import React, { useState } from 'react';
import { ShieldCheck, LogIn, Lock, Mail, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';
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
      setError(err.message || 'Unable to sign in. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPwd) => {
    setEmail(quickEmail);
    setPassword(quickPwd);
  };

  return (
    <div className="max-w-md mx-auto my-12 p-7 sm:p-8 rounded-2xl bg-[#122035] border border-[#274366] shadow-xl">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#1d3557] border border-[#457b9d]/40 flex items-center justify-center text-[#a9d8de] mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#f3fbf0]">
          Welcome Back
        </h2>
        <p className="text-xs text-[#a9d8de]/80 mt-1 max-w-xs">
          Sign in to access your saved website scans, community reports, and analyst tools.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-[#28070a] border border-[#e83845] text-xs text-[#ffd0d4] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#e83845] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-[#a9d8de] font-medium block mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#457b9d] absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b1523] border border-[#274366] text-xs sm:text-sm text-[#f3fbf0] placeholder-[#a9d8de]/40 focus:outline-none focus:border-[#457b9d] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-[#a9d8de] font-medium block mb-1.5">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#457b9d] absolute left-3.5 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b1523] border border-[#274366] text-xs sm:text-sm text-[#f3fbf0] placeholder-[#a9d8de]/40 focus:outline-none focus:border-[#457b9d] transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#457b9d] hover:bg-[#a9d8de] text-[#0b1523] font-bold text-xs sm:text-sm transition-all disabled:opacity-50 mt-2"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      {/* Quick Demo Credentials */}
      <div className="mt-6 pt-5 border-t border-[#274366]">
        <span className="text-[11px] text-[#a9d8de]/70 font-semibold block mb-2.5">
          One-Click Demo Profiles:
        </span>
        <div className="flex flex-col gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickLogin('analyst@cybershield.ai', 'Analyst@2026')}
            className="px-3.5 py-2 rounded-xl bg-[#0b1523] hover:bg-[#182b45] text-[#a9d8de] border border-[#274366] hover:border-[#457b9d] text-left flex items-center justify-between transition-colors"
          >
            <span className="font-medium text-[#f3fbf0]">Security Analyst</span>
            <span className="text-[11px] text-[#457b9d] font-mono">analyst@cybershield.ai</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@cybershield.ai', 'CyberShield@2026')}
            className="px-3.5 py-2 rounded-xl bg-[#0b1523] hover:bg-[#182b45] text-[#a9d8de] border border-[#274366] hover:border-[#457b9d] text-left flex items-center justify-between transition-colors"
          >
            <span className="font-medium text-[#f3fbf0]">System Administrator</span>
            <span className="text-[11px] text-[#457b9d] font-mono">admin@cybershield.ai</span>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-[#a9d8de]/80">
        Don't have an account yet?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-[#a9d8de] hover:underline font-semibold"
        >
          Create one here
        </button>
      </div>
    </div>
  );
};
