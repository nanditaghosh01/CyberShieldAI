import React from 'react';
import { Shield, Plus, CheckCircle2, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ title = "Dashboard", onQuickScan, onToggleMobileMenu }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-[#101e33]/95 backdrop-blur-md border-b border-[#274366] px-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Mobile / Tablet Hamburger Toggle */}
        <button
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
          className="p-2 rounded-xl text-[#a9d8de] hover:text-[#f3fbf0] hover:bg-[#182b45] lg:hidden border border-[#274366] transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-sm sm:text-base lg:text-lg font-bold text-[#f3fbf0] tracking-tight truncate max-w-[160px] sm:max-w-sm lg:max-w-none">
          {title}
        </h1>

        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#182b45] border border-[#274366] text-xs text-[#a9d8de] shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#a9d8de]" />
          <span className="font-medium text-[11px]">Protection Active</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {onQuickScan && (
          <button
            onClick={onQuickScan}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-[#457b9d] hover:bg-[#a9d8de] text-[#0b1523] font-semibold text-xs transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scan a Website</span>
            <span className="sm:hidden">Scan</span>
          </button>
        )}

        {user && (
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#274366] text-xs text-[#a9d8de]/80">
            <span>Welcome, <strong className="text-[#f3fbf0] font-medium">{user.username}</strong></span>
          </div>
        )}
      </div>
    </header>
  );
};
