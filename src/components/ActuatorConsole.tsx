import React from 'react';
import { RoomControl } from '../types';

interface ActuatorConsoleProps {
  control?: RoomControl;
  roomName?: string;
  onUpdateControl: (patch: Partial<RoomControl>) => void;
}

export const ActuatorConsole: React.FC<ActuatorConsoleProps> = ({
  control = { roomId: 'icu', mode: 'auto', fan: true, damper: 78, uvc: true, carbonBed: true, ionization: false },
  roomName = 'ICU Suite 401',
  onUpdateControl
}) => {
  const isAuto = control.mode === 'auto';
  const isFanOn = control.fan;
  const damperVal = control.damper ?? 78;

  const toggleMode = () => {
    onUpdateControl({ mode: isAuto ? 'manual' : 'auto' });
  };

  const toggleFan = () => {
    onUpdateControl({ fan: !isFanOn });
  };

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(10, Math.min(100, Math.round((clickX / rect.width) * 100)));
    onUpdateControl({ damper: pct });
  };

  return (
    <div className="rounded-[24px] bg-white/75 backdrop-blur-[24px] p-space-lg border border-white/90 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06),0_4px_6px_-2px_rgba(15,23,42,0.03),inset_0_1px_0_0_rgba(255,255,255,1)] flex flex-col justify-between h-full">
      <div>
        {/* Top Header with Tactile Auto/Manual Rocker */}
        <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-slate-200/70">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-teal-600 text-2xl">
              mode_fan
            </span>
            <div>
              <h3 className="font-headline-md text-xl md:text-2xl font-light text-slate-900">
                HVAC Exhaust Actuator
              </h3>
              <span className="font-label-mono text-[10px] text-slate-400">
                Target: {roomName}
              </span>
            </div>
          </div>

          {/* Tactile Auto / Manual Debossed Rocker Switch */}
          <div
            onClick={toggleMode}
            className="cursor-pointer flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200/70 shadow-[inset_0_2px_4px_rgba(15,23,42,0.08)] select-none"
          >
            <span
              className={`px-3 py-0.5 rounded-full font-label-mono text-[10px] font-bold transition-all duration-200 ${
                isAuto
                  ? 'bg-white text-teal-700 shadow-[0_2px_4px_rgba(15,23,42,0.08)] border border-slate-200/50'
                  : 'text-slate-500'
              }`}
            >
              AUTO
            </span>
            <span
              className={`px-3 py-0.5 rounded-full font-label-mono text-[10px] font-bold transition-all duration-200 ${
                !isAuto
                  ? 'bg-white text-teal-700 shadow-[0_2px_4px_rgba(15,23,42,0.08)] border border-slate-200/50'
                  : 'text-slate-500'
              }`}
            >
              MANUAL
            </span>
          </div>
        </div>

        {/* Center Tactile Push-Button for Exhaust Activation */}
        <div className="flex flex-col items-center justify-center my-space-md">
          {/* Outer Brushed Silver Bezel with Halo */}
          <div
            className="w-32 h-32 rounded-full p-1.5 shadow-[0_12px_28px_rgba(15,23,42,0.14),0_0_20px_rgba(13,148,136,0.15)] transition-all"
            style={{
              background:
                'conic-gradient(from 0deg at 50% 50%, #f8fafc 0deg, #cbd5e1 90deg, #f1f5f9 180deg, #94a3b8 270deg, #f8fafc 360deg)'
            }}
          >
            {/* Emissive Cyan/Teal LED Ring */}
            <div className="w-full h-full rounded-full p-1 bg-slate-100 shadow-[inset_0_2px_5px_rgba(15,23,42,0.12)] flex items-center justify-center relative">
              <div
                className={`absolute inset-0 rounded-full border-2 transition-all duration-300 pointer-events-none ${
                  isFanOn
                    ? 'border-teal-500/80 shadow-[0_0_12px_rgba(13,148,136,0.65)]'
                    : 'border-slate-300 shadow-none'
                }`}
              />
              {/* Concave Push Surface */}
              <button
                onClick={toggleFan}
                className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center shadow-[inset_0_3px_6px_rgba(15,23,42,0.08),inset_0_-2px_4px_rgba(255,255,255,1),0_2px_6px_rgba(15,23,42,0.06)] active:scale-95 transition-transform group"
              >
                <span
                  className={`material-symbols-outlined text-3xl transition-transform duration-700 ${
                    isFanOn
                      ? 'text-teal-600 drop-shadow-[0_0_8px_rgba(13,148,136,0.4)] animate-spin [animation-duration:3s]'
                      : 'text-slate-400'
                  }`}
                >
                  mode_fan
                </span>
                <span
                  className={`font-label-mono text-[9px] uppercase tracking-wider mt-1 font-bold ${
                    isFanOn ? 'text-teal-700' : 'text-slate-500'
                  }`}
                >
                  {isFanOn ? 'EXHAUST ON' : 'EXHAUST STANDBY'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-space-md">
            <span
              className={`w-2 h-2 rounded-full ${
                isFanOn
                  ? 'bg-teal-600 shadow-[0_0_8px_rgba(13,148,136,0.6)] animate-pulse'
                  : 'bg-slate-400'
              }`}
            />
            <span className="font-label-mono text-xs text-slate-800 font-semibold">
              {isFanOn ? '1,850 RPM · Negative Pressure Mode' : '0 RPM · Standby Idle'}
            </span>
          </div>
        </div>

        {/* Sunken Debossed Velocity Slider Track */}
        <div className="mt-space-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-xs text-slate-500 font-medium">
              Plenum Airflow Velocity
            </span>
            <span className="font-label-mono text-xs text-teal-700 font-bold">
              {damperVal}% · {(damperVal * 0.03).toFixed(1)} m/s
            </span>
          </div>

          {/* Recessed Track */}
          <div
            onClick={handleSliderClick}
            className="cursor-pointer relative h-6 w-full rounded-full bg-slate-100 border border-slate-200/80 shadow-[inset_0_2px_4px_rgba(15,23,42,0.12)] flex items-center px-1"
          >
            {/* Glowing Filled Bar */}
            <div
              className="h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(13,148,136,0.5)] transition-all duration-150"
              style={{ width: `${damperVal}%` }}
            />
            {/* Knurled Machined Tactile Handle */}
            <div
              className="absolute -translate-x-1/2 w-7 h-7 rounded-full shadow-[0_3px_8px_rgba(15,23,42,0.2),inset_0_1px_1px_rgba(255,255,255,1)] border border-slate-300 flex items-center justify-center transition-all duration-150"
              style={{
                left: `${damperVal}%`,
                background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)'
              }}
            >
              <div className="w-1.5 h-3 flex flex-col justify-between">
                <div className="w-full h-0.5 bg-slate-400 rounded-full" />
                <div className="w-full h-0.5 bg-slate-400 rounded-full" />
                <div className="w-full h-0.5 bg-slate-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Purifier Multi-Stage Selector Buttons */}
        <div className="grid grid-cols-3 gap-space-sm mt-space-lg">
          <button
            onClick={() => onUpdateControl({ uvc: !control.uvc })}
            className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              control.uvc
                ? 'bg-teal-50 border-teal-200/80 shadow-[0_2px_4px_rgba(13,148,136,0.06)] text-teal-800'
                : 'bg-slate-50 border-slate-200/70 text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-lg">medical_services</span>
            <span className="font-label-mono text-[10px] font-semibold">HEPA UV-C</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                control.uvc ? 'bg-teal-600 shadow-[0_0_6px_rgba(13,148,136,0.6)]' : 'bg-slate-300'
              }`}
            />
          </button>

          <button
            onClick={() => onUpdateControl({ ionization: !control.ionization })}
            className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              control.ionization
                ? 'bg-teal-50 border-teal-200/80 shadow-[0_2px_4px_rgba(13,148,136,0.06)] text-teal-800'
                : 'bg-slate-50 border-slate-200/70 text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-lg">bolt</span>
            <span className="font-label-mono text-[10px] font-semibold">Ionization</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                control.ionization ? 'bg-teal-600 shadow-[0_0_6px_rgba(13,148,136,0.6)]' : 'bg-slate-300'
              }`}
            />
          </button>

          <button
            onClick={() => onUpdateControl({ carbonBed: !control.carbonBed })}
            className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              control.carbonBed
                ? 'bg-sky-50 border-sky-200/80 shadow-[0_2px_4px_rgba(2,132,199,0.06)] text-sky-800'
                : 'bg-slate-50 border-slate-200/70 text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-lg">filter_alt</span>
            <span className="font-label-mono text-[10px] font-semibold">Carbon Bed</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                control.carbonBed ? 'bg-sky-600 shadow-[0_0_6px_rgba(2,132,199,0.6)]' : 'bg-slate-300'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Bottom Motor Telemetry */}
      <div className="pt-space-md mt-space-md border-t border-slate-200/70 flex items-center justify-between text-slate-400 font-label-mono text-[11px]">
        <span>Damper Motor #DM-04: Online</span>
        <span>Temp: 34.2°C Internal</span>
      </div>
    </div>
  );
};
