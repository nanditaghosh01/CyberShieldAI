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
    { name: 'Legitimate', value: 45, color: '#a9d8de' }, // Ice Blue
    { name: 'Suspicious', value: 18, color: '#457b9d' }, // Steel Cerulean
    { name: 'Phishing', value: 24, color: '#e83845' },   // Harmful Coral Red
    { name: 'Malicious', value: 12, color: '#a81b26' }   // Harmful Deep Crimson Red
  ];

  const riskBarData = [
    { range: '0-20 (Low)', count: stats?.secure_analyzed || 45, fill: '#a9d8de' },
    { range: '21-40 (Mod)', count: 14, fill: '#457b9d' },
    { range: '41-60 (Elev)', count: stats?.suspicious_detected || 18, fill: '#f86b76' },
    { range: '61-80 (High)', count: stats?.phishing_detected || 24, fill: '#e83845' },
    { range: '81-100 (Crit)', count: stats?.malicious_detected || 12, fill: '#a81b26' }
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Welcome / Hero Banner */}
      <div className="rounded-2xl bg-[#122035] border border-[#274366] p-4 sm:p-6 lg:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#a9d8de]" />
              <span className="text-xs font-semibold text-[#a9d8de]">
                Website Trust & Safety Center
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-[#f3fbf0] tracking-tight">
              Know if a website is safe before you click
            </h2>
            <p className="text-xs sm:text-sm text-[#a9d8de]/85 max-w-2xl leading-relaxed">
              Check links for phishing scams, fake banking logins, and malicious downloads. We verify the actual SSL certificate, domain history, and public community reports in real time.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('scanner')}
            className="self-start md:self-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#457b9d] hover:bg-[#a9d8de] text-[#0b1523] font-bold text-xs sm:text-sm shadow-sm transition-all transform active:scale-95 shrink-0 w-full sm:w-auto"
          >
            <span>Scan a Website</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid: Responsive across Mobile (2-col), Tablet (3-col), PC (5-col) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <MetricCard
          title="Links Inspected"
          value={stats?.total_scanned ?? 0}
          icon={Globe}
          color="ice"
          subtitle="Websites scanned to date"
        />
        <MetricCard
          title="Phishing Traps"
          value={stats?.phishing_detected ?? 0}
          icon={AlertTriangle}
          color="red"
          subtitle="Fake logins & clones"
        />
        <MetricCard
          title="Malicious Sites"
          value={stats?.malicious_detected ?? 0}
          icon={Skull}
          color="deepRed"
          subtitle="Confirmed exploits"
        />
        <MetricCard
          title="Verified Safe"
          value={stats?.secure_analyzed ?? 0}
          icon={CheckCircle}
          color="honeydew"
          subtitle="Clean and verified"
        />
        <div className="col-span-2 md:col-span-1">
          <MetricCard
            title="Needs Attention"
            value={stats?.requiring_attention ?? 0}
            icon={Shield}
            color="steel"
            subtitle="Weak security or missing SSL"
          />
        </div>
      </div>

      {/* Visual Charts Row: Tablet & PC side-by-side, Mobile stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Threat Distribution Donut */}
        <div className="lg:col-span-5 rounded-2xl bg-[#122035] border border-[#274366] p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#f3fbf0]">Website Safety Breakdown</h3>
              <p className="text-[11px] sm:text-xs text-[#a9d8de]/75">Categorization across all analyzed links</p>
            </div>
            <Activity className="w-4 h-4 text-[#a9d8de]" />
          </div>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={threatData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {threatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#122035" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b1523', borderColor: '#274366', borderRadius: '8px', fontSize: '12px', color: '#f3fbf0' }} 
                  itemStyle={{ color: '#f3fbf0' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={32} 
                  iconType="circle" 
                  formatter={(val) => <span className="text-[11px] sm:text-xs text-[#a9d8de]">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Level Distribution Bar Chart */}
        <div className="lg:col-span-7 rounded-2xl bg-[#122035] border border-[#274366] p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#f3fbf0]">Risk Score Distribution</h3>
              <p className="text-[11px] sm:text-xs text-[#a9d8de]/75">From 0 (clean & safe) to 100 (critical threat)</p>
            </div>
            <span className="text-[11px] text-[#a9d8de] bg-[#182b45] px-2.5 py-0.5 rounded-full border border-[#274366]">
              Risk Range
            </span>
          </div>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="range" stroke="#457b9d" fontSize={10} tickLine={false} />
                <YAxis stroke="#457b9d" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b1523', borderColor: '#274366', borderRadius: '8px', fontSize: '12px', color: '#f3fbf0' }}
                  itemStyle={{ color: '#f3fbf0' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Motivating Security Incident Banner: eMudhra CA Case Study */}
      <div className="rounded-2xl bg-[#182b45] border border-[#274366] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#122035] border border-[#274366] text-[#a9d8de] mt-0.5 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#a9d8de] block mb-1">
              Why HTTPS alone isn't proof of safety: The eMudhra incident
            </span>
            <p className="text-xs text-[#f3fbf0]/85 leading-relaxed">
              Many phishing sites now have valid SSL certificates and display a green padlock. Incidents like eMudhra showed that unauthorized intermediate certificates can make fraudulent portals look authentic. CyberShield verifies issuing authorities, key lengths, and Certificate Transparency (CT) records rather than assuming a lock icon means trust.
            </p>
          </div>
        </div>
        <button
          onClick={() => onSelectTab('ssl')}
          className="whitespace-nowrap px-4 py-2 rounded-xl bg-[#122035] hover:bg-[#1d3557] text-[#f3fbf0] text-xs font-medium border border-[#274366] hover:border-[#457b9d] transition-all flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto"
        >
          <span>Learn More</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#a9d8de]" />
        </button>
      </div>

      {/* Recent Scans and Community Feeds Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Recent Scans Table */}
        <div className="lg:col-span-7 rounded-2xl bg-[#122035] border border-[#274366] p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 className="text-sm font-bold text-[#f3fbf0] tracking-tight">Recent Security Scans</h3>
              <p className="text-xs text-[#a9d8de]/70">Latest inspected targets and calculated risk levels</p>
            </div>
            <button
              onClick={() => onSelectTab('history')}
              className="text-xs text-[#a9d8de] hover:text-[#f3fbf0] font-medium flex items-center gap-1 shrink-0"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[480px]">
              <thead className="text-[#a9d8de] border-b border-[#274366] bg-[#0b1523]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Target Domain / URL</th>
                  <th className="py-2.5 px-3 font-semibold">Classification</th>
                  <th className="py-2.5 px-3 font-semibold">Risk Score</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#274366]/60">
                {recentScans.length > 0 ? (
                  recentScans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-[#182b45]/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[#f3fbf0] truncate max-w-[180px] sm:max-w-xs">
                        {scan.domain || scan.url}
                      </td>
                      <td className="py-2.5 px-3">
                        <ThreatBadge category={scan.threat_classification} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span style={{ color: scan.details?.risk_scoring?.color_code || '#a9d8de' }}>
                          {scan.risk_score}
                        </span>
                        <span className="text-[#457b9d] text-[10px]">/100</span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onOpenScan && onOpenScan(scan)}
                          className="px-2.5 py-1 rounded-lg bg-[#182b45] hover:bg-[#457b9d] text-[#f3fbf0] border border-[#274366] text-[11px] font-medium transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#a9d8de]/60">
                      No security scans recorded yet. Enter a website URL to begin analysis.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Community Reports Feed */}
        <div className="lg:col-span-5 rounded-2xl bg-[#122035] border border-[#274366] p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 className="text-sm font-bold text-[#f3fbf0] tracking-tight">Community Threat Watch</h3>
              <p className="text-xs text-[#a9d8de]/70">Crowdsourced submissions & status verification</p>
            </div>
            <button
              onClick={() => onSelectTab('community')}
              className="text-xs text-[#a9d8de] hover:text-[#f3fbf0] font-medium flex items-center gap-1 shrink-0"
            >
              <span>Submit Report</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <div key={report.id} className="p-3.5 rounded-xl bg-[#0b1523] border border-[#274366] hover:border-[#457b9d] transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-mono font-semibold text-[#f3fbf0] truncate">
                      {report.url}
                    </span>
                    <ThreatBadge category={report.status} size="sm" />
                  </div>
                  <p className="text-[11px] text-[#a9d8de]/85 line-clamp-2">
                    {report.description}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#274366]/60 text-[10px] text-[#a9d8de]/70 font-mono">
                    <span>Category: <strong className="text-[#f3fbf0]">{report.threat_category}</strong></span>
                    <span>Votes: <strong className="text-[#a9d8de]">+{report.upvotes}</strong> / <strong className="text-[#e83845]">-{report.downvotes}</strong></span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-[#a9d8de]/60">No community threat reports submitted yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
