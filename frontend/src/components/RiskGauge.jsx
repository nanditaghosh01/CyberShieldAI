import React from 'react';
import { ThreatBadge } from './ThreatBadge';

export const RiskGauge = ({ score = 0, category = 'Low Risk', confidence = 0.95, size = 200 }) => {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc length for 240 degrees representation
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * normalizedScore) / 100;

  let strokeColor = '#10b981'; // Green
  let glowColor = 'rgba(16, 185, 129, 0.3)';
  if (normalizedScore > 20) { strokeColor = '#0ea5e9'; glowColor = 'rgba(14, 165, 233, 0.3)'; }
  if (normalizedScore > 40) { strokeColor = '#f59e0b'; glowColor = 'rgba(245, 158, 11, 0.3)'; }
  if (normalizedScore > 60) { strokeColor = '#f97316'; glowColor = 'rgba(249, 115, 22, 0.35)'; }
  if (normalizedScore > 80) { strokeColor = '#ef4444'; glowColor = 'rgba(239, 68, 68, 0.45)'; }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#16233d"
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
          {/* Active Progress Meter */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease',
              filter: `drop-shadow(0 0 10px ${glowColor})`
            }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight font-mono text-white">
            {normalizedScore}
            <span className="text-lg font-normal text-slate-400">/100</span>
          </span>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-0.5">
            Risk Score
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-col items-center gap-1.5">
        <ThreatBadge category={category} size="lg" />
        {confidence !== undefined && (
          <span className="text-xs text-slate-400 font-mono">
            Confidence: <span className="text-cyan-400 font-semibold">{(confidence * 100).toFixed(1)}%</span>
          </span>
        )}
      </div>
    </div>
  );
};

