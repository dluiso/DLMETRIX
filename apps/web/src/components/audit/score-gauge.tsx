'use client';

import { getScoreLabel } from '@dlmetrix/shared';

interface Props {
  score: number;
  size?: number;
}

export function ScoreGauge({ score, size = 140 }: Props) {
  const scoreInfo = getScoreLabel(score);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  // Gauge arc = 270 degrees (three quarters)
  const arcLength = circumference * 0.75;
  const offset = arcLength - (score / 100) * arcLength;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(135deg)' }}>
        {/* Background arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeLinecap="round"
        />
        {/* Score arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={scoreInfo.color}
          strokeWidth="12"
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: 10 }}>
        <span className="text-4xl font-bold text-gray-900 dark:text-white leading-none">
          {score}
        </span>
        <span className="text-xs text-muted-foreground mt-1">/ 100</span>
      </div>
    </div>
  );
}
