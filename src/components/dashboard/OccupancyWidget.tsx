import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

/**
 * OccupancyWidget - Luxury circular gauge with gradient ring
 * Features: Animated progress, glowing effect, stat breakdown
 */

export default function OccupancyWidget({ value, occupied, total, className }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = 70;
  const strokeWidth = 10;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedValue / 100) * circumference;

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-neutral-100",
      "shadow-sm hover:shadow-lg transition-all duration-300",
      "overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-100">
        <h3 className="text-sm font-semibold text-neutral-900">Live Occupancy</h3>
        <p className="text-xs text-neutral-400 mt-0.5">{total} total rooms</p>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex flex-col items-center">
          {/* Gauge */}
          <div className="relative" style={{ width: 180, height: 180 }}>
            {/* Glow effect */}
            <div
              className="absolute inset-4 rounded-full blur-xl opacity-30 transition-opacity duration-1000"
              style={{
                background: `conic-gradient(from 0deg, #A57865 ${animatedValue}%, transparent ${animatedValue}%)`,
              }}
            />

            <svg width="180" height="180" className="transform -rotate-90 relative z-10">
              <defs>
                <linearGradient id="occupancyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A57865" />
                  <stop offset="50%" stopColor="#BFA793" />
                  <stop offset="100%" stopColor="#CDB261" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background track */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="#F5F5F4"
                strokeWidth={strokeWidth}
              />

              {/* Progress ring */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="url(#occupancyGradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                filter="url(#glow)"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <span className="text-4xl font-semibold text-neutral-900 tracking-tight tabular-nums">
                {Math.round(animatedValue)}
                <span className="text-2xl text-neutral-300">%</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mt-1">
                Occupied
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="w-full flex items-center gap-4 mt-6 pt-6 border-t border-neutral-100">
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-terra-500" />
                <span className="text-2xl font-semibold text-neutral-900">{occupied}</span>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                Occupied
              </p>
            </div>

            <div className="w-px h-12 bg-neutral-100" />

            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-2xl font-semibold text-emerald-600">{total - occupied}</span>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                Available
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
