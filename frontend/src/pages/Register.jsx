import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Lock, Mail, User, Shield, AlertTriangle } from 'lucide-react';
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
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-7 sm:p-8 rounded-2xl bg-[#122035] border border-[#274366] shadow-xl">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#1d3557] border border-[#457b9d]/40 flex items-center justify-center text-[#a9d8de] mb-3">
          <UserPlus className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#f3fbf0]">
          Create Your Account
        </h2>
        <p className="text-xs text-[#a9d8de]/80 mt-1 max-w-xs">
          Join CyberShield to save your scan records and help report fraudulent portals.
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
          <label className="text-xs text-[#a9d8de] font-medium block mb-1.5">Your Name or Alias</label>
          <div className="relative">
            <User className="w-4 h-4 text-[#457b9d] absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b1523] border border-[#274366] text-xs sm:text-sm text-[#f3fbf0] placeholder-[#a9d8de]/40 focus:outline-none focus:border-[#457b9d] transition-colors"
            />
          </div>
        </div>

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

        <div>
          <label className="text-xs text-[#a9d8de] font-medium block mb-1.5">Account Role</label>
          <div className="relative">
            <Shield className="w-4 h-4 text-[#457b9d] absolute left-3.5 top-3" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b1523] border border-[#274366] text-xs sm:text-sm text-[#f3fbf0] focus:outline-none focus:border-[#457b9d] transition-colors"
            >
              <option value="Regular User">General User (Scanning & Community Reports)</option>
              <option value="Security Analyst">Security Analyst (Threat Verification Access)</option>
              <option value="Administrator">Administrator (Full Access & Engine Controls)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#457b9d] hover:bg-[#a9d8de] text-[#0b1523] font-bold text-xs sm:text-sm transition-all disabled:opacity-50 mt-2"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-[#a9d8de]/80">
        Already registered?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-[#a9d8de] hover:underline font-semibold"
        >
          Sign in here
        </button>
      </div>
    </div>
  );
};
