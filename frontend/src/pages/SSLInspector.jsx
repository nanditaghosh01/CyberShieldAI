import React, { useState } from 'react';
import { Lock, Search, ShieldCheck, AlertTriangle, Key, Calendar, Info } from 'lucide-react';
import { ThreatBadge } from '../components/ThreatBadge';
import { api } from '../services/api';

export const SSLInspector = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInspect = async (e) => {
    e?.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.inspectSsl(url.trim());
      setResult(data);
    } catch (err) {
      setError(err.message || 'SSL Inspection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="rounded-2xl bg-[#0c1424] border border-cyan-500/30 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-wide">
            SSL/TLS Certificate & Cryptographic Chain Inspector
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Deep X.509 certificate inspection, Certificate Authority (CA) root validation, key lengths, deprecated protocol checks, and Certificate Transparency (CT) log verification.
        </p>

        <form onSubmit={handleInspect} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. google.com or https://chase.com"
            className="flex-1 px-4 py-3 bg-[#080d18] border border-slate-700/80 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Inspecting...' : 'Inspect SSL/TLS'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-xs text-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Motivating Case Study Highlight */}
      <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-200">
          <strong className="text-blue-300">The eMudhra Motivating Security Case:</strong> Modern phishing and rogue impersonation attacks frequently possess valid SSL certificates. The eMudhra incident highlighted that weak Certificate Authority validation or unmonitored intermediates can undermine trust. CyberShield AI analyzes issuing CAs, key sizes, and Certificate Transparency SCT proofs rather than blindly treating HTTPS as legitimate.
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Validity & Trust Banner */}
          <div className="p-5 rounded-xl bg-[#0c1424] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400">Target Hostname</span>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">
                {result.hostname}:{result.port}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <ThreatBadge category={result.trust_status || 'Audited CA'} size="sm" />
                <span className="text-xs text-slate-400">
                  {result.days_remaining} days remaining ({result.is_expired ? 'EXPIRED' : 'ACTIVE'})
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Protocol Version</span>
              <div className="text-xl font-bold font-mono text-cyan-400">
                {result.tls_version || 'TLSv1.3'}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-[#0c1424] border border-slate-800 space-y-3 text-xs">
              <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Certificate Identity</h4>
              <div>
                <span className="text-slate-400 block">Common Name (CN):</span>
                <strong className="text-white font-mono">{result.subject?.common_name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Issuing Authority:</span>
                <strong className="text-cyan-300 font-mono">{result.issuer?.common_name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Organization:</span>
                <span className="text-slate-300 font-mono">{result.issuer?.organization}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Self-Signed:</span>
                <span className={result.is_self_signed ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {result.is_self_signed ? 'YES (Untrusted)' : 'NO (Publicly Audited)'}
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#0c1424] border border-slate-800 space-y-3 text-xs">
              <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Cryptographic Strength</h4>
              <div>
                <span className="text-slate-400 block">Public Key Algorithm & Size:</span>
                <strong className="text-white font-mono">{result.public_key_algorithm} ({result.key_size} bits)</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Signature Algorithm:</span>
                <span className="text-slate-300 font-mono">{result.signature_algorithm}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Cipher Suite:</span>
                <span className="text-cyan-300 font-mono text-[11px] truncate block">{result.cipher_suite}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Certificate Transparency:</span>
                <span className={result.has_sct_transparency ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {result.has_sct_transparency ? 'SCT Log Proof Present' : 'No Embedded SCTs'}
                </span>
              </div>
            </div>
          </div>

          {/* Subject Alternative Names */}
          <div className="p-5 rounded-xl bg-[#0c1424] border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-2">Subject Alternative Names ({result.sans?.length || 0})</h4>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto font-mono text-xs">
              {result.sans?.map((san, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-[#080d18] border border-slate-800 text-slate-300">
                  {san}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

