import React from 'react';

export type NavigationTab = 'dashboard' | 'suites' | 'alerts' | 'trends' | 'settings';

interface NavigationProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  unacknowledgedAlertsCount: number;
  demoMode: boolean;
  onToggleDemoMode: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  nodeOnline: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  unacknowledgedAlertsCount,
  demoMode,
  onToggleDemoMode,
  searchQuery,
  onSearchChange,
  nodeOnline
}) => {
  return (
    <>
      {/* ----------------- DESKTOP SIDEBAR DOCK ----------------- */}
      <aside className="hidden lg:flex fixed left-6 top-6 bottom-6 w-20 z-50 flex-col items-center py-6 glass-panel rounded-[24px] border border-cyan-200/50 shadow-[0_10px_35px_-5px_rgba(2,132,199,0.12),0_0_20px_rgba(0,229,255,0.06),inset_0_1px_0_0_rgba(255,255,255,1)]">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-1 transition-transform duration-300 hover:scale-110 flex items-center justify-center">
            <span className="material-symbols-outlined text-cyan-600 text-3xl font-light drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">
              air
            </span>
          </div>
          <div className="w-8 h-[1px] bg-cyan-200/60 mt-6" />
        </div>

        {/* Primary Navigation Icons */}
        <nav className="flex-1 flex flex-col items-center gap-space-sm w-full px-3">
          {/* Dashboard */}
          <div className="relative group flex justify-center w-full">
            <button
              onClick={() => onSelectTab('dashboard')}
              aria-current={currentTab === 'dashboard' ? 'page' : undefined}
              className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 ${
                currentTab === 'dashboard'
                  ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-[0_4px_18px_rgba(0,229,255,0.45)]'
                  : 'text-slate-500 hover:bg-cyan-50/60 hover:text-cyan-700'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">dashboard</span>
            </button>
            <div className="absolute left-16 top-1/2 -translate-y-1/2 px-space-sm py-1 bg-slate-900/90 backdrop-blur-md text-white font-label-sm text-xs rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap">
              Dashboard
            </div>
          </div>

          {/* Suites & Isolation */}
          <div className="relative group flex justify-center w-full">
            <button
              onClick={() => onSelectTab('suites')}
              className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 ${
                currentTab === 'suites'
                  ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-[0_4px_18px_rgba(0,229,255,0.45)]'
                  : 'text-slate-500 hover:bg-cyan-50/60 hover:text-cyan-700'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">meeting_room</span>
            </button>
            <div className="absolute left-16 top-1/2 -translate-y-1/2 px-space-sm py-1 bg-slate-900/90 backdrop-blur-md text-white font-label-sm text-xs rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap">
              Cleanroom Node 01
            </div>
          </div>

          {/* Active Alerts */}
          <div className="relative group flex justify-center w-full">
            <button
              onClick={() => onSelectTab('alerts')}
              className={`w-12 h-12 flex items-center justify-center rounded-xl relative transition-all duration-200 ${
                currentTab === 'alerts'
                  ? 'bg-teal-600 text-white shadow-[0_4px_16px_rgba(13,148,136,0.35)]'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">crisis_alert</span>
              {unacknowledgedAlertsCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-purple-600 shadow-[0_0_6px_rgba(147,51,234,0.6)]" />
              )}
            </button>
            <div className="absolute left-16 top-1/2 -translate-y-1/2 px-space-sm py-1 bg-slate-900/90 backdrop-blur-md text-white font-label-sm text-xs rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap">
              Active Alerts ({unacknowledgedAlertsCount})
            </div>
          </div>

          {/* Telemetry Trends */}
          <div className="relative group flex justify-center w-full">
            <button
              onClick={() => onSelectTab('trends')}
              className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 ${
                currentTab === 'trends'
                  ? 'bg-teal-600 text-white shadow-[0_4px_16px_rgba(13,148,136,0.35)]'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">monitoring</span>
            </button>
            <div className="absolute left-16 top-1/2 -translate-y-1/2 px-space-sm py-1 bg-slate-900/90 backdrop-blur-md text-white font-label-sm text-xs rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap">
              Telemetry Trends
            </div>
          </div>
        </nav>

        {/* System Settings Dock Button */}
        <div className="relative group flex justify-center w-full px-3 pt-4">
          <div className="w-8 h-[1px] bg-slate-200/80 absolute top-0 left-1/2 -translate-x-1/2" />
          <button
            onClick={() => onSelectTab('settings')}
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 ${
              currentTab === 'settings'
                ? 'bg-teal-600 text-white shadow-[0_4px_16px_rgba(13,148,136,0.35)]'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">tune</span>
          </button>
          <div className="absolute left-16 top-1/2 -translate-y-1/2 px-space-sm py-1 bg-slate-900/90 backdrop-blur-md text-white font-label-sm text-xs rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap">
            System Parameters & Demo Mode
          </div>
        </div>
      </aside>

      {/* ----------------- DESKTOP HEADER BAR ----------------- */}
      <header className="hidden lg:flex fixed top-6 left-32 right-6 h-20 z-40 items-center justify-between px-space-lg glass-panel rounded-[24px] border border-cyan-200/50 shadow-[0_10px_35px_-5px_rgba(2,132,199,0.1),0_0_20px_rgba(0,229,255,0.08),inset_0_1px_0_0_rgba(255,255,255,1)]">
        <div className="flex items-center gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-xl font-semibold text-slate-900 tracking-tight">
                Kongu Hospital & Research Institute
              </span>
              <span className="font-label-mono text-[11px] uppercase px-2.5 py-0.5 rounded-full bg-cyan-50/90 text-cyan-800 border border-cyan-200/80 font-bold shadow-sm">
                Node 01 Ops
              </span>
              {demoMode && (
                <span className="font-label-mono text-[10px] uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Demo Mode
                </span>
              )}
            </div>
            <span className="font-label-sm text-xs text-slate-500">
              Clinical AirOps · ESP32 Hardware Transducer Telemetry (Kongu Node 01)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-lg">
          {/* Search Box */}
          <div className="relative flex items-center w-72 h-10 px-space-md rounded-full bg-slate-100/80 border border-slate-200/70 shadow-[inset_0_1px_3px_0_rgba(15,23,42,0.08)]">
            <span className="material-symbols-outlined text-slate-400 text-lg mr-2">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent text-slate-800 placeholder:text-slate-400 font-body-md text-xs w-full focus:outline-none"
              placeholder="Search Kongu Node 01 telemetry, particulate stats..."
              type="text"
            />
          </div>

          {/* Operational Status Pill — reflects real ESP32 link state */}
          {demoMode ? (
            <div className="flex items-center gap-space-sm px-space-md py-1.5 rounded-full bg-amber-50/90 border border-amber-200/70 shadow-[0_0_12px_rgba(251,191,36,0.18)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              </span>
              <span className="font-label-mono text-[11px] text-amber-800 tracking-wider uppercase font-bold">
                Demo Mode · Simulated
              </span>
            </div>
          ) : nodeOnline ? (
            <div className="flex items-center gap-space-sm px-space-md py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/70 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </span>
              <span className="font-label-mono text-[11px] text-emerald-800 tracking-wider uppercase font-bold">
                Online · Kongu Node Active
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-space-sm px-space-md py-1.5 rounded-full bg-slate-100/90 border border-slate-300/70 shadow-[0_0_12px_rgba(148,163,184,0.12)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400" />
              </span>
              <span className="font-label-mono text-[11px] text-slate-600 tracking-wider uppercase font-bold">
                Waiting for Node
              </span>
            </div>
          )}

          {/* Notifications Button */}
          <button
            onClick={() => onSelectTab('alerts')}
            className="relative p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-cyan-50/50 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
            {unacknowledgedAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-purple-600 text-white font-label-mono text-[9px] flex items-center justify-center font-bold shadow-[0_0_8px_rgba(147,51,234,0.5)]">
                {unacknowledgedAlertsCount}
              </span>
            )}
          </button>

          {/* User Profile - ENIYAN */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200/80">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 ring-2 ring-cyan-400/50 shadow-[0_0_12px_rgba(0,229,255,0.4)] flex items-center justify-center text-white font-black text-xs">
              EN
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-xs font-bold text-slate-900 leading-tight">
                ENIYAN
              </span>
              <span className="font-label-mono text-[10px] text-cyan-700 tracking-wider uppercase font-semibold">
                Lead ECE Project Engineer
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ----------------- MOBILE TOP HEADER ----------------- */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 pt-safe bg-white/90 backdrop-blur-xl border-b border-cyan-100 shadow-[0_1px_15px_rgba(0,229,255,0.06)]">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
              <span className="material-symbols-outlined text-xl">air</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-mono text-[10px] uppercase tracking-wider text-cyan-700 font-bold">
                Kongu Hospital
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-headline-md text-base font-bold text-slate-900 leading-tight">
                  AirGuard · ENIYAN
                </span>
                {demoMode && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold uppercase font-label-mono">
                    Demo
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTab('alerts')}
              className="w-9 h-9 relative flex items-center justify-center rounded-xl bg-white/90 border border-slate-200/70 shadow-sm text-slate-700 hover:text-teal-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unacknowledgedAlertsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-600 shadow-[0_0_6px_#9333ea] animate-pulse" />
              )}
            </button>
            <button
              onClick={() => onSelectTab('settings')}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/90 border border-slate-200/70 shadow-sm text-slate-700 hover:text-teal-700"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
          </div>
        </div>
      </header>

      {/* ----------------- MOBILE GLASS BOTTOM NAVIGATION ----------------- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe px-4 pb-3 pointer-events-none">
        <div className="pointer-events-auto h-16 rounded-full bg-white/90 backdrop-blur-2xl border border-white/90 shadow-[0_12px_32px_-4px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.04)] flex items-center justify-around px-2">
          {/* Board */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all active:scale-90 ${
              currentTab === 'dashboard'
                ? "text-teal-700 relative after:content-[''] after:absolute after:bottom-1 after:w-1 after:h-1 after:rounded-full after:bg-teal-600 after:shadow-[0_0_6px_#0d9488]"
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">dashboard</span>
            <span className="font-label-mono text-[9px] tracking-tight font-bold">Board</span>
          </button>

          {/* Rooms */}
          <button
            onClick={() => onSelectTab('suites')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all active:scale-90 ${
              currentTab === 'suites'
                ? "text-teal-700 relative after:content-[''] after:absolute after:bottom-1 after:w-1 after:h-1 after:rounded-full after:bg-teal-600 after:shadow-[0_0_6px_#0d9488]"
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">meeting_room</span>
            <span className="font-label-mono text-[9px] tracking-tight font-medium">Rooms</span>
          </button>

          {/* Alerts */}
          <button
            onClick={() => onSelectTab('alerts')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all active:scale-90 relative ${
              currentTab === 'alerts'
                ? "text-teal-700 relative after:content-[''] after:absolute after:bottom-1 after:w-1 after:h-1 after:rounded-full after:bg-teal-600 after:shadow-[0_0_6px_#0d9488]"
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">crisis_alert</span>
            <span className="font-label-mono text-[9px] tracking-tight font-medium">Alerts</span>
            {unacknowledgedAlertsCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-purple-600 shadow-sm" />
            )}
          </button>

          {/* Trends */}
          <button
            onClick={() => onSelectTab('trends')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all active:scale-90 ${
              currentTab === 'trends'
                ? "text-teal-700 relative after:content-[''] after:absolute after:bottom-1 after:w-1 after:h-1 after:rounded-full after:bg-teal-600 after:shadow-[0_0_6px_#0d9488]"
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">monitoring</span>
            <span className="font-label-mono text-[9px] tracking-tight font-medium">Trends</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => onSelectTab('settings')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all active:scale-90 ${
              currentTab === 'settings'
                ? "text-teal-700 relative after:content-[''] after:absolute after:bottom-1 after:w-1 after:h-1 after:rounded-full after:bg-teal-600 after:shadow-[0_0_6px_#0d9488]"
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">tune</span>
            <span className="font-label-mono text-[9px] tracking-tight font-medium">Config</span>
          </button>
        </div>
      </nav>
    </>
  );
};
