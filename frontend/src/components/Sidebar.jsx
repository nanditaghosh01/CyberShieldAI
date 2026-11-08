import React from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Scan, 
  Lock, 
  Globe, 
  Users, 
  History, 
  Cpu, 
  Settings, 
  LogOut, 
  LogIn, 
  ShieldCheck, 
  UserCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scanner', label: 'URL Scanner', icon: Scan },
    { id: 'assessment', label: 'Security Assessment', icon: ShieldAlert },
    { id: 'ssl', label: 'SSL/TLS Inspector', icon: Lock },
    { id: 'threat-intel', label: 'Threat Intelligence', icon: Globe },
    { id: 'community', label: 'Community Reports', icon: Users },
    { id: 'history', label: 'Scan History', icon: History },
    { id: 'model-evaluation', label: 'ML Benchmarks', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0a101d] border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      {/* Brand header */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-white">
                CYBER<span className="text-cyan-400">SHIELD</span>
              </span>
              <span className="text-[10px] bg-cyan-950/80 text-cyan-300 font-mono px-1.5 py-0.5 rounded border border-cyan-500/30">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Threat Intelligence AI</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.1)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile / session footer */}
      <div className="p-4 border-t border-slate-800/80 bg-[#080d18]">
        {isAuthenticated ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xs font-bold">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{user.username}</p>
                <p className="text-[10px] text-cyan-400 font-mono truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('login')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

