import React from 'react';
import { AlertData } from '../types';

interface IncidentStreamProps {
  alerts: Record<string, AlertData>;
  onAcknowledge: (alertId: string) => void;
  onViewAll?: () => void;
}

export const IncidentStream: React.FC<IncidentStreamProps> = ({
  alerts,
  onAcknowledge,
  onViewAll
}) => {
  const alertList = Object.values(alerts)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 4);

  const formatTimeAgo = (ts: number) => {
    const diffMin = Math.round((Date.now() - ts) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.round(diffMin / 60);
    return `${diffH}h ago`;
  };

  const downloadCSV = () => {
    const rows = [
      ['Alert ID', 'Room ID', 'Type', 'Severity', 'Message', 'Timestamp', 'Acknowledged']
    ];
    Object.values(alerts).forEach((a) => {
      rows.push([
        a.alertId,
        a.roomId,
        a.type,
        a.severity,
        `"${a.message.replace(/"/g, '""')}"`,
        new Date(a.timestamp).toISOString(),
        String(a.acknowledged)
      ]);
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `airguard_hospital_telemetry_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-[24px] bg-white/75 backdrop-blur-[24px] p-space-lg border border-white/90 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06),0_4px_6px_-2px_rgba(15,23,42,0.03),inset_0_1px_0_0_rgba(255,255,255,1)] flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-slate-200/70">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-sky-600 text-2xl">
              receipt_long
            </span>
            <h3 className="font-headline-md text-xl md:text-2xl font-light text-slate-900">
              Recent Hospital Environmental Events
            </h3>
          </div>
          <span className="font-label-mono text-xs text-slate-400">
            Realtime Syslog
          </span>
        </div>

        <div className="space-y-space-md">
          {alertList.map((alert) => (
            <div
              key={alert.alertId}
              className={`p-space-md rounded-2xl bg-white/90 border border-slate-200/70 shadow-[0_2px_8px_rgba(15,23,42,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-space-md transition-all ${
                alert.acknowledged ? 'opacity-70 bg-slate-50/70' : ''
              }`}
            >
              <div className="flex items-start gap-space-sm min-w-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                    alert.acknowledged
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                      : alert.severity === 'critical'
                      ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse'
                      : 'bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.6)] animate-pulse'
                  }`}
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-body-md text-base font-semibold text-slate-900 truncate">
                      {alert.roomName || alert.roomId}
                    </span>
                    <span
                      className={`font-label-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        alert.acknowledged
                          ? 'text-emerald-800 bg-emerald-50 border-emerald-200/70'
                          : 'text-purple-700 bg-purple-50 border-purple-200/70'
                      }`}
                    >
                      {alert.acknowledged ? 'RESOLVED' : alert.type.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                  <p className="font-body-md text-sm text-slate-600 mt-0.5 line-clamp-2">
                    {alert.message}
                  </p>
                  <span className="font-label-mono text-[11px] text-slate-400 mt-1">
                    {formatTimeAgo(alert.timestamp)} · Sensor Node #{alert.roomId.toUpperCase()}-ENV-04
                  </span>
                </div>
              </div>

              {alert.acknowledged ? (
                <div className="shrink-0 px-space-md py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-label-mono text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="material-symbols-outlined text-sm text-emerald-600">
                    check_circle
                  </span>
                  Logged
                </div>
              ) : (
                <button
                  onClick={() => onAcknowledge(alert.alertId)}
                  className="shrink-0 px-space-md py-2 rounded-xl text-slate-800 font-label-mono text-xs font-semibold shadow-[0_2px_6px_rgba(15,23,42,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] hover:bg-slate-50 border border-slate-200 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
                  style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)' }}
                >
                  Acknowledge
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-space-md mt-space-md border-t border-slate-200/70 flex items-center justify-between text-xs font-label-mono">
        <span className="text-slate-400">
          Clinical Incident Audit Log · Total: {Object.keys(alerts).length} events
        </span>
        <button
          onClick={downloadCSV}
          className="text-cyan-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          Download Hospital CSV
        </button>
      </div>
    </div>
  );
};
