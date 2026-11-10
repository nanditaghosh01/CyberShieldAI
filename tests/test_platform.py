import sys
import os
import unittest

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.ml.feature_extractor import extract_url_features, FEATURE_COLUMNS, levenshtein_ratio
from app.ml.predict import predict_url
from app.utils.validators import normalize_url, validate_public_target
from app.utils.security import hash_password, verify_password, create_access_token, decode_access_token
from app.services.risk_scoring import calculate_unified_risk_score

class TestCyberShieldAI(unittest.TestCase):

    def test_feature_extraction(self):
        """Verifies that all 16 engineered features extract correctly."""
        url = "http://paypa1-security-verification.com/webscr?cmd=_login"
        feat = extract_url_features(url)
        for col in FEATURE_COLUMNS:
            self.assertIn(col, feat, f"Missing feature column: {col}")
        self.assertGreater(feat["_typosquat_similarity"], 0.7)
        self.assertEqual(feat["https_flag"], 0)
        self.assertEqual(feat["has_hyphen_in_domain"], 1)

    def test_ml_predictions_trained_model(self):
        """Tests that the classifier trained on url_features_extracted1.csv predicts appropriately."""
        res_legit = predict_url("https://www.google.com/search?q=nist+cybersecurity")
        self.assertEqual(res_legit["prediction"], "Legitimate")
        self.assertGreaterEqual(res_legit["confidence"], 0.7)

        res_malware = predict_url("http://192.168.1.100/payload.exe")
        self.assertEqual(res_malware["features"]["has_ip_address"], 1)
        self.assertEqual(res_malware["features"]["suspicious_file_extension"], 1)
        self.assertEqual(res_malware["prediction"], "Malicious")

        res_phish = predict_url("http://paypa1-security-verification.com/webscr?cmd=_login")
        self.assertIn(res_phish["prediction"], ["Phishing", "Suspicious", "Malicious"])

    def test_ssrf_validator(self):
        """Tests that SSRF protections block private/link-local addresses."""
        from fastapi import HTTPException
        with self.assertRaises(HTTPException):
            validate_public_target("192.168.1.1")
        with self.assertRaises(HTTPException):
            validate_public_target("127.0.0.1")
        with self.assertRaises(HTTPException):
            validate_public_target("localhost")

    def test_password_and_jwt(self):
        """Tests bcrypt hashing and JWT token round-trip."""
        raw_pw = "CyberShield#Pass2026"
        hashed = hash_password(raw_pw)
        self.assertTrue(verify_password(raw_pw, hashed))
        self.assertFalse(verify_password("WrongPass", hashed))

        payload = {"sub": "user-test-id", "role": "Administrator", "username": "AdminTest"}
        token = create_access_token(payload)
        decoded = decode_access_token(token)
        self.assertEqual(decoded["sub"], "user-test-id")
        self.assertEqual(decoded["role"], "Administrator")

    def test_risk_scoring_bounds(self):
        """Ensures risk scores always stay within 0 to 100."""
        dummy_ai = {"prediction": "Legitimate", "confidence": 0.9, "risk_factors": []}
        dummy_intel = {"reputation_score": 100, "is_flagged": False, "matched_feeds": []}
        dummy_ssl = {"is_self_signed": False, "is_expired": False, "findings": []}
        dummy_web = {"https_enforced": True, "missing_headers": [], "vulnerabilities": []}
        dummy_dns = {"findings": []}

        score_res = calculate_unified_risk_score(dummy_ai, dummy_intel, dummy_ssl, dummy_web, dummy_dns)
        self.assertGreaterEqual(score_res["overall_risk_score"], 0.0)
        self.assertLessEqual(score_res["overall_risk_score"], 100.0)
        self.assertEqual(score_res["risk_category"], "Low Risk")

if __name__ == "__main__":
    unittest.main()
