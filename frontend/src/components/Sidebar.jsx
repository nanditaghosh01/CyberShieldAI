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
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) => {
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

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#101e33] border-r border-[#274366] flex flex-col justify-between h-screen select-none z-50
        transform transition-transform duration-300 ease-in-out
        lg:static lg:w-64 lg:translate-x-0 lg:z-30 lg:shrink-0
        ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div>
          <div className="p-4 sm:p-5 border-b border-[#274366] flex items-center justify-between">
            <div className="flex items-center gap-3">
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

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-[#a9d8de]/70 hover:text-[#f3fbf0] hover:bg-[#182b45] lg:hidden transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation list */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#1d3557] text-[#f3fbf0] border border-[#457b9d]/60 shadow-sm'
                      : 'text-[#a9d8de]/80 hover:text-[#f3fbf0] hover:bg-[#182b45] border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#a9d8de]' : 'text-[#a9d8de]/70'}`} />
                  <span className="truncate">{item.label}</span>
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
                <div className="w-8 h-8 rounded-full bg-[#1d3557] border border-[#457b9d] flex items-center justify-center text-[#a9d8de] text-xs font-bold shrink-0">
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
                className="p-1.5 rounded-lg text-[#a9d8de]/70 hover:text-[#e83845] hover:bg-[#38080c] transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => handleNavClick('login')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#1d3557] hover:bg-[#457b9d] text-[#f3fbf0] text-xs font-semibold border border-[#457b9d] transition-all shadow-sm"
              >
                <LogIn className="w-4 h-4 text-[#a9d8de]" />
                <span>Sign In / Register</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
