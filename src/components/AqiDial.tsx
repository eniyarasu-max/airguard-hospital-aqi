import React, { useEffect, useState, useRef } from 'react';
import { aqiToNeedleAngle } from '../utils/aqi';

interface AqiDialProps {
  score: number;
  color?: string;
  size?: 'normal' | 'compact';
  targetLabel?: string;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export const AqiDial: React.FC<AqiDialProps> = ({
  score,
  color = '#0d9488',
  size = 'normal',
  targetLabel = 'CLEANROOM BENCHMARK'
}) => {
  const isCompact = size === 'compact';
  const diameter = isCompact ? 200 : 270;
  const radius = isCompact ? 76 : 102;
  const center = diameter / 2;

  const [displayScore, setDisplayScore] = useState<number>(0);
  const [animDone, setAnimDone] = useState<boolean>(false);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const prevScoreRef = useRef<number>(score);
  const scoreRef = useRef<number>(score);
  scoreRef.current = score;

  // Startup 3-phase sweep: 0→100 (900ms) then 100→target (700ms)
  useEffect(() => {
    const PHASE1_MS = 900;
    const PHASE2_MS = 700;

    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    startTimeRef.current = null;
    setAnimDone(false);
    setDisplayScore(0);

    const runPhase2 = (now: number) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const t = Math.min((now - startTimeRef.current) / PHASE2_MS, 1);
      const target = scoreRef.current;
      setDisplayScore(100 + (target - 100) * easeOutCubic(t));
      if (t < 1) {
        animRef.current = requestAnimationFrame(runPhase2);
      } else {
        setDisplayScore(scoreRef.current);
        setAnimDone(true);
        prevScoreRef.current = scoreRef.current;
      }
    };

    const runPhase1 = (now: number) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const t = Math.min((now - startTimeRef.current) / PHASE1_MS, 1);
      setDisplayScore(easeInOutQuad(t) * 100);
      if (t < 1) {
        animRef.current = requestAnimationFrame(runPhase1);
      } else {
        setDisplayScore(100);
        startTimeRef.current = null;
        animRef.current = requestAnimationFrame(runPhase2);
      }
    };

    // Small delay so DOM is ready
    const kickoff = setTimeout(() => {
      animRef.current = requestAnimationFrame(runPhase1);
    }, 80);

    return () => {
      clearTimeout(kickoff);
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live data updates animate with spring overshoot
  useEffect(() => {
    if (!animDone) return;
    const from = prevScoreRef.current;
    const to = score;
    if (Math.abs(to - from) < 0.5) { prevScoreRef.current = to; return; }
    prevScoreRef.current = to;

    const LIVE_MS = 550;
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    startTimeRef.current = null;

    const runLive = (now: number) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const t = Math.min((now - startTimeRef.current) / LIVE_MS, 1);
      setDisplayScore(from + (to - from) * easeOutBack(t));
      if (t < 1) animRef.current = requestAnimationFrame(runLive);
      else setDisplayScore(to);
    };
    animRef.current = requestAnimationFrame(runLive);
    return () => { if (animRef.current !== null) cancelAnimationFrame(animRef.current); };
  }, [score, animDone]);

  // Geometry
  const clamped = Math.min(100, Math.max(0, displayScore));
  const needleAngle = aqiToNeedleAngle(clamped);
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (240 / 360);
  const strokeOffset = arcLength - (clamped / 100) * arcLength;

  const majorLabelTicks = [0, 20, 40, 60, 80, 100];
  const majorTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const minorTicks = Array.from({ length: 51 }, (_, i) => i * 2).filter(
    (v) => !majorTicks.includes(v)
  );

  // SVG needle geometry (drawn vertically, then rotated)
  const needleLen     = isCompact ? 62 : 86;
  const needleTail    = isCompact ? 18 : 24;
  const bladeBaseHW   = isCompact ? 2.2 : 3.0;
  const bladeMidHW    = isCompact ? 1.3 : 1.8;
  const tipY          = center - needleLen;
  const midY          = center - needleLen * 0.45;
  const baseY         = center;
  const tailBaseHW    = isCompact ? 1.8 : 2.4;
  const tailTipY      = center + needleTail;

  return (
    <div className="relative flex items-center justify-center select-none group gpu-layer">
      {/* Outer Machined Titanium Bezel */}
      <div
        className="relative rounded-full"
        style={{
          width: `${diameter}px`,
          height: `${diameter}px`,
          padding: isCompact ? '7px' : '9px',
          background:
            'conic-gradient(from 220deg at 50% 50%, #f8fafc 0deg, #94a3b8 40deg, #ffffff 90deg, #475569 140deg, #f1f5f9 210deg, #cbd5e1 270deg, #64748b 330deg, #f8fafc 360deg)',
          boxShadow: `
            0 24px 48px -12px rgba(15,23,42,0.25),
            0 10px 20px -5px rgba(15,23,42,0.12),
            0 0 25px rgba(0,229,255,0.22),
            inset 0 2px 2px 0 rgba(255,255,255,1),
            inset 0 -2px 3px 0 rgba(51,65,85,0.45)
          `
        }}
      >
        {/* Cardinal fastener markers */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] pointer-events-none" />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] pointer-events-none" />
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] pointer-events-none" />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] pointer-events-none" />

        {/* Dial face */}
        <div
          className="w-full h-full rounded-full relative flex items-center justify-center overflow-hidden border border-cyan-200/40"
          style={{
            background: 'radial-gradient(circle at 50% 48%, #ffffff 0%, #f8fafc 60%, #eef2f6 100%)',
            boxShadow: `
              inset 0 10px 20px 0 rgba(15,23,42,0.18),
              inset 0 3px 6px 0 rgba(15,23,42,0.10),
              inset 0 -1px 2px 0 rgba(255,255,255,0.95)
            `
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox={`0 0 ${diameter} ${diameter}`}
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id={`arcGrad-${size}`} x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#00f0ff" />
                <stop offset="45%"  stopColor="#0284c7" />
                <stop offset="100%" stopColor={color} />
              </linearGradient>
              <radialGradient id={`dialGlow-${size}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={color} stopOpacity="0.14" />
                <stop offset="85%"  stopColor={color} stopOpacity="0.02" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </radialGradient>
              {/* Needle blade gradient */}
              <linearGradient id={`needleGrad-${size}`} x1="0" y1={baseY} x2="0" y2={tipY} gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#1e293b" />
                <stop offset="38%"  stopColor="#334155" />
                <stop offset="70%"  stopColor={color} />
                <stop offset="100%" stopColor="#e0f2fe" />
              </linearGradient>
              {/* Pivot bevel */}
              <radialGradient id={`pivotBevel-${size}`} cx="38%" cy="32%" r="62%">
                <stop offset="0%"   stopColor="#ffffff" />
                <stop offset="40%"  stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#475569" />
              </radialGradient>
              {/* Jewel */}
              <radialGradient id={`jewel-${size}`} cx="35%" cy="30%" r="70%">
                <stop offset="0%"   stopColor="#e0f2fe" />
                <stop offset="100%" stopColor={color} />
              </radialGradient>
              {/* Needle shadow */}
              <filter id={`ns-${size}`} x="-80%" y="-30%" width="260%" height="160%">
                <feDropShadow dx="1.5" dy="3" stdDeviation="2.5" floodColor="rgba(15,23,42,0.42)" />
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={color} floodOpacity="0.30" />
              </filter>
            </defs>

            {/* Ambient glow */}
            <circle cx={center} cy={center} r={radius} fill={`url(#dialGlow-${size})`} />

            {/* Background track */}
            <circle cx={center} cy={center} r={radius}
              fill="none" stroke="#e2e8f0"
              strokeWidth={isCompact ? 7 : 9}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={-((circumference - arcLength) / 2)}
              strokeLinecap="round"
              transform={`rotate(150 ${center} ${center})`}
            />

            {/* Zone bands */}
            <circle cx={center} cy={center} r={radius + (isCompact ? 6 : 8)}
              fill="none" stroke="#fee2e2" strokeWidth={2}
              strokeDasharray={`${arcLength * 0.5} ${circumference}`}
              strokeDashoffset={-((circumference - arcLength) / 2)}
              transform={`rotate(150 ${center} ${center})`}
            />
            <circle cx={center} cy={center} r={radius + (isCompact ? 6 : 8)}
              fill="none" stroke="#fef3c7" strokeWidth={2}
              strokeDasharray={`${arcLength * 0.3} ${circumference}`}
              strokeDashoffset={-(arcLength * 0.5 + (circumference - arcLength) / 2)}
              transform={`rotate(150 ${center} ${center})`}
            />
            <circle cx={center} cy={center} r={radius + (isCompact ? 6 : 8)}
              fill="none" stroke="#d1fae5" strokeWidth={2.5}
              strokeDasharray={`${arcLength * 0.2} ${circumference}`}
              strokeDashoffset={-(arcLength * 0.8 + (circumference - arcLength) / 2)}
              transform={`rotate(150 ${center} ${center})`}
            />

            {/* Active arc */}
            <circle cx={center} cy={center} r={radius}
              fill="none"
              stroke={`url(#arcGrad-${size})`}
              strokeWidth={isCompact ? 7 : 9}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={strokeOffset - ((circumference - arcLength) / 2)}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 8px ${color}aa)` }}
              transform={`rotate(150 ${center} ${center})`}
            />

            {/* Minor ticks */}
            <g stroke="#cbd5e1" strokeWidth="0.85" strokeLinecap="round">
              {minorTicks.map((val) => {
                const deg = -120 + (val / 100) * 240;
                return (
                  <line key={`mn-${val}`}
                    x1={center} y1={isCompact ? 22 : 28}
                    x2={center} y2={isCompact ? 25 : 32}
                    transform={`rotate(${deg} ${center} ${center})`}
                  />
                );
              })}
            </g>

            {/* Major ticks */}
            <g strokeLinecap="round">
              {majorTicks.map((val) => {
                const deg = -120 + (val / 100) * 240;
                const isCallout = majorLabelTicks.includes(val);
                return (
                  <line key={`mj-${val}`}
                    x1={center} y1={isCompact ? 20 : 25}
                    x2={center} y2={isCompact ? (isCallout ? 28 : 25) : (isCallout ? 37 : 33)}
                    stroke={isCallout ? '#334155' : '#64748b'}
                    strokeWidth={isCallout ? 2 : 1.4}
                    transform={`rotate(${deg} ${center} ${center})`}
                  />
                );
              })}
            </g>

            {/* Scale labels */}
            {majorLabelTicks.map((val) => {
              const deg = -120 + (val / 100) * 240;
              const rad = (deg - 90) * (Math.PI / 180);
              const lr = isCompact ? radius - 19 : radius - 26;
              const x = center + lr * Math.cos(rad);
              const y = center + lr * Math.sin(rad) + 3.5;
              return (
                <text key={`lb-${val}`} x={x} y={y}
                  textAnchor="middle"
                  fill={val >= 80 ? '#0f766e' : val >= 50 ? '#92400e' : '#b91c1c'}
                  fontSize={isCompact ? '9' : '10.5'}
                  fontFamily="'Space Mono','JetBrains Mono',monospace"
                  fontWeight="700"
                  className="select-none tabular-nums"
                >
                  {val}
                </text>
              );
            })}

            {/* Legend */}
            <text x={center} y={center + (isCompact ? 38 : 50)}
              textAnchor="middle" fill="#64748b"
              fontSize={isCompact ? '7' : '8.5'}
              fontFamily="'Space Mono',monospace"
              fontWeight="700" letterSpacing="0.12em"
              className="uppercase select-none"
            >HOSPITAL AQI · 0-100</text>
            <text x={center} y={center + (isCompact ? 47 : 61)}
              textAnchor="middle" fill="#94a3b8"
              fontSize={isCompact ? '6' : '7'}
              fontFamily="'Space Mono',monospace"
              fontWeight="600" letterSpacing="0.08em"
              className="uppercase select-none"
            >{targetLabel}</text>

            {/* ── Precision Galvanometer Needle ──────────────────────── */}
            {/* Rotated around pivot (center, center) by needleAngle degrees */}
            <g
              transform={`rotate(${needleAngle} ${center} ${center})`}
              filter={`url(#ns-${size})`}
            >
              {/* Blade: tapered diamond polygon */}
              <polygon
                points={[
                  `${center - bladeBaseHW},${baseY}`,
                  `${center - bladeMidHW},${midY}`,
                  `${center},${tipY}`,
                  `${center + bladeMidHW},${midY}`,
                  `${center + bladeBaseHW},${baseY}`
                ].join(' ')}
                fill={`url(#needleGrad-${size})`}
                stroke="rgba(15,23,42,0.20)"
                strokeWidth="0.4"
              />
              {/* Left-face glint */}
              <polygon
                points={[
                  `${center - bladeBaseHW * 0.5},${baseY}`,
                  `${center},${midY}`,
                  `${center},${tipY}`
                ].join(' ')}
                fill="rgba(255,255,255,0.20)"
              />
              {/* Counterweight tail */}
              <polygon
                points={[
                  `${center - tailBaseHW},${baseY}`,
                  `${center + tailBaseHW},${baseY}`,
                  `${center + tailBaseHW * 0.5},${tailTipY}`,
                  `${center - tailBaseHW * 0.5},${tailTipY}`
                ].join(' ')}
                fill="#334155"
                stroke="rgba(15,23,42,0.25)"
                strokeWidth="0.4"
              />
            </g>

            {/* ── Pivot Hub (above needle in z-order) ─────────────────── */}
            {/* Outer beveled ring */}
            <circle cx={center} cy={center} r={isCompact ? 10 : 14}
              fill={`url(#pivotBevel-${size})`}
              style={{
                filter: `
                  drop-shadow(0 3px 6px rgba(15,23,42,0.38))
                  drop-shadow(0 1px 1px rgba(255,255,255,0.85))
                `
              }}
            />
            {/* Dark jewel cup */}
            <circle cx={center} cy={center} r={isCompact ? 6.5 : 9} fill="#0f172a" />
            {/* Synthetic ruby jewel bearing */}
            <circle cx={center} cy={center} r={isCompact ? 3.5 : 5}
              fill={`url(#jewel-${size})`}
              style={{ filter: `drop-shadow(0 0 5px ${color}bb)` }}
            />
            {/* Jewel glint */}
            <circle
              cx={center - (isCompact ? 1.2 : 1.7)}
              cy={center - (isCompact ? 1.2 : 1.7)}
              r={isCompact ? 1.2 : 1.7}
              fill="rgba(255,255,255,0.82)"
            />
          </svg>

          {/* Sapphire crystal lens sheen */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none z-40"
            style={{
              background: `
                radial-gradient(circle at 40% 30%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.12) 42%, rgba(255,255,255,0) 65%),
                radial-gradient(circle at 75% 80%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 45%)
              `
            }}
          />
        </div>
      </div>
    </div>
  );
};
