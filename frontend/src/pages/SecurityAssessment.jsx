import React, { useState } from 'react';
import { ShieldAlert, Search, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ThreatBadge } from '../components/ThreatBadge';
import { api } from '../services/api';

export const SecurityAssessment = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAudit = async (e) => {
    e?.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.auditSecurity(url.trim());
      setResult(data);
    } catch (err) {
      setError(err.message || 'Audit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#0c1424] border border-cyan-500/30 p-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-wide">
            Passive Website Security Posture Assessment
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Safe, passive inspection of HTTP security headers (CSP, HSTS, X-Frame-Options), cookie security flags (Secure, HttpOnly, SameSite), server software leaks, and exposed configuration endpoints.
        </p>

        <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. https://target-site.com"
            className="flex-1 px-4 py-3 bg-[#080d18] border border-slate-700/80 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Auditing...' : 'Run Security Audit'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-xs text-red-200">
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-6">
          {/* Posture Score Banner */}
          <div className="p-5 rounded-xl bg-[#0c1424] border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Security Posture Grade</span>
              <div className="text-3xl font-bold font-mono text-cyan-400 mt-0.5">
                {result.posture_grade}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                HTTPS Enforced: <strong className={result.https_enforced ? 'text-emerald-400' : 'text-red-400'}>
                  {result.https_enforced ? 'YES' : 'NO'}
                </strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Identified Findings:</span>
              <div className="text-2xl font-bold font-mono text-white">
                {result.vulnerabilities?.length || 0}
              </div>
            </div>
          </div>

          {/* Vulnerabilities / Misconfigurations Table */}
          <div className="rounded-xl bg-[#0c1424] border border-slate-800 p-5">
            <h3 className="text-sm font-bold text-white mb-3">Identified Weaknesses & Recommended Remediations</h3>
            {result.vulnerabilities?.length > 0 ? (
              <div className="space-y-3">
                {result.vulnerabilities.map((v, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#080d18] border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono">{v.name}</span>
                      <ThreatBadge category={v.severity} size="sm" />
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>Impact:</strong> {v.impact}
                    </p>
                    <p className="text-xs text-cyan-300 bg-cyan-950/20 p-2 rounded border border-cyan-500/20">
                      <strong>Remediation:</strong> {v.remediation}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-400">No security misconfigurations identified!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

