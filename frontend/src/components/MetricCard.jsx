import React from 'react';

export const MetricCard = ({ title, value, icon: Icon, changeText, color = 'cyan', subtitle }) => {
  const colorMap = {
    cyan: 'border-cyan-500/20 text-cyan-400 bg-cyan-950/20 hover:border-cyan-500/40',
    blue: 'border-blue-500/20 text-blue-400 bg-blue-950/20 hover:border-blue-500/40',
    emerald: 'border-emerald-500/20 text-emerald-400 bg-emerald-950/20 hover:border-emerald-500/40',
    amber: 'border-amber-500/20 text-amber-400 bg-amber-950/20 hover:border-amber-500/40',
    rose: 'border-rose-500/20 text-rose-400 bg-rose-950/20 hover:border-rose-500/40',
  };

  const iconBgMap = {
    cyan: 'bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20',
    blue: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20',
  };

  return (
    <div className={`relative p-5 rounded-xl bg-[#0c1424] border transition-all duration-200 group ${colorMap[color] || colorMap.cyan}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg ${iconBgMap[color] || iconBgMap.cyan}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold font-mono text-white tracking-tight">
          {value}
        </span>
        {changeText && (
          <span className="text-xs font-medium text-emerald-400 flex items-center">
            {changeText}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};

