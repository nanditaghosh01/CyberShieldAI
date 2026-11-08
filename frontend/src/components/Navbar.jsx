import React from 'react';
import { Shield, Activity, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ title = "Dashboard", onQuickScan }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-[#0a101d]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-white tracking-wide">
          {title}
        </h1>
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
            SYSTEM ONLINE
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Scan CTA */}
        {onQuickScan && (
          <button
            onClick={onQuickScan}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Scan URL</span>
          </button>
        )}

        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Passive Heuristic Guard</span>
          </div>
        </div>
      </div>
    </header>
  );
};

