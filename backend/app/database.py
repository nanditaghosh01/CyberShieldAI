import os
import json
import sqlite3
import datetime
from typing import List, Dict, Any, Optional
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from .config import settings

class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.is_mongodb = False
        self.sqlite_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "cybershield.db")
        self._init_connection()

    def _init_connection(self):
        try:
            # Try connecting with a short 1.5s timeout so startup doesn't hang if Mongo isn't running
            client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1500)
            client.admin.command('ping')
            self.client = client
            self.db = client[settings.MONGODB_DB_NAME]
            self.is_mongodb = True
            print(f"[CyberShield DB] Connected to MongoDB at {settings.MONGODB_URI}")
        except Exception as e:
            self.is_mongodb = False
            self.client = None
            self.db = None
            print(f"[CyberShield DB] MongoDB not reachable ({e}). Using embedded SQLite store.")
            self._init_sqlite()

    def _init_sqlite(self):
        conn = sqlite3.connect(self.sqlite_path)
        cursor = conn.cursor()
        # Collections as tables
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE,
                username TEXT,
                hashed_password TEXT,
                role TEXT,
                created_at TEXT
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                id TEXT PRIMARY KEY,
                url TEXT,
                domain TEXT,
                risk_score REAL,
                risk_category TEXT,
                threat_classification TEXT,
                scan_timestamp TEXT,
                user_id TEXT,
                details TEXT
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS community_reports (
                id TEXT PRIMARY KEY,
                url TEXT,
                threat_category TEXT,
                description TEXT,
                evidence TEXT,
                status TEXT,
                submitted_by TEXT,
                submitted_at TEXT,
                upvotes INTEGER DEFAULT 0,
                downvotes INTEGER DEFAULT 0,
                votes_data TEXT
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cert_monitor (
                id TEXT PRIMARY KEY,
                domain TEXT UNIQUE,
                last_serial TEXT,
                last_issuer TEXT,
                last_expires TEXT,
                last_checked TEXT,
                status TEXT
            )
        """)
        conn.commit()
        conn.close()

    def get_status(self) -> dict:
        return {
            "engine": "MongoDB" if self.is_mongodb else "SQLite (Embedded Local)",
            "connected": True,
            "database_name": settings.MONGODB_DB_NAME if self.is_mongodb else "cybershield.db"
        }

    # User operations
    def find_user_by_email(self, email: str) -> Optional[dict]:
        if self.is_mongodb:
            user = self.db.users.find_one({"email": email})
            if user:
                user["id"] = str(user.get("_id", user.get("id")))
            return user
        else:
            conn = sqlite3.connect(self.sqlite_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            conn.close()
            return dict(row) if row else None

    def find_user_by_id(self, user_id: str) -> Optional[dict]:
        if self.is_mongodb:
            user = self.db.users.find_one({"id": user_id})
            return user
        else:
            conn = sqlite3.connect(self.sqlite_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            conn.close()
            return dict(row) if row else None

    def insert_user(self, user_data: dict) -> dict:
        if self.is_mongodb:
            self.db.users.insert_one(user_data)
            user_data.pop("_id", None)
        else:
            conn = sqlite3.connect(self.sqlite_path)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO users (id, email, username, hashed_password, role, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                user_data["id"],
                user_data["email"],
                user_data["username"],
                user_data["hashed_password"],
                user_data["role"],
                user_data["created_at"]
            ))
            conn.commit()
            conn.close()
        return user_data

    # Scan operations
    def insert_scan(self, scan_data: dict) -> dict:
        if self.is_mongodb:
            self.db.scans.insert_one(scan_data)
            scan_data.pop("_id", None)
        else:
            conn = sqlite3.connect(self.sqlite_path)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO scans (id, url, domain, risk_score, risk_category, threat_classification, scan_timestamp, user_id, details)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                scan_data["id"],
                scan_data["url"],
                scan_data.get("domain", ""),
                scan_data.get("risk_score", 0.0),
                scan_data.get("risk_category", "Low Risk"),
                scan_data.get("threat_classification", "Legitimate"),
                scan_data.get("scan_timestamp", datetime.datetime.utcnow().isoformat()),
                scan_data.get("user_id", "anonymous"),
                json.dumps(scan_data.get("details", {}))
            ))
            conn.commit()
            conn.close()
        return scan_data

    def get_scans(self, limit: int = 50, user_id: Optional[str] = None) -> List[dict]:
        if self.is_mongodb:
            query = {"user_id": user_id} if user_id else {}
            cursor = self.db.scans.find(query, {"_id": 0}).sort("scan_timestamp", -1).limit(limit)
            return list(cursor)
        else:
            conn = sqlite3.connect(self.sqlite_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            if user_id:
                cursor.execute("SELECT * FROM scans WHERE user_id = ? ORDER BY scan_timestamp DESC LIMIT ?", (user_id, limit))
            else:
                cursor.execute("SELECT * FROM scans ORDER BY scan_timestamp DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            results = []
            for r in rows:
                item = dict(r)
                if item.get("details"):
                    try:
                        item["details"] = json.loads(item["details"])
                    except Exception:
                        pass
                results.append(item)
            conn.close()
            return results

    def get_scan_by_id(self, scan_id: str) -> Optional[dict]:
        if self.is_mongodb:
            return self.db.scans.find_one({"id": scan_id}, {"_id": 0})
        else:
            conn = sqlite3.connect(self.sqlite_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM scans WHERE id = ?", (scan_id,))
            row = cursor.fetchone()
            conn.close()
            if row:
                item = dict(row)
                if item.get("details"):
                    try:
                        item["details"] = json.loads(item["details"])
                    except Exception:
                        pass
                return item
            return None

    # Community report operations
    def insert_community_report(self, report_data: dict) -> dict:
        if self.is_mongodb:
            self.db.community_reports.insert_one(report_data)
            report_data.pop("_id", None)
        else:
            conn = sqlite3.connect(self.sqlite_path)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO community_reports (id, url, threat_category, description, evidence, status, submitted_by, submitted_at, upvotes, downvotes, votes_data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                report_data["id"],
                report_data["url"],
                report_data["threat_category"],
                report_data.get("description", ""),
                report_data.get("evidence", ""),
                report_data.get("status", "Pending"),
                report_data.get("submitted_by", "anonymous"),
                report_data.get("submitted_at", datetime.datetime.utcnow().isoformat()),
                report_data.get("upvotes", 0),
                report_data.get("downvotes", 0),
                json.dumps(report_data.get("votes_data", {}))
            ))
            conn.commit()
            conn.close()
        return report_data

    def get_community_reports(self, limit: int = 50, status: Optional[str] = None) -> List[dict]:
        if self.is_mongodb:
            query = {"status": status} if status else {}
            cursor = self.db.community_reports.find(query, {"_id": 0}).sort("submitted_at", -1).limit(limit)
            return list(cursor)
        else:
            conn = sqlite3.connect(self.sqlite_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            if status:
                cursor.execute("SELECT * FROM community_reports WHERE status = ? ORDER BY submitted_at DESC LIMIT ?", (status, limit))
            else:
                cursor.execute("SELECT * FROM community_reports ORDER BY submitted_at DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            results = []
            for r in rows:
                item = dict(r)
                if item.get("votes_data"):
                    try:
                        item["votes_data"] = json.loads(item["votes_data"])
                    except Exception:
                        pass
                results.append(item)
            conn.close()
            return results

    def update_community_report_status(self, report_id: str, new_status: str) -> bool:
        if self.is_mongodb:
            result = self.db.community_reports.update_one({"id": report_id}, {"$set": {"status": new_status}})
            return result.modified_count > 0
        else:
            conn = sqlite3.connect(self.sqlite_path)
            cursor = conn.cursor()
            cursor.execute("UPDATE community_reports SET status = ? WHERE id = ?", (new_status, report_id))
            conn.commit()
            rows_affected = cursor.rowcount
            conn.close()
            return rows_affected > 0

    def vote_community_report(self, report_id: str, vote_type: str, voter_ip: str) -> Optional[dict]:
        if self.is_mongodb:
            field = "upvotes" if vote_type == "up" else "downvotes"
            self.db.community_reports.update_one({"id": report_id}, {"$inc": {field: 1}})
            return self.db.community_reports.find_one({"id": report_id}, {"_id": 0})
        else:
            field = "upvotes" if vote_type == "up" else "downvotes"
            conn = sqlite3.connect(self.sqlite_path)
            cursor = conn.cursor()
            cursor.execute(f"UPDATE community_reports SET {field} = {field} + 1 WHERE id = ?", (report_id,))
            conn.commit()
            conn.close()
            return self.get_community_report_by_id(report_id)

    def get_community_report_by_id(self, report_id: str) -> Optional[dict]:
        if self.is_mongodb:
            return self.db.community_reports.find_one({"id": report_id}, {"_id": 0})
        else:
            conn = sqlite3.connect(self.sqlite_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM community_reports WHERE id = ?", (report_id,))
            row = cursor.fetchone()
            conn.close()
            if row:
                item = dict(row)
                if item.get("votes_data"):
                    try:
                        item["votes_data"] = json.loads(item["votes_data"])
                    except Exception:
                        pass
                return item
            return None

    # Stats for Dashboard
    def get_dashboard_stats(self) -> dict:
        scans = self.get_scans(limit=500)
        total_scans = len(scans)
        phishing_count = sum(1 for s in scans if s.get("threat_classification") == "Phishing")
        malicious_count = sum(1 for s in scans if s.get("threat_classification") == "Malicious")
        suspicious_count = sum(1 for s in scans if s.get("threat_classification") == "Suspicious")
        legitimate_count = sum(1 for s in scans if s.get("threat_classification") == "Legitimate")
        attention_count = phishing_count + malicious_count + suspicious_count

        return {
            "total_scanned": total_scans,
            "phishing_detected": phishing_count,
            "malicious_detected": malicious_count,
            "suspicious_detected": suspicious_count,
            "secure_analyzed": legitimate_count,
            "requiring_attention": attention_count,
            "threat_distribution": [
                {"name": "Legitimate", "value": legitimate_count, "color": "#10b981"},
                {"name": "Suspicious", "value": suspicious_count, "color": "#f59e0b"},
                {"name": "Phishing", "value": phishing_count, "color": "#f97316"},
                {"name": "Malicious", "value": malicious_count, "color": "#ef4444"}
            ]
        }

db_manager = DatabaseManager()

