import React from 'react';

interface BiocontrolPanelProps {
  roomName?: string;
  pressurePa?: number;
  achTarget?: number;
}

export const BiocontrolPanel: React.FC<BiocontrolPanelProps> = ({
  roomName = 'Kongu Cleanroom Suite (Node 01)',
  pressurePa = -14.2,
  achTarget = 16
}) => {
  return (
    <div className="rounded-[24px] glass-panel shimmer-effect p-space-lg flex flex-col justify-between h-full gpu-layer border-cyan-200/40 shadow-[0_15px_40px_-5px_rgba(2,132,199,0.08),0_0_20px_rgba(0,229,255,0.05)]">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-slate-200/70">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-cyan-600 text-2xl drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">
              cyclone
            </span>
            <div>
              <h3 className="font-headline-md text-xl md:text-2xl font-light text-slate-900">
                Hospital Air Filtration & Biocontrol
              </h3>
              <span className="font-label-mono text-[10px] text-slate-400">
                Monitoring Suite: {roomName}
              </span>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] animate-pulse" />
            <span className="font-label-mono text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
              ISO 14644-1 Grade B
            </span>
          </div>
        </div>

        {/* Center Circular Machined Dial: 99.8% Filtration Efficiency */}
        <div className="flex flex-col items-center justify-center my-space-md">
          {/* Outer Brushed Silver Bezel */}
          <div
            className="w-32 h-32 rounded-full p-1.5 shadow-[0_12px_28px_rgba(15,23,42,0.14),0_0_20px_rgba(13,148,136,0.15)]"
            style={{
              background:
                'conic-gradient(from 0deg at 50% 50%, #f8fafc 0deg, #cbd5e1 90deg, #f1f5f9 180deg, #94a3b8 270deg, #f8fafc 360deg)'
            }}
          >
            {/* Emissive Glowing Ring */}
            <div className="w-full h-full rounded-full p-1 bg-slate-100 shadow-[inset_0_2px_5px_rgba(15,23,42,0.12)] flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-2 border-teal-500/80 shadow-[0_0_12px_rgba(13,148,136,0.6)] pointer-events-none" />

              {/* Center Readout Disc */}
              <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center shadow-[inset_0_3px_6px_rgba(15,23,42,0.08),inset_0_-2px_4px_rgba(255,255,255,1),0_2px_6px_rgba(15,23,42,0.06)]">
                <span className="font-label-numeric-lg text-2xl font-bold text-slate-900 leading-none">
                  99.8%
                </span>
                <span className="font-label-mono text-[9px] uppercase tracking-wider text-teal-700 mt-0.5 font-bold">
                  HEPA PURITY
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-space-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            <span className="font-label-mono text-xs text-slate-800 font-semibold">
              4,620 CFM Active Displacement · Zero Incursions
            </span>
          </div>
        </div>

        {/* Sunken Debossed Velocity Bar */}
        <div className="mt-space-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-xs text-slate-500 font-medium">
              Laminar Airflow Velocity (Plenum)
            </span>
            <span className="font-label-mono text-xs text-teal-700 font-bold">
              0.42 m/s · Nominal Spec
            </span>
          </div>

          {/* Recessed Track */}
          <div className="relative h-6 w-full rounded-full bg-slate-100 border border-slate-200/80 shadow-[inset_0_2px_4px_rgba(15,23,42,0.12)] flex items-center px-1">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 shadow-[0_0_8px_rgba(13,148,136,0.5)]"
              style={{ width: '84%' }}
            />
            {/* Knurled Indicator Notch */}
            <div
              className="absolute w-6 h-6 rounded-full shadow-[0_3px_8px_rgba(15,23,42,0.18),inset_0_1px_1px_rgba(255,255,255,1)] border border-slate-300 flex items-center justify-center pointer-events-none"
              style={{
                left: '82%',
                background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)'
              }}
            >
              <div className="w-1.5 h-2.5 flex flex-col justify-between">
                <div className="w-full h-0.5 bg-slate-400 rounded-full" />
                <div className="w-full h-0.5 bg-slate-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* 3-Stage Filtration Telemetry Pods */}
        <div className="grid grid-cols-3 gap-space-sm mt-space-lg">
          {/* HEPA UV-C */}
          <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200/80 shadow-sm text-teal-900 flex flex-col items-center justify-center gap-1">
            <span className="material-symbols-outlined text-lg text-teal-600">
              medical_services
            </span>
            <span className="font-label-mono text-[10px] font-bold">HEPA UV-C</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
              <span className="font-label-mono text-[9px] text-teal-700 font-semibold">99.97%</span>
            </div>
          </div>

          {/* Multi-Ionization */}
          <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200/80 shadow-sm text-teal-900 flex flex-col items-center justify-center gap-1">
            <span className="material-symbols-outlined text-lg text-teal-600">
              bolt
            </span>
            <span className="font-label-mono text-[10px] font-bold">Ionization</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shadow-[0_0_6px_rgba(13,148,136,0.7)]" />
              <span className="font-label-mono text-[9px] text-teal-700 font-semibold">Active</span>
            </div>
          </div>

          {/* Activated Carbon Bed */}
          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200/80 shadow-sm text-sky-900 flex flex-col items-center justify-center gap-1">
            <span className="material-symbols-outlined text-lg text-sky-600">
              filter_alt
            </span>
            <span className="font-label-mono text-[10px] font-bold">Carbon Bed</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shadow-[0_0_6px_rgba(2,132,199,0.7)]" />
              <span className="font-label-mono text-[9px] text-sky-700 font-semibold">Nominal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Metadata */}
      <div className="pt-space-md mt-space-md border-t border-slate-200/70 flex items-center justify-between text-slate-400 font-label-mono text-[11px]">
        <span>Pressure: {pressurePa > 0 ? `+${pressurePa}` : pressurePa} Pa Airlock</span>
        <span>Turnover: {achTarget} ACH</span>
      </div>
    </div>
  );
};
