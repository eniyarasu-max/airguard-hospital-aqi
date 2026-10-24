import React from 'react';

interface SensorTileProps {
  label: string;
  value: number | string;
  unit: string;
  icon: string;
  badgeText: string;
  badgeTone?: 'teal' | 'sky' | 'amber' | 'rose';
  rangeLabel: string;
  trendLabel: string;
  trendPositive?: boolean;
  sparklineData?: number[];
  color?: string;
}

export const SensorTile: React.FC<SensorTileProps> = ({
  label,
  value,
  unit,
  icon,
  badgeText,
  badgeTone = 'teal',
  rangeLabel,
  trendLabel,
  trendPositive = true,
  sparklineData,
  color = '#0d9488'
}) => {
  // Generate a smooth SVG path from sparkline points or default wave
  const points = sparklineData && sparklineData.length >= 4
    ? sparklineData
    : [18, 12, 15, 8, 14, 10];

  const minVal = Math.min(...points);
  const maxVal = Math.max(...points) || 1;
  const range = maxVal - minVal || 1;

  // Map points to SVG coordinates (viewBox 0 0 100 24)
  const coords = points.map((p, idx) => {
    const x = (idx / (points.length - 1)) * 100;
    const y = 20 - ((p - minVal) / range) * 16;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M 0,${coords[0].split(',')[1]} ` + coords.map((c) => `L ${c}`).join(' ');
  const areaD = `${pathD} L 100,24 L 0,24 Z`;

  const toneClasses = {
    teal: 'bg-teal-50 border-teal-200/60 text-teal-800',
    sky: 'bg-sky-50 border-sky-200/60 text-sky-800',
    amber: 'bg-amber-50 border-amber-200/60 text-amber-800',
    rose: 'bg-rose-50 border-rose-200/60 text-rose-800'
  }[badgeTone];

  const gradientId = `spark_${label.replace(/\s+/g, '_')}`;

  return (
    <div className="rounded-[22px] bg-white/80 backdrop-blur-[24px] p-space-md border border-white/90 shadow-[0_8px_24px_-4px_rgba(15,23,42,0.05),0_2px_4px_-1px_rgba(15,23,42,0.03),inset_0_1px_0_0_rgba(255,255,255,1)] flex flex-col justify-between hover:bg-white/95 transition-all duration-200 group">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600 transition-colors text-xl">
          {icon}
        </span>
        <span className={`font-label-mono text-[10px] uppercase font-semibold border px-2 py-0.5 rounded-full ${toneClasses}`}>
          {badgeText}
        </span>
      </div>

      {/* Main Metric Value */}
      <div className="my-3">
        <div className="font-label-sm text-label-sm text-slate-500 font-medium">
          {label}
        </div>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="font-label-numeric-lg text-3xl md:text-[32px] text-slate-900 font-light tracking-tight">
            {value}
          </span>
          <span className="font-body-md text-sm text-slate-400 font-normal">
            {unit}
          </span>
        </div>
      </div>

      {/* Sparkline Graphic */}
      <div className="w-full h-8 flex items-end">
        <svg className="w-full h-7 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 24">
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#${gradientId})`} />
          <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Bottom Range Reference */}
      <div className="flex items-center justify-between text-[11px] font-label-mono text-slate-400 pt-2 border-t border-slate-100">
        <span className="truncate max-w-[120px]">{rangeLabel}</span>
        <span className={`font-semibold ${trendPositive ? 'text-teal-700' : 'text-slate-500'}`}>
          {trendLabel}
        </span>
      </div>
    </div>
  );
};
