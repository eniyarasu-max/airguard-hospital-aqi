import React, { useState } from 'react';
import { AlertData } from '../types';

interface AlertsViewProps {
  alerts: Record<string, AlertData>;
  onAcknowledge: (alertId: string) => void;
  onClose?: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onAcknowledge,
  onClose
}) => {
  const [severityFilter, setSeverityFilter] = useState<'all' | 'warning' | 'critical' | 'info'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unacknowledged' | 'acknowledged'>('all');
  const [search, setSearch] = useState('');

  const alertList = Object.values(alerts)
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter((a) => {
      if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
      if (statusFilter === 'unacknowledged' && a.acknowledged) return false;
      if (statusFilter === 'acknowledged' && !a.acknowledged) return false;
      if (search) {
        const query = search.toLowerCase();
        return (
          a.message.toLowerCase().includes(query) ||
          (a.roomName && a.roomName.toLowerCase().includes(query)) ||
          a.type.toLowerCase().includes(query)
        );
      }
      return true;
    });

  const unackCount = Object.values(alerts).filter((a) => !a.acknowledged).length;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Header */}
      <div className="rounded-[24px] bg-white/75 backdrop-blur-[24px] p-space-lg border border-white/90 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06),0_4px_6px_-2px_rgba(15,23,42,0.03),inset_0_1px_0_0_rgba(255,255,255,1)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-space-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <span className="material-symbols-outlined text-2xl">crisis_alert</span>
          </div>
          <div>
            <h2 className="font-headline-md text-2xl font-light text-slate-900">
              Hospital Environmental Alert Console
            </h2>
            <p className="font-label-sm text-xs text-slate-500">
              Infection control & bio-contaminant threshold deviations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-label-mono text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-bold">
            {unackCount} Unacknowledged Active
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-[20px] bg-white/75 backdrop-blur-xl p-4 border border-white/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Severity Tabs */}
        <div className="flex items-center gap-2">
          <span className="font-label-mono text-xs text-slate-400 mr-1">Severity:</span>
          {(['all', 'warning', 'critical'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg font-label-mono text-xs capitalize transition-all ${
                severityFilter === sev
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2">
          <span className="font-label-mono text-xs text-slate-400 mr-1">Status:</span>
          {(['all', 'unacknowledged', 'acknowledged'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-label-mono text-xs capitalize transition-all ${
                statusFilter === st
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex items-center w-full md:w-64 h-9 px-3 rounded-full bg-slate-100 border border-slate-200">
          <span className="material-symbols-outlined text-slate-400 text-base mr-2">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts..."
            className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alertList.length === 0 ? (
          <div className="p-12 text-center rounded-[24px] bg-white/75 backdrop-blur-xl border border-white/90 shadow-sm text-slate-400 font-label-mono text-sm">
            <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2 block">
              check_circle
            </span>
            No matching environmental alerts found. Conditions are optimal across all wards.
          </div>
        ) : (
          alertList.map((alert) => (
            <div
              key={alert.alertId}
              className={`p-4 md:p-5 rounded-[22px] bg-white/85 backdrop-blur-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alert.acknowledged
                  ? 'border-slate-200/60 opacity-70'
                  : alert.severity === 'critical'
                  ? 'border-rose-300 bg-rose-50/30 shadow-[0_8px_20px_rgba(225,29,72,0.08)]'
                  : 'border-purple-200/80 shadow-[0_4px_16px_rgba(147,51,234,0.06)]'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    alert.acknowledged
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : alert.severity === 'critical'
                      ? 'bg-rose-100 border-rose-200 text-rose-600 shadow-sm'
                      : 'bg-purple-100 border-purple-200 text-purple-600 shadow-sm'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {alert.acknowledged ? 'check' : alert.severity === 'critical' ? 'e911_emergency' : 'warning'}
                  </span>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-headline-md text-base font-bold text-slate-900">
                      {alert.roomName || alert.roomId}
                    </span>
                    <span
                      className={`font-label-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        alert.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-purple-100 text-purple-800 border-purple-300'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="font-label-mono text-[10px] text-slate-500 uppercase">
                      · {alert.type.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="font-body-md text-sm text-slate-700 mt-1">
                    {alert.message}
                  </p>

                  <div className="flex items-center gap-3 mt-1.5 font-label-mono text-[11px] text-slate-400">
                    <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    <span>·</span>
                    <span>{new Date(alert.timestamp).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>ID: #{alert.alertId.substring(0, 10)}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 self-end md:self-center">
                {alert.acknowledged ? (
                  <span className="font-label-mono text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    Acknowledged
                  </span>
                ) : (
                  <button
                    onClick={() => onAcknowledge(alert.alertId)}
                    className="px-4 py-2 rounded-xl text-slate-800 font-label-mono text-xs font-bold shadow-[0_2px_6px_rgba(15,23,42,0.1),inset_0_1px_0_rgba(255,255,255,1)] hover:bg-slate-50 border border-slate-300 active:translate-y-0.5 transition-all"
                    style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)' }}
                  >
                    Acknowledge Alert
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
