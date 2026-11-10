import React from 'react';
import { ThreatBadge } from './ThreatBadge';

export const RiskGauge = ({ score = 0, category = 'Low Risk', confidence = 0.95, size = 190 }) => {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc length for 240 degrees representation
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * normalizedScore) / 100;

  // Exact Palette Mapping with clean human tones
  let strokeColor = '#a9d8de'; // Ice Blue (Low Risk / Safe)
  if (normalizedScore > 20) { 
    strokeColor = '#457b9d'; // Steel Blue (Moderate)
  }
  if (normalizedScore > 40) { 
    strokeColor = '#f86b76'; // Light Warning Red (Elevated)
  }
  if (normalizedScore > 60) { 
    strokeColor = '#e83845'; // Primary Vibrant Red (High / Phishing)
  }
  if (normalizedScore > 80) { 
    strokeColor = '#cc2734'; // Deep Crimson Red (Critical / Malicious)
  }

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track in Deep Navy */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#1d3557"
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
              transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.4s ease'
            }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-bold tracking-tight text-[#f3fbf0]">
            {normalizedScore}
            <span className="text-sm font-normal text-[#a9d8de]/70 ml-0.5">/100</span>
          </span>
          <span className="text-xs font-medium text-[#a9d8de]/80 mt-0.5">
            Risk Score
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-col items-center gap-1">
        <ThreatBadge category={category} size="md" />
        {confidence !== undefined && (
          <span className="text-xs text-[#a9d8de]/70">
            Model confidence: <strong className="text-[#f3fbf0]">{(confidence * 100).toFixed(0)}%</strong>
          </span>
        )}
      </div>
    </div>
  );
};
