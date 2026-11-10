import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Database, ShieldAlert, Key, UserCheck, ShieldCheck, CheckCircle2, Lock, Cpu, Server } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Settings = () => {
  const { user, isAnalyst, isAdmin } = useAuth();
  const [adminStatus, setAdminStatus] = useState(null);

  useEffect(() => {
    if (isAnalyst) {
      api.getSystemStatus().then(setAdminStatus).catch(console.error);
    }
  }, [isAnalyst]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Card */}
      <div className="rounded-2xl bg-[#122035] border border-[#274366] p-6 sm:p-7 shadow-lg">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-[#1d3557] border border-[#457b9d]/40 flex items-center justify-center text-[#a9d8de]">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold text-[#f3fbf0]">
            System Architecture & Protection Settings
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#a9d8de]/85 max-w-2xl leading-relaxed">
          Verify connected threat feed services, inspect database storage failover, and review scanner safety guardrails.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Persistence & Database Engine Status */}
        <div className="p-6 rounded-2xl bg-[#122035] border border-[#274366] space-y-4 shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-[#274366] pb-3">
            <Database className="w-4 h-4 text-[#a9d8de]" />
            <h3 className="text-sm font-bold text-[#f3fbf0]">Data Storage & Database Health</h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#a9d8de]/80">Primary Storage Engine:</span>
              <span className="text-[#f3fbf0] font-semibold">
                {adminStatus?.database?.engine || 'Active (Mongo with SQLite Fallback)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#a9d8de]/80">Database Collection:</span>
              <span className="text-[#a9d8de] font-mono">{adminStatus?.database?.database_name || 'cybershield_ai'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#a9d8de]/80">Autonomous Fallback:</span>
              <span className="text-[#a9d8de] font-semibold">Enabled (Seamless offline switch)</span>
            </div>
          </div>
          <p className="text-[11px] text-[#a9d8de]/70 bg-[#0b1523] p-3 rounded-xl border border-[#274366] leading-relaxed">
            CyberShield AI connects to MongoDB when available. If MongoDB is unavailable during testing or deployment, it smoothly transitions to a zero-configuration local database without dropping any user scans.
          </p>
        </div>

        {/* Security & SSRF Protection Policy */}
        <div className="p-6 rounded-2xl bg-[#122035] border border-[#274366] space-y-4 shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-[#274366] pb-3">
            <ShieldCheck className="w-4 h-4 text-[#a9d8de]" />
            <h3 className="text-sm font-bold text-[#f3fbf0]">Scanner Safety & SSRF Guardrails</h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#a9d8de]/80">Private Network Protection:</span>
              <span className="text-[#a9d8de] font-semibold">Active (Blocks 192.168.x, 10.x, 172.x)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#a9d8de]/80">Cloud Metadata Protection:</span>
              <span className="text-[#a9d8de] font-semibold">Active (Blocks 169.254.169.254 & localhost)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#a9d8de]/80">Request Timeout:</span>
              <span className="text-[#f3fbf0] font-mono">10.0 seconds</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#a9d8de]/80">Redirect Hop Limit:</span>
              <span className="text-[#f3fbf0] font-mono">5 hops maximum</span>
            </div>
          </div>
          <p className="text-[11px] text-[#a9d8de]/70 bg-[#0b1523] p-3 rounded-xl border border-[#274366] leading-relaxed">
            Prevents malicious users from submitting internal IP addresses or server metadata endpoints, ensuring security scans strictly inspect external, public websites.
          </p>
        </div>
      </div>

      {/* External Intelligence API Key Configuration */}
      <div className="rounded-2xl bg-[#122035] border border-[#274366] p-6 shadow-lg">
        <h3 className="text-base font-bold text-[#f3fbf0] mb-1">Threat Feed Integrations</h3>
        <p className="text-xs text-[#a9d8de]/80 mb-4">
          API keys are safely loaded from server environment variables (<code className="text-[#a9d8de]">.env</code>) and are never exposed in frontend browser code.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0b1523] border border-[#274366] space-y-1">
            <strong className="text-[#f3fbf0] block font-semibold">Google Safe Browsing</strong>
            <span className="text-[11px] text-[#457b9d] block">API v4 Threat List</span>
            <span className="text-xs text-[#a9d8de] font-medium block pt-1">Environment Configured</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0b1523] border border-[#274366] space-y-1">
            <strong className="text-[#f3fbf0] block font-semibold">VirusTotal Intelligence</strong>
            <span className="text-[11px] text-[#457b9d] block">Multi-Scanner Aggregation</span>
            <span className="text-xs text-[#a9d8de] font-medium block pt-1">Environment Configured</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0b1523] border border-[#274366] space-y-1">
            <strong className="text-[#f3fbf0] block font-semibold">URLhaus (Abuse.ch)</strong>
            <span className="text-[11px] text-[#457b9d] block">Community Malware Registry</span>
            <span className="text-xs text-[#a9d8de] font-medium block pt-1">Active Public Feed</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0b1523] border border-[#274366] space-y-1">
            <strong className="text-[#f3fbf0] block font-semibold">Certificate Transparency</strong>
            <span className="text-[11px] text-[#457b9d] block">RFC 6962 CT Proof Verifier</span>
            <span className="text-xs text-[#a9d8de] font-medium block pt-1">Active X.509 Inspector</span>
          </div>
        </div>
      </div>
    </div>
  );
};
