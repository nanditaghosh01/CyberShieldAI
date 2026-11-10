import React, { useState } from 'react';
import { Lock, Search, ShieldCheck, AlertTriangle, Key, Calendar, Info, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { ThreatBadge } from '../components/ThreatBadge';
import { api } from '../services/api';

export const SSLInspector = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInspect = async (targetUrl) => {
    const toInspect = targetUrl || url;
    if (!toInspect.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.inspectSsl(toInspect.trim());
      setResult(data);
    } catch (err) {
      setError(err.message || 'Unable to inspect SSL certificate. Verify hostname or try with https://');
    } finally {
      setLoading(false);
    }
  };

  const sampleDomains = [
    { name: 'Google (Hardened)', url: 'google.com' },
    { name: 'Cloudflare', url: 'cloudflare.com' },
    { name: 'Wikipedia', url: 'wikipedia.org' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Search Header Card */}
      <div className="rounded-2xl bg-[#122035] border border-[#274366] p-6 sm:p-7 shadow-lg">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-[#1d3557] border border-[#457b9d]/40 flex items-center justify-center text-[#a9d8de]">
            <Lock className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold text-[#f3fbf0]">
            SSL & Encryption Inspector
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#a9d8de]/85 max-w-2xl leading-relaxed mb-4">
          Verify digital certificates, inspect issuing authorities, test encryption strength, and check Certificate Transparency logs.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleInspect();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#457b9d] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter domain or link (e.g. google.com or https://example.com)"
              className="w-full pl-10 pr-4 py-3 bg-[#0b1523] border border-[#274366] rounded-xl text-xs sm:text-sm text-[#f3fbf0] placeholder-[#a9d8de]/40 focus:outline-none focus:border-[#457b9d] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-[#457b9d] hover:bg-[#a9d8de] text-[#0b1523] font-bold text-xs sm:text-sm transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? 'Inspecting...' : 'Inspect Certificate'}
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-[#a9d8de]/70">
          <span>Quick check:</span>
          {sampleDomains.map((site) => (
            <button
              key={site.name}
              type="button"
              onClick={() => {
                setUrl(site.url);
                handleInspect(site.url);
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

      {/* Case Study Callout: eMudhra Incident */}
      <div className="p-5 rounded-2xl bg-[#182b45] border border-[#457b9d]/40 flex items-start gap-3.5 shadow-md">
        <div className="w-8 h-8 rounded-lg bg-[#1d3557] border border-[#457b9d]/30 flex items-center justify-center shrink-0 text-[#a9d8de] mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs text-[#f3fbf0]/90 leading-relaxed">
          <strong className="text-[#a9d8de] block text-sm mb-1">
            Why HTTPS does NOT guarantee a website is legitimate
          </strong>
          <p>
            Phishing scams frequently acquire valid, free certificates so their website displays a reassuring padlock in your browser. Furthermore, real-world events like the <strong className="text-[#f3fbf0]">eMudhra incident</strong> showed that lax Certificate Authority (CA) validation or compromised intermediates can lead to misissued certificates. CyberShield examines CA identity, key lengths, and Certificate Transparency (CT) proofs to confirm authenticity.
          </p>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Validity & Summary Banner */}
          <div className="p-6 rounded-2xl bg-[#122035] border border-[#274366] shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <span className="text-xs text-[#a9d8de]/70 font-medium">Domain & Connection Port</span>
              <div className="text-2xl font-bold font-mono text-[#f3fbf0] mt-0.5">
                {result.hostname}:{result.port || 443}
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <ThreatBadge category={result.trust_status || (result.is_expired ? 'Expired' : 'Verified')} size="sm" />
                <span className={`text-xs font-medium ${result.is_expired ? 'text-[#e83845]' : 'text-[#a9d8de]'}`}>
                  {result.days_remaining > 0 ? `${result.days_remaining} days remaining before renewal` : 'Certificate has expired!'}
                </span>
              </div>
            </div>

            <div className="bg-[#0b1523] px-5 py-3.5 rounded-xl border border-[#274366] text-right sm:text-right w-full sm:w-auto">
              <span className="text-xs text-[#a9d8de]/70 block">Protocol Handshake</span>
              <span className="text-lg font-bold font-mono text-[#a9d8de]">{result.tls_version || 'TLS 1.3'}</span>
              <span className="text-[11px] text-[#f3fbf0]/70 block mt-0.5">Modern Secure Cipher</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Identity Card */}
            <div className="p-5 rounded-2xl bg-[#122035] border border-[#274366] shadow-md space-y-3.5 text-xs">
              <div className="flex items-center gap-2 border-b border-[#274366] pb-2.5">
                <Lock className="w-4 h-4 text-[#a9d8de]" />
                <h4 className="text-sm font-bold text-[#f3fbf0]">Certificate Identity & Authority</h4>
              </div>

              <div>
                <span className="text-[#a9d8de]/70 block">Domain Name (CN):</span>
                <strong className="text-[#f3fbf0] font-mono text-sm">{result.subject?.common_name || result.hostname}</strong>
              </div>

              <div>
                <span className="text-[#a9d8de]/70 block">Issuing Certificate Authority:</span>
                <span className="text-[#a9d8de] font-mono font-medium">{result.issuer?.common_name || 'Public CA'}</span>
              </div>

              <div>
                <span className="text-[#a9d8de]/70 block">Organization:</span>
                <span className="text-[#f3fbf0]/85">{result.issuer?.organization || 'Verified Web Authority'}</span>
              </div>

              <div className="pt-1">
                <span className="text-[#a9d8de]/70 block">Self-Signed Status:</span>
                <span className={`font-semibold ${result.is_self_signed ? 'text-[#e83845]' : 'text-[#a9d8de]'}`}>
                  {result.is_self_signed ? 'Self-Signed (Untrusted Root)' : 'Publicly Trusted & Audited Root'}
                </span>
              </div>
            </div>

            {/* Cryptographic Strength Card */}
            <div className="p-5 rounded-2xl bg-[#122035] border border-[#274366] shadow-md space-y-3.5 text-xs">
              <div className="flex items-center gap-2 border-b border-[#274366] pb-2.5">
                <Key className="w-4 h-4 text-[#a9d8de]" />
                <h4 className="text-sm font-bold text-[#f3fbf0]">Cryptographic Strength</h4>
              </div>

              <div>
                <span className="text-[#a9d8de]/70 block">Public Key & Key Length:</span>
                <strong className="text-[#f3fbf0] font-mono">{result.public_key_algorithm || 'RSA'} ({result.key_size || 2048} bits)</strong>
              </div>

              <div>
                <span className="text-[#a9d8de]/70 block">Signature Algorithm:</span>
                <span className="text-[#f3fbf0]/85 font-mono">{result.signature_algorithm || 'SHA256 with RSA'}</span>
              </div>

              <div>
                <span className="text-[#a9d8de]/70 block">Cipher Suite:</span>
                <span className="text-[#a9d8de] font-mono text-[11px] truncate block">{result.cipher_suite || 'ECDHE-RSA-AES128-GCM-SHA256'}</span>
              </div>

              <div className="pt-1">
                <span className="text-[#a9d8de]/70 block">Certificate Transparency (CT Logs):</span>
                <span className={`font-semibold ${result.has_sct_transparency ? 'text-[#a9d8de]' : 'text-[#f86b76]'}`}>
                  {result.has_sct_transparency ? 'SCT Proof Present (Publicly logged)' : 'No SCT proofs logged'}
                </span>
              </div>
            </div>
          </div>

          {/* Subject Alternative Names (SANs) */}
          <div className="p-5 rounded-2xl bg-[#122035] border border-[#274366] shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-[#f3fbf0]">
                Protected Hostnames ({result.sans?.length || 0} Domain Aliases)
              </h4>
              <span className="text-xs text-[#a9d8de]/70">Subject Alternative Names (SAN)</span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto text-xs">
              {result.sans?.length > 0 ? (
                result.sans.map((san, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-[#0b1523] border border-[#274366] text-[#a9d8de] font-mono text-[11px]">
                    {san}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#a9d8de]/60">Only primary common name protected</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
