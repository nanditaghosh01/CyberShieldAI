import React, { useState, useEffect } from 'react';
import { History, Search, Download, ExternalLink, Filter } from 'lucide-react';
import { ThreatBadge } from '../components/ThreatBadge';
import { api } from '../services/api';

export const ScanHistory = ({ onOpenScan }) => {
  const [scans, setScans] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getScanHistory(filterRisk);
        setScans(data);
      } catch (err) {
        console.error('Failed to fetch scan history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [filterRisk]);

  const filteredScans = scans.filter(s => {
    const term = search.toLowerCase();
    return (s.url || '').toLowerCase().includes(term) || (s.domain || '').toLowerCase().includes(term);
  });

  const handleDownload = async (scan) => {
    try {
      const text = await api.getScanReport(scan.id);
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CyberShield_Audit_${scan.domain || 'scan'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert("Download failed: " + err.message);
    }
  };

  const riskFilters = ["All", "Low Risk", "Moderate Risk", "Elevated Risk", "High Risk", "Critical Risk"];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#0c1424] border border-cyan-500/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Historical Security Scans & Threat Audits
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Review previous scans, download technical audit logs, and inspect changes in website risk scores.
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scans by URL or domain..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#080d18] border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {riskFilters.map(rf => (
            <button
              key={rf}
              onClick={() => setFilterRisk(rf)}
              className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filterRisk === rf
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white bg-[#0c1424] border border-slate-800'
              }`}
            >
              {rf}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-xl bg-[#0c1424] border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080d18] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Target Domain / URL</th>
                <th className="py-3 px-4 font-semibold">Classification</th>
                <th className="py-3 px-4 font-semibold">Risk Score</th>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredScans.length > 0 ? (
                filteredScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4 text-white font-bold truncate max-w-sm">
                      {scan.url}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <ThreatBadge category={scan.threat_classification} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <strong className="text-sm font-mono text-white">{scan.risk_score}</strong>
                      <span className="text-slate-500 text-[10px]">/100</span>
                      <span className="text-slate-400 text-[11px] block font-sans">{scan.risk_category}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] font-sans">
                      {new Date(scan.scan_timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(scan)}
                          title="Download Report"
                          className="p-1.5 rounded bg-[#080d18] border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenScan && onOpenScan(scan)}
                          className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-sans font-semibold transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-sans">
                    {loading ? 'Loading scan history...' : 'No historical scans found matching query.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

