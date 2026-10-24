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
  targetLabel
}) => {
  const needleAngle = aqiToNeedleAngle(score);
  const isCompact = size === 'compact';
  const diameter = isCompact ? 180 : 240;
  const radius = isCompact ? 70 : 92;
  const center = diameter / 2;

  // Arc length math for 240-degree dial arc (circumference = 2 * PI * radius)
  const circumference = 2 * Math.PI * radius;
  // Span is 240/360 * circumference = ~0.666 * circumference
  const arcLength = circumference * (240 / 360);
  const strokeOffset = arcLength - (score / 100) * arcLength;

  return (
    <div
      className={`relative rounded-full shadow-[0_12px_28px_rgba(15,23,42,0.12),inset_0_2px_3px_rgba(255,255,255,0.9),inset_0_-3px_6px_rgba(148,163,184,0.4)] transition-all`}
      style={{
        width: `${diameter}px`,
        height: `${diameter}px`,
        padding: isCompact ? '5px' : '7px',
        background:
          'conic-gradient(from 180deg at 50% 50%, #f8fafc 0deg, #cbd5e1 70deg, #f1f5f9 130deg, #94a3b8 200deg, #f8fafc 280deg, #cbd5e1 360deg)'
      }}
    >
      {/* Clean Inner Clinical Dial Plate */}
      <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-50 to-white relative flex items-center justify-center shadow-[inset_0_3px_8px_rgba(15,23,42,0.12),inset_0_-1px_2px_rgba(255,255,255,0.8)] overflow-hidden border border-slate-200/50">
        {/* Radial SVG Dial Tracks and Calibration Marks */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${diameter} ${diameter}`}
        >
          {/* Background Track Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={isCompact ? 5 : 6}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={-((circumference - arcLength) / 2)}
            strokeLinecap="round"
            transform={`rotate(150 ${center} ${center})`}
          />

          {/* Active Glowing AQI Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={isCompact ? 5 : 6}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeOffset - ((circumference - arcLength) / 2)}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${color}80)`
            }}
            transform={`rotate(150 ${center} ${center})`}
          />

          {/* Calibrated Ticks */}
          <g stroke="#94a3b8" strokeWidth="1.5">
            {[-120, -90, -60, -30, 0, 30, 60, 90, 120].map((deg) => (
              <line
                key={deg}
                x1={center}
                y1={isCompact ? 20 : 26}
                x2={center}
                y2={isCompact ? 26 : 34}
                transform={`rotate(${deg} ${center} ${center})`}
              />
            ))}
          </g>

          {/* Gauge Scale Labels */}
          <text
            x={center - (isCompact ? 42 : 56)}
            y={center + (isCompact ? 38 : 52)}
            fill="#64748b"
            fontFamily="Inter"
            fontSize={isCompact ? "8" : "9"}
            fontWeight="600"
          >
            0
          </text>
          <text
            x={center - 7}
            y={isCompact ? 38 : 48}
            fill="#64748b"
            fontFamily="Inter"
            fontSize={isCompact ? "8" : "9"}
            fontWeight="600"
          >
            50
          </text>
          <text
            x={center + (isCompact ? 32 : 44)}
            y={center + (isCompact ? 38 : 52)}
            fill="#64748b"
            fontFamily="Inter"
            fontSize={isCompact ? "8" : "9"}
            fontWeight="600"
          >
            100
          </text>
        </svg>

        {/* Skeuomorphic Machined Needle */}
        <div
          className="absolute origin-bottom transition-transform duration-1000 ease-out flex flex-col items-center pointer-events-none z-10"
          style={{
            height: isCompact ? '65px' : '92px',
            bottom: `${center}px`,
            transform: `rotate(${needleAngle}deg)`
          }}
        >
          <div
            className="rounded-full shadow-md transition-colors"
            style={{
              width: isCompact ? '4px' : '6px',
              height: isCompact ? '45px' : '65px',
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}b3, 0 0 20px ${color}66`
            }}
          />
          <div
            className="bg-slate-400"
            style={{
              width: '2px',
              height: isCompact ? '20px' : '27px'
            }}
          />
        </div>

        {/* Machined Center Cap with Metallic Bevel */}
        <div
          className="rounded-full p-[3px] shadow-[0_4px_8px_rgba(15,23,42,0.18),inset_0_1px_1px_rgba(255,255,255,1)] relative z-20 flex items-center justify-center"
          style={{
            width: isCompact ? '40px' : '54px',
            height: isCompact ? '40px' : '54px',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)'
          }}
        >
          <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(15,23,42,0.15)]">
            <div
              className="rounded-full flex items-center justify-center p-0.5"
              style={{ backgroundColor: `${color}20` }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 6px ${color}cc`
                }}
              />
            </div>
          </div>
        </div>

        {/* Ambient Glow Wash Inside Dial */}
        <div
          className="absolute bottom-2 w-28 h-8 rounded-full blur-[14px] pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: `${color}20` }}
        />
      </div>
    </div>
  );
};
