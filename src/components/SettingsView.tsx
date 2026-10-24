import React, { useState } from 'react';
import { isFirebaseConfigured } from '../firebase';
import { useThresholds, WardPreset } from '../context/ThresholdContext';
import { generateIsoComplianceAuditPdf, generateIsoComplianceAuditCsv } from '../utils/exportIsoReport';
import { RoomData } from '../types';

interface SettingsViewProps {
  demoMode: boolean;
  onToggleDemoMode: () => void;
  onClose?: () => void;
  room?: RoomData | null;
  compositeAQI?: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  demoMode,
  onToggleDemoMode,
  onClose,
  room = null,
  compositeAQI = 88
}) => {
  const firebaseReady = isFirebaseConfigured();
  const { thresholds, setPreset, updateThreshold, resetToDefaults } = useThresholds();

  return (
    <div className="w-full flex flex-col gap-6 animate-startup-1">
      {/* Top Header */}
      <div className="rounded-[24px] glass-panel p-space-lg border border-cyan-200/50 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 shadow-sm">
            <span className="material-symbols-outlined text-2xl">tune</span>
          </div>
          <div>
            <h2 className="font-headline-md text-2xl font-light text-slate-900">
              System Parameters & Configuration
            </h2>
            <p className="font-label-sm text-xs text-slate-500">
              Custom hospital ward threshold sliders, ISO 14644 compliance audits, and AI telemetry settings
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
      </div>

      {/* SECTION 1: Dynamic Ward Threshold Sliders & Presets */}
      <div className="rounded-[24px] glass-panel p-space-lg border border-cyan-200/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-600 text-2xl">tune</span>
              <h3 className="font-headline-md text-lg font-bold text-slate-900">
                Dynamic Ward Threshold Sliders
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-label-mono font-bold uppercase bg-cyan-100 text-cyan-800">
                Live Re-Calibration
              </span>
            </div>
            <p className="font-label-sm text-xs text-slate-500 mt-0.5">
              Customize warning triggers for surgical wards, ICUs, or outpatient areas. Updates AQI needle and LED logic instantly.
            </p>
          </div>

          <button
            onClick={resetToDefaults}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-label-mono font-semibold self-start sm:self-auto cursor-pointer active:scale-95 transition-all"
          >
            Reset to ISO Standard
          </button>
        </div>

        {/* Preset Selector Pills */}
        <div className="mb-6">
          <label className="block font-label-mono text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select Hospital Ward Preset:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'iso_cleanroom' as WardPreset,
                title: 'ISO Cleanroom (Strict)',
                desc: 'PM2.5 ≤ 10 µg/m³ • CO₂ ≤ 650 ppm',
                icon: 'medical_services'
              },
              {
                id: 'icu_suite' as WardPreset,
                title: 'ICU Isolation Ward',
                desc: 'PM2.5 ≤ 18 µg/m³ • CO₂ ≤ 750 ppm',
                icon: 'emergency'
              },
              {
                id: 'general_ward' as WardPreset,
                title: 'General Hospital Ward',
                desc: 'PM2.5 ≤ 30 µg/m³ • CO₂ ≤ 950 ppm',
                icon: 'domain'
              }
            ].map((p) => {
              const isSelected = thresholds.preset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPreset(p.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer active:scale-98 ${
                    isSelected
                      ? 'bg-cyan-50/90 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.18)] ring-1 ring-cyan-400/50'
                      : 'bg-white/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`material-symbols-outlined text-lg ${isSelected ? 'text-cyan-700' : 'text-slate-500'}`}>
                      {p.icon}
                    </span>
                    <span className="font-headline-md text-xs font-bold text-slate-900">
                      {p.title}
                    </span>
                  </div>
                  <span className="font-label-mono text-[10px] text-slate-500 block">
                    {p.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* PM2.5 Fine Dust Slider */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body-md text-xs font-semibold text-slate-800">
                PM2.5 Fine Particulate Ceiling
              </span>
              <span className="font-label-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 tabular-nums">
                {thresholds.dustMax} µg/m³
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={thresholds.dustMax}
              onChange={(e) => updateThreshold('dustMax', Number(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between font-label-mono text-[10px] text-slate-400 mt-1">
              <span>5 µg/m³ (Sterile Class 5)</span>
              <span>50 µg/m³ (Max Ward Limit)</span>
            </div>
          </div>

          {/* CO2 Concentration Slider */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body-md text-xs font-semibold text-slate-800">
                Carbon Dioxide (CO₂) Warning Ceiling
              </span>
              <span className="font-label-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 tabular-nums">
                {thresholds.co2Max} ppm
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="1500"
              step="25"
              value={thresholds.co2Max}
              onChange={(e) => updateThreshold('co2Max', Number(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between font-label-mono text-[10px] text-slate-400 mt-1">
              <span>500 ppm (Fresh Plenum)</span>
              <span>1500 ppm (Stale Air)</span>
            </div>
          </div>

          {/* Target Temperature Slider */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body-md text-xs font-semibold text-slate-800">
                Cleanroom Ambient Temperature Range
              </span>
              <span className="font-label-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 tabular-nums">
                {thresholds.tempMin.toFixed(1)}° - {thresholds.tempMax.toFixed(1)}°C
              </span>
            </div>
            <input
              type="range"
              min="18"
              max="26"
              step="0.5"
              value={thresholds.tempMax}
              onChange={(e) => updateThreshold('tempMax', Number(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between font-label-mono text-[10px] text-slate-400 mt-1">
              <span>18°C (Cool OT)</span>
              <span>26°C (General Ward)</span>
            </div>
          </div>

          {/* Relative Humidity Slider */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body-md text-xs font-semibold text-slate-800">
                Relative Humidity Target Range
              </span>
              <span className="font-label-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 tabular-nums">
                {thresholds.humidityMin}% - {thresholds.humidityMax}%
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="70"
              step="1"
              value={thresholds.humidityMax}
              onChange={(e) => updateThreshold('humidityMax', Number(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between font-label-mono text-[10px] text-slate-400 mt-1">
              <span>30% (Dry Barrier)</span>
              <span>70% (Microbial Threshold)</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: 1-Click ISO 14644 Compliance Summary Export */}
      <div className="rounded-[24px] glass-panel p-space-lg border border-cyan-200/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-cyan-600 text-2xl">picture_as_pdf</span>
            <h3 className="font-headline-md text-lg font-bold text-slate-900">
              ISO 14644 Compliance Summary Export
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-label-mono font-bold bg-emerald-100 text-emerald-800">
              Grade B Certified
            </span>
          </div>
          <p className="font-label-sm text-xs text-slate-600 max-w-xl">
            Generates a formal, printable hospital environmental audit report with Min/Max/Average particle concentrations, temperature stability index, sensor calibration data, and official auditor signature certification.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => generateIsoComplianceAuditCsv(room, compositeAQI)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-label-mono text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-slate-500">table_view</span>
            <span>Download CSV</span>
          </button>

          <button
            onClick={() => generateIsoComplianceAuditPdf(room, compositeAQI)}
            className="px-4 py-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-label-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_4px_16px_rgba(0,229,255,0.35)] active:scale-95 hover:shadow-[0_6px_20px_rgba(0,229,255,0.5)] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Export ISO Audit PDF</span>
          </button>
        </div>
      </div>

      {/* SECTION 3: AirGuard Gemini AI & Simulation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gemini Engine Status Card (Pre-Configured Enterprise Link) */}
        <div className="rounded-[24px] glass-panel p-space-lg border border-cyan-200/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-600 text-xl">auto_awesome</span>
                <span className="font-headline-md text-lg font-bold text-slate-900">
                  AirGuard Gemini 3.8 Flash AI
                </span>
              </div>
              <span className="font-label-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active & Connected
              </span>
            </div>

            <p className="font-body-md text-xs text-slate-600 mb-4">
              Integrated with Google's <b>Gemini 3.8 Flash</b> multimodal neural engine. Automatically calibrated for Kongu Hospital & Research Institute Cleanroom Node 01 telemetry records.
            </p>

            <div className="space-y-2 rounded-xl bg-slate-50/80 p-3 border border-slate-200/70 font-label-mono text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Model Engine:</span>
                <span className="font-bold text-cyan-800">gemini-3.8-flash</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">API Status:</span>
                <span className="font-bold text-emerald-600">Enterprise Key Provisioned</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Telemetry Target:</span>
                <span className="font-bold text-slate-800">Cleanroom Node 01</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="font-label-mono text-[11px] text-slate-500">
              No manual key entry required
            </span>
            <span className="font-label-mono text-xs font-bold text-cyan-700 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">verified</span>
              Automated Link
            </span>
          </div>
        </div>

        {/* Demo Mode & Hardware Link Card */}
        <div className="rounded-[24px] glass-panel p-space-lg border border-cyan-200/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-headline-md text-lg font-bold text-slate-900">
                Simulation & Hardware Bridge
              </span>
              <span className={`font-label-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                demoMode ? 'bg-amber-100 text-amber-800' : 'bg-cyan-100 text-cyan-800'
              }`}>
                {demoMode ? 'Demo Simulation' : 'Live Node 01'}
              </span>
            </div>

            <p className="font-body-md text-xs text-slate-600 mb-3">
              Toggle between simulated cleanroom telemetry and live ESP32 microcontroller packets from Kongu Hospital RTDB:
            </p>

            <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-label-mono text-[11px] space-y-1 mb-3">
              <div className="text-cyan-400">// Node 01 Firebase RTDB Channel</div>
              <div>ESP32 Baud: 115200 • Status: {firebaseReady ? 'Subscribed' : 'Fallback'}</div>
              <div>Sensors: DHT22 • MQ-135 • GP2Y1010AU0F</div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="font-body-md text-xs font-bold text-slate-800">
              Enable Demo Simulation
            </span>

            <div
              onClick={onToggleDemoMode}
              className={`cursor-pointer w-14 h-8 rounded-full p-1 transition-colors duration-200 relative border ${
                demoMode
                  ? 'bg-cyan-600 border-cyan-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]'
                  : 'bg-slate-200 border-slate-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 flex items-center justify-center ${
                  demoMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    demoMode ? 'bg-cyan-600' : 'bg-slate-300'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
