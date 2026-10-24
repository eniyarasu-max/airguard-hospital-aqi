import React, { useState, useMemo } from 'react';
import { useRooms } from './hooks/useRooms';
import { useAlerts } from './hooks/useAlerts';
import { useControl } from './hooks/useControl';
import { useAQI } from './hooks/useAQI';
import { Navigation, NavigationTab } from './components/Navigation';
import { AqiDial } from './components/AqiDial';
import { SensorTile } from './components/SensorTile';
import { StatChips } from './components/StatChips';
import { TrendChart } from './components/TrendChart';
import { RoomsGrid } from './components/RoomsGrid';
import { BiocontrolPanel } from './components/BiocontrolPanel';
import { IncidentStream } from './components/IncidentStream';
import { RoomDetailModal } from './components/RoomDetailModal';
import { AlertsView } from './components/AlertsView';
import { SettingsView } from './components/SettingsView';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { EceHardwareAnnunciator } from './components/EceHardwareAnnunciator';
import { CustomCursor } from './components/CustomCursor';
import { AirGuardChatbot } from './components/AirGuardChatbot';
import { useThresholds } from './context/ThresholdContext';
import { playNodeConnectionChime } from './utils/audioChimes';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showConnectionToast, setShowConnectionToast] = useState<boolean>(false);

  const { thresholds } = useThresholds();
  const { rooms, loading: roomsLoading, error: roomsError, demoMode, toggleDemoMode } = useRooms();
  const { alerts, acknowledgeAlert } = useAlerts(rooms, demoMode);
  const { controls, updateControl } = useControl(rooms, demoMode);
  const { compositeAQI, color: aqiColor, label: aqiLabel } = useAQI(rooms, undefined, thresholds);

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const query = searchQuery.toLowerCase();
    const result: typeof rooms = {};
    Object.entries(rooms).forEach(([id, room]) => {
      if (
        room.name.toLowerCase().includes(query) ||
        room.zone.toLowerCase().includes(query) ||
        id.toLowerCase().includes(query)
      ) {
        result[id] = room;
      }
    });
    return result;
  }, [rooms, searchQuery]);

  const roomList = Object.values(rooms);
  const totalRooms = roomList.length;
  const onlineRooms = roomList.filter((r) => r.device.online).length;
  const offlineDevices = totalRooms - onlineRooms;
  const unackAlerts = Object.values(alerts).filter((a) => !a.acknowledged);

  const isNodeOnline = onlineRooms > 0;
  const prevOnlineRef = React.useRef<boolean>(false);

  // Play clinical dual-tone chime (880 Hz -> 1760 Hz) when ESP32 transitions to Online
  React.useEffect(() => {
    if (!prevOnlineRef.current && isNodeOnline) {
      playNodeConnectionChime();
      setShowConnectionToast(true);
      const timer = setTimeout(() => setShowConnectionToast(false), 5000);
      return () => clearTimeout(timer);
    }
    prevOnlineRef.current = isNodeOnline;
  }, [isNodeOnline]);

  const focusedRoom = selectedRoomId ? rooms[selectedRoomId] || null : null;
  const primaryRoom = rooms.icu || roomList[0] || null;

  return (
    <div className="bg-[#f8fafc] font-body-md text-slate-800 min-h-screen relative overflow-x-hidden selection:bg-cyan-100 selection:text-cyan-900">
      <CustomCursor />

      {/* Atmospheric Liquid Glow Orbs with Neon Cyan Hue */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-10 w-[680px] h-[680px] bg-cyan-400/25 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -right-20 w-[620px] h-[620px] bg-blue-500/20 rounded-full blur-[170px]" />
        <div className="absolute -bottom-20 left-1/4 w-[640px] h-[640px] bg-cyan-500/18 rounded-full blur-[160px]" />
        <div className="absolute top-2/3 left-10 w-[460px] h-[460px] bg-sky-400/20 rounded-full blur-[140px]" />
        
        <div className="cleanroom-particle absolute top-1/4 left-1/5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f0ff]" style={{ animationDelay: '0s' }} />
        <div className="cleanroom-particle absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_12px_#38bdf8]" style={{ animationDelay: '2.5s' }} />
        <div className="cleanroom-particle absolute bottom-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#00e5ff]" style={{ animationDelay: '4.5s' }} />
        <div className="cleanroom-particle absolute top-3/4 right-1/3 w-2 h-2 rounded-full bg-sky-300 shadow-[0_0_10px_#0284c7]" style={{ animationDelay: '1.2s' }} />
      </div>

      {/* Liquid Node Connection Floating Toast */}
      {showConnectionToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-24 right-4 sm:right-8 z-50 flex items-center gap-3.5 px-4 py-3 rounded-2xl liquid-glass liquid-glass-glow border-cyan-400/70 shadow-[0_20px_50px_rgba(0,229,255,0.25)] animate-startup-1"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/80 flex items-center justify-center text-cyan-500 shadow-[0_0_14px_rgba(0,229,255,0.6)] shrink-0">
            <span className="material-symbols-outlined text-xl animate-pulse">sensors</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-label-mono text-xs font-bold text-slate-900 tracking-wide">
                Kongu Node 01 Connected
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
            </div>
            <span className="font-label-mono text-[10px] text-cyan-700">
              Clinical Telemetry Synced · Dual-Tone Chime (880 Hz → 1760 Hz)
            </span>
          </div>
          <button
            onClick={() => setShowConnectionToast(false)}
            aria-label="Dismiss toast"
            className="ml-2 text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </aside>
      )}

      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unacknowledgedAlertsCount={unackAlerts.length}
        demoMode={demoMode}
        onToggleDemoMode={toggleDemoMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        nodeOnline={isNodeOnline}
        onTestChime={playNodeConnectionChime}
      />

      <div className="lg:pl-28 lg:pr-5 pt-18 lg:pt-24 pb-20 lg:pb-10 px-3 sm:px-6 relative z-10 max-w-[1600px] mx-auto">
        {roomsError && !demoMode && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 backdrop-blur-md border border-amber-200 text-amber-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-label-mono text-xs animate-startup-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600">cloud_off</span>
              <span>{roomsError}</span>
            </div>
            <button
              onClick={() => toggleDemoMode(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              Switch to Demo Mode
            </button>
          </div>
        )}

        {roomsLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <div className="flex flex-col w-full">
                {/* Hero Metrics Console */}
                <section className="grid grid-cols-1 xl:grid-cols-12 gap-gutter items-stretch mb-space-xl">
                  {/* Gauge Pod */}
                  <div className="xl:col-span-7 rounded-[26px] glass-panel shimmer-effect p-space-lg relative overflow-hidden flex flex-col justify-between gpu-layer border-cyan-200/50 shadow-[0_15px_40px_-5px_rgba(2,132,199,0.08),0_0_25px_rgba(0,229,255,0.06),inset_0_1px_0_0_rgba(255,255,255,1)] animate-startup-1">
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-400/12 rounded-full blur-[80px] pointer-events-none" />

                    <div className="flex items-center justify-between relative z-10 flex-wrap gap-2">
                      <div className="flex items-center gap-space-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(0,229,255,0.9)] animate-pulse" />
                        <span className="font-label-mono text-label-mono uppercase tracking-widest text-slate-500 font-semibold text-xs">
                          Kongu Telemetry Station · Node 01
                        </span>
                      </div>
                      <div className="px-space-md py-1 rounded-full bg-cyan-50/90 border border-cyan-200/80 shadow-[0_0_10px_rgba(0,229,255,0.15)] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
                        <span className="font-label-mono text-[10px] text-cyan-800 tracking-wider uppercase font-bold">
                          Kongu Hospital · ENIYAN Project
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg items-center my-space-md relative z-10">
                      <div className="md:col-span-6 flex justify-center items-center py-2">
                        <AqiDial score={compositeAQI} color={aqiColor} size="normal" targetLabel="KONGU CLEANROOM · NODE 01" />
                      </div>

                      <div className="md:col-span-6 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-label-mono text-label-mono text-cyan-800 uppercase tracking-wider font-semibold text-xs">
                            Kongu Atmosphere · Node 01
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-label-mono font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm">
                            LIVE SCAN
                          </span>
                        </div>

                        <div className="my-2 p-4 rounded-2xl glass-inset flex flex-col justify-center relative overflow-hidden border border-cyan-200/50">
                          <div className="flex items-baseline gap-space-sm">
                            <span className="font-label-numeric-lg text-5xl md:text-[68px] leading-none text-slate-900 font-light tracking-tight tabular-nums">
                              {compositeAQI}
                            </span>
                            <span className="font-headline-md text-2xl text-slate-400 font-light">
                              AQI
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div
                              className="h-2.5 w-2.5 rounded-full shadow-sm"
                              style={{ backgroundColor: aqiColor, boxShadow: `0 0 10px ${aqiColor}` }}
                            />
                            <span
                              className="font-label-sm text-xs font-bold uppercase tracking-wider"
                              style={{ color: aqiColor }}
                            >
                              {aqiLabel}
                            </span>
                          </div>
                        </div>

                        <p className="font-body-md text-sm text-slate-600 mt-2 max-w-sm">
                          Operating conditions nominal for Kongu Hospital cleanroom suite. Live ESP32 telemetry streaming from DHT22, MQ-135, and GP2Y1010AU0F optical dust sensor.
                        </p>
                      </div>
                    </div>

                    <div className="pt-space-md mt-space-sm border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-space-md text-slate-500 text-xs">
                      <div className="flex items-center gap-space-md">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base text-cyan-600">air</span>
                          <span className="font-label-mono text-slate-700 font-medium tabular-nums">Velocity: 0.42 m/s</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base text-blue-600">compress</span>
                          <span className="font-label-mono text-slate-700 font-medium tabular-nums">Pressure: -14.2 Pa</span>
                        </div>
                      </div>
                      <span className="font-label-mono text-slate-400">
                        Kongu ECE Mini Project · ENIYAN
                      </span>
                    </div>
                  </div>

                  {/* Summary Pods */}
                  <div className="xl:col-span-5 animate-startup-2">
                    <StatChips
                      activeAlertsCount={unackAlerts.length}
                      latestAlertMessage={unackAlerts[0]?.message}
                      totalRooms={totalRooms}
                      onlineRooms={onlineRooms}
                      offlineDevicesCount={offlineDevices}
                      onOpenAlerts={() => setCurrentTab('alerts')}
                    />
                  </div>
                </section>

                {/* ECE Transducer Telemetry & Annunciator */}
                <div className="animate-startup-3">
                  <EceHardwareAnnunciator room={primaryRoom} />
                </div>

                {/* 6 Sensor Tiles */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-space-md mb-space-xl">
                  <div className="animate-startup-4">
                    <SensorTile
                      label="Ambient Temp"
                      value={primaryRoom ? primaryRoom.latest.temperature.toFixed(1) : 21.4}
                      unit="°C"
                      icon="thermostat"
                      badgeText="Ideal"
                      badgeTone="teal"
                      rangeLabel="Range: 20-22°C"
                      trendLabel="+0.1° / hr"
                      sparklineData={[20.9, 21.1, 21.0, 21.4, 21.3, 21.4]}
                    />
                  </div>

                  <div className="animate-startup-4">
                    <SensorTile
                      label="Relative RH"
                      value={primaryRoom ? primaryRoom.latest.humidity : 46}
                      unit="%"
                      icon="humidity_mid"
                      badgeText="Optimal"
                      badgeTone="sky"
                      color="#0284c7"
                      rangeLabel="Target: 40-50%"
                      trendLabel="Steady"
                      sparklineData={[44, 47, 45, 48, 46, 46.2]}
                    />
                  </div>

                  <div className="animate-startup-5">
                    <SensorTile
                      label="Carbon Dioxide"
                      value={primaryRoom ? primaryRoom.latest.co2 : 418}
                      unit="ppm"
                      icon="air"
                      badgeText="Clean"
                      badgeTone="teal"
                      rangeLabel="Limit: 700 ppm"
                      trendLabel="-12 ppm"
                      sparklineData={[435, 428, 440, 422, 419, 418]}
                    />
                  </div>

                  <div className="animate-startup-5">
                    <SensorTile
                      label="TVOC Vapor"
                      value={primaryRoom ? (primaryRoom.latest.tvoc * 0.001).toFixed(2) : '0.04'}
                      unit="mg/m³"
                      icon="science"
                      badgeText="Pristine"
                      badgeTone="teal"
                      rangeLabel="Ceiling: 0.30"
                      trendLabel="Nominal"
                      sparklineData={[0.05, 0.04, 0.06, 0.04, 0.04, 0.04]}
                    />
                  </div>

                  <div className="animate-startup-6">
                    <SensorTile
                      label="Dust PM2.5"
                      value={primaryRoom ? primaryRoom.latest.dust : 2.8}
                      unit="µg/m³"
                      icon="grain"
                      badgeText="Grade A"
                      badgeTone="teal"
                      rangeLabel="PM10: 5.1 µg/m³"
                      trendLabel="Ultra-Low"
                      sparklineData={[3.4, 3.0, 2.9, 3.2, 2.8, 2.8]}
                    />
                  </div>

                  <div className="animate-startup-6">
                    <SensorTile
                      label="Gas MQ-135"
                      value={primaryRoom ? (primaryRoom.latest.gas * 0.0001).toFixed(2) : '0.01'}
                      unit="ppm"
                      icon="verified_user"
                      badgeText="Safe"
                      badgeTone="teal"
                      rangeLabel="OSHA Safe: <0.10"
                      trendLabel="Undetectable"
                      sparklineData={[0.02, 0.01, 0.01, 0.02, 0.01, 0.01]}
                    />
                  </div>
                </section>

                {/* 24-Hour Environmental Volatility Trace Chart */}
                <div className="animate-startup-7 mb-space-xl">
                  <TrendChart rooms={rooms} selectedRoomId={primaryRoom?.id} />
                </div>

                {/* Two-Column Diagnostic & Mechanical Control Section */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-stretch mb-space-xl animate-startup-8">
                  <div className="lg:col-span-7">
                    <IncidentStream
                      alerts={alerts}
                      onAcknowledge={acknowledgeAlert}
                      onViewAll={() => setCurrentTab('alerts')}
                    />
                  </div>

                  <div className="lg:col-span-5">
                    <BiocontrolPanel
                      roomName={primaryRoom?.name || 'ICU Suite 401'}
                      pressurePa={primaryRoom?.pressurePa}
                      achTarget={primaryRoom?.achTarget}
                    />
                  </div>
                </section>

                {/* Cleanrooms & Surgical Suites Grid */}
                <div className="animate-startup-9">
                  <RoomsGrid
                    rooms={filteredRooms}
                    onSelectRoom={(roomId) => setSelectedRoomId(roomId)}
                    selectedRoomId={selectedRoomId || undefined}
                  />
                </div>
              </div>
            )}

            {currentTab === 'suites' && (
              <div className="w-full flex flex-col gap-6 animate-startup-1">
                <RoomsGrid
                  rooms={filteredRooms}
                  onSelectRoom={(roomId) => setSelectedRoomId(roomId)}
                  selectedRoomId={selectedRoomId || undefined}
                />
              </div>
            )}

            {currentTab === 'alerts' && (
              <div className="animate-startup-1">
                <AlertsView alerts={alerts} onAcknowledge={acknowledgeAlert} />
              </div>
            )}

            {currentTab === 'trends' && (
              <div className="w-full flex flex-col gap-6 animate-startup-1">
                <TrendChart rooms={rooms} />
                <RoomsGrid
                  rooms={filteredRooms}
                  onSelectRoom={(roomId) => setSelectedRoomId(roomId)}
                />
              </div>
            )}

            {currentTab === 'settings' && (
              <div className="animate-startup-1">
                <SettingsView
                  demoMode={demoMode}
                  onToggleDemoMode={toggleDemoMode}
                  room={primaryRoom}
                  compositeAQI={compositeAQI}
                />
              </div>
            )}
          </>
        )}
      </div>

      {selectedRoomId && focusedRoom && (
        <RoomDetailModal
          room={focusedRoom}
          onClose={() => setSelectedRoomId(null)}
        />
      )}

      {/* Floating AirGuard AI Hospital Telemetry Chatbot */}
      <AirGuardChatbot
        room={primaryRoom}
        compositeAQI={compositeAQI}
        aqiLabel={aqiLabel}
        nodeOnline={isNodeOnline}
        unackAlertsCount={unackAlerts.length}
      />
    </div>
  );
};
