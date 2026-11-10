import React from 'react';
import { Shield, Plus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ title = "Dashboard", onQuickScan }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-[#101e33]/95 backdrop-blur-md border-b border-[#274366] px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h1 className="text-base sm:text-lg font-semibold text-[#f3fbf0] tracking-tight">
          {title}
        </h1>
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#182b45] border border-[#274366] text-xs text-[#a9d8de]">
          <span className="w-2 h-2 rounded-full bg-[#a9d8de]" />
          <span className="font-medium text-[11px]">Protection Active</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onQuickScan && (
          <button
            onClick={onQuickScan}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#457b9d] hover:bg-[#a9d8de] text-[#0b1523] font-semibold text-xs shadow-sm hover:shadow transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Scan a Website</span>
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
