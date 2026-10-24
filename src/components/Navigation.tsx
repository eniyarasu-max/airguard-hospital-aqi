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
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  unacknowledgedAlertsCount,
  demoMode,
  onToggleDemoMode,
  searchQuery,
  onSearchChange
}) => {
  return (
    <>
      {/* ----------------- DESKTOP SIDEBAR DOCK ----------------- */}
      <aside className="hidden lg:flex fixed left-6 top-6 bottom-6 w-20 z-50 flex-col items-center py-6 bg-white/75 backdrop-blur-[24px] rounded-[24px] border border-white/90 shadow-[0_10px_35px_-5px_rgba(15,23,42,0.08),0_4px_6px_-2px_rgba(15,23,42,0.04),inset_0_1px_0_0_rgba(255,255,255,1)]">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-1 transition-transform duration-300 hover:scale-105 flex items-center justify-center">
            <span className="material-symbols-outlined text-teal-700 text-3xl font-light">
              air
            </span>
          </div>
          <div className="w-8 h-[1px] bg-slate-200/80 mt-6" />
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
                  ? 'bg-teal-600 text-white shadow-[0_4px_16px_rgba(13,148,136,0.35)]'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
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
                  ? 'bg-teal-600 text-white shadow-[0_4px_16px_rgba(13,148,136,0.35)]'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">meeting_room</span>
            </button>
            <div className="absolute left-16 top-1/2 -translate-y-1/2 px-space-sm py-1 bg-slate-900/90 backdrop-blur-md text-white font-label-sm text-xs rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap">
              Suites & Isolation
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
      <header className="hidden lg:flex fixed top-6 left-32 right-6 h-20 z-40 items-center justify-between px-space-lg bg-white/75 backdrop-blur-[24px] rounded-[24px] border border-white/90 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06),0_4px_6px_-2px_rgba(15,23,42,0.03),inset_0_1px_0_0_rgba(255,255,255,1)]">
        <div className="flex items-center gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-xl font-semibold text-slate-900 tracking-tight">
                St. Jude Clinical Research Pavilion
              </span>
              <span className="font-label-mono text-[11px] uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 font-medium">
                Zone-A Ops
              </span>
              {demoMode && (
                <span className="font-label-mono text-[10px] uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Demo Mode
                </span>
              )}
            </div>
            <span className="font-label-sm text-xs text-slate-500">
              Facility AirOps · Critical Cleanroom & Negative Pressure Telemetry
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-lg">
          {/* Search Box */}
          <div className="relative flex items-center w-72 h-10 px-space-md rounded-full bg-slate-100/80 border border-slate-200/60 shadow-[inset_0_1px_3px_0_rgba(15,23,42,0.08)]">
            <span className="material-symbols-outlined text-slate-400 text-lg mr-2">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent text-slate-800 placeholder:text-slate-400 font-body-md text-xs w-full focus:outline-none"
              placeholder="Filter suites, HEPA nodes, particulate stats..."
              type="text"
            />
          </div>

          {/* Operational Status Pill */}
          <div className="flex items-center gap-space-sm px-space-md py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/60 shadow-[inset_0_1px_2px_rgba(16,185,129,0.1)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            </span>
            <span className="font-label-mono text-[11px] text-emerald-800 tracking-wider uppercase font-semibold">
              Online · 99.8% filtration rate
            </span>
          </div>

          {/* Notifications Button */}
          <button
            onClick={() => onSelectTab('alerts')}
            className="relative p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
            {unacknowledgedAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-purple-600 text-white font-label-mono text-[9px] flex items-center justify-center font-bold shadow-[0_0_8px_rgba(147,51,234,0.5)]">
                {unacknowledgedAlertsCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200/70">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-600 to-sky-500 ring-2 ring-teal-500/40 shadow-[0_2px_8px_rgba(13,148,136,0.25)] flex items-center justify-center text-white font-bold text-xs">
              EV
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-xs font-semibold text-slate-900 leading-tight">
                Dr. Eleanor Vance
              </span>
              <span className="font-label-mono text-[10px] text-teal-700 tracking-wider uppercase font-medium">
                Chief Medical Officer
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ----------------- MOBILE TOP HEADER ----------------- */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 pt-safe bg-white/85 backdrop-blur-xl border-b border-white/80 shadow-[0_1px_12px_rgba(15,23,42,0.04)]">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <span className="material-symbols-outlined text-xl">air</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-mono text-[10px] uppercase tracking-wider text-teal-700 font-bold">
                St. Jude Hospital
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-headline-md text-base font-bold text-slate-900 leading-tight">
                  AirGuard
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
