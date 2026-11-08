import React from 'react';

export const ThreatBadge = ({ category, size = "md" }) => {
  const cat = (category || 'Unknown').toLowerCase();

  let styles = "bg-slate-800 text-slate-300 border-slate-700";

  if (cat.includes('legitimate') || cat.includes('low') || cat.includes('clean') || cat.includes('good') || cat.includes('strong')) {
    styles = "bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]";
  } else if (cat.includes('moderate') || cat.includes('fair') || cat.includes('info')) {
    styles = "bg-sky-950/70 text-sky-300 border-sky-500/40";
  } else if (cat.includes('suspicious') || cat.includes('elevated') || cat.includes('medium')) {
    styles = "bg-amber-950/70 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]";
  } else if (cat.includes('phishing') || cat.includes('high') || cat.includes('poor')) {
    styles = "bg-orange-950/70 text-orange-300 border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.2)]";
  } else if (cat.includes('malicious') || cat.includes('critical')) {
    styles = "bg-red-950/80 text-red-300 border-red-500/50 shadow-[0_0_14px_rgba(239,68,68,0.25)]";
  }

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : size === 'lg' 
    ? 'px-3.5 py-1.5 text-sm font-semibold' 
    : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${styles} uppercase tracking-wider`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {category}
    </span>
  );
};

