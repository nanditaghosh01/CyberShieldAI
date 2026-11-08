import React, { useState } from 'react';
import { Globe, Search, ShieldCheck, AlertTriangle, Database, Activity } from 'lucide-react';
import { ThreatBadge } from '../components/ThreatBadge';
import { api } from '../services/api';

export const ThreatIntelligence = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleLookup = async (e) => {
    e?.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.lookupThreat(url.trim());
      setResult(data);
    } catch (err) {
      setError(err.message || 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const intel = result?.threat_intelligence || {};
  const domain = result?.domain_analysis || {};

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#0c1424] border border-cyan-500/30 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-wide">
            Threat Intelligence & Domain Reputation Feeds
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Query cross-referenced threat feeds (Google Safe Browsing, VirusTotal, URLhaus, PhishTank), DNS infrastructure records, and domain email security posture.
        </p>

        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. suspicious-phish.top or legitimate-site.com"
            className="flex-1 px-4 py-3 bg-[#080d18] border border-slate-700/80 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Querying...' : 'Query Threat Feeds'}
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
          {/* Feed Match Summary Banner */}
          <div className="p-5 rounded-xl bg-[#0c1424] border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Target Domain</span>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">
                {result.domain}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-slate-400">Reputation Score:</span>
                <strong className={`font-mono ${intel.reputation_score < 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {intel.reputation_score} / 100
                </strong>
              </div>
            </div>
            <div>
              <ThreatBadge category={intel.is_flagged ? 'Malicious' : 'Legitimate'} size="lg" />
            </div>
          </div>

          {/* Integrated Intelligence Feeds */}
          <div className="rounded-xl bg-[#0c1424] border border-slate-800 p-5">
            <h3 className="text-sm font-bold text-white mb-3">Feed Attribution & Match Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {intel.threat_sources && Object.entries(intel.threat_sources).map(([feed, data]) => (
                <div key={feed} className="p-4 rounded-xl bg-[#080d18] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{feed}</span>
                    <span className={`text-[11px] font-mono font-bold ${data.match ? 'text-red-400' : 'text-emerald-400'}`}>
                      {data.match ? 'FLAGGED' : 'CLEAN'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">{data.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* DNS Infrastructure */}
          <div className="rounded-xl bg-[#0c1424] border border-slate-800 p-5">
            <h3 className="text-sm font-bold text-white mb-3">DNS Infrastructure Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#080d18] border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">A Records (IPv4)</span>
                {domain.dns_records?.A?.length > 0 ? (
                  domain.dns_records.A.map((ip, i) => <div key={i} className="text-slate-200">{ip}</div>)
                ) : <span className="text-slate-500">None</span>}
              </div>
              <div className="p-3 rounded-lg bg-[#080d18] border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">MX Records (Mail)</span>
                {domain.dns_records?.MX?.length > 0 ? (
                  domain.dns_records.MX.map((mx, i) => <div key={i} className="text-slate-200 truncate">{mx}</div>)
                ) : <span className="text-slate-500">None</span>}
              </div>
              <div className="p-3 rounded-lg bg-[#080d18] border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">NS Records (Nameserver)</span>
                {domain.dns_records?.NS?.length > 0 ? (
                  domain.dns_records.NS.map((ns, i) => <div key={i} className="text-slate-200 truncate">{ns}</div>)
                ) : <span className="text-slate-500">None</span>}
              </div>
              <div className="p-3 rounded-lg bg-[#080d18] border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">Reverse DNS PTR</span>
                <span className="text-slate-200 truncate block">{domain.reverse_dns || 'None'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

