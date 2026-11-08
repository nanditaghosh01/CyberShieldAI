const API_BASE = '/api/v1';

// Token helper
export const getAuthToken = () => localStorage.getItem('cybershield_token');
export const setAuthToken = (token) => localStorage.setItem('cybershield_token', token);
export const removeAuthToken = () => localStorage.removeItem('cybershield_token');

const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDetail = 'Network request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch (e) {
      errorDetail = await response.text();
    }
    throw new Error(errorDetail);
  }

  // Handle plain text response (e.g. ASCII report)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/plain')) {
    return response.text();
  }

  return response.json();
};

export const api = {
  // Authentication
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (email, username, password, role = 'Regular User') => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, username, password, role })
  }),
  getMe: () => request('/auth/me'),

  // Unified Scanner & Dashboard
  scanUrl: (url) => request('/scanner/scan', {
    method: 'POST',
    body: JSON.stringify({ url })
  }),
  getDashboardStats: () => request('/scanner/stats'),
  getScanById: (id) => request(`/scanner/scan/${id}`),
  getScanReport: (id) => request(`/scanner/scan/${id}/report`),
  getModelMetrics: () => request('/scanner/model-metrics'),

  // Dedicated Security Modules
  inspectSsl: (url) => request('/ssl/inspect', {
    method: 'POST',
    body: JSON.stringify({ url })
  }),
  auditSecurity: (url) => request('/assessment/audit', {
    method: 'POST',
    body: JSON.stringify({ url })
  }),
  lookupThreat: (url) => request('/threat-intel/lookup', {
    method: 'POST',
    body: JSON.stringify({ url })
  }),

  // Community Threat Intelligence
  getCommunityReports: (status = null) => {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return request(`/community/reports${q}`);
  },
  submitCommunityReport: (data) => request('/community/reports', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  voteCommunityReport: (reportId, voteType) => request(`/community/reports/${reportId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ vote_type: voteType })
  }),

  // Scan History
  getScanHistory: (riskLevel = null) => {
    const q = riskLevel && riskLevel !== 'All' ? `?risk_level=${encodeURIComponent(riskLevel)}` : '';
    return request(`/history/scans${q}`);
  },

  // Admin & System Status
  getSystemStatus: () => request('/admin/system-status'),
  updateReportStatus: (reportId, status) => request(`/admin/reports/${reportId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
};

