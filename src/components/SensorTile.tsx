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
    teal: 'bg-teal-50/90 border-teal-200/80 text-teal-800 shadow-[inset_0_1px_1px_rgba(20,184,166,0.1)]',
    sky: 'bg-sky-50/90 border-sky-200/80 text-sky-800 shadow-[inset_0_1px_1px_rgba(14,165,233,0.1)]',
    amber: 'bg-amber-50/90 border-amber-200/80 text-amber-800 shadow-[inset_0_1px_1px_rgba(245,158,11,0.1)]',
    rose: 'bg-rose-50/90 border-rose-200/80 text-rose-800 shadow-[inset_0_1px_1px_rgba(244,63,94,0.1)]'
  }[badgeTone];

  const gradientId = `spark_${label.replace(/\s+/g, '_')}`;

  return (
    <div className="rounded-[22px] glass-panel shimmer-effect p-space-md flex flex-col justify-between group relative overflow-hidden gpu-layer">
      {/* Top Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="w-8 h-8 rounded-lg bg-slate-100/80 border border-slate-200/60 flex items-center justify-center text-slate-500 group-hover:text-teal-700 group-hover:border-teal-200 group-hover:bg-teal-50/50 transition-all">
          <span className="material-symbols-outlined text-lg">
            {icon}
          </span>
        </div>
        <span className={`font-label-mono text-[10px] uppercase font-bold border px-2.5 py-0.5 rounded-full ${toneClasses}`}>
          {badgeText}
        </span>
      </div>

      {/* Main Metric Value */}
      <div className="my-3 relative z-10">
        <div className="font-label-sm text-label-sm text-slate-500 font-medium tracking-tight">
          {label}
        </div>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="font-label-numeric-lg text-3xl md:text-[34px] text-slate-900 font-light tracking-tight tabular-nums">
            {value}
          </span>
          <span className="font-body-md text-sm text-slate-400 font-medium">
            {unit}
          </span>
        </div>
      </div>

      {/* Skeuomorphic Recessed Sparkline Well */}
      <div className="w-full h-9 rounded-xl glass-inset px-2 py-1 flex items-end relative overflow-hidden mb-2">
        <svg className="w-full h-6 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 24">
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.32" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#${gradientId})`} />
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Bottom Range Reference */}
      <div className="flex items-center justify-between text-[11px] font-label-mono text-slate-400 pt-2 border-t border-slate-100/80 relative z-10">
        <span className="truncate max-w-[120px]">{rangeLabel}</span>
        <span className={`font-semibold ${trendPositive ? 'text-teal-700' : 'text-slate-500'}`}>
          {trendLabel}
        </span>
      </div>
    </div>
  );
};
