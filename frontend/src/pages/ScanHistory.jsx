import React, { useState, useEffect } from 'react';
import { History, Search, Download, ExternalLink, Filter, ShieldCheck, AlertTriangle } from 'lucide-react';
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
      a.download = `CyberShield_Report_${scan.domain || 'scan'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert("Download failed: " + err.message);
    }
  };

  const riskFilters = [
    { label: "All Scans", value: "All" },
    { label: "Low Risk", value: "Low Risk" },
    { label: "Moderate Risk", value: "Moderate Risk" },
    { label: "Elevated Risk", value: "Elevated Risk" },
    { label: "High Risk", value: "High Risk" },
    { label: "Critical Risk", value: "Critical Risk" }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Card */}
      <div className="rounded-2xl bg-[#122035] border border-[#274366] p-6 sm:p-7 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-[#1d3557] border border-[#457b9d]/40 flex items-center justify-center text-[#a9d8de]">
              <History className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-[#f3fbf0]">
              Inspection History & Saved Reports
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#a9d8de]/85 max-w-2xl leading-relaxed">
            Browse through previous URL scans, download offline audit summaries, and review identified security vulnerabilities.
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#457b9d] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved scans by web address or domain..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b1523] border border-[#274366] text-xs sm:text-sm text-[#f3fbf0] placeholder-[#a9d8de]/40 focus:outline-none focus:border-[#457b9d] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          {riskFilters.map(rf => (
            <button
              key={rf.value}
              onClick={() => setFilterRisk(rf.value)}
              className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                filterRisk === rf.value
                  ? 'bg-[#1d3557] text-[#f3fbf0] border border-[#457b9d]'
                  : 'text-[#a9d8de]/70 hover:text-[#f3fbf0] bg-[#122035] border border-[#274366]'
              }`}
            >
              {rf.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Table Card */}
      <div className="rounded-2xl bg-[#122035] border border-[#274366] overflow-hidden shadow-lg">
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead className="bg-[#0b1523] text-[#a9d8de] border-b border-[#274366]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Web Address / Target</th>
                <th className="py-3.5 px-4 font-semibold">Classification</th>
                <th className="py-3.5 px-4 font-semibold">Safety Score</th>
                <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#274366]/60">
              {filteredScans.length > 0 ? (
                filteredScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-[#182b45]/50 transition-colors">
                    <td className="py-3.5 px-4 text-[#f3fbf0] font-medium truncate max-w-sm">
                      <span className="font-mono text-xs">{scan.url}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <ThreatBadge category={scan.threat_classification} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-baseline gap-1">
                        <strong className="text-sm font-bold font-mono text-[#f3fbf0]">{scan.risk_score}</strong>
                        <span className="text-[10px] text-[#457b9d]">/100</span>
                      </div>
                      <span className="text-[11px] text-[#a9d8de]/70 block">{scan.risk_category}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#a9d8de]/80 text-[11px]">
                      {new Date(scan.scan_timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(scan)}
                          title="Download summary report"
                          className="p-1.5 rounded-lg bg-[#0b1523] border border-[#274366] text-[#a9d8de] hover:text-[#f3fbf0] hover:border-[#457b9d] transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenScan && onOpenScan(scan)}
                          className="px-3 py-1.5 rounded-lg bg-[#182b45] hover:bg-[#457b9d] hover:text-[#0b1523] text-[#f3fbf0] border border-[#274366] text-xs font-semibold transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-[#a9d8de]/70">
                    <div className="flex flex-col items-center gap-2">
                      <History className="w-8 h-8 text-[#457b9d]" />
                      <span className="font-semibold text-[#f3fbf0]">
                        {loading ? 'Retrieving scan records...' : 'No historical scans match this filter.'}
                      </span>
                      <span className="text-xs text-[#a9d8de]/60">
                        Scan any link from the URL Scanner to see its history here.
                      </span>
                    </div>
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
