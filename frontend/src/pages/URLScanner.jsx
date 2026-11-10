import React, { useState } from 'react';
import { 
  Scan, 
  Search, 
  AlertTriangle, 
  ShieldCheck, 
  Lock, 
  Server, 
  Globe, 
  Download, 
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { RiskGauge } from '../components/RiskGauge';
import { ThreatBadge } from '../components/ThreatBadge';
import { ScanProgressModal } from '../components/ScanProgressModal';
import { api } from '../services/api';

export const URLScanner = ({ initialResult = null }) => {
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [scanResult, setScanResult] = useState(initialResult);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const sampleTargets = [
    { label: "Google (Verified Safe)", url: "https://www.google.com" },
    { label: "PayPal Fake Login Scam", url: "http://paypa1-security-verification.com/webscr?cmd=_login" },
    { label: "Suspicious Direct IP", url: "http://192.168.1.100/payload.exe" },
    { label: "Fake Job Offer Scam", url: "http://internship-offer-google.xyz/apply" }
  ];

  const handleScan = async (targetToScan = null) => {
    const urlToUse = targetToScan || inputUrl;
    if (!urlToUse || !urlToUse.trim()) {
      setError("Please enter a website link to check.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await api.scanUrl(urlToUse.trim());
      setScanResult(data);
    } catch (err) {
      setError(err.message || "Failed to complete security scan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!scanResult?.id) return;
    try {
      const reportText = await api.getScanReport(scanResult.id);
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CyberShield_Audit_${scanResult.domain || 'report'}_${scanResult.id.substring(0, 8)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Error generating report download: " + err.message);
    }
  };

  const handleCopyUrl = () => {
    if (scanResult?.url) {
      navigator.clipboard.writeText(scanResult.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const details = scanResult?.details || {};
  const ai = details.ai_detection || {};
  const ssl = details.ssl_inspection || {};
  const web = details.website_security || {};
  const domain = details.domain_intelligence || {};
  const intel = details.threat_intelligence || {};
  const risk = details.risk_scoring || {};

  return (
    <div className="space-y-6">
      {/* Progress modal when scanning */}
      {loading && <ScanProgressModal url={inputUrl} />}

      {/* URL Input Form Card */}
      <div className="rounded-2xl bg-[#122035] border border-[#274366] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <Scan className="w-5 h-5 text-[#a9d8de]" />
          <h2 className="text-lg font-semibold text-[#f3fbf0] tracking-tight">
            Check any website link
          </h2>
        </div>
        <p className="text-xs text-[#a9d8de]/80 mb-4">
          Paste any link or domain name to verify whether it's safe to visit. We check for phishing scams, SSL certificate health, and community threat reports.
        </p>

        {/* Input bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleScan(); }} 
          className="flex flex-col sm:flex-row items-stretch gap-3"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#457b9d]">
              <Search className="w-4 h-4 text-[#457b9d]" />
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="e.g. google.com or suspicious-link.top/login"
              className="w-full pl-10 pr-4 py-3 bg-[#0b1523] border border-[#274366] rounded-xl text-sm text-[#f3fbf0] placeholder-[#a9d8de]/40 focus:outline-none focus:border-[#457b9d] transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#457b9d] hover:bg-[#a9d8de] text-[#0b1523] font-semibold text-sm shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            <Scan className="w-4 h-4" />
            <span>Check Website</span>
          </button>
        </form>

        {/* Sample URLs quick select */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#a9d8de]/70 font-medium">Try an example:</span>
          {sampleTargets.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputUrl(sample.url);
                handleScan(sample.url);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#182b45] hover:bg-[#1d3557] text-[#a9d8de] text-[11px] border border-[#274366] hover:border-[#457b9d] transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-[#28070a] border border-[#e83845] flex items-start gap-2.5 text-xs text-[#ffd0d4]">
            <AlertTriangle className="w-4 h-4 text-[#e83845] mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* SCAN RESULTS DISPLAY */}
      {scanResult && (
        <div className="space-y-5">
          {/* Plain-Language Verdict Banner */}
          <div className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 shadow-sm ${
            scanResult.risk_score <= 20 
              ? 'bg-[#18344e]/70 border-[#457b9d] text-[#f3fbf0]'
              : scanResult.risk_score <= 40
              ? 'bg-[#1a3350] border-[#457b9d] text-[#f3fbf0]'
              : 'bg-[#28070a] border-[#e83845] text-[#ffd0d4]'
          }`}>
            <div className="p-2 rounded-xl bg-[#0b1523]/70 shrink-0">
              {scanResult.risk_score <= 20 ? (
                <CheckCircle2 className="w-6 h-6 text-[#a9d8de]" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-[#e83845]" />
              )}
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-semibold text-[#f3fbf0]">
                {scanResult.risk_score <= 20
                  ? "This website looks safe to visit"
                  : scanResult.threat_classification === 'Phishing'
                  ? "Warning: Likely Phishing or Fraudulent Portal"
                  : scanResult.threat_classification === 'Malicious'
                  ? "High Danger: Confirmed Malicious Link"
                  : "Caution: Website requires careful inspection"}
              </h4>
              <p className="text-xs text-[#a9d8de]/90 leading-relaxed max-w-3xl">
                {scanResult.risk_score <= 20
                  ? "Our multi-layer analysis found no evidence of phishing or deceptive practices. The SSL lock is valid and issued by an established authority."
                  : scanResult.threat_classification === 'Phishing'
                  ? "This website exhibits patterns commonly used in phishing scams (such as lookalike characters or login forms on suspicious domains). We recommend closing this link immediately."
                  : scanResult.threat_classification === 'Malicious'
                  ? "Threat intelligence feeds or malware scanners have flagged this address. Do not download any files or interact with the page."
                  : "Some risk indicators were detected, such as missing browser protections or an unusual domain setup. Avoid submitting passwords or payment credentials."}
              </p>
            </div>
          </div>

          {/* Header Banner with Score Summary */}
          <div className="rounded-2xl bg-[#122035] border border-[#274366] p-5 sm:p-6 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <ThreatBadge category={scanResult.threat_classification} size="md" />
                <span className="text-xs text-[#a9d8de]/70 font-mono">
                  Scan ID: {scanResult.id.substring(0, 8)}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base sm:text-xl font-bold text-[#f3fbf0] font-mono truncate max-w-[200px] sm:max-w-md lg:max-w-xl">
                  {scanResult.url}
                </h3>
                <button
                  onClick={handleCopyUrl}
                  title="Copy URL"
                  className="p-1.5 rounded-lg text-[#a9d8de] hover:text-[#f3fbf0] hover:bg-[#182b45] transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-[#a9d8de]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-[#a9d8de]/70 mt-1">
                Checked {new Date(scanResult.scan_timestamp).toLocaleDateString()} at {new Date(scanResult.scan_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Domain: <strong className="text-[#f3fbf0] font-medium">{scanResult.domain}</strong>
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#182b45] hover:bg-[#457b9d] text-[#f3fbf0] text-xs font-medium border border-[#274366] transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#a9d8de]" />
                  <span>Download Summary (.txt)</span>
                </button>
              </div>
            </div>

            {/* Circular Risk Gauge */}
            <div className="shrink-0 bg-[#0b1523] rounded-2xl p-2 border border-[#274366]">
              <RiskGauge
                score={scanResult.risk_score}
                category={scanResult.risk_category}
                confidence={scanResult.detection_confidence}
                size={175}
              />
            </div>
          </div>

          {/* Result Sub-Navigation Tabs */}
          <div className="flex overflow-x-auto gap-1.5 border-b border-[#274366] pb-2 -mx-3.5 sm:mx-0 px-3.5 sm:px-0">
            {[
              { id: 'overview', label: 'Summary & Risk Factors', icon: ShieldCheck },
              { id: 'ai-detection', label: 'Phishing Detection', icon: Scan },
              { id: 'ssl-inspection', label: 'SSL & Encryption Lock', icon: Lock },
              { id: 'website-security', label: 'Browser Defenses', icon: Server },
              { id: 'domain-intel', label: 'Domain & Threat Feeds', icon: Globe }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-[#1d3557] text-[#f3fbf0] border border-[#457b9d]/70 shadow-sm'
                      : 'text-[#a9d8de]/75 hover:text-[#f3fbf0] hover:bg-[#182b45] border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#a9d8de]' : 'text-[#457b9d]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW & MULTI-FACTOR RISK BREAKDOWN */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Multi-factor Score Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                <div className="p-4 rounded-2xl bg-[#122035] border border-[#274366] shadow-sm">
                  <div className="flex items-center justify-between text-xs text-[#a9d8de]/80 mb-1.5">
                    <span className="font-medium">Phishing Risk (35%)</span>
                    <Scan className="w-4 h-4 text-[#a9d8de]" />
                  </div>
                  <div className="text-2xl font-bold text-[#f3fbf0]">
                    {risk.breakdown?.ai_score ?? 0}
                    <span className="text-xs text-[#457b9d] font-normal">/100</span>
                  </div>
                  <div className="w-full bg-[#0b1523] h-1.5 rounded-full mt-2 overflow-hidden border border-[#274366]">
                    <div className="bg-[#457b9d] h-full rounded-full" style={{ width: `${risk.breakdown?.ai_score ?? 0}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#122035] border border-[#274366] shadow-sm">
                  <div className="flex items-center justify-between text-xs text-[#a9d8de]/80 mb-1.5">
                    <span className="font-medium">Threat Feeds (25%)</span>
                    <Globe className="w-4 h-4 text-[#f86b76]" />
                  </div>
                  <div className="text-2xl font-bold text-[#f3fbf0]">
                    {risk.breakdown?.threat_intel_score ?? 0}
                    <span className="text-xs text-[#457b9d] font-normal">/100</span>
                  </div>
                  <div className="w-full bg-[#0b1523] h-1.5 rounded-full mt-2 overflow-hidden border border-[#274366]">
                    <div className="bg-[#e83845] h-full rounded-full" style={{ width: `${risk.breakdown?.threat_intel_score ?? 0}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#122035] border border-[#274366] shadow-sm">
                  <div className="flex items-center justify-between text-xs text-[#a9d8de]/80 mb-1.5">
                    <span className="font-medium">SSL Security (20%)</span>
                    <Lock className="w-4 h-4 text-[#a9d8de]" />
                  </div>
                  <div className="text-2xl font-bold text-[#f3fbf0]">
                    {risk.breakdown?.ssl_score ?? 0}
                    <span className="text-xs text-[#457b9d] font-normal">/100</span>
                  </div>
                  <div className="w-full bg-[#0b1523] h-1.5 rounded-full mt-2 overflow-hidden border border-[#274366]">
                    <div className="bg-[#a9d8de] h-full rounded-full" style={{ width: `${risk.breakdown?.ssl_score ?? 0}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#122035] border border-[#274366] shadow-sm">
                  <div className="flex items-center justify-between text-xs text-[#a9d8de]/80 mb-1.5">
                    <span className="font-medium">Web Defenses (10%)</span>
                    <Server className="w-4 h-4 text-[#457b9d]" />
                  </div>
                  <div className="text-2xl font-bold text-[#f3fbf0]">
                    {risk.breakdown?.web_security_score ?? 0}
                    <span className="text-xs text-[#457b9d] font-normal">/100</span>
                  </div>
                  <div className="w-full bg-[#0b1523] h-1.5 rounded-full mt-2 overflow-hidden border border-[#274366]">
                    <div className="bg-[#457b9d] h-full rounded-full" style={{ width: `${risk.breakdown?.web_security_score ?? 0}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#122035] border border-[#274366] shadow-sm">
                  <div className="flex items-center justify-between text-xs text-[#a9d8de]/80 mb-1.5">
                    <span className="font-medium">Domain Health (10%)</span>
                    <ShieldCheck className="w-4 h-4 text-[#a9d8de]" />
                  </div>
                  <div className="text-2xl font-bold text-[#f3fbf0]">
                    {risk.breakdown?.domain_dns_score ?? 0}
                    <span className="text-xs text-[#457b9d] font-normal">/100</span>
                  </div>
                  <div className="w-full bg-[#0b1523] h-1.5 rounded-full mt-2 overflow-hidden border border-[#274366]">
                    <div className="bg-[#a9d8de] h-full rounded-full" style={{ width: `${risk.breakdown?.domain_dns_score ?? 0}%` }} />
                  </div>
                </div>
              </div>

              {/* Major Security Findings List */}
              <div className="rounded-2xl bg-[#122035] border border-[#274366] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-[#f3fbf0]">What our scan discovered</h4>
                    <p className="text-xs text-[#a9d8de]/75">Specific findings flagged during deep inspection</p>
                  </div>
                </div>
                {risk.major_findings?.length > 0 ? (
                  <div className="space-y-2.5">
                    {risk.major_findings.map((f, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#0b1523] border border-[#274366] flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#f3fbf0]">{f.title}</span>
                            <span className="text-[10px] bg-[#182b45] text-[#a9d8de] px-2 py-0.5 rounded-full border border-[#274366]">
                              {f.source}
                            </span>
                          </div>
                          <p className="text-xs text-[#a9d8de]/80 mt-1 leading-relaxed">{f.description}</p>
                        </div>
                        <ThreatBadge category={f.severity} size="sm" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#a9d8de]/80 py-2">No security warnings or vulnerabilities identified for this website.</p>
                )}
              </div>

              {/* Recommended Actions */}
              <div className="rounded-2xl bg-[#122035] border border-[#274366] p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-[#f3fbf0] mb-2">What you should do</h4>
                <ul className="space-y-2">
                  {risk.recommended_actions?.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#f3fbf0]/90">
                      <ChevronRight className="w-4 h-4 text-[#a9d8de] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="p-4 rounded-xl bg-[#0b1523] border border-[#274366] text-[11px] text-[#a9d8de]/70 leading-relaxed">
                <strong>Safety Note:</strong> {risk.disclaimer}
              </div>
            </div>
          )}

          {/* TAB 2: AI PHISHING DETECTION */}
          {activeSubTab === 'ai-detection' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-[#122035] border border-[#274366] p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#274366]">
                  <div>
                    <span className="text-xs font-medium text-[#a9d8de]">
                      Phishing & Scam Assessment
                    </span>
                    <h4 className="text-lg font-bold text-[#f3fbf0] mt-1">
                      Website is classified as {ai.prediction}
                    </h4>
                    <p className="text-xs text-[#a9d8de]/85 mt-1 max-w-2xl leading-relaxed">{ai.explanation}</p>
                  </div>
                  <ThreatBadge category={ai.prediction} size="lg" />
                </div>

                {/* Probability distribution */}
                <div className="mt-5">
                  <h5 className="text-xs font-semibold text-[#f3fbf0] mb-2.5">Likelihood across categories</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {ai.probabilities && Object.entries(ai.probabilities).map(([cls, prob]) => (
                      <div key={cls} className="p-3.5 rounded-xl bg-[#0b1523] border border-[#274366]">
                        <span className="text-xs font-medium text-[#a9d8de]/90">{cls}</span>
                        <div className="text-lg font-bold text-[#f3fbf0] mt-0.5">
                          {(prob * 100).toFixed(1)}%
                        </div>
                        <div className="w-full bg-[#182b45] h-1.5 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${cls === 'Phishing' ? 'bg-[#e83845]' : cls === 'Malicious' ? 'bg-[#a81b26]' : cls === 'Suspicious' ? 'bg-[#457b9d]' : 'bg-[#a9d8de]'}`} 
                            style={{ width: `${prob * 100}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Extracted Engineered Features Grid */}
              <div className="rounded-2xl bg-[#122035] border border-[#274366] p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-[#f3fbf0] mb-1">Link Structure & Characteristics Inspected</h4>
                <p className="text-xs text-[#a9d8de]/75 mb-4">
                  Specific technical factors checked from the URL to identify scams, typosquatting, and hidden redirects:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
                  {ai.features && Object.entries(ai.features).map(([key, val]) => {
                    const friendlyName = {
                      url_length: "Full Link Length",
                      has_ip_address: "Raw IP Used",
                      dot_count: "Dot Count",
                      https_flag: "HTTPS Protected",
                      url_entropy: "Name Randomness",
                      token_count: "Word Segments",
                      subdomain_count: "Subdomain Count",
                      query_param_count: "Query Parameters",
                      tld_length: "Extension Length",
                      path_length: "Path Length",
                      has_hyphen_in_domain: "Hyphen in Domain",
                      number_of_digits: "Digit Count",
                      tld_popularity: "Extension Trust",
                      suspicious_file_extension: "Dangerous File Ext",
                      domain_name_length: "Domain Length",
                      percentage_numeric_chars: "Digit Ratio"
                    }[key] || key.replace(/_/g, ' ');

                    const displayVal = typeof val === 'number' 
                      ? (Number.isInteger(val) ? val : (val <= 1 ? `${(val * 100).toFixed(0)}%` : val.toFixed(2)))
                      : String(val);

                    return (
                      <div key={key} className="p-3 rounded-xl bg-[#0b1523] border border-[#274366] flex flex-col justify-between">
                        <span className="text-[11px] text-[#a9d8de]/80 capitalize truncate">{friendlyName}</span>
                        <span className="text-sm font-semibold text-[#f3fbf0] mt-1">
                          {displayVal}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SSL/TLS CRYPTOGRAPHY */}
          {activeSubTab === 'ssl-inspection' && (
            <div className="space-y-6">
              {/* eMudhra Motivating Case Study Note */}
              <div className="p-4 rounded-xl bg-[#182b45] border border-[#457b9d]/40 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#a9d8de] shrink-0 mt-0.5" />
                <div className="text-xs text-[#f3fbf0]/90">
                  <strong className="text-[#a9d8de]">eMudhra TLS Incident Notice:</strong> {ssl.case_study_note}
                </div>
              </div>

              {/* Certificate Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[#122035] border border-[#274366] space-y-3 text-xs">
                  <h4 className="text-sm font-bold text-[#f3fbf0] border-b border-[#274366] pb-2">Subject & Issuer Identity</h4>
                  <div>
                    <span className="text-[#a9d8de]/70 block">Common Name (CN):</span>
                    <strong className="text-[#f3fbf0] font-mono">{ssl.subject?.common_name || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[#a9d8de]/70 block">Issuing Authority (CA):</span>
                    <strong className="text-[#a9d8de] font-mono">{ssl.issuer?.common_name || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[#a9d8de]/70 block">Issuer Organization:</span>
                    <span className="text-[#f3fbf0] font-mono">{ssl.issuer?.organization || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#a9d8de]/70 block">CA Trust Status:</span>
                    <ThreatBadge category={ssl.trust_status || 'Unknown'} size="sm" />
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#122035] border border-[#274366] space-y-3 text-xs">
                  <h4 className="text-sm font-bold text-[#f3fbf0] border-b border-[#274366] pb-2">Cryptographic Parameters</h4>
                  <div>
                    <span className="text-[#a9d8de]/70 block">Negotiated TLS Protocol:</span>
                    <strong className="text-[#f3fbf0] font-mono">{ssl.tls_version || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[#a9d8de]/70 block">Cipher Suite:</span>
                    <span className="text-[#a9d8de] font-mono text-[11px] truncate block">{ssl.cipher_suite || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#a9d8de]/70 block">Public Key Algorithm & Size:</span>
                    <strong className="text-[#f3fbf0] font-mono">{ssl.public_key_algorithm} ({ssl.key_size} bits)</strong>
                  </div>
                  <div>
                    <span className="text-[#a9d8de]/70 block">Signature Algorithm:</span>
                    <span className="text-[#f3fbf0]/80 font-mono">{ssl.signature_algorithm || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#a9d8de]/70 block">Certificate Transparency (SCT Logs):</span>
                    <span className={ssl.has_sct_transparency ? 'text-[#a9d8de] font-semibold' : 'text-[#f86b76]'}>
                      {ssl.has_sct_transparency ? 'Verified Embedded SCTs' : 'Not Embedded in X.509'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject Alternative Names (SANs) */}
              <div className="p-5 rounded-xl bg-[#122035] border border-[#274366]">
                <h4 className="text-sm font-bold text-[#f3fbf0] mb-2">Subject Alternative Names (SANs)</h4>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto font-mono text-xs">
                  {ssl.sans?.length > 0 ? (
                    ssl.sans.map((san, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-[#0b1523] border border-[#274366] text-[#a9d8de]">
                        {san}
                      </span>
                    ))
                  ) : (
                    <span className="text-[#a9d8de]/60">No SAN entries recorded.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WEBSITE SECURITY HEADERS & POSTURE */}
          {activeSubTab === 'website-security' && (
            <div className="space-y-6">
              {/* Security Posture Summary Card */}
              <div className="p-5 rounded-xl bg-[#122035] border border-[#274366] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-[#a9d8de]/70 uppercase tracking-wider">Overall Posture Grade</span>
                  <div className="text-2xl font-bold font-mono text-[#f3fbf0] mt-0.5">
                    {web.posture_grade || 'B (Good)'}
                  </div>
                  <p className="text-xs text-[#a9d8de]/80 mt-1">
                    {web.missing_headers?.length ?? 0} missing defensive HTTP security headers identified.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#a9d8de]/70">HTTPS Enforced:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${web.https_enforced ? 'bg-[#1d3557] text-[#a9d8de] border border-[#457b9d]/40' : 'bg-[#28070a] text-[#e83845] border border-[#e83845]/50'}`}>
                    {web.https_enforced ? 'ENABLED' : 'INSECURE HTTP'}
                  </span>
                </div>
              </div>

              {/* Security Headers Table */}
              <div className="rounded-xl bg-[#122035] border border-[#274366] p-5">
                <h4 className="text-sm font-bold text-[#f3fbf0] mb-3">HTTP Security Headers Evaluation</h4>
                <div className="overflow-x-auto -mx-3.5 sm:mx-0 px-3.5 sm:px-0">
                  <table className="w-full text-left text-xs min-w-[550px]">
                    <thead className="bg-[#0b1523] text-[#a9d8de] border-b border-[#274366]">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Header Name</th>
                        <th className="py-2.5 px-3 font-semibold">Status</th>
                        <th className="py-2.5 px-3 font-semibold">Observed Value</th>
                        <th className="py-2.5 px-3 font-semibold">Security Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#274366]/60 font-mono">
                      {web.headers_analyzed && Object.entries(web.headers_analyzed).map(([header, info]) => (
                        <tr key={header} className="hover:bg-[#182b45]/40">
                          <td className="py-2.5 px-3 font-bold text-[#f3fbf0]">{header}</td>
                          <td className="py-2.5 px-3">
                            {info.present ? (
                              <span className="inline-flex items-center gap-1 text-[#a9d8de] font-sans text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[#e83845] font-sans text-xs font-bold">
                                <XCircle className="w-3.5 h-3.5" /> Missing
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[#a9d8de]/70 truncate max-w-xs">
                            {info.value || 'None'}
                          </td>
                          <td className="py-2.5 px-3 font-sans text-[#a9d8de]/80 text-[11px]">
                            {info.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Server Disclosures & Exposed Paths */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#122035] border border-[#274366]">
                  <h5 className="text-xs font-bold text-[#f3fbf0] mb-2">Server Banners & Information Leaks</h5>
                  {web.server_disclosures?.length > 0 ? (
                    <ul className="space-y-1 font-mono text-xs text-[#f86b76]">
                      {web.server_disclosures.map((d, i) => (
                        <li key={i} className="p-2 rounded bg-[#28070a] border border-[#e83845]/40">{d}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#a9d8de]">No server banner version disclosures detected.</p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-[#122035] border border-[#274366]">
                  <h5 className="text-xs font-bold text-[#f3fbf0] mb-2">Safe Sensitive Configuration File Probes</h5>
                  {web.exposed_files?.length > 0 ? (
                    <ul className="space-y-1 font-mono text-xs text-[#ffd0d4]">
                      {web.exposed_files.map((f, i) => (
                        <li key={i} className="p-2 rounded bg-[#28070a] border border-[#e83845] shadow-[0_0_12px_rgba(232,56,69,0.3)]">
                          {f.path} (HTTP {f.status_code})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#a9d8de]">All sensitive path checks safely blocked (403/404).</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOMAIN INTELLIGENCE & THREAT FEEDS */}
          {activeSubTab === 'domain-intel' && (
            <div className="space-y-6">
              {/* Multi-source Threat Intelligence Feeds */}
              <div className="rounded-xl bg-[#122035] border border-[#274366] p-5">
                <h4 className="text-sm font-bold text-[#f3fbf0] mb-3">Threat Intelligence Feed Responses</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {intel.threat_sources && Object.entries(intel.threat_sources).map(([feed, data]) => (
                    <div key={feed} className={`p-3.5 rounded-lg border ${data.match ? 'bg-[#28070a] border-[#e83845] shadow-[0_0_15px_rgba(232,56,69,0.25)]' : 'bg-[#0b1523] border-[#274366]'}`}>
                      <span className="text-xs font-semibold text-[#f3fbf0] block">{feed}</span>
                      <span className="text-[10px] text-[#a9d8de]/70 font-mono block mt-0.5">{data.status}</span>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-[#a9d8de]/80">Threat Match:</span>
                        <span className={data.match ? 'text-xs font-bold text-[#e83845]' : 'text-xs font-bold text-[#a9d8de]'}>
                          {data.match ? 'FLAGGED THREAT' : 'CLEAN / NO MATCH'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DNS Records */}
              <div className="rounded-xl bg-[#122035] border border-[#274366] p-5">
                <h4 className="text-sm font-bold text-[#f3fbf0] mb-3">DNS Infrastructure Records</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
                  {domain.dns_records && Object.entries(domain.dns_records).map(([recType, records]) => (
                    <div key={recType} className="p-3 rounded-lg bg-[#0b1523] border border-[#274366]">
                      <span className="text-[#a9d8de] font-bold block mb-1">{recType} Record</span>
                      {records?.length > 0 ? (
                        <div className="space-y-0.5 text-[#f3fbf0]/80 text-[11px] truncate">
                          {records.slice(0, 3).map((r, i) => (
                            <div key={i} title={r} className="truncate">{r}</div>
                          ))}
                          {records.length > 3 && <div className="text-[#457b9d]">+{records.length - 3} more</div>}
                        </div>
                      ) : (
                        <span className="text-[#a9d8de]/50 text-[11px]">None configured</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Authentication (SPF / DMARC) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#122035] border border-[#274366]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[#f3fbf0]">SPF (Sender Policy Framework)</span>
                    <span className={domain.email_security?.spf_configured ? 'text-[#a9d8de] font-mono font-bold' : 'text-[#e83845] font-mono font-bold'}>
                      {domain.email_security?.spf_configured ? 'ENABLED' : 'MISSING'}
                    </span>
                  </div>
                  <p className="text-[#a9d8de]/70 text-[11px] font-mono break-all">
                    {domain.email_security?.spf_record || 'No SPF record found in DNS TXT queries.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#122035] border border-[#274366]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[#f3fbf0]">DMARC Policy Enforcement</span>
                    <span className={domain.email_security?.dmarc_configured ? 'text-[#a9d8de] font-mono font-bold' : 'text-[#e83845] font-mono font-bold'}>
                      {domain.email_security?.dmarc_configured ? 'ENABLED' : 'MISSING'}
                    </span>
                  </div>
                  <p className="text-[#a9d8de]/70 text-[11px] font-mono break-all">
                    {domain.email_security?.dmarc_record || 'No DMARC policy found under _dmarc.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

