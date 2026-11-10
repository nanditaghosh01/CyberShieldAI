import React from 'react';

export const MetricCard = ({ title, value, icon: Icon, changeText, color = 'ice', subtitle }) => {
  const colorMap = {
    ice: 'border-[#274366] text-[#a9d8de] bg-[#122035] hover:border-[#457b9d]',
    steel: 'border-[#274366] text-[#d8f0f3] bg-[#14253d] hover:border-[#457b9d]',
    honeydew: 'border-[#274366] text-[#f3fbf0] bg-[#122035] hover:border-[#457b9d]',
    // Red shades for harmful/alert metrics
    red: 'border-[#a81b26]/70 text-[#fca5ac] bg-[#22070a] hover:border-[#e83845]',
    deepRed: 'border-[#e83845] text-[#ffd0d4] bg-[#2b080d] hover:border-[#f86b76]',
  };

  const iconBgMap = {
    ice: 'bg-[#182b45] text-[#a9d8de] border border-[#274366]',
    steel: 'bg-[#182b45] text-[#457b9d] border border-[#274366]',
    honeydew: 'bg-[#182b45] text-[#f3fbf0] border border-[#274366]',
    red: 'bg-[#38080c] text-[#e83845] border border-[#a81b26]',
    deepRed: 'bg-[#4c0c11] text-[#f86b76] border border-[#e83845]',
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 shadow-sm hover:shadow group ${colorMap[color] || colorMap.ice}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#a9d8de]/90">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl ${iconBgMap[color] || iconBgMap.ice}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-[#f3fbf0] tracking-tight">
          {value}
        </span>
        {changeText && (
          <span className="text-xs font-medium text-[#a9d8de]">
            {changeText}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[11px] text-[#a9d8de]/75 leading-tight">
          {subtitle}
        </p>
      )}
    </div>
  );
};
