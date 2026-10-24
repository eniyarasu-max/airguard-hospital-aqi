import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { RoomData } from '../types';

interface TrendChartProps {
  rooms: Record<string, RoomData>;
  selectedRoomId?: string;
}

type Timeframe = '1H' | '24H' | '7D' | '30D';

export const TrendChart: React.FC<TrendChartProps> = ({ rooms, selectedRoomId }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('24H');

  // Build trend chart data points from room history
  const chartData = useMemo(() => {
    const targetRoom = selectedRoomId ? rooms[selectedRoomId] : (rooms.icu || Object.values(rooms)[0]);
    if (!targetRoom || !targetRoom.history) {
      return [
        { time: '00:00', aqi: 24, co2: 410, dust: 2.1 },
        { time: '04:00', aqi: 28, co2: 415, dust: 2.3 },
        { time: '08:00', aqi: 35, co2: 460, dust: 3.4 },
        { time: '12:00', aqi: 48, co2: 540, dust: 4.8 },
        { time: '16:00', aqi: 42, co2: 500, dust: 3.9 },
        { time: '20:00', aqi: 32, co2: 440, dust: 2.8 },
        { time: 'Now', aqi: 34, co2: 418, dust: 2.8 }
      ];
    }

    const historyItems = Object.values(targetRoom.history).sort((a, b) => a.timestamp - b.timestamp);
    if (historyItems.length === 0) {
      return [];
    }

    // Filter by timeframe
    const now = Date.now();
    const timeframeMs = {
      '1H': 1 * 3600 * 1000,
      '24H': 24 * 3600 * 1000,
      '7D': 7 * 24 * 3600 * 1000,
      '30D': 30 * 24 * 3600 * 1000
    }[timeframe];

    const filtered = historyItems.filter((item) => now - item.timestamp <= timeframeMs);
    const dataSlice = filtered.length >= 4 ? filtered : historyItems;

    return dataSlice.map((item) => {
      const d = new Date(item.timestamp);
      const hoursStr = String(d.getHours()).padStart(2, '0');
      const minsStr = String(d.getMinutes()).padStart(2, '0');
      const timeLabel = timeframe === '1H' ? `${hoursStr}:${minsStr}` : `${hoursStr}:00`;

      // Approximate AQI volatility curve
      const aqiScore = Math.max(15, Math.min(95, Math.round(
        100 - (item.co2 - 400) * 0.08 - item.dust * 2.5
      )));

      return {
        time: timeLabel,
        rawTimestamp: item.timestamp,
        aqi: aqiScore,
        co2: item.co2,
        dust: item.dust,
        temp: item.temperature,
        humidity: item.humidity
      };
    });
  }, [rooms, selectedRoomId, timeframe]);

  return (
    <section className="rounded-[24px] bg-white/75 backdrop-blur-[24px] p-space-lg border border-white/90 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06),0_4px_6px_-2px_rgba(15,23,42,0.03),inset_0_1px_0_0_rgba(255,255,255,1)] mb-space-xl relative overflow-hidden">
      {/* Chart Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-teal-600 text-xl">
              monitoring
            </span>
            <h2 className="font-headline-md text-2xl font-light text-slate-900">
              {timeframe} Environmental Volatility Trace
            </h2>
          </div>
          <span className="font-label-sm text-xs text-slate-500 mt-0.5">
            Real-time cleanroom index progression across surgical & ICU zones
          </span>
        </div>

        {/* Tactile Skeuomorphic Pill Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100/90 border border-slate-200/60 shadow-[inset_0_2px_4px_rgba(15,23,42,0.06)] self-start md:self-auto">
          {(['1H', '24H', '7D', '30D'] as Timeframe[]).map((tf) => {
            const isActive = timeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3.5 py-1.5 rounded-lg font-label-mono text-xs transition-all duration-200 cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-white text-cyan-700 font-semibold shadow-[0_2px_6px_rgba(15,23,42,0.1),inset_0_1px_0_rgba(255,255,255,1)] flex items-center gap-1.5 border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 shadow-[0_0_6px_#00e5ff]" />
                )}
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recharts Canvas Frame with Graticule */}
      <div className="relative w-full h-72 rounded-2xl bg-slate-50/70 p-2 sm:p-space-md border border-slate-200/60 shadow-[inset_0_2px_6px_rgba(15,23,42,0.04)] overflow-hidden">
        {/* Subtle graticule baseline labels */}
        <div className="absolute top-3 right-4 flex flex-col items-end gap-1 pointer-events-none z-10 font-label-mono text-[10px]">
          <span className="text-purple-600 font-semibold">100 AQI · Hospital Advisory Ceiling</span>
          <span className="text-slate-500">50 AQI · Bio-Clean Baseline</span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d9488" stopOpacity={0.28} />
                <stop offset="60%" stopColor="#14b8a6" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Threshold Reference Lines */}
            <ReferenceLine
              y={80}
              stroke="#7c3aed"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <ReferenceLine
              y={50}
              stroke="#cbd5e1"
              strokeDasharray="3 3"
              strokeWidth={1}
            />

            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-3 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/80 font-label-mono text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-teal-600 shadow-sm" />
                        <span className="font-bold text-slate-900">{data.time}</span>
                        <span className="text-teal-700 font-semibold">AQI: {data.aqi}</span>
                      </div>
                      <div className="text-slate-500 space-y-0.5 text-[11px]">
                        <div>CO₂: {data.co2} ppm</div>
                        <div>PM2.5 Dust: {data.dust} µg/m³</div>
                        <div>Temp: {data.temp}°C · RH: {data.humidity}%</div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#0d9488"
              strokeWidth={2.5}
              fill="url(#chartGradient)"
              dot={{ r: 3, fill: '#0d9488', stroke: '#ffffff', strokeWidth: 1.5 }}
              activeDot={{ r: 6, fill: '#0d9488', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
