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
        className="cursor-pointer rounded-[22px] bg-white/75 backdrop-blur-[24px] p-space-md border border-white/90 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06),0_4px_6px_-2px_rgba(15,23,42,0.03),inset_0_1px_0_0_rgba(255,255,255,1)] flex items-center justify-between group hover:bg-white/90 transition-all duration-200"
      >
        <div className="flex items-start gap-space-md min-w-0">
          <div className={`w-12 h-12 rounded-2xl p-0.5 border flex items-center justify-center shrink-0 ${
            activeAlertsCount > 0
              ? 'bg-purple-50 border-purple-100 shadow-[inset_0_1px_2px_rgba(147,51,234,0.1)]'
              : 'bg-emerald-50 border-emerald-100 shadow-[inset_0_1px_2px_rgba(16,185,129,0.1)]'
          }`}>
            <span className={`material-symbols-outlined text-2xl ${
              activeAlertsCount > 0 ? 'text-purple-600 drop-shadow-[0_0_6px_rgba(147,51,234,0.3)]' : 'text-emerald-600'
            }`}>
              {activeAlertsCount > 0 ? 'warning' : 'verified_user'}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-2xl font-light text-slate-900">
                {activeAlertsCount} {activeAlertsCount === 1 ? 'Warning' : 'Alerts'}
              </span>
              <span className={`w-2 h-2 rounded-full ${
                activeAlertsCount > 0 ? 'bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.6)] animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
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
        <button className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 group-hover:text-teal-700 group-hover:bg-teal-50 border border-slate-200/60 shadow-[0_2px_4px_rgba(15,23,42,0.04)] flex items-center justify-center transition-all shrink-0 ml-2">
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>

      {/* Card 2: Rooms Coverage & Online Stat */}
      <div className="rounded-[22px] bg-white/75 backdrop-blur-[24px] p-space-md border border-white/90 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06),0_4px_6px_-2px_rgba(15,23,42,0.03),inset_0_1px_0_0_rgba(255,255,255,1)] flex items-center justify-between group hover:bg-white/90 transition-all duration-200">
        <div className="flex items-start gap-space-md">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 p-0.5 border border-teal-100 shadow-[inset_0_1px_2px_rgba(13,148,136,0.1)] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-teal-600 text-2xl drop-shadow-[0_0_6px_rgba(13,148,136,0.3)]">
              domain_verification
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-2xl font-light text-slate-900">
                {onlineRooms} / {totalRooms} Online
              </span>
              <span className={`w-2 h-2 rounded-full ${
                onlineRooms === totalRooms
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                  : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]'
              }`} />
            </div>
            <span className="font-body-md text-sm text-slate-800 font-medium mt-0.5">
              {Math.round((onlineRooms / (totalRooms || 1)) * 100)}% Telemetry Coverage
            </span>
            <span className="font-label-sm text-xs text-slate-500">
              Laminar Pressure & Cleanroom Stream Sync
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-label-mono text-[10px] text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
            {onlineRooms === totalRooms ? 'ALL NODES ACTIVE' : `${totalRooms - onlineRooms} DEGRADED`}
          </span>
        </div>
      </div>

      {/* Card 3: Devices Offline & HVAC Scrubbers */}
      <div className="rounded-[22px] bg-white/75 backdrop-blur-[24px] p-space-md border border-white/90 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06),0_4px_6px_-2px_rgba(15,23,42,0.03),inset_0_1px_0_0_rgba(255,255,255,1)] flex items-center justify-between group hover:bg-white/90 transition-all duration-200">
        <div className="flex items-start gap-space-md">
          <div className={`w-12 h-12 rounded-2xl p-0.5 border flex items-center justify-center shrink-0 ${
            offlineDevicesCount > 0
              ? 'bg-rose-50 border-rose-100 shadow-[inset_0_1px_2px_rgba(244,63,94,0.1)]'
              : 'bg-sky-50 border-sky-100 shadow-[inset_0_1px_2px_rgba(2,132,199,0.1)]'
          }`}>
            <span className={`material-symbols-outlined text-2xl ${
              offlineDevicesCount > 0 ? 'text-rose-600' : 'text-sky-600 drop-shadow-[0_0_6px_rgba(2,132,199,0.3)]'
            }`}>
              {offlineDevicesCount > 0 ? 'wifi_off' : 'cyclone'}
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-2xl font-light text-slate-900">
                {offlineDevicesCount > 0 ? `${offlineDevicesCount} Device Offline` : '99.4% Efficiency'}
              </span>
              <span className={`w-2 h-2 rounded-full ${
                offlineDevicesCount > 0
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                  : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
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
          <span className="font-label-mono text-[11px] text-sky-700 font-semibold">
            {offlineDevicesCount > 0 ? 'ATTN' : '4,620 CFM'}
          </span>
        </div>
      </div>
    </div>
  );
};
