import React from 'react';
import { RoomData, AQIResult } from '../types';
import { computeAQI } from '../utils/aqi';

interface RoomsGridProps {
  rooms: Record<string, RoomData>;
  onSelectRoom: (roomId: string) => void;
  selectedRoomId?: string;
}

export const RoomsGrid: React.FC<RoomsGridProps> = ({
  rooms,
  onSelectRoom,
  selectedRoomId
}) => {
  const roomList = Object.values(rooms);

  const getStatusBadge = (room: RoomData, aqiResult: AQIResult) => {
    if (room.zone === 'ot') {
      return { text: 'Laminar Flow ON', tone: 'teal' };
    }
    if (room.zone === 'icu') {
      return { text: 'Active Isolation', tone: 'teal' };
    }
    if (room.id === 'pharmacy') {
      return { text: 'Positive Pressure', tone: 'teal' };
    }
    if (room.id === 'lab') {
      return { text: 'Negative Pressure', tone: 'teal' };
    }
    if (room.id === 'waiting') {
      return aqiResult.score < 70
        ? { text: 'Boost Active', tone: 'purple' }
        : { text: 'Normal Occupancy', tone: 'slate' };
    }
    return { text: 'Normal Occupancy', tone: 'slate' };
  };

  return (
    <section className="flex flex-col mb-space-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-space-md gap-2">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-cyan-600 text-2xl drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">
            meeting_room
          </span>
          <div>
            <h3 className="font-headline-md text-xl md:text-2xl font-light text-slate-900">
              Kongu Hospital Cleanroom Telemetry · Node 01
            </h3>
            <p className="font-label-sm text-xs text-slate-500">
              Direct high-frequency IoT aerometrics stream from Kongu cleanroom suite (ENIYAN)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="font-label-mono text-xs text-slate-400 uppercase">
            Click suite for deep transducer diagnostics
          </span>
        </div>
      </div>

      {/* Grid of Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {roomList.map((room) => {
          const aqiResult = computeAQI(room.latest, room.zone);
          const badge = getStatusBadge(room, aqiResult);
          const isSelected = selectedRoomId === room.id;

          const badgeClasses = {
            teal: 'bg-cyan-50/90 text-cyan-800 border-cyan-200/80 shadow-[0_0_8px_rgba(0,229,255,0.15)]',
            purple: 'bg-purple-50 text-purple-700 border-purple-200/70',
            slate: 'bg-slate-100 text-slate-600 border-slate-200/60'
          }[badge.tone];

          return (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className={`cursor-pointer rounded-[22px] glass-panel shimmer-effect p-space-md border transition-all duration-300 flex flex-col justify-between hover:scale-[1.01] active:scale-[0.98] gpu-layer ${
                isSelected
                  ? 'border-cyan-500 shadow-[0_16px_36px_-6px_rgba(0,229,255,0.25)] ring-1 ring-cyan-500/50'
                  : 'border-cyan-200/40'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Glowing LED Diode */}
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      aqiResult.status === 'Good'
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                        : aqiResult.status === 'Moderate'
                        ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse'
                        : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-ping'
                    }`}
                  />
                  <span className="font-body-md text-base font-semibold text-slate-900 truncate">
                    {room.name}
                  </span>
                </div>
                <span className={`font-label-mono text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${badgeClasses}`}>
                  {badge.text}
                </span>
              </div>

              {/* Inset Metric Triplet Well */}
              <div className="grid grid-cols-3 gap-space-sm my-space-md py-space-sm glass-inset rounded-xl px-space-sm text-center">
                <div className="flex flex-col">
                  <span className="font-label-mono text-[10px] text-slate-400 font-bold">AQI</span>
                  <span
                    className="font-headline-md text-xl md:text-2xl font-light tabular-nums"
                    style={{ color: aqiResult.color }}
                  >
                    {aqiResult.score}
                  </span>
                </div>
                <div className="flex flex-col border-x border-slate-200/80">
                  <span className="font-label-mono text-[10px] text-slate-400 font-bold">TEMP</span>
                  <span className="font-headline-md text-xl md:text-2xl font-light text-slate-900 tabular-nums">
                    {(room.latest?.temperature ?? 21.4).toFixed(1)}°
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-mono text-[10px] text-slate-400 font-bold">HUMID</span>
                  <span className="font-headline-md text-xl md:text-2xl font-light text-slate-900 tabular-nums">
                    {room.latest.humidity}%
                  </span>
                </div>
              </div>

              {/* Lower Info Bar */}
              <div className="flex items-center justify-between font-label-mono text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1 font-semibold truncate text-slate-700">
                  {room.pressurePa !== undefined && (
                    <span className={room.pressurePa < 0 ? 'text-teal-700' : 'text-sky-700'}>
                      {room.pressurePa > 0 ? `+${room.pressurePa} Pa` : `${room.pressurePa} Pa`}
                    </span>
                  )}
                  {room.achTarget && (
                    <span className="text-slate-400 font-normal"> · {room.achTarget} ACH</span>
                  )}
                </span>
                <span className="text-slate-400">
                  {room.device.online ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
