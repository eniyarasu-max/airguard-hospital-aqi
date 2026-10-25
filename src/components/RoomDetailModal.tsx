import React from 'react';
import { RoomData, RoomControl } from '../types';
import { computeAQI, ZONE_THRESHOLDS } from '../utils/aqi';
import { AqiDial } from './AqiDial';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface RoomDetailModalProps {
  room: RoomData | null;
  onClose: () => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  onClose
}) => {
  if (!room) return null;

  const aqiResult = computeAQI(room.latest, room.zone);
  const limits = ZONE_THRESHOLDS[room.zone] || ZONE_THRESHOLDS.general;

  // Format historical chart data
  const chartData = Object.values(room.history || {})
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((item) => {
      const d = new Date(item.timestamp);
      return {
        time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
        co2: item.co2,
        dust: item.dust,
        temp: item.temperature,
        humidity: item.humidity,
        tvoc: item.tvoc
      };
    });

  // Calculate WiFi signal bars
  const rssi = room.device.wifiRssi;
  const getSignalStrength = (val: number) => {
    if (val >= -60) return { label: 'Excellent (-' + Math.abs(val) + ' dBm)', bars: 4 };
    if (val >= -70) return { label: 'Good (-' + Math.abs(val) + ' dBm)', bars: 3 };
    if (val >= -80) return { label: 'Fair (-' + Math.abs(val) + ' dBm)', bars: 2 };
    return { label: 'Weak (-' + Math.abs(val) + ' dBm)', bars: 1 };
  };
  const signal = getSignalStrength(rssi);

  // Format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hrs = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hrs}h ${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  const timeAgoSec = Math.round((Date.now() - room.device.lastSeen) / 1000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-8 rounded-[28px] bg-white/95 backdrop-blur-2xl border border-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.15)] p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700">
              <span className="material-symbols-outlined text-2xl">meeting_room</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-md text-2xl font-bold text-slate-900 tracking-tight">
                  {room.name}
                </h2>
                <span className="font-label-mono text-xs uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/70 font-semibold">
                  Zone: {room.zone.toUpperCase()}
                </span>
                {room.indicators && (
                  <span className={`font-label-mono text-xs uppercase px-2 py-0.5 rounded-full border font-bold flex items-center gap-1.5 ${
                    room.indicators.state === 'safe'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : room.indicators.state === 'caution'
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      room.indicators.state === 'safe' ? 'bg-emerald-500' : room.indicators.state === 'caution' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    ANNUNCIATOR: {room.indicators.state.toUpperCase()} {room.indicators.buzzer ? '• 🔊 BUZZER ON' : ''}
                  </span>
                )}
                <span className={`w-2.5 h-2.5 rounded-full ${
                  room.device.online
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                    : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)] animate-ping'
                }`} />
              </div>
              <p className="font-label-sm text-xs text-slate-500 mt-0.5">
                Hospital Biocontrol & Decentralized Sensor Node #{room.id.toUpperCase()}-IOT-09
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Hero Section: Main Dial + Gauge Telemetry Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Dial Gauge */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50/60 rounded-2xl border border-slate-200/60">
            <AqiDial score={aqiResult.score} color={aqiResult.color} size="normal" />
            <div className="flex flex-col items-center mt-3 text-center">
              <span className="font-label-mono text-xs text-teal-700 font-bold uppercase tracking-wider">
                Composite Cleanroom Index
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-label-numeric-lg text-4xl font-extralight text-slate-900">
                  {aqiResult.score}
                </span>
                <span className="font-headline-md text-lg text-slate-400 font-light">AQI</span>
              </div>
              <span
                className="font-label-sm text-xs font-semibold uppercase tracking-wider mt-1 px-3 py-0.5 rounded-full"
                style={{ backgroundColor: `${aqiResult.color}15`, color: aqiResult.color }}
              >
                {aqiResult.label}
              </span>
            </div>
          </div>

          {/* Individual Sensor Sub-metrics Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* CO2 */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="material-symbols-outlined text-lg text-teal-600">air</span>
                <span className="font-label-mono text-[10px] text-teal-700 font-bold">CO₂</span>
              </div>
              <div className="my-2">
                <span className="font-label-numeric-lg text-2xl font-bold text-slate-900">
                  {room.latest.co2}
                </span>
                <span className="text-xs text-slate-400 ml-1">ppm</span>
              </div>
              <div className="text-[10px] font-label-mono text-slate-400 border-t border-slate-100 pt-1">
                Max Limit: {limits.co2Max} ppm
              </div>
            </div>

            {/* PM2.5 Dust */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="material-symbols-outlined text-lg text-sky-600">grain</span>
                <span className="font-label-mono text-[10px] text-sky-700 font-bold">PM2.5</span>
              </div>
              <div className="my-2">
                <span className="font-label-numeric-lg text-2xl font-bold text-slate-900">
                  {room.latest.dust}
                </span>
                <span className="text-xs text-slate-400 ml-1">µg/m³</span>
              </div>
              <div className="text-[10px] font-label-mono text-slate-400 border-t border-slate-100 pt-1">
                Ceiling: {limits.dustMax} µg/m³
              </div>
            </div>

            {/* TVOC */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="material-symbols-outlined text-lg text-teal-600">science</span>
                <span className="font-label-mono text-[10px] text-teal-700 font-bold">TVOC</span>
              </div>
              <div className="my-2">
                <span className="font-label-numeric-lg text-2xl font-bold text-slate-900">
                  {room.latest.tvoc}
                </span>
                <span className="text-xs text-slate-400 ml-1">ppb</span>
              </div>
              <div className="text-[10px] font-label-mono text-slate-400 border-t border-slate-100 pt-1">
                Ceiling: {limits.tvocMax} ppb
              </div>
            </div>

            {/* Temperature */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="material-symbols-outlined text-lg text-teal-600">thermostat</span>
                <span className="font-label-mono text-[10px] text-teal-700 font-bold">TEMP</span>
              </div>
              <div className="my-2">
                <span className="font-label-numeric-lg text-2xl font-bold text-slate-900">
                  {(room.latest?.temperature ?? 21.4).toFixed(1)}
                </span>
                <span className="text-xs text-slate-400 ml-1">°C</span>
              </div>
              <div className="text-[10px] font-label-mono text-slate-400 border-t border-slate-100 pt-1">
                Spec: {limits.tempMin} - {limits.tempMax}°C
              </div>
            </div>

            {/* Humidity */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="material-symbols-outlined text-lg text-sky-600">water_drop</span>
                <span className="font-label-mono text-[10px] text-sky-700 font-bold">HUMID</span>
              </div>
              <div className="my-2">
                <span className="font-label-numeric-lg text-2xl font-bold text-slate-900">
                  {room.latest.humidity}
                </span>
                <span className="text-xs text-slate-400 ml-1">%</span>
              </div>
              <div className="text-[10px] font-label-mono text-slate-400 border-t border-slate-100 pt-1">
                Spec: {limits.humidityMin} - {limits.humidityMax}%
              </div>
            </div>

            {/* MQ-135 Air Purity Rating */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="material-symbols-outlined text-lg text-purple-600">sensors</span>
                <span className="font-label-mono text-[10px] text-purple-700 font-bold">VOC / MQ-135</span>
              </div>
              <div className="my-2">
                {(() => {
                  // Map raw 12-bit ADC (0-4095) to Air Purity % (100% = cleanest)
                  const adcVal = room.latest.gas ?? 0;
                  const purity = Math.max(0, Math.min(100, Math.round(100 - (adcVal / 4095) * 100)));
                  const label = purity >= 90 ? 'Pristine' : purity >= 75 ? 'Good' : purity >= 55 ? 'Fair' : 'Poor';
                  const color = purity >= 90 ? 'text-emerald-600' : purity >= 75 ? 'text-teal-600' : purity >= 55 ? 'text-amber-600' : 'text-rose-600';
                  return (
                    <>
                      <span className={`font-label-numeric-lg text-2xl font-bold ${color}`}>
                        {purity}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">% · {label}</span>
                    </>
                  );
                })()}
              </div>
              <div className="text-[10px] font-label-mono text-slate-400 border-t border-slate-100 pt-1">
                Air Purity Index (100 = Pristine)
              </div>
            </div>
          </div>
        </div>

        {/* Room Historical Progression Chart */}
        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <span className="font-headline-md text-base font-semibold text-slate-800">
              Live Sensor Progression Trend
            </span>
            <span className="font-label-mono text-xs text-slate-400">
              CO₂ (ppm) vs Dust (µg/m³)
            </span>
          </div>
          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="detailCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono'
                  }}
                />
                <Area type="monotone" dataKey="co2" stroke="#0d9488" strokeWidth={2} fill="url(#detailCo2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Dual Grid: Device Health Card & Cleanroom Safety Assessment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Device Health Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-teal-600">memory</span>
                <span className="font-headline-md text-base font-semibold text-slate-900">
                  ESP32 Microcontroller Node
                </span>
              </div>
              <span className={`font-label-mono text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                room.device.online
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {room.device.online ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 my-3 text-xs">
              <div>
                <span className="text-slate-400 font-label-mono text-[10px] block">WiFi RSSI Signal</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="material-symbols-outlined text-base text-teal-600">wifi</span>
                  <span className="font-bold text-slate-800 font-label-mono">{signal.label}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-label-mono text-[10px] block">Heartbeat / Last Seen</span>
                <span className="font-bold text-slate-800 font-label-mono mt-0.5 block">
                  {room.device.online ? `${timeAgoSec}s ago` : `Offline (${timeAgoSec}s ago)`}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-label-mono text-[10px] block">System Uptime</span>
                <span className="font-bold text-slate-800 font-label-mono mt-0.5 block">
                  {formatUptime(room.device.uptime)}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-label-mono text-[10px] block">Sensor Calibration</span>
                <span className="font-bold text-emerald-700 font-label-mono mt-0.5 block uppercase">
                  {room.device.sensorStatus}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] font-label-mono text-slate-400">
              {room.device.online
                ? 'Continuous telemetry stream nominal (1 reading / 1.5s)'
                : 'Heartbeat timeout: Device marked offline (>60s inactivity)'}
            </div>
          </div>

          {/* Cleanroom Biocontrol & Safety Assessment */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-teal-600">verified_user</span>
                <span className="font-headline-md text-base font-semibold text-slate-900">
                  Cleanroom Biocontrol Status
                </span>
              </div>
              <span className="font-label-mono text-xs px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 font-bold uppercase">
                {aqiResult.status === 'Good' ? 'Compliant' : 'Advisory'}
              </span>
            </div>

            <div className="space-y-2.5 my-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Pressure Airlock Containment:</span>
                <span className="font-label-mono font-bold text-slate-800">
                  {room.pressurePa !== undefined
                    ? room.pressurePa > 0
                      ? `+${room.pressurePa} Pa (Positive)`
                      : `${room.pressurePa} Pa (Negative Isolation)`
                    : 'Balanced'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Air Exchange Rate (ACH):</span>
                <span className="font-label-mono font-bold text-slate-800">
                  {room.achTarget ?? 14} Air Changes / Hr
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Bio-Aerosol Risk Level:</span>
                <span className="font-label-mono font-bold text-emerald-700">
                  {aqiResult.score >= 80 ? 'Minimal (Ultra-Low)' : aqiResult.score >= 50 ? 'Moderate (Watch)' : 'High Advisory'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-label-mono text-slate-500">
              <span>Standard: ASHRAE 170 / ISO 14644-1</span>
              <span className="text-teal-700 font-semibold">Continuous AQI Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

