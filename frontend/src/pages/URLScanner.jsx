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
    { label: "Legitimate (Google)", url: "https://www.google.com" },
    { label: "PayPal Phishing Clone", url: "http://paypa1-security-verification.com/webscr?cmd=_login" },
    { label: "IP Malware Dropper", url: "http://192.168.1.100/payload.exe" },
    { label: "Fake Internship Portal", url: "http://internship-offer-google.xyz/apply" }
  ];

  const handleScan = async (targetToScan = null) => {
    const urlToUse = targetToScan || inputUrl;
    if (!urlToUse || !urlToUse.trim()) {
      setError("Please enter a valid website URL to initiate the scan.");
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
      <div className="rounded-2xl bg-[#0c1424] border border-cyan-500/30 p-6 shadow-[0_0_35px_rgba(0,240,255,0.06)]">
        <div className="flex items-center gap-2 mb-2">
          <Scan className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-wide">
            Intelligent Website Security & Phishing Scanner
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Enter any fully qualified domain or URL to trigger parallel AI heuristic classification, SSL/TLS validation, passive web misconfiguration audits, and multi-source threat intelligence lookup.
        </p>

        {/* Input bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleScan(); }} 
          className="flex flex-col sm:flex-row items-stretch gap-3"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="e.g. https://example.com or suspicious-domain.top/login"
              className="w-full pl-10 pr-4 py-3 bg-[#080d18] border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all disabled:opacity-50"
          >
            <Scan className="w-4 h-4" />
            <span>Scan Website</span>
          </button>
        </form>

        {/* Sample URLs quick select */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Quick Test Targets:</span>
          {sampleTargets.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputUrl(sample.url);
                handleScan(sample.url);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-300 font-mono text-[11px] border border-slate-700 hover:border-cyan-500/40 transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* SCAN RESULTS DISPLAY */}
      {scanResult && (
        <div className="space-y-6">
          {/* Header Banner with Score Summary */}
          <div className="rounded-2xl bg-[#0c1424] border border-slate-800 p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <ThreatBadge category={scanResult.threat_classification} size="md" />
                <span className="text-xs text-slate-500 font-mono">
                  Scan ID: {scanResult.id.substring(0, 12)}...
                </span>
              </div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-white font-mono truncate max-w-xl">
                  {scanResult.url}
                </h3>
                <button
                  onClick={handleCopyUrl}
                  title="Copy URL"
                  className="p-1 rounded text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Inspected: {new Date(scanResult.scan_timestamp).toLocaleString()} | Domain: <strong className="text-slate-200 font-mono">{scanResult.domain}</strong>
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download Audit Report (.txt)</span>
                </button>
              </div>
            </div>

            {/* Circular Risk Gauge */}
            <div className="shrink-0 bg-[#080d18] rounded-xl p-2 border border-slate-800/80">
              <RiskGauge
                score={scanResult.risk_score}
                category={scanResult.risk_category}
                confidence={scanResult.detection_confidence}
                size={180}
              />
            </div>
          </div>

          {/* Result Sub-Navigation Tabs */}
          <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-2">
            {[
              { id: 'overview', label: 'Overview & Risk Breakdown', icon: ShieldCheck },
              { id: 'ai-detection', label: 'AI Phishing Analysis', icon: Scan },
              { id: 'ssl-inspection', label: 'SSL/TLS Cryptography', icon: Lock },
              { id: 'website-security', label: 'Security Headers & Posture', icon: Server },
              { id: 'domain-intel', label: 'Domain & Threat Feeds', icon: Globe }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.1)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW & MULTI-FACTOR RISK BREAKDOWN */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Multi-factor Score Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-4 rounded-xl bg-[#0c1424] border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>AI Detection (35%)</span>
                    <Scan className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {risk.breakdown?.ai_score ?? 0}
                    <span className="text-xs text-slate-500 font-normal">/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-cyan-400 h-full" style={{ width: `${risk.breakdown?.ai_score ?? 0}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0c1424] border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Threat Intel (25%)</span>
                    <Globe className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {risk.breakdown?.threat_intel_score ?? 0}
                    <span className="text-xs text-slate-500 font-normal">/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-400 h-full" style={{ width: `${risk.breakdown?.threat_intel_score ?? 0}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0c1424] border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>SSL/TLS Posture (20%)</span>
                    <Lock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {risk.breakdown?.ssl_score ?? 0}
                    <span className="text-xs text-slate-500 font-normal">/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-400 h-full" style={{ width: `${risk.breakdown?.ssl_score ?? 0}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0c1424] border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Web Security (10%)</span>
                    <Server className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {risk.breakdown?.web_security_score ?? 0}
                    <span className="text-xs text-slate-500 font-normal">/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: `${risk.breakdown?.web_security_score ?? 0}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0c1424] border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Domain / DNS (10%)</span>
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {risk.breakdown?.domain_dns_score ?? 0}
                    <span className="text-xs text-slate-500 font-normal">/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-purple-400 h-full" style={{ width: `${risk.breakdown?.domain_dns_score ?? 0}%` }} />
                  </div>
                </div>
              </div>

              {/* Major Security Findings List */}
              <div className="rounded-xl bg-[#0c1424] border border-slate-800 p-5">
                <h4 className="text-sm font-bold text-white mb-3">Key Security Findings Identified</h4>
                {risk.major_findings?.length > 0 ? (
                  <div className="space-y-2.5">
                    {risk.major_findings.map((f, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#080d18] border border-slate-800 flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200">{f.title}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                              {f.source}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{f.description}</p>
                        </div>
                        <ThreatBadge category={f.severity} size="sm" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No high-severity risks identified for this target.</p>
                )}
              </div>

              {/* Recommended Actions */}
              <div className="rounded-xl bg-[#0c1424] border border-slate-800 p-5">
                <h4 className="text-sm font-bold text-white mb-3">Recommended Security Actions</h4>
                <ul className="space-y-2">
                  {risk.recommended_actions?.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="p-4 rounded-xl bg-[#080d18] border border-slate-800/80 text-[11px] text-slate-500 leading-relaxed">
                <strong>Disclaimer:</strong> {risk.disclaimer}
              </div>
            </div>
          )}

          {/* TAB 2: AI PHISHING DETECTION */}
          {activeSubTab === 'ai-detection' && (
            <div className="space-y-6">
              <div className="rounded-xl bg-[#0c1424] border border-slate-800 p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                      Model Classification Result
                    </span>
                    <h4 className="text-xl font-bold text-white mt-1">
                      {ai.prediction}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl">{ai.explanation}</p>
                  </div>
                  <ThreatBadge category={ai.prediction} size="lg" />
                </div>

                {/* Probability distribution */}
                <div className="mt-5">
                  <h5 className="text-xs font-semibold text-slate-300 mb-2">Class Probability Distribution</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {ai.probabilities && Object.entries(ai.probabilities).map(([cls, prob]) => (
                      <div key={cls} className="p-3 rounded-lg bg-[#080d18] border border-slate-800">
                        <span className="text-xs text-slate-400">{cls}</span>
                        <div className="text-lg font-bold font-mono text-white mt-0.5">
                          {(prob * 100).toFixed(1)}%
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className={`h-full ${cls === 'Phishing' ? 'bg-orange-500' : cls === 'Malicious' ? 'bg-red-500' : cls === 'Suspicious' ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${prob * 100}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Extracted Engineered Features Grid */}
              <div className="rounded-xl bg-[#0c1424] border border-slate-800 p-5">
                <h4 className="text-sm font-bold text-white mb-2">Engineered Feature Vectors (24 Dimensions)</h4>
                <p className="text-xs text-slate-400 mb-4">
                  Extracted lexical, structural, and cryptographic features evaluated by the trained ensemble model.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 font-mono text-xs">
                  {ai.features && Object.entries(ai.features).map(([key, val]) => (
                    <div key={key} className="p-2.5 rounded-lg bg-[#080d18] border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block truncate">{key}</span>
                      <span className="text-sm font-bold text-cyan-300">
                        {typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(3)) : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SSL/TLS CRYPTOGRAPHY */}
          {activeSubTab === 'ssl-inspection' && (
            <div className="space-y-6">
              {/* eMudhra Motivating Case Study Note */}
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-200">
                  <strong className="text-blue-300">eMudhra TLS Incident Notice:</strong> {ssl.case_study_note}
                </div>
              </div>

              {/* Certificate Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[#0c1424] border border-slate-800 space-y-3 text-xs">
                  <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Subject & Issuer Identity</h4>
                  <div>
                    <span className="text-slate-400 block">Common Name (CN):</span>
                    <strong className="text-white font-mono">{ssl.subject?.common_name || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Issuing Authority (CA):</span>
                    <strong className="text-cyan-300 font-mono">{ssl.issuer?.common_name || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Issuer Organization:</span>
                    <span className="text-slate-200 font-mono">{ssl.issuer?.organization || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">CA Trust Status:</span>
                    <ThreatBadge category={ssl.trust_status || 'Unknown'} size="sm" />
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#0c1424] border border-slate-800 space-y-3 text-xs">
                  <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Cryptographic Parameters</h4>
                  <div>
                    <span className="text-slate-400 block">Negotiated TLS Protocol:</span>
                    <strong className="text-white font-mono">{ssl.tls_version || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Cipher Suite:</span>
                    <span className="text-cyan-300 font-mono text-[11px] truncate block">{ssl.cipher_suite || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Public Key Algorithm & Size:</span>
                    <strong className="text-white font-mono">{ssl.public_key_algorithm} ({ssl.key_size} bits)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Signature Algorithm:</span>
                    <span className="text-slate-300 font-mono">{ssl.signature_algorithm || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Certificate Transparency (SCT Logs):</span>
                    <span className={ssl.has_sct_transparency ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                      {ssl.has_sct_transparency ? 'Verified Embedded SCTs' : 'Not Embedded in X.509'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject Alternative Names (SANs) */}
              <div className="p-5 rounded-xl bg-[#0c1424] border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-2">Subject Alternative Names (SANs)</h4>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto font-mono text-xs">
                  {ssl.sans?.length > 0 ? (
                    ssl.sans.map((san, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-[#080d18] border border-slate-800 text-slate-300">
                        {san}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">No SAN entries recorded.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WEBSITE SECURITY HEADERS & POSTURE */}
          {activeSubTab === 'website-security' && (
            <div className="space-y-6">
              {/* Security Posture Summary Card */}
              <div className="p-5 rounded-xl bg-[#0c1424] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Overall Posture Grade</span>
                  <div className="text-2xl font-bold font-mono text-white mt-0.5">
                    {web.posture_grade || 'B (Good)'}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {web.missing_headers?.length ?? 0} missing defensive HTTP security headers identified.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">HTTPS Enforced:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${web.https_enforced ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-red-950 text-red-400 border border-red-500/30'}`}>
                    {web.https_enforced ? 'ENABLED' : 'INSECURE HTTP'}
                  </span>
                </div>
              </div>

              {/* Security Headers Table */}
              <div className="rounded-xl bg-[#0c1424] border border-slate-800 p-5">
                <h4 className="text-sm font-bold text-white mb-3">HTTP Security Headers Evaluation</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#080d18] text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Header Name</th>
                        <th className="py-2.5 px-3 font-semibold">Status</th>
                        <th className="py-2.5 px-3 font-semibold">Observed Value</th>
                        <th className="py-2.5 px-3 font-semibold">Security Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {web.headers_analyzed && Object.entries(web.headers_analyzed).map(([header, info]) => (
                        <tr key={header} className="hover:bg-slate-800/20">
                          <td className="py-2.5 px-3 font-bold text-slate-200">{header}</td>
                          <td className="py-2.5 px-3">
                            {info.present ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-sans text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-400 font-sans text-xs">
                                <XCircle className="w-3.5 h-3.5" /> Missing
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">
                            {info.value || 'None'}
                          </td>
                          <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px]">
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
                <div className="p-4 rounded-xl bg-[#0c1424] border border-slate-800">
                  <h5 className="text-xs font-bold text-white mb-2">Server Banners & Information Leaks</h5>
                  {web.server_disclosures?.length > 0 ? (
                    <ul className="space-y-1 font-mono text-xs text-amber-300">
                      {web.server_disclosures.map((d, i) => (
                        <li key={i} className="p-2 rounded bg-[#080d18] border border-slate-800">{d}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-400">No server banner version disclosures detected.</p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-[#0c1424] border border-slate-800">
                  <h5 className="text-xs font-bold text-white mb-2">Safe Sensitive Configuration File Probes</h5>
                  {web.exposed_files?.length > 0 ? (
                    <ul className="space-y-1 font-mono text-xs text-red-300">
                      {web.exposed_files.map((f, i) => (
                        <li key={i} className="p-2 rounded bg-red-950/20 border border-red-500/30">
                          {f.path} (HTTP {f.status_code})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-400">All sensitive path checks safely blocked (403/404).</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOMAIN INTELLIGENCE & THREAT FEEDS */}
          {activeSubTab === 'domain-intel' && (
            <div className="space-y-6">
              {/* Multi-source Threat Intelligence Feeds */}
              <div className="rounded-xl bg-[#0c1424] border border-slate-800 p-5">
                <h4 className="text-sm font-bold text-white mb-3">Threat Intelligence Feed Responses</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {intel.threat_sources && Object.entries(intel.threat_sources).map(([feed, data]) => (
                    <div key={feed} className="p-3.5 rounded-lg bg-[#080d18] border border-slate-800">
                      <span className="text-xs font-semibold text-slate-200 block">{feed}</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{data.status}</span>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Threat Match:</span>
                        <span className={data.match ? 'text-xs font-bold text-red-400' : 'text-xs font-bold text-emerald-400'}>
                          {data.match ? 'FLAGGED THREAT' : 'CLEAN / NO MATCH'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DNS Records */}
              <div className="rounded-xl bg-[#0c1424] border border-slate-800 p-5">
                <h4 className="text-sm font-bold text-white mb-3">DNS Infrastructure Records</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
                  {domain.dns_records && Object.entries(domain.dns_records).map(([recType, records]) => (
                    <div key={recType} className="p-3 rounded-lg bg-[#080d18] border border-slate-800">
                      <span className="text-cyan-400 font-bold block mb-1">{recType} Record</span>
                      {records?.length > 0 ? (
                        <div className="space-y-0.5 text-slate-300 text-[11px] truncate">
                          {records.slice(0, 3).map((r, i) => (
                            <div key={i} title={r} className="truncate">{r}</div>
                          ))}
                          {records.length > 3 && <div className="text-slate-500">+{records.length - 3} more</div>}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">None configured</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Authentication (SPF / DMARC) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#0c1424] border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">SPF (Sender Policy Framework)</span>
                    <span className={domain.email_security?.spf_configured ? 'text-emerald-400 font-mono font-bold' : 'text-amber-400 font-mono font-bold'}>
                      {domain.email_security?.spf_configured ? 'ENABLED' : 'MISSING'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-mono break-all">
                    {domain.email_security?.spf_record || 'No SPF record found in DNS TXT queries.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0c1424] border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">DMARC Policy Enforcement</span>
                    <span className={domain.email_security?.dmarc_configured ? 'text-emerald-400 font-mono font-bold' : 'text-amber-400 font-mono font-bold'}>
                      {domain.email_security?.dmarc_configured ? 'ENABLED' : 'MISSING'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-mono break-all">
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

