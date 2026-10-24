import React from 'react';
import { aqiToNeedleAngle } from '../utils/aqi';

interface AqiDialProps {
  score: number;
  color?: string;
  size?: 'normal' | 'compact';
  targetLabel?: string;
}

export const AqiDial: React.FC<AqiDialProps> = ({
  score,
  color = '#0d9488',
  size = 'normal',
  targetLabel = 'CLEANROOM BENCHMARK'
}) => {
  const needleAngle = aqiToNeedleAngle(score);
  const isCompact = size === 'compact';
  const diameter = isCompact ? 200 : 270;
  const radius = isCompact ? 76 : 102;
  const center = diameter / 2;

  // Arc length math for 240-degree dial arc (circumference = 2 * PI * radius)
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (240 / 360);
  const strokeOffset = arcLength - (Math.min(100, Math.max(0, score)) / 100) * arcLength;

  // Numerical callout ticks: 0, 20, 40, 60, 80, 100
  const majorLabelTicks = [0, 20, 40, 60, 80, 100];
  // Major tick lines every 10 units: 0, 10, 20, ..., 100
  const majorTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  // Minor precision ticks every 2 units (excluding the 10s)
  const minorTicks = Array.from({ length: 51 }, (_, i) => i * 2).filter(
    (v) => !majorTicks.includes(v)
  );

  return (
    <div className="relative flex items-center justify-center select-none group gpu-layer">
      {/* Outer Machined Titanium/Stainless Steel Bezel Ring */}
      <div
        className="relative rounded-full transition-all duration-700"
        style={{
          width: `${diameter}px`,
          height: `${diameter}px`,
          padding: isCompact ? '7px' : '9px',
          background:
            'conic-gradient(from 220deg at 50% 50%, #f8fafc 0deg, #94a3b8 40deg, #ffffff 90deg, #475569 140deg, #f1f5f9 210deg, #cbd5e1 270deg, #64748b 330deg, #f8fafc 360deg)',
          boxShadow: `
            0 24px 48px -12px rgba(15, 23, 42, 0.25),
            0 10px 20px -5px rgba(15, 23, 42, 0.12),
            0 0 25px rgba(0, 229, 255, 0.22),
            inset 0 2px 2px 0 rgba(255, 255, 255, 1),
            inset 0 -2px 3px 0 rgba(51, 65, 85, 0.45)
          `
        }}
      >
        {/* Cardinal Direction Lathe Fastener Markers */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] pointer-events-none" />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] pointer-events-none" />
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] pointer-events-none" />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] pointer-events-none" />

        {/* Recessed Dial Cup with Deep Ambient Occlusion */}
        <div
          className="w-full h-full rounded-full relative flex items-center justify-center overflow-hidden border border-cyan-200/40"
          style={{
            background: 'radial-gradient(circle at 50% 48%, #ffffff 0%, #f8fafc 60%, #eef2f6 100%)',
            boxShadow: `
              inset 0 10px 20px 0 rgba(15, 23, 42, 0.18),
              inset 0 3px 6px 0 rgba(15, 23, 42, 0.10),
              inset 0 -1px 2px 0 rgba(255, 255, 255, 0.95)
            `
          }}
        >
          {/* Radial SVG Dial Tracks and High-Precision Scales */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${diameter} ${diameter}`}
          >
            <defs>
              {/* Active Trace Multi-stop Gradient with Neon Blue */}
              <linearGradient id="activeArcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f0ff" />
                <stop offset="45%" stopColor="#0284c7" />
                <stop offset="100%" stopColor={color} />
              </linearGradient>

              {/* Dial Radial Ambient Halo */}
              <radialGradient id="dialGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={color} stopOpacity="0.14" />
                <stop offset="85%" stopColor={color} stopOpacity="0.02" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Subtle Center Radial Glow */}
            <circle cx={center} cy={center} r={radius} fill="url(#dialGlow)" />

            {/* Background Calibrated Track Arc (240 degree sweep) */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={isCompact ? 7 : 9}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={-((circumference - arcLength) / 2)}
              strokeLinecap="round"
              transform={`rotate(150 ${center} ${center})`}
            />

            {/* Qualitative Hospital Standard Bands (Etched Reference Arc) */}
            {/* 1. Hazard Band (0-50: -120deg to 0deg = 120deg span) */}
            <circle
              cx={center}
              cy={center}
              r={radius + (isCompact ? 6 : 8)}
              fill="none"
              stroke="#fee2e2"
              strokeWidth={2}
              strokeDasharray={`${arcLength * (50 / 100)} ${circumference}`}
              strokeDashoffset={-((circumference - arcLength) / 2)}
              transform={`rotate(150 ${center} ${center})`}
            />
            {/* 2. Caution Band (50-80: 0deg to +72deg = 72deg span) */}
            <circle
              cx={center}
              cy={center}
              r={radius + (isCompact ? 6 : 8)}
              fill="none"
              stroke="#fef3c7"
              strokeWidth={2}
              strokeDasharray={`${arcLength * (30 / 100)} ${circumference}`}
              strokeDashoffset={-(arcLength * 0.5 + (circumference - arcLength) / 2)}
              transform={`rotate(150 ${center} ${center})`}
            />
            {/* 3. Pristine Cleanroom Band (80-100: +72deg to +120deg = 48deg span) */}
            <circle
              cx={center}
              cy={center}
              r={radius + (isCompact ? 6 : 8)}
              fill="none"
              stroke="#d1fae5"
              strokeWidth={2.5}
              strokeDasharray={`${arcLength * (20 / 100)} ${circumference}`}
              strokeDashoffset={-(arcLength * 0.8 + (circumference - arcLength) / 2)}
              transform={`rotate(150 ${center} ${center})`}
            />

            {/* Active Glowing AQI Arc */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="url(#activeArcGrad)"
              strokeWidth={isCompact ? 7 : 9}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={strokeOffset - ((circumference - arcLength) / 2)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{
                filter: `drop-shadow(0 0 8px ${color}aa)`
              }}
              transform={`rotate(150 ${center} ${center})`}
            />

            {/* Minor Hairline Precision Ticks (every 2 AQI units) */}
            <g stroke="#cbd5e1" strokeWidth="0.85" strokeLinecap="round">
              {minorTicks.map((val) => {
                const deg = -120 + (val / 100) * 240;
                return (
                  <line
                    key={`min-${val}`}
                    x1={center}
                    y1={isCompact ? 22 : 28}
                    x2={center}
                    y2={isCompact ? 25 : 32}
                    transform={`rotate(${deg} ${center} ${center})`}
                  />
                );
              })}
            </g>

            {/* Major Division Ticks (every 10 AQI units) */}
            <g stroke="#64748b" strokeWidth="1.6" strokeLinecap="round">
              {majorTicks.map((val) => {
                const deg = -120 + (val / 100) * 240;
                const isCallout = majorLabelTicks.includes(val);
                return (
                  <line
                    key={`maj-${val}`}
                    x1={center}
                    y1={isCompact ? 20 : 25}
                    x2={center}
                    y2={isCompact ? (isCallout ? 28 : 25) : (isCallout ? 37 : 33)}
                    stroke={isCallout ? '#334155' : '#64748b'}
                    strokeWidth={isCallout ? 2 : 1.4}
                    transform={`rotate(${deg} ${center} ${center})`}
                  />
                );
              })}
            </g>

            {/* Dial Numerical Markings with Optical Alignment in Space Mono */}
            {majorLabelTicks.map((val) => {
              const deg = -120 + (val / 100) * 240;
              const rad = (deg - 90) * (Math.PI / 180);
              const labelRadius = isCompact ? radius - 19 : radius - 26;
              const x = center + labelRadius * Math.cos(rad);
              const y = center + labelRadius * Math.sin(rad) + 3.5;

              return (
                <text
                  key={`lbl-${val}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fill={val >= 80 ? '#0f766e' : val >= 50 ? '#92400e' : '#b91c1c'}
                  fontSize={isCompact ? '9' : '10.5'}
                  fontFamily="'Space Mono', 'JetBrains Mono', monospace, sans-serif"
                  fontWeight="700"
                  className="select-none tabular-nums tracking-tighter"
                >
                  {val}
                </text>
              );
            })}

            {/* Cleanroom Standard Label */}
            <text
              x={center}
              y={center + (isCompact ? 38 : 50)}
              textAnchor="middle"
              fill="#64748b"
              fontSize={isCompact ? '7' : '8.5'}
              fontFamily="'Space Mono', monospace"
              fontWeight="700"
              letterSpacing="0.12em"
              className="uppercase select-none"
            >
              HOSPITAL AQI · 0-100
            </text>
            <text
              x={center}
              y={center + (isCompact ? 47 : 61)}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize={isCompact ? '6' : '7'}
              fontFamily="'Space Mono', monospace"
              fontWeight="600"
              letterSpacing="0.08em"
              className="uppercase select-none"
            >
              {targetLabel}
            </text>
          </svg>

          {/* Precision Galvanometer Needle with Counterbalance Tail */}
          <div
            className="absolute origin-bottom pointer-events-none z-20 flex flex-col items-center galvanometer-needle"
            style={{
              height: isCompact ? '78px' : '106px',
              bottom: `${center}px`,
              transform: `rotate(${needleAngle}deg)`,
              filter: 'drop-shadow(0 4px 8px rgba(15, 23, 42, 0.32))'
            }}
          >
            {/* Knife-Edge Needle Spear with High-Contrast Tip */}
            <div
              className="rounded-t-full transition-colors duration-500 relative"
              style={{
                width: isCompact ? '3.5px' : '4.5px',
                height: isCompact ? '58px' : '82px',
                background: `linear-gradient(to top, #1e293b 0%, #334155 30%, ${color} 65%, #ffffff 98%)`,
                boxShadow: `0 0 10px ${color}bb`
              }}
            >
              {/* Microscopic Pointer Pin */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
            {/* Counterweight Tail below pivot */}
            <div
              className="bg-slate-600 rounded-b-sm"
              style={{
                width: isCompact ? '2px' : '2.5px',
                height: isCompact ? '20px' : '24px'
              }}
            />
          </div>

          {/* Machined Center Pivot Hub with Milled Concentric Bevels & Synthetic Jewel */}
          <div
            className="rounded-full relative z-30 flex items-center justify-center shadow-lg"
            style={{
              width: isCompact ? '40px' : '54px',
              height: isCompact ? '40px' : '54px',
              background:
                'conic-gradient(from 145deg at 50% 50%, #ffffff 0deg, #94a3b8 55deg, #f8fafc 115deg, #334155 180deg, #cbd5e1 245deg, #ffffff 360deg)',
              boxShadow: `
                0 4px 12px rgba(15, 23, 42, 0.32),
                inset 0 1.5px 1.5px rgba(255, 255, 255, 1),
                inset 0 -1.5px 2px rgba(51, 65, 85, 0.6)
              `
            }}
          >
            {/* Outer Jewel Cup */}
            <div className="w-[76%] h-[76%] rounded-full bg-slate-900 flex items-center justify-center shadow-inner relative">
              {/* Synthetic Jewel Bearing */}
              <div
                className="w-3 h-3 rounded-full transition-colors duration-500 relative overflow-hidden"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 10px 2px ${color}dd, inset 0 1px 1px rgba(255,255,255,0.8)`
                }}
              >
                {/* Jewel Internal Refraction Glint */}
                <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white/90" />
              </div>
            </div>
          </div>

          {/* Convex Curved Sapphire Crystal Reflection (Optical Lens Curvature) */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none z-40"
            style={{
              background: `
                radial-gradient(circle at 40% 30%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.12) 42%, rgba(255, 255, 255, 0) 65%),
                radial-gradient(circle at 75% 80%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 45%)
              `
            }}
          />
        </div>
      </div>
    </div>
  );
};
