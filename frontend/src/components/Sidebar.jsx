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
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scanner', label: 'Website Scanner', icon: Scan },
    { id: 'assessment', label: 'Security Assessment', icon: ShieldAlert },
    { id: 'ssl', label: 'SSL & Certificates', icon: Lock },
    { id: 'threat-intel', label: 'Domain Intelligence', icon: Globe },
    { id: 'community', label: 'Community Reports', icon: Users },
    { id: 'history', label: 'Scan History', icon: History },
    { id: 'model-evaluation', label: 'Model Accuracy', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#101e33] border-r border-[#274366] flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      {/* Brand header */}
      <div>
        <div className="p-5 border-b border-[#274366] flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#1d3557] border border-[#457b9d]/60 text-[#a9d8de]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-[#f3fbf0]">
                Cyber<span className="text-[#a9d8de]">Shield</span>
              </span>
              <span className="text-[10px] bg-[#182b45] text-[#a9d8de] px-1.5 py-0.5 rounded border border-[#274366]">
                Security
              </span>
            </div>
            <p className="text-[11px] text-[#a9d8de]/70 font-normal">Web Safety Platform</p>
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1d3557] text-[#f3fbf0] border border-[#457b9d]/60 shadow-sm'
                    : 'text-[#a9d8de]/80 hover:text-[#f3fbf0] hover:bg-[#182b45] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#a9d8de]' : 'text-[#a9d8de]/70'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile / session footer */}
      <div className="p-4 border-t border-[#274366] bg-[#0b1523]">
        {isAuthenticated ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#1d3557] border border-[#457b9d] flex items-center justify-center text-[#a9d8de] text-xs font-bold">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#f3fbf0] truncate">{user.username}</p>
                <p className="text-[10px] text-[#a9d8de] font-mono truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#a9d8de]/70 hover:text-[#e83845] hover:bg-[#38080c] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('login')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#1d3557] hover:bg-[#457b9d] text-[#f3fbf0] text-xs font-semibold border border-[#457b9d] transition-all shadow-[0_0_12px_rgba(69,123,157,0.2)]"
            >
              <LogIn className="w-4 h-4 text-[#a9d8de]" />
              <span>Sign In / Register</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
