import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Search, CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, Info, Lock } from 'lucide-react';
import { ThreatBadge } from '../components/ThreatBadge';
import { api } from '../services/api';

export const SecurityAssessment = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleAudit = async (targetUrl) => {
    const toAudit = targetUrl || url;
    if (!toAudit.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.auditSecurity(toAudit.trim());
      setResult(data);
    } catch (err) {
      setError(err.message || 'Unable to audit website security posture. Please verify the URL.');
    } finally {
      setLoading(false);
    }
  };

  const sampleSites = [
    { name: 'GitHub (Strong Posture)', url: 'https://github.com' },
    { name: 'Google (Hardened)', url: 'https://google.com' },
    { name: 'Insecure Test Site', url: 'http://neverssl.com' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="rounded-2xl bg-[#122035] border border-[#274366] p-6 sm:p-7 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-[#1d3557] border border-[#457b9d]/40 flex items-center justify-center text-[#a9d8de]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-[#f3fbf0]">
                Website Security Health Check
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#a9d8de]/85 max-w-2xl leading-relaxed">
              Find out whether a website uses modern defensive headers to guard its visitors from clickjacking, script injection, and eavesdropping.
            </p>
          </div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#182b45] hover:bg-[#1d3557] text-xs text-[#a9d8de] border border-[#274366] transition-colors self-start md:self-auto shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#457b9d]" />
            <span>{showGuide ? 'Hide Guide' : 'What do these checks mean?'}</span>
          </button>
        </div>

        {/* Educational Explainer */}
        {showGuide && (
          <div className="mt-5 p-4 rounded-xl bg-[#0b1523] border border-[#274366] text-xs space-y-3 animate-fadeIn">
            <h4 className="font-semibold text-[#f3fbf0] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#a9d8de]" />
              Why website headers matter for your safety:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[#a9d8de]/90">
              <div className="p-3 rounded-lg bg-[#122035] border border-[#274366]/80">
                <strong className="text-[#f3fbf0] block mb-1">Content-Security-Policy (CSP)</strong>
                Restricts what scripts and resources can load, stopping malicious hackers from stealing passwords or injecting ads.
              </div>
              <div className="p-3 rounded-lg bg-[#122035] border border-[#274366]/80">
                <strong className="text-[#f3fbf0] block mb-1">Strict-Transport-Security (HSTS)</strong>
                Forces browsers to always connect via encrypted HTTPS, preventing coffee-shop Wi-Fi snooping.
              </div>
              <div className="p-3 rounded-lg bg-[#122035] border border-[#274366]/80">
                <strong className="text-[#f3fbf0] block mb-1">X-Frame-Options</strong>
                Prevents deceptive websites from invisibly framing this site to trick you into clicking malicious buttons (clickjacking).
              </div>
              <div className="p-3 rounded-lg bg-[#122035] border border-[#274366]/80">
                <strong className="text-[#f3fbf0] block mb-1">Cookie Security (HttpOnly)</strong>
                Ensures sensitive login tokens cannot be read by illicit client-side scripts.
              </div>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAudit();
          }}
          className="mt-6 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#457b9d] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL (e.g. https://example.com)"
              className="w-full pl-10 pr-4 py-3 bg-[#0b1523] border border-[#274366] rounded-xl text-xs sm:text-sm text-[#f3fbf0] placeholder-[#a9d8de]/40 focus:outline-none focus:border-[#457b9d] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-[#457b9d] hover:bg-[#a9d8de] text-[#0b1523] font-bold text-xs sm:text-sm transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? 'Inspecting...' : 'Check Security'}
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-[#a9d8de]/70">
          <span>Try an example:</span>
          {sampleSites.map((site) => (
            <button
              key={site.name}
              type="button"
              onClick={() => {
                setUrl(site.url);
                handleAudit(site.url);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#182b45] hover:bg-[#1d3557] hover:text-[#f3fbf0] border border-[#274366] text-[11px] text-[#a9d8de] transition-colors"
            >
              {site.name}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#28070a] border border-[#e83845] text-xs text-[#ffd0d4] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#e83845] shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-6">
          {/* Posture Summary Card */}
          <div className="p-6 rounded-2xl bg-[#122035] border border-[#274366] shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <span className="text-xs text-[#a9d8de]/70 font-medium">Overall Defensive Posture</span>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-4xl font-extrabold ${
                  result.posture_grade === 'A' || result.posture_grade === 'A+' ? 'text-[#a9d8de]' :
                  result.posture_grade === 'B' || result.posture_grade === 'C' ? 'text-[#f3fbf0]' : 'text-[#e83845]'
                }`}>
                  Grade {result.posture_grade}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#182b45] text-[#a9d8de] border border-[#274366]">
                  {result.vulnerabilities?.length === 0 ? 'Optimal Configuration' : `${result.vulnerabilities?.length} Area(s) for Improvement`}
                </span>
              </div>
              <p className="text-xs text-[#a9d8de]/80 mt-2 flex items-center gap-2">
                <span>Enforced HTTPS:</span>
                <strong className={result.https_enforced ? 'text-[#a9d8de]' : 'text-[#e83845]'}>
                  {result.https_enforced ? 'Yes, strictly encrypted' : 'No, allows unencrypted HTTP'}
                </strong>
              </p>
            </div>

            <div className="bg-[#0b1523] px-5 py-3.5 rounded-xl border border-[#274366] text-right sm:text-right w-full sm:w-auto">
              <span className="text-xs text-[#a9d8de]/70 block">Target Examined</span>
              <span className="text-sm font-semibold text-[#f3fbf0] break-all">{url || 'Target'}</span>
              <span className="text-[11px] text-[#457b9d] block mt-0.5">Passive, non-intrusive scan</span>
            </div>
          </div>

          {/* Detailed Findings List */}
          <div className="rounded-2xl bg-[#122035] border border-[#274366] p-6 shadow-lg">
            <h3 className="text-base font-bold text-[#f3fbf0] mb-1">
              Configuration Audit & Recommendations
            </h3>
            <p className="text-xs text-[#a9d8de]/80 mb-5">
              Review specific headers and settings that protect users against spoofing, session theft, and content tampering.
            </p>

            {result.vulnerabilities?.length > 0 ? (
              <div className="space-y-4">
                {result.vulnerabilities.map((v, i) => (
                  <div key={i} className="p-5 rounded-xl bg-[#0b1523] border border-[#274366] hover:border-[#457b9d]/60 transition-colors space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[#f3fbf0]">{v.name}</span>
                      <ThreatBadge category={v.severity} size="sm" />
                    </div>

                    <div className="text-xs text-[#f3fbf0]/85 space-y-1">
                      <span className="text-[#a9d8de]/70 font-semibold block">Potential Risk:</span>
                      <p>{v.impact}</p>
                    </div>

                    <div className="text-xs text-[#a9d8de] bg-[#182b45] p-3 rounded-lg border border-[#457b9d]/30">
                      <span className="font-semibold text-[#f3fbf0] block mb-0.5">How to resolve:</span>
                      <span className="text-xs font-mono">{v.remediation}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-[#0b1523] border border-[#274366] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#a9d8de] mx-auto" />
                <h4 className="text-sm font-bold text-[#f3fbf0]">No obvious weaknesses detected</h4>
                <p className="text-xs text-[#a9d8de]/80 max-w-md mx-auto">
                  This website adheres to modern browser protection guidelines, enforcing HTTPS and standard security headers.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
