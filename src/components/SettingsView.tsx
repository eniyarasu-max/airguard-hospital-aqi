import React from 'react';
import { isFirebaseConfigured } from '../firebase';
import { ZONE_THRESHOLDS } from '../utils/aqi';

interface SettingsViewProps {
  demoMode: boolean;
  onToggleDemoMode: () => void;
  onClose?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  demoMode,
  onToggleDemoMode,
  onClose
}) => {
  const firebaseReady = isFirebaseConfigured();

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Header */}
      <div className="rounded-[24px] bg-white/75 backdrop-blur-[24px] p-space-lg border border-white/90 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06),0_4px_6px_-2px_rgba(15,23,42,0.03),inset_0_1px_0_0_rgba(255,255,255,1)] flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
            <span className="material-symbols-outlined text-2xl">tune</span>
          </div>
          <div>
            <h2 className="font-headline-md text-2xl font-light text-slate-900">
              System Parameters & Configuration
            </h2>
            <p className="font-label-sm text-xs text-slate-500">
              Biocontrol threshold matrices, IoT hardware bridge, and Demo simulation
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Demo Mode Toggle Card */}
        <div className="rounded-[24px] bg-white/80 backdrop-blur-xl p-space-lg border border-white/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-headline-md text-lg font-semibold text-slate-900">
                Demo Mode Simulation
              </span>
              <span className={`font-label-mono text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                demoMode
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {demoMode ? 'Active (Simulated)' : 'Real Hardware Mode'}
              </span>
            </div>

            <p className="font-body-md text-sm text-slate-600 mb-4">
              When Demo Mode is enabled, the dashboard simulates real-time decentralized telemetry for all 6 specialized hospital chambers (ICU, Operating Theatre, General Ward, Pharmacy, Waiting Hall, Bio-Lab) with natural atmospheric drift.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-label-mono text-slate-600 space-y-1 mb-4">
              <div>• Real Firebase data is utilized when Demo Mode is switched OFF.</div>
              <div>• In live operation, only the ICU unit connects to physical ESP32 hardware.</div>
              <div>• Auto ventilation logic triggers purge exhaust when simulated AQI drops.</div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="font-body-md text-sm font-semibold text-slate-800">
              Enable Demo Simulation
            </span>

            {/* Tactile Switch */}
            <div
              onClick={onToggleDemoMode}
              className={`cursor-pointer w-14 h-8 rounded-full p-1 transition-colors duration-200 relative border ${
                demoMode
                  ? 'bg-teal-600 border-teal-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]'
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
                    demoMode ? 'bg-teal-600 shadow-sm' : 'bg-slate-300'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Firebase Connection Card */}
        <div className="rounded-[24px] bg-white/80 backdrop-blur-xl p-space-lg border border-white/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-headline-md text-lg font-semibold text-slate-900">
                Firebase Realtime Database
              </span>
              <span className={`font-label-mono text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                firebaseReady
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {firebaseReady ? 'Connected' : 'Placeholder Config'}
              </span>
            </div>

            <p className="font-body-md text-sm text-slate-600 mb-3">
              Telemetry connects to Firebase Realtime Database modular SDK v9+. To connect real ESP32 microcontroller hardware:
            </p>

            <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-label-mono text-xs space-y-1 mb-4 overflow-x-auto">
              <div className="text-teal-400">// Edit src/firebase.ts</div>
              <div>apiKey: "YOUR_FIREBASE_API_KEY",</div>
              <div>databaseURL: "https://your-app-rtdb.firebaseio.com"</div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs font-label-mono text-slate-500">
            Status: {firebaseReady ? 'Subscribed to /rooms, /alerts, /control' : 'Using graceful offline fallback'}
          </div>
        </div>
      </div>

      {/* Clinical Zone Thresholds Matrix */}
      <div className="rounded-[24px] bg-white/80 backdrop-blur-xl p-space-lg border border-white/90 shadow-sm">
        <h3 className="font-headline-md text-lg font-semibold text-slate-900 mb-1">
          Clinical Aerometrics: Zone Thresholds Matrix
        </h3>
        <p className="font-label-sm text-xs text-slate-500 mb-4">
          Stricter bio-clean standards applied to Surgical Operating Theatres and Intensive Care Units
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-label-mono text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 px-3">Zone</th>
                <th className="py-2.5 px-3">Max CO₂</th>
                <th className="py-2.5 px-3">Max PM2.5 Dust</th>
                <th className="py-2.5 px-3">Max TVOC</th>
                <th className="py-2.5 px-3">Temp Range</th>
                <th className="py-2.5 px-3">RH Range</th>
                <th className="py-2.5 px-3">AQI Warning Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {Object.entries(ZONE_THRESHOLDS).map(([zoneKey, t]) => (
                <tr key={zoneKey} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-bold uppercase text-teal-800">
                    {zoneKey}
                  </td>
                  <td className="py-2.5 px-3">{t.co2Max} ppm</td>
                  <td className="py-2.5 px-3">{t.dustMax} µg/m³</td>
                  <td className="py-2.5 px-3">{t.tvocMax} ppb</td>
                  <td className="py-2.5 px-3">{t.tempMin} - {t.tempMax}°C</td>
                  <td className="py-2.5 px-3">{t.humidityMin} - {t.humidityMax}%</td>
                  <td className="py-2.5 px-3 font-semibold text-amber-700">&lt; {t.aqiWarningThreshold} AQI</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
