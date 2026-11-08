import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Database, ShieldAlert, Key, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Settings = () => {
  const { user, isAnalyst, isAdmin } = useAuth();
  const [adminStatus, setAdminStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAnalyst) {
      api.getSystemStatus().then(setAdminStatus).catch(console.error);
    }
  }, [isAnalyst]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#0c1424] border border-cyan-500/30 p-6">
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-wide">
            Platform Configuration & System Architecture
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Manage API keys, database persistence engines, SSRF protections, and role-based permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Persistence & Database Engine Status */}
        <div className="p-5 rounded-xl bg-[#0c1424] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Database & Persistence Engine</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Primary Database Engine:</span>
              <strong className="text-emerald-400 font-mono">
                {adminStatus?.database?.engine || 'Active (Dual Mongo/SQLite Driver)'}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Database Name:</span>
              <span className="text-white font-mono">{adminStatus?.database?.database_name || 'cybershield_ai'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Zero-Config Fallback:</span>
              <span className="text-cyan-400 font-mono">ENABLED (Automatic)</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            CyberShield AI operates on MongoDB when the daemon is running, and automatically fails over to an embedded local storage layer when standalone testing is needed.
          </p>
        </div>

        {/* Security & SSRF Protection Policy */}
        <div className="p-5 rounded-xl bg-[#0c1424] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">SSRF & Scanning Safeguards</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Private IP Blocking (RFC 1918):</span>
              <strong className="text-emerald-400 font-mono">ACTIVE (10/8, 172.16/12, 192.168/16)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Loopback & Cloud Metadata:</span>
              <strong className="text-emerald-400 font-mono">BLOCKED (127.0.0.1, 169.254.169.254)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Scan Socket Timeout:</span>
              <span className="text-white font-mono">10.0 seconds</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Max HTTP Redirect Hops:</span>
              <span className="text-white font-mono">5 hops max</span>
            </div>
          </div>
        </div>
      </div>

      {/* External Intelligence API Key Configuration */}
      <div className="rounded-xl bg-[#0c1424] border border-slate-800 p-5">
        <h3 className="text-sm font-bold text-white mb-2">Threat Intelligence Service Integrations</h3>
        <p className="text-xs text-slate-400 mb-4">
          Keys configured via environment variables (.env). Active heuristic fallback algorithms protect users when external API limits are exceeded.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#080d18] border border-slate-800">
            <span className="text-white block font-sans font-semibold">Google Safe Browsing</span>
            <span className="text-slate-500 text-[10px] block mt-0.5">API v4 REST</span>
            <span className="text-cyan-400 mt-2 block">Environment Configured</span>
          </div>

          <div className="p-3 rounded-lg bg-[#080d18] border border-slate-800">
            <span className="text-white block font-sans font-semibold">VirusTotal API</span>
            <span className="text-slate-500 text-[10px] block mt-0.5">Multi-engine Antivirus</span>
            <span className="text-cyan-400 mt-2 block">Environment Configured</span>
          </div>

          <div className="p-3 rounded-lg bg-[#080d18] border border-slate-800">
            <span className="text-white block font-sans font-semibold">URLhaus (Abuse.ch)</span>
            <span className="text-slate-500 text-[10px] block mt-0.5">Community Malware Feeds</span>
            <span className="text-emerald-400 mt-2 block">Active Public API</span>
          </div>

          <div className="p-3 rounded-lg bg-[#080d18] border border-slate-800">
            <span className="text-white block font-sans font-semibold">CT Log Monitors</span>
            <span className="text-slate-500 text-[10px] block mt-0.5">RFC 6962 / SCT Logs</span>
            <span className="text-emerald-400 mt-2 block">Active X.509 Parser</span>
          </div>
        </div>
      </div>
    </div>
  );
};

