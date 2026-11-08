import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Skull, 
  CheckCircle, 
  Globe, 
  ArrowRight, 
  ExternalLink,
  Shield, 
  Lock, 
  FileText,
  Activity
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { ThreatBadge } from '../components/ThreatBadge';
import { api } from '../services/api';

export const Dashboard = ({ onSelectTab, onOpenScan }) => {
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, scansData, reportsData] = await Promise.all([
          api.getDashboardStats(),
          api.getScanHistory(),
          api.getCommunityReports()
        ]);
        setStats(statsData);
        setRecentScans(scansData.slice(0, 5));
        setRecentReports(reportsData.slice(0, 4));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const threatData = stats?.threat_distribution || [
    { name: 'Legitimate', value: 45, color: '#10b981' },
    { name: 'Suspicious', value: 18, color: '#f59e0b' },
    { name: 'Phishing', value: 24, color: '#f97316' },
    { name: 'Malicious', value: 12, color: '#ef4444' }
  ];

  const riskBarData = [
    { range: '0-20 (Low)', count: stats?.secure_analyzed || 45, fill: '#10b981' },
    { range: '21-40 (Mod)', count: 14, fill: '#0ea5e9' },
    { range: '41-60 (Elev)', count: stats?.suspicious_detected || 18, fill: '#f59e0b' },
    { range: '61-80 (High)', count: stats?.phishing_detected || 24, fill: '#f97316' },
    { range: '81-100 (Crit)', count: stats?.malicious_detected || 12, fill: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome / Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c162b] via-[#0d1c3a] to-[#0a1224] border border-cyan-500/20 p-6 shadow-[0_0_30px_rgba(0,240,255,0.08)]">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-semibold tracking-wider text-cyan-300 uppercase font-mono">
                Unified Web Threat Protection
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              CyberShield AI Security Intelligence
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time multi-dimensional detection combining Machine Learning URL heuristics, passive web configuration auditing, SSL/TLS cryptographic verification, and collaborative threat intelligence.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('scanner')}
            className="self-start md:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all transform active:scale-95"
          >
            <span>Launch Security Scanner</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Scanned"
          value={stats?.total_scanned ?? 0}
          icon={Globe}
          color="cyan"
          subtitle="All inspected domains"
        />
        <MetricCard
          title="Phishing Detected"
          value={stats?.phishing_detected ?? 0}
          icon={AlertTriangle}
          color="amber"
          subtitle="Deceptive credential traps"
        />
        <MetricCard
          title="Malicious Identified"
          value={stats?.malicious_detected ?? 0}
          icon={Skull}
          color="rose"
          subtitle="Confirmed threat & malware"
        />
        <MetricCard
          title="Secure Analysed"
          value={stats?.secure_analyzed ?? 0}
          icon={CheckCircle}
          color="emerald"
          subtitle="Structurally verified sites"
        />
        <MetricCard
          title="Requires Attention"
          value={stats?.requiring_attention ?? 0}
          icon={Shield}
          color="blue"
          subtitle="Weak crypto or missing headers"
        />
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Threat Distribution Donut */}
        <div className="lg:col-span-5 rounded-xl bg-[#0c1424] border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Threat Classification Distribution</h3>
              <p className="text-xs text-slate-400">Class breakdown across all analyzed endpoints</p>
            </div>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={threatData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {threatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0c1424" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#070b14', borderColor: '#1e2c47', borderRadius: '8px', fontSize: '12px' }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  formatter={(val) => <span className="text-xs text-slate-300">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Level Distribution Bar Chart */}
        <div className="lg:col-span-7 rounded-xl bg-[#0c1424] border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Unified Risk Score Distribution</h3>
              <p className="text-xs text-slate-400">0-100 severity index across scanned assets</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
              Composite Model
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#070b14', borderColor: '#1e2c47', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Motivating Security Incident Banner: eMudhra CA Case Study */}
      <div className="rounded-xl bg-[#0f192e] border border-blue-500/30 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Case Study Highlight: eMudhra TLS Certificate Incident
              </span>
              <span className="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                CA Trust Analysis
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              HTTPS alone is not proof of legitimacy. The eMudhra incident demonstrates that improper Certificate Authority practices or unauthorized intermediate certificates can issue valid-looking padlocks for unauthorized domains. CyberShield AI rigorously verifies issuing CA roots, certificate chains, and Certificate Transparency (CT) logs.
            </p>
          </div>
        </div>
        <button
          onClick={() => onSelectTab('ssl')}
          className="whitespace-nowrap px-3.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30 transition-all flex items-center gap-1.5"
        >
          <span>Inspect SSL/TLS</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recent Scans and Community Feeds Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Scans Table */}
        <div className="lg:col-span-7 rounded-xl bg-[#0c1424] border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Recent Security Scans</h3>
              <p className="text-xs text-slate-400">Latest inspected targets and calculated risk levels</p>
            </div>
            <button
              onClick={() => onSelectTab('history')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 bg-[#080d18]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Target Domain / URL</th>
                  <th className="py-2.5 px-3 font-semibold">Classification</th>
                  <th className="py-2.5 px-3 font-semibold">Risk Score</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentScans.length > 0 ? (
                  recentScans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-200 truncate max-w-xs">
                        {scan.domain || scan.url}
                      </td>
                      <td className="py-2.5 px-3">
                        <ThreatBadge category={scan.threat_classification} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span style={{ color: scan.details?.risk_scoring?.color_code || '#fff' }}>
                          {scan.risk_score}
                        </span>
                        <span className="text-slate-500 text-[10px]">/100</span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onOpenScan && onOpenScan(scan)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-[11px] font-medium transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No security scans recorded yet. Enter a website URL to begin analysis.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Community Reports Feed */}
        <div className="lg:col-span-5 rounded-xl bg-[#0c1424] border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Community Threat Intelligence</h3>
              <p className="text-xs text-slate-400">Crowdsourced submissions & status verification</p>
            </div>
            <button
              onClick={() => onSelectTab('community')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              <span>Submit Report</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <div key={report.id} className="p-3 rounded-lg bg-[#080d18] border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-mono font-semibold text-slate-200 truncate">
                      {report.url}
                    </span>
                    <ThreatBadge category={report.status} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {report.description}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                    <span>Category: <strong className="text-slate-300">{report.threat_category}</strong></span>
                    <span>Votes: <strong className="text-emerald-400">+{report.upvotes}</strong> / <strong className="text-rose-400">-{report.downvotes}</strong></span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-slate-500">No community threat reports submitted yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

