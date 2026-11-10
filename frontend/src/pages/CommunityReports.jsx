import React, { useState, useEffect } from 'react';
import { Users, Plus, ThumbsUp, ThumbsDown, ShieldAlert, CheckCircle, Clock, Filter, AlertTriangle, MessageSquare, Info, ShieldCheck } from 'lucide-react';
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
  const [formCategory, setFormCategory] = useState('Phishing Login');
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
      setFormMsg({ type: 'success', text: 'Thank you! Your threat report was submitted and queued for verification.' });
      setFormUrl('');
      setFormDesc('');
      setFormEvidence('');
      setShowForm(false);
      fetchReports();
    } catch (err) {
      setFormMsg({ type: 'error', text: err.message || 'Submission failed. Please check inputs.' });
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
    "Phishing Login",
    "Fake Payment Portal",
    "Fraudulent Job / Internship Offer",
    "Fake Admission Portal",
    "Brand Impersonation",
    "Malware / Virus Download",
    "Crypto / Investment Scam"
  ];

  const statuses = ["All", "Pending", "Under Review", "Verified Malicious", "False Positive"];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner Card */}
      <div className="rounded-2xl bg-[#122035] border border-[#274366] p-6 sm:p-7 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-[#1d3557] border border-[#457b9d]/40 flex items-center justify-center text-[#a9d8de]">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-[#f3fbf0]">
              Community Threat Watch
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#a9d8de]/85 max-w-2xl leading-relaxed">
            Suspicious links reported by students, everyday web users, and security researchers. Community votes and expert analysts help verify legitimate reports and filter false alarms.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#457b9d] hover:bg-[#a9d8de] text-[#0b1523] font-bold text-xs sm:text-sm transition-all shrink-0 self-start md:self-auto shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Cancel' : 'Report Suspicious Website'}</span>
        </button>
      </div>

      {formMsg && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
          formMsg.type === 'success' ? 'bg-[#182b45] border border-[#457b9d] text-[#a9d8de]' : 'bg-[#28070a] border border-[#e83845] text-[#ffd0d4]'
        }`}>
          {formMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{formMsg.text}</span>
        </div>
      )}

      {/* Submission Form Panel */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 rounded-2xl bg-[#182b45] border border-[#457b9d]/50 space-y-4 shadow-xl animate-fadeIn">
          <div className="border-b border-[#274366] pb-3 mb-2">
            <h3 className="text-base font-bold text-[#f3fbf0]">Submit a Suspicious Website or Scam Link</h3>
            <p className="text-xs text-[#a9d8de]/80 mt-0.5">
              Every report helps protect fellow users. Please provide as much context as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#a9d8de] font-semibold block mb-1.5">
                Suspicious Link or Domain *
              </label>
              <input
                type="text"
                required
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="e.g. http://fake-login-chase.xyz or verify-job-offer.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[#0b1523] border border-[#274366] text-xs font-mono text-[#f3fbf0] placeholder-[#a9d8de]/40 focus:outline-none focus:border-[#457b9d] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-[#a9d8de] font-semibold block mb-1.5">
                Threat Category *
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0b1523] border border-[#274366] text-xs text-[#f3fbf0] focus:outline-none focus:border-[#457b9d] transition-colors"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#a9d8de] font-semibold block mb-1.5">
              Why is this suspicious? *
            </label>
            <textarea
              required
              rows={3}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Explain what the website is trying to do (e.g. imitates university admission portal and asks for credit card upfront, or impersonates Microsoft login)..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#0b1523] border border-[#274366] text-xs text-[#f3fbf0] placeholder-[#a9d8de]/40 focus:outline-none focus:border-[#457b9d] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-[#a9d8de] font-semibold block mb-1.5">
              Evidence or Origin (Optional)
            </label>
            <input
              type="text"
              value={formEvidence}
              onChange={(e) => setFormEvidence(e.target.value)}
              placeholder="e.g. Received via text message, unsolicited email claiming urgent password reset, or WhatsApp forward"
              className="w-full px-4 py-2.5 rounded-xl bg-[#0b1523] border border-[#274366] text-xs text-[#f3fbf0] placeholder-[#a9d8de]/40 focus:outline-none focus:border-[#457b9d] transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl bg-[#122035] hover:bg-[#1d3557] text-xs text-[#f3fbf0] font-medium border border-[#274366] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#457b9d] hover:bg-[#a9d8de] text-[#0b1523] text-xs font-bold transition-all disabled:opacity-50"
            >
              {formSubmitting ? 'Submitting Report...' : 'Submit Threat Report'}
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[#a9d8de]/70 font-semibold mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-[#457b9d]" /> Filter:
        </span>
        {statuses.map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              filterStatus === st
                ? 'bg-[#1d3557] text-[#f3fbf0] border border-[#457b9d]'
                : 'text-[#a9d8de]/70 hover:text-[#f3fbf0] hover:bg-[#122035] bg-[#0b1523] border border-[#274366]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div key={report.id} className="p-5 sm:p-6 rounded-2xl bg-[#122035] border border-[#274366] hover:border-[#457b9d]/60 transition-all shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                  <span className="text-sm font-bold font-mono text-[#f3fbf0] truncate max-w-lg">
                    {report.url}
                  </span>
                  <span className="text-xs bg-[#182b45] text-[#a9d8de] font-medium px-2.5 py-0.5 rounded-md border border-[#457b9d]/30">
                    {report.threat_category}
                  </span>
                </div>
                <ThreatBadge category={report.status} size="sm" />
              </div>

              <p className="text-xs sm:text-sm text-[#f3fbf0]/85 leading-relaxed">
                {report.description}
              </p>

              {report.evidence && (
                <div className="text-xs text-[#a9d8de] bg-[#0b1523] p-3 rounded-xl border border-[#274366] flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-[#457b9d] shrink-0 mt-0.5" />
                  <span><strong>Evidence / Origin:</strong> {report.evidence}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#274366] text-xs text-[#a9d8de]/70">
                <div className="flex items-center gap-2">
                  <span>Reported by <strong className="text-[#f3fbf0]">{report.submitted_by}</strong></span>
                  <span>•</span>
                  <span>{new Date(report.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Human Voting Buttons */}
                  <button
                    onClick={() => handleVote(report.id, 'up')}
                    title="I agree, this website looks suspicious"
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0b1523] border border-[#274366] hover:border-[#a9d8de] text-[#a9d8de] text-xs transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful (+{report.upvotes})</span>
                  </button>

                  <button
                    onClick={() => handleVote(report.id, 'down')}
                    title="I disagree, this website seems legitimate"
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0b1523] border border-[#274366] hover:border-[#e83845] text-[#e83845] text-xs transition-colors"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Dispute (-{report.downvotes})</span>
                  </button>

                  {/* Analyst Moderation Dropdown */}
                  {isAnalyst && (
                    <div className="ml-2 pl-3 border-l border-[#274366] flex items-center gap-1.5">
                      <span className="text-[11px] text-[#a9d8de]">Status:</span>
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusUpdate(report.id, e.target.value)}
                        className="bg-[#0b1523] border border-[#274366] text-xs rounded-lg px-2.5 py-1 text-[#f3fbf0] focus:outline-none focus:border-[#457b9d]"
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
          <div className="p-12 text-center text-xs sm:text-sm text-[#a9d8de]/70 rounded-2xl bg-[#122035] border border-[#274366] space-y-2">
            <MessageSquare className="w-8 h-8 text-[#457b9d] mx-auto" />
            <p className="font-semibold text-[#f3fbf0]">
              {loading ? 'Loading threat reports...' : 'No community reports match this filter.'}
            </p>
            <p className="text-xs text-[#a9d8de]/60">
              Be the first to submit a suspicious website to warn others.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
