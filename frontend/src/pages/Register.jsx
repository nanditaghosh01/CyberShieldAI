import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Lock, Mail, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = ({ onSwitchToLogin, onSuccess }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Regular User');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !username || !password) return;
    setLoading(true);
    setError(null);
    try {
      await register(email, username, password, role);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-2xl bg-[#0c1424] border border-cyan-500/30 shadow-[0_0_40px_rgba(0,240,255,0.08)]">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-white">
          Create CyberShield Account
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Join the security intelligence network & contribute threat feeds
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Username</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="hunter_zero"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#080d18] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="analyst@domain.com"
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

        <div>
          <label className="text-xs text-slate-400 block mb-1">Account Role</label>
          <div className="relative">
            <Shield className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#080d18] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="Regular User">Regular User (Community Reports & History)</option>
              <option value="Security Analyst">Security Analyst (Threat Verification & Moderation)</option>
              <option value="Administrator">Administrator (Full Access & Engine Controls)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        Already registered?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-cyan-400 hover:underline font-semibold"
        >
          Sign in here
        </button>
      </div>
    </div>
  );
};

