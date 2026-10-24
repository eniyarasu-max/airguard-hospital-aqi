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
          <span className="material-symbols-outlined text-teal-600 text-2xl">
            meeting_room
          </span>
          <div>
            <h3 className="font-headline-md text-xl md:text-2xl font-light text-slate-900">
              Zonal Hospital Cleanrooms & Surgical Suites
            </h3>
            <p className="font-label-sm text-xs text-slate-500">
              Live decentralized IoT telemetry stream from multi-stage isolation chambers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="font-label-mono text-xs text-slate-400 uppercase">
            Click any suite for sensor diagnostics
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
            teal: 'bg-teal-50 text-teal-800 border-teal-200/70',
            purple: 'bg-purple-50 text-purple-700 border-purple-200/70',
            slate: 'bg-slate-100 text-slate-600 border-slate-200/60'
          }[badge.tone];

          return (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className={`cursor-pointer rounded-[22px] bg-white/80 backdrop-blur-[24px] p-space-md border transition-all duration-200 flex flex-col justify-between hover:bg-white hover:scale-[1.01] ${
                isSelected
                  ? 'border-teal-500 shadow-[0_12px_32px_-4px_rgba(13,148,136,0.18)]'
                  : 'border-white/90 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06),0_4px_6px_-2px_rgba(15,23,42,0.03),inset_0_1px_0_0_rgba(255,255,255,1)]'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Glowing LED Diode */}
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      aqiResult.status === 'Good'
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                        : aqiResult.status === 'Moderate'
                        ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)] animate-pulse'
                        : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)] animate-ping'
                    }`}
                  />
                  <span className="font-body-md text-base font-semibold text-slate-900 truncate">
                    {room.name}
                  </span>
                </div>
                <span className={`font-label-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${badgeClasses}`}>
                  {badge.text}
                </span>
              </div>

              {/* Inset Metric Triplet Well */}
              <div className="grid grid-cols-3 gap-space-sm my-space-md py-space-sm bg-slate-50/80 border border-slate-100 rounded-xl px-space-sm shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] text-center">
                <div className="flex flex-col">
                  <span className="font-label-mono text-[10px] text-slate-400">AQI</span>
                  <span
                    className="font-headline-md text-xl md:text-2xl font-light"
                    style={{ color: aqiResult.color }}
                  >
                    {aqiResult.score}
                  </span>
                </div>
                <div className="flex flex-col border-x border-slate-200/60">
                  <span className="font-label-mono text-[10px] text-slate-400">TEMP</span>
                  <span className="font-headline-md text-xl md:text-2xl font-light text-slate-900">
                    {room.latest.temperature.toFixed(1)}°
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-mono text-[10px] text-slate-400">HUMID</span>
                  <span className="font-headline-md text-xl md:text-2xl font-light text-slate-900">
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
