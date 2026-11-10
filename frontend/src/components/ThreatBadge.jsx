import React from 'react';

export const ThreatBadge = ({ category, size = "md" }) => {
  const cat = (category || 'Unknown').toLowerCase();

  let styles = "bg-[#182b45] text-[#f3fbf0] border-[#274366]";
  let dotColor = "bg-[#a9d8de]";

  if (cat.includes('legitimate') || cat.includes('low') || cat.includes('clean') || cat.includes('good') || cat.includes('strong')) {
    // Ice Blue / Soft Navy tone
    styles = "bg-[#18344e] text-[#a9d8de] border-[#457b9d]/60";
    dotColor = "bg-[#a9d8de]";
  } else if (cat.includes('moderate') || cat.includes('fair') || cat.includes('info')) {
    // Steel Cerulean
    styles = "bg-[#1a3350] text-[#d8f0f3] border-[#457b9d]/70";
    dotColor = "bg-[#457b9d]";
  } else if (cat.includes('suspicious') || cat.includes('elevated') || cat.includes('medium')) {
    // Soft amber/red alert
    styles = "bg-[#381318] text-[#ffd0d4] border-[#a81b26]/70";
    dotColor = "bg-[#f86b76]";
  } else if (cat.includes('phishing') || cat.includes('high') || cat.includes('poor')) {
    // Coral alert
    styles = "bg-[#4a1217] text-[#ffd0d4] border-[#e83845]/80 font-medium";
    dotColor = "bg-[#e83845]";
  } else if (cat.includes('malicious') || cat.includes('critical')) {
    // Deep Harmful Crimson
    styles = "bg-[#33080c] text-[#ffd0d4] border-[#e83845] font-semibold";
    dotColor = "bg-[#e83845]";
  }

  const sizeClasses = size === 'sm' 
    ? 'px-2.5 py-0.5 text-xs' 
    : size === 'lg' 
    ? 'px-3.5 py-1 text-sm font-medium' 
    : 'px-3 py-0.5 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{category}</span>
    </span>
  );
};
