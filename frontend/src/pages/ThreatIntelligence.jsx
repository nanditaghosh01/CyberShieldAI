import React, { useState } from 'react';
import { Globe, Search, ShieldCheck, AlertTriangle, Database, Activity, CheckCircle2, Server, Mail, ShieldAlert } from 'lucide-react';
import { ThreatBadge } from '../components/ThreatBadge';
import { api } from '../services/api';

export const ThreatIntelligence = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleLookup = async (targetUrl) => {
    const toQuery = targetUrl || url;
    if (!toQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.lookupThreat(toQuery.trim());
      setResult(data);
    } catch (err) {
      setError(err.message || 'Lookup failed. Please verify domain name.');
    } finally {
      setLoading(false);
    }
  };

  const intel = result?.threat_intelligence || {};
  const domain = result?.domain_analysis || {};

  const sampleTargets = [
    { name: 'Google.com (Safe)', url: 'google.com' },
    { name: 'Wikipedia.org', url: 'wikipedia.org' },
    { name: 'Known Phish Sample', url: 'http://paypal-verification-account-update.xyz' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Card */}
      <div className="rounded-2xl bg-[#122035] border border-[#274366] p-6 sm:p-7 shadow-lg">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-[#1d3557] border border-[#457b9d]/40 flex items-center justify-center text-[#a9d8de]">
            <Globe className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold text-[#f3fbf0]">
            Domain Reputation & Threat Feeds
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#a9d8de]/85 max-w-2xl leading-relaxed mb-4">
          Cross-reference domain names against leading security blocklists, analyze DNS servers, and check for historical malicious campaign activity.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#457b9d] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter domain or web link (e.g. suspicious-site.top or github.com)"
              className="w-full pl-10 pr-4 py-3 bg-[#0b1523] border border-[#274366] rounded-xl text-xs sm:text-sm text-[#f3fbf0] placeholder-[#a9d8de]/40 focus:outline-none focus:border-[#457b9d] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-[#457b9d] hover:bg-[#a9d8de] text-[#0b1523] font-bold text-xs sm:text-sm transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? 'Checking Feeds...' : 'Query Threat Feeds'}
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-[#a9d8de]/70">
          <span>Try an example:</span>
          {sampleTargets.map((target) => (
            <button
              key={target.name}
              type="button"
              onClick={() => {
                setUrl(target.url);
                handleLookup(target.url);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#182b45] hover:bg-[#1d3557] hover:text-[#f3fbf0] border border-[#274366] text-[11px] text-[#a9d8de] transition-colors"
            >
              {target.name}
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
          {/* Domain Verdict Banner */}
          <div className="p-6 rounded-2xl bg-[#122035] border border-[#274366] shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <span className="text-xs text-[#a9d8de]/70 font-medium">Domain Examined</span>
              <div className="text-2xl font-bold font-mono text-[#f3fbf0] mt-0.5">
                {result.domain}
              </div>
              <div className="mt-2 flex items-center gap-2.5">
                <span className="text-xs text-[#a9d8de]/80">Reputation Rating:</span>
                <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                  (intel.reputation_score || 85) >= 70 ? 'bg-[#182b45] text-[#a9d8de]' : 'bg-[#28070a] text-[#e83845] border border-[#e83845]/40'
                }`}>
                  {intel.reputation_score || 85} / 100
                </span>
                <span className="text-xs text-[#a9d8de]/70">
                  ({(intel.reputation_score || 85) >= 70 ? 'High Trust Domain' : 'Low Trust / Suspicious'})
                </span>
              </div>
            </div>

            <div className="w-full sm:w-auto text-left sm:text-right">
              <ThreatBadge category={intel.is_flagged ? 'Malicious' : 'Legitimate'} size="lg" />
              <span className="text-[11px] text-[#a9d8de]/70 block mt-1.5">
                {intel.is_flagged ? 'Flagged by at least one global feed' : 'No active feed blacklist entries'}
              </span>
            </div>
          </div>

          {/* Integrated Intelligence Feeds */}
          <div className="rounded-2xl bg-[#122035] border border-[#274366] p-6 shadow-lg">
            <h3 className="text-base font-bold text-[#f3fbf0] mb-1">
              Live Threat Feed Results
            </h3>
            <p className="text-xs text-[#a9d8de]/80 mb-5">
              Verified status across independent security registries and malware clearinghouses.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {intel.threat_sources && Object.entries(intel.threat_sources).map(([feed, data]) => {
                const isFlagged = data.match;
                return (
                  <div
                    key={feed}
                    className={`p-4 rounded-xl border transition-all ${
                      isFlagged
                        ? 'bg-[#28070a] border-[#e83845] shadow-sm'
                        : 'bg-[#0b1523] border-[#274366]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#f3fbf0]">{feed}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isFlagged ? 'bg-[#e83845] text-[#f3fbf0]' : 'bg-[#182b45] text-[#a9d8de]'
                      }`}>
                        {isFlagged ? 'FLAGGED' : 'CLEAN'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a9d8de]/80">
                      {isFlagged ? 'Domain reported as malicious.' : 'No active reports or threats found.'}
                    </p>
                    <span className="text-[10px] text-[#457b9d] block mt-2 font-mono truncate">
                      {data.status || 'Active inspection'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DNS Infrastructure Details */}
          <div className="rounded-2xl bg-[#122035] border border-[#274366] p-6 shadow-lg">
            <h3 className="text-base font-bold text-[#f3fbf0] mb-1">
              DNS Infrastructure & Server Records
            </h3>
            <p className="text-xs text-[#a9d8de]/80 mb-5">
              Infrastructure analysis reveals whether a website is backed by legitimate enterprise mail and name servers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[#0b1523] border border-[#274366] space-y-1">
                <div className="flex items-center gap-1.5 text-[#a9d8de] font-sans font-semibold mb-2">
                  <Server className="w-3.5 h-3.5 text-[#457b9d]" />
                  <span>A Records (Web Host IP)</span>
                </div>
                {domain.dns_records?.A?.length > 0 ? (
                  domain.dns_records.A.map((ip, i) => (
                    <div key={i} className="text-[#f3fbf0] text-[11px]">{ip}</div>
                  ))
                ) : (
                  <span className="text-[#a9d8de]/50 font-sans text-[11px]">No IP records returned</span>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#0b1523] border border-[#274366] space-y-1">
                <div className="flex items-center gap-1.5 text-[#a9d8de] font-sans font-semibold mb-2">
                  <Mail className="w-3.5 h-3.5 text-[#457b9d]" />
                  <span>MX Records (Email Routing)</span>
                </div>
                {domain.dns_records?.MX?.length > 0 ? (
                  domain.dns_records.MX.map((mx, i) => (
                    <div key={i} className="text-[#f3fbf0] text-[11px] truncate" title={mx}>{mx}</div>
                  ))
                ) : (
                  <span className="text-[#a9d8de]/50 font-sans text-[11px]">No mail exchange records</span>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#0b1523] border border-[#274366] space-y-1">
                <div className="flex items-center gap-1.5 text-[#a9d8de] font-sans font-semibold mb-2">
                  <Globe className="w-3.5 h-3.5 text-[#457b9d]" />
                  <span>Nameservers (DNS)</span>
                </div>
                {domain.dns_records?.NS?.length > 0 ? (
                  domain.dns_records.NS.map((ns, i) => (
                    <div key={i} className="text-[#f3fbf0] text-[11px] truncate" title={ns}>{ns}</div>
                  ))
                ) : (
                  <span className="text-[#a9d8de]/50 font-sans text-[11px]">Default provider</span>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#0b1523] border border-[#274366] space-y-1">
                <div className="flex items-center gap-1.5 text-[#a9d8de] font-sans font-semibold mb-2">
                  <Activity className="w-3.5 h-3.5 text-[#457b9d]" />
                  <span>Reverse DNS (PTR)</span>
                </div>
                <span className="text-[#f3fbf0] text-[11px] truncate block" title={domain.reverse_dns}>
                  {domain.reverse_dns || 'No reverse PTR verified'}
                </span>
                <span className="text-[10px] text-[#457b9d] font-sans block mt-2">
                  Verifies host identity
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
