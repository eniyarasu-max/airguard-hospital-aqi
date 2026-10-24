import React from 'react';

interface StatChipsProps {
  activeAlertsCount: number;
  latestAlertMessage?: string;
  totalRooms: number;
  onlineRooms: number;
  offlineDevicesCount: number;
  onOpenAlerts?: () => void;
}

export const StatChips: React.FC<StatChipsProps> = ({
  activeAlertsCount,
  latestAlertMessage = "Surgery Suite B HEPA Saturation",
  totalRooms,
  onlineRooms,
  offlineDevicesCount,
  onOpenAlerts
}) => {
  return (
    <div className="flex flex-col justify-between gap-space-md h-full">
      {/* Card 1: Active Warning Alerts */}
      <div
        onClick={onOpenAlerts}
        className="cursor-pointer rounded-[22px] glass-panel shimmer-effect p-space-md flex items-center justify-between group relative overflow-hidden gpu-layer"
      >
        <div className="flex items-start gap-space-md min-w-0">
          <div className={`w-12 h-12 rounded-2xl p-0.5 border flex items-center justify-center shrink-0 shadow-inner ${
            activeAlertsCount > 0
              ? 'bg-purple-50/90 border-purple-200/80 shadow-[inset_0_2px_4px_rgba(147,51,234,0.15)]'
              : 'bg-emerald-50/90 border-emerald-200/80 shadow-[inset_0_2px_4px_rgba(16,185,129,0.15)]'
          }`}>
            <span className={`material-symbols-outlined text-2xl ${
              activeAlertsCount > 0 ? 'text-purple-600 drop-shadow-[0_0_8px_rgba(147,51,234,0.4)]' : 'text-emerald-600 drop-shadow-[0_0_6px_rgba(16,185,129,0.3)]'
            }`}>
              {activeAlertsCount > 0 ? 'warning' : 'verified_user'}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-2xl font-light text-slate-900 tabular-nums">
                {activeAlertsCount} {activeAlertsCount === 1 ? 'Warning' : 'Alerts'}
              </span>
              <span className={`w-2 h-2 rounded-full ${
                activeAlertsCount > 0 ? 'bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.8)] animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
              }`} />
            </div>
            <span className="font-body-md text-sm text-slate-800 font-medium mt-0.5 truncate max-w-xs">
              {activeAlertsCount > 0 ? latestAlertMessage : 'All Clinical Zones Nominal'}
            </span>
            <span className="font-label-sm text-xs text-slate-500">
              {activeAlertsCount > 0 ? 'Click to inspect trigger benchmarks' : 'Zero unacknowledged bio-hazard events'}
            </span>
          </div>
        </div>
        <button className="w-9 h-9 rounded-xl skeuo-button flex items-center justify-center shrink-0 ml-2 text-slate-600 group-hover:text-teal-700">
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>

      {/* Card 2: Rooms Coverage & Online Stat */}
      <div className="rounded-[22px] glass-panel shimmer-effect p-space-md flex items-center justify-between group relative overflow-hidden gpu-layer">
        <div className="flex items-start gap-space-md">
          <div className="w-12 h-12 rounded-2xl bg-teal-50/90 p-0.5 border border-teal-200/80 shadow-[inset_0_2px_4px_rgba(13,148,136,0.15)] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-teal-600 text-2xl drop-shadow-[0_0_8px_rgba(13,148,136,0.4)]">
              domain_verification
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-2xl font-light text-slate-900 tabular-nums">
                {onlineRooms} / {totalRooms} Online
              </span>
              <span className={`w-2 h-2 rounded-full ${
                onlineRooms === totalRooms
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                  : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
              }`} />
            </div>
            <span className="font-body-md text-sm text-slate-800 font-medium mt-0.5 tabular-nums">
              {Math.round((onlineRooms / (totalRooms || 1)) * 100)}% Telemetry Coverage
            </span>
            <span className="font-label-sm text-xs text-slate-500">
              Laminar Pressure & Cleanroom Stream Sync
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-label-mono text-[10px] text-teal-800 bg-teal-50/90 border border-teal-200/80 px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap shadow-sm">
            {onlineRooms === totalRooms ? 'ALL NODES ACTIVE' : `${totalRooms - onlineRooms} DEGRADED`}
          </span>
        </div>
      </div>

      {/* Card 3: Devices Offline & HVAC Scrubbers */}
      <div className="rounded-[22px] glass-panel shimmer-effect p-space-md flex items-center justify-between group relative overflow-hidden gpu-layer">
        <div className="flex items-start gap-space-md">
          <div className={`w-12 h-12 rounded-2xl p-0.5 border flex items-center justify-center shrink-0 shadow-inner ${
            offlineDevicesCount > 0
              ? 'bg-rose-50/90 border-rose-200/80 shadow-[inset_0_2px_4px_rgba(244,63,94,0.15)]'
              : 'bg-sky-50/90 border-sky-200/80 shadow-[inset_0_2px_4px_rgba(2,132,199,0.15)]'
          }`}>
            <span className={`material-symbols-outlined text-2xl ${
              offlineDevicesCount > 0 ? 'text-rose-600' : 'text-sky-600 drop-shadow-[0_0_8px_rgba(2,132,199,0.4)]'
            }`}>
              {offlineDevicesCount > 0 ? 'wifi_off' : 'cyclone'}
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-2xl font-light text-slate-900 tabular-nums">
                {offlineDevicesCount > 0 ? `${offlineDevicesCount} Device Offline` : '99.4% Efficiency'}
              </span>
              <span className={`w-2 h-2 rounded-full ${
                offlineDevicesCount > 0
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                  : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
              }`} />
            </div>
            <span className="font-body-md text-sm text-slate-800 font-medium mt-0.5">
              {offlineDevicesCount > 0 ? 'Heartbeat timed out (>60s)' : 'Filtration & HVAC Sync'}
            </span>
            <span className="font-label-sm text-xs text-slate-500">
              {offlineDevicesCount > 0 ? 'Check ESP32 sensor power / WiFi' : 'All 6 multistage scrubbers operating'}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-label-mono text-[11px] text-sky-700 font-bold tabular-nums">
            {offlineDevicesCount > 0 ? 'ATTN' : '4,620 CFM'}
          </span>
        </div>
      </div>
    </div>
  );
};
