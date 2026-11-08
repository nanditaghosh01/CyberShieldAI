import React, { useState } from 'react';
import { ShieldCheck, LogIn, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = ({ onSwitchToRegister, onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPwd) => {
    setEmail(quickEmail);
    setPassword(quickPwd);
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-2xl bg-[#0c1424] border border-cyan-500/30 shadow-[0_0_40px_rgba(0,240,255,0.08)]">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-white">
          Sign In to CyberShield AI
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Access threat intelligence, scan history, and community moderation
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#080d18] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#080d18] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      {/* Quick Demo Credentials */}
      <div className="mt-6 pt-5 border-t border-slate-800">
        <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-2 font-mono">
          Quick Demo Credentials:
        </span>
        <div className="flex flex-col gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@cybershield.ai', 'CyberShield@2026')}
            className="px-3 py-1.5 rounded-lg bg-[#080d18] hover:bg-slate-800 text-cyan-300 border border-slate-800 text-left flex items-center justify-between"
          >
            <span>Lead Administrator</span>
            <span className="text-[10px] text-slate-500 font-mono">admin@cybershield.ai</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('analyst@cybershield.ai', 'Analyst@2026')}
            className="px-3 py-1.5 rounded-lg bg-[#080d18] hover:bg-slate-800 text-cyan-300 border border-slate-800 text-left flex items-center justify-between"
          >
            <span>Security Analyst</span>
            <span className="text-[10px] text-slate-500 font-mono">analyst@cybershield.ai</span>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-400">
        Don't have an account yet?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-cyan-400 hover:underline font-semibold"
        >
          Register here
        </button>
      </div>
    </div>
  );
};

