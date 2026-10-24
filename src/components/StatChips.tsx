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
  latestAlertMessage = "Kongu Cleanroom Suite nominal",
  totalRooms,
  onlineRooms,
  offlineDevicesCount,
  onOpenAlerts
}) => {
  const isSingleNode = totalRooms <= 1;

  return (
    <div className="flex flex-col justify-between gap-space-md h-full">
      {/* Card 1: Active Warning Alerts */}
      <div
        onClick={onOpenAlerts}
        className="cursor-pointer rounded-[22px] glass-panel shimmer-effect p-space-md flex items-center justify-between group relative overflow-hidden gpu-layer border-cyan-200/40 shadow-[0_10px_30px_-5px_rgba(2,132,199,0.06),0_0_15px_rgba(0,229,255,0.04)]"
      >
        <div className="flex items-start gap-space-md min-w-0">
          <div className={`w-12 h-12 rounded-2xl p-0.5 border flex items-center justify-center shrink-0 shadow-inner ${
            activeAlertsCount > 0
              ? 'bg-purple-50/90 border-purple-200/80 shadow-[inset_0_2px_4px_rgba(147,51,234,0.15)]'
              : 'bg-cyan-50/90 border-cyan-200/80 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
          }`}>
            <span className={`material-symbols-outlined text-2xl ${
              activeAlertsCount > 0 ? 'text-purple-600 drop-shadow-[0_0_8px_rgba(147,51,234,0.4)]' : 'text-cyan-600 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]'
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
                activeAlertsCount > 0 ? 'bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.8)] animate-pulse' : 'bg-cyan-500 shadow-[0_0_8px_rgba(0,229,255,0.8)]'
              }`} />
            </div>
            <span className="font-body-md text-sm text-slate-800 font-medium mt-0.5 truncate max-w-xs">
              {activeAlertsCount > 0 ? latestAlertMessage : 'Kongu Cleanroom Nominal'}
            </span>
            <span className="font-label-sm text-xs text-slate-500">
              {activeAlertsCount > 0 ? 'Click to inspect trigger benchmarks' : 'Zero unacknowledged bio-hazard events'}
            </span>
          </div>
        </div>
        <button className="w-9 h-9 rounded-xl skeuo-button flex items-center justify-center shrink-0 ml-2 text-slate-600 group-hover:text-cyan-700">
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>

      {/* Card 2: Rooms Coverage & Online Stat */}
      <div className="rounded-[22px] glass-panel shimmer-effect p-space-md flex items-center justify-between group relative overflow-hidden gpu-layer border-cyan-200/40 shadow-[0_10px_30px_-5px_rgba(2,132,199,0.06),0_0_15px_rgba(0,229,255,0.04)]">
        <div className="flex items-start gap-space-md">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50/90 p-0.5 border border-cyan-200/80 shadow-[0_0_12px_rgba(0,229,255,0.25)] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-cyan-600 text-2xl drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">
              domain_verification
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-2xl font-light text-slate-900 tabular-nums">
                {isSingleNode
                  ? (onlineRooms > 0 ? 'Node 01 Online' : 'Node 01 Offline')
                  : `${onlineRooms} / ${totalRooms} Online`}
              </span>
              <span className={`w-2 h-2 rounded-full ${
                onlineRooms >= totalRooms && onlineRooms > 0
                  ? 'bg-cyan-500 shadow-[0_0_8px_rgba(0,229,255,0.8)]'
                  : 'bg-slate-400'
              }`} />
            </div>
            <span className="font-body-md text-sm text-slate-800 font-medium mt-0.5 tabular-nums">
              {isSingleNode
                ? (onlineRooms > 0 ? '100% Real-Time Node Telemetry' : 'Awaiting ESP32 Connection')
                : `${Math.round((onlineRooms / (totalRooms || 1)) * 100)}% Telemetry Coverage`}
            </span>
            <span className="font-label-sm text-xs text-slate-500">
              Laminar Pressure &amp; Kongu Node Stream Sync
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`font-label-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap ${
            onlineRooms > 0
              ? 'text-cyan-800 bg-cyan-50/90 border border-cyan-200/80 shadow-[0_0_8px_rgba(0,229,255,0.15)]'
              : 'text-slate-600 bg-slate-100/90 border border-slate-200/80'
          }`}>
            {isSingleNode
              ? (onlineRooms > 0 ? 'KONGU NODE 01 ACTIVE' : 'WAITING FOR NODE')
              : (onlineRooms === totalRooms ? 'ALL NODES ACTIVE' : `${totalRooms - onlineRooms} DEGRADED`)}
          </span>
        </div>
      </div>

      {/* Card 3: Devices Offline & HVAC Scrubbers */}
      <div className="rounded-[22px] glass-panel shimmer-effect p-space-md flex items-center justify-between group relative overflow-hidden gpu-layer border-cyan-200/40 shadow-[0_10px_30px_-5px_rgba(2,132,199,0.06),0_0_15px_rgba(0,229,255,0.04)]">
        <div className="flex items-start gap-space-md">
          <div className={`w-12 h-12 rounded-2xl p-0.5 border flex items-center justify-center shrink-0 shadow-inner ${
            offlineDevicesCount > 0 && !isSingleNode
              ? 'bg-rose-50/90 border-rose-200/80 shadow-[inset_0_2px_4px_rgba(244,63,94,0.15)]'
              : 'bg-blue-50/90 border-blue-200/80 shadow-[0_0_12px_rgba(2,132,199,0.2)]'
          }`}>
            <span className={`material-symbols-outlined text-2xl ${
              offlineDevicesCount > 0 && !isSingleNode ? 'text-rose-600' : 'text-blue-600 drop-shadow-[0_0_8px_rgba(2,132,199,0.4)]'
            }`}>
              {offlineDevicesCount > 0 && !isSingleNode ? 'wifi_off' : 'memory'}
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-2xl font-light text-slate-900 tabular-nums">
                {(isSingleNode || offlineDevicesCount === 0) && onlineRooms > 0 ? 'ESP32 Link Active' : offlineDevicesCount === 0 ? 'Awaiting Node' : `${offlineDevicesCount} Device Offline`}
              </span>
              <span className={`w-2 h-2 rounded-full ${
                offlineDevicesCount > 0 && !isSingleNode
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                  : onlineRooms > 0
                  ? 'bg-cyan-500 shadow-[0_0_8px_rgba(0,229,255,0.8)]'
                  : 'bg-slate-400'
              }`} />
            </div>
            <span className="font-body-md text-sm text-slate-800 font-medium mt-0.5">
              {isSingleNode || offlineDevicesCount === 0 ? 'ESP32-DEVKITV1 · 80 MHz Modem Sleep' : 'Heartbeat timed out (>60s)'}
            </span>
            <span className="font-label-sm text-xs text-slate-500">
              DHT22 · MQ-135 · GP2Y1010AU0F
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-label-mono text-[11px] text-blue-700 font-bold tabular-nums">
            115200 BAUD
          </span>
        </div>
      </div>
    </div>
  );
};
