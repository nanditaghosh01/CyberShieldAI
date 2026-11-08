import React, { useState, useEffect } from 'react';
import { Users, Plus, ThumbsUp, ThumbsDown, ShieldAlert, CheckCircle, Clock, Filter, AlertTriangle } from 'lucide-react';
import { ThreatBadge } from '../components/ThreatBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const CommunityReports = () => {
  const { user, isAnalyst } = useAuth();
  const [reports, setReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [formUrl, setFormUrl] = useState('');
  const [formCategory, setFormCategory] = useState('Phishing');
  const [formDesc, setFormDesc] = useState('');
  const [formEvidence, setFormEvidence] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState(null);

  const fetchReports = async () => {
    try {
      const data = await api.getCommunityReports(filterStatus !== 'All' ? filterStatus : null);
      setReports(data);
    } catch (err) {
      console.error('Failed to fetch community reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formUrl.trim() || !formDesc.trim()) return;

    setFormSubmitting(true);
    setFormMsg(null);

    try {
      await api.submitCommunityReport({
        url: formUrl.trim(),
        threat_category: formCategory,
        description: formDesc.trim(),
        evidence: formEvidence.trim()
      });
      setFormMsg({ type: 'success', text: 'Report submitted successfully for community validation.' });
      setFormUrl('');
      setFormDesc('');
      setFormEvidence('');
      setShowForm(false);
      fetchReports();
    } catch (err) {
      setFormMsg({ type: 'error', text: err.message || 'Submission failed' });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleVote = async (reportId, voteType) => {
    try {
      const updated = await api.voteCommunityReport(reportId, voteType);
      setReports(prev => prev.map(r => (r.id === reportId ? updated : r)));
    } catch (err) {
      alert("Vote failed: " + err.message);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await api.updateReportStatus(reportId, newStatus);
      fetchReports();
    } catch (err) {
      alert("Status update failed: " + err.message);
    }
  };

  const categories = [
    "Phishing", 
    "Fake Payment", 
    "Fake Recruitment", 
    "Malware Distribution", 
    "Brand Impersonation", 
    "Scam"
  ];

  const statuses = ["All", "Pending", "Under Review", "Verified Malicious", "False Positive"];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl bg-[#0c1424] border border-cyan-500/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Collaborative Community Threat Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Report suspicious portals, fake job offers, and phishing lures. Community consensus and security analysts validate reports to stop active campaigns.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Cancel Submission' : 'Submit Threat Report'}</span>
        </button>
      </div>

      {/* Submission Form Modal / Panel */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#0c1424] border border-cyan-500/40 space-y-4">
          <h3 className="text-sm font-bold text-white">Submit Suspicious Website or Phishing Portal</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Suspicious URL / Domain *</label>
              <input
                type="text"
                required
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="e.g. http://fake-login-bank.xyz"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#080d18] border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Threat Category *</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#080d18] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Description of Threat *</label>
            <textarea
              required
              rows={3}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Explain why this portal is deceptive (e.g. imitates university admission login, asks for credit card upfront, typosquatted brand name)..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#080d18] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Evidence or Supporting Details (Optional)</label>
            <input
              type="text"
              value={formEvidence}
              onChange={(e) => setFormEvidence(e.target.value)}
              placeholder="e.g. Received via SMS smishing lure, unencrypted form POST action, fake registration fee demanded"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#080d18] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50"
            >
              {formSubmitting ? 'Submitting...' : 'Submit to Community'}
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
        {statuses.map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterStatus === st
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div key={report.id} className="p-5 rounded-xl bg-[#0c1424] border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-mono font-bold text-white truncate max-w-md">
                    {report.url}
                  </span>
                  <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                    {report.threat_category}
                  </span>
                </div>
                <ThreatBadge category={report.status} size="sm" />
              </div>

              <p className="text-xs text-slate-300 my-2">
                {report.description}
              </p>

              {report.evidence && (
                <div className="text-[11px] font-mono text-cyan-300/80 bg-cyan-950/20 p-2 rounded border border-cyan-500/20 mb-3">
                  <strong>Evidence:</strong> {report.evidence}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span>Reported by: <strong className="text-slate-300">{report.submitted_by}</strong></span>
                  <span>•</span>
                  <span>{new Date(report.submitted_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Voting buttons */}
                  <button
                    onClick={() => handleVote(report.id, 'up')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#080d18] border border-slate-800 hover:border-emerald-500/40 text-emerald-400 text-xs font-mono transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>+{report.upvotes}</span>
                  </button>

                  <button
                    onClick={() => handleVote(report.id, 'down')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#080d18] border border-slate-800 hover:border-rose-500/40 text-rose-400 text-xs font-mono transition-colors"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>-{report.downvotes}</span>
                  </button>

                  {/* Analyst Moderation Dropdown */}
                  {isAnalyst && (
                    <div className="ml-3 pl-3 border-l border-slate-800 flex items-center gap-2">
                      <span className="text-[10px] text-cyan-400 font-mono">Moderate:</span>
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusUpdate(report.id, e.target.value)}
                        className="bg-[#080d18] border border-slate-700 text-[11px] rounded px-2 py-0.5 text-slate-200"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Verified Malicious">Verified Malicious</option>
                        <option value="False Positive">False Positive</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-xs text-slate-500 rounded-xl bg-[#0c1424] border border-slate-800">
            {loading ? 'Loading threat reports...' : 'No community reports match the selected criteria.'}
          </div>
        )}
      </div>
    </div>
  );
};

