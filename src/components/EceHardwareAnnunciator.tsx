import React, { useState, useEffect, useRef } from 'react';
import { RoomData, HardwareIndicators, EceDiagnostics } from '../types';
import { evaluateHardwareIndicators, computeEceDiagnostics } from '../utils/eceCalculations';

interface EceHardwareAnnunciatorProps {
  room: RoomData | null;
}

export const EceHardwareAnnunciator: React.FC<EceHardwareAnnunciatorProps> = ({ room }) => {
  const [audioMuted, setAudioMuted] = useState<boolean>(true);
  const [isTestAlarmActive, setIsTestAlarmActive] = useState<boolean>(false);
  const [showCircuitPinout, setShowCircuitPinout] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Compute live readings and indicators
  const latest = room?.latest;
  const indicators: HardwareIndicators = room?.indicators || (latest?.indicators) || evaluateHardwareIndicators(
    latest?.co2 ?? 420,
    latest?.dust ?? 5.0,
    latest?.gas ?? 380
  );

  const ece: EceDiagnostics = room?.ece || (latest?.ece) || computeEceDiagnostics(latest || {});

  // Alarm sound synthesizer via Web Audio API (2400 Hz hospital buzzer tone)
  const shouldBeep = (indicators.buzzer || isTestAlarmActive) && !audioMuted;

  useEffect(() => {
    if (shouldBeep) {
      try {
        if (!audioContextRef.current) {
          const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioContextRef.current = new AudioCtx();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        // Create 2.4 kHz pulsed alarm
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(2400, ctx.currentTime);

        // Pulsing envelope (beep-beep-beep)
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        for (let i = 0; i < 8; i++) {
          const t = now + (i * 0.25);
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.setValueAtTime(0, t + 0.12);
        }

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.0);

        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
      } catch (e) {
        console.warn('Web Audio buzzer simulation error:', e);
      }
    } else {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch {
          // ignore already stopped
        }
        oscillatorRef.current = null;
      }
    }
  }, [shouldBeep]);

  // Audio test toggle
  const toggleTestAlarm = () => {
    setAudioMuted(false);
    setIsTestAlarmActive(true);
    setTimeout(() => {
      setIsTestAlarmActive(false);
    }, 2000);
  };

  return (
    <div className="rounded-[24px] bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-7 border border-slate-700/60 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.4),inset_0_1px_0_0_rgba(255,255,255,0.1)] text-slate-100 relative overflow-hidden mb-space-xl">
      {/* Background Circuit Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Banner & Control Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
            <span className="material-symbols-outlined text-2xl">memory</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline-md text-base sm:text-lg font-bold tracking-tight text-white">
                ECE Hardware Transducer & Annunciator Panel
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-label-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ESP32 NODE {room ? `[${room.id.toUpperCase()}]` : '[ICU]'}
              </span>
            </div>
            <p className="font-label-mono text-xs text-slate-400 mt-0.5">
              Sensors: DHT22 • MQ-135 • GP2Y1010AU0F | Actuators: 3x LEDs + Piezo Buzzer
            </p>
          </div>
        </div>

        {/* Action Buttons: Circuit Pinout & Audio Mute/Test */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setShowCircuitPinout(!showCircuitPinout)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700 text-xs font-label-mono font-medium flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm text-sky-400">schema</span>
            <span>{showCircuitPinout ? 'Hide Pinout' : 'Pinout Schematics'}</span>
          </button>

          <button
            onClick={() => setAudioMuted(!audioMuted)}
            className={`px-3 py-1.5 rounded-lg text-xs font-label-mono font-medium flex items-center gap-1.5 transition-all border ${
              audioMuted
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
            }`}
            title={audioMuted ? 'Unmute Browser Buzzer' : 'Mute Browser Buzzer'}
          >
            <span className="material-symbols-outlined text-sm">
              {audioMuted ? 'volume_off' : 'volume_up'}
            </span>
            <span>{audioMuted ? 'Buzzer Muted' : 'Buzzer Armed'}</span>
          </button>

          <button
            onClick={toggleTestAlarm}
            disabled={isTestAlarmActive}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-label-mono font-bold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm text-rose-400">notifications_active</span>
            <span>{isTestAlarmActive ? 'Beeping...' : 'Test Buzzer'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Expandable Hardware Pinout Circuit Diagram */}
      {showCircuitPinout && (
        <div className="my-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-label-mono animate-fadeIn relative z-10">
          <div className="flex items-center justify-between mb-3 text-slate-400 font-bold tracking-wider uppercase text-[11px]">
            <span>ESP32-WROOM-32 Pinout & Transducer Bus Wiring</span>
            <span className="text-teal-400">Active High Logic (3.3V LVTTL)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">🟢 Safe Green LED</span>
              <span className="text-slate-300 block">Pin: <b className="text-white">GPIO 18</b> (Through 220Ω)</span>
              <span className="text-slate-400 text-[10px]">Threshold: CO₂ ≤ 800 ppm & Dust ≤ 25</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-amber-400 font-bold block mb-1">🟡 Caution Yellow LED</span>
              <span className="text-slate-300 block">Pin: <b className="text-white">GPIO 19</b> (Through 220Ω)</span>
              <span className="text-slate-400 text-[10px]">Threshold: CO₂ 801-1200 or Dust 26-50</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-rose-400 font-bold block mb-1">🔴 Hazard Red LED</span>
              <span className="text-slate-300 block">Pin: <b className="text-white">GPIO 23</b> (Through 220Ω)</span>
              <span className="text-slate-400 text-[10px]">Threshold: CO₂ &gt; 1200 or Dust &gt; 50</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-purple-400 font-bold block mb-1">🔊 Piezo Buzzer</span>
              <span className="text-slate-300 block">Pin: <b className="text-white">GPIO 22</b> (NPN Transistor Drive)</span>
              <span className="text-slate-400 text-[10px]">Frequency: 2400 Hz Pulsed Alert</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-300">
            <div><b className="text-sky-400">DHT22:</b> GPIO 4 (Bidirectional DATA + 10kΩ pull-up to 3.3V)</div>
            <div><b className="text-amber-400">MQ-135:</b> GPIO 34 (ADC1_CH6, 0-3.3V Analog Vo, Heater to 5V)</div>
            <div><b className="text-indigo-400">Sharp GP2Y1010:</b> GPIO 5 (ILED Drive) + GPIO 35 (ADC1_CH7 Vo)</div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Side LED Annunciator Diode Block, Right Side ECE Transducer Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-stretch relative z-10">
        
        {/* Physical LED Annunciator & Buzzer Chassis (5 Columns) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-950/90 border border-slate-800 p-5 flex flex-col justify-between shadow-inner">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-label-mono text-[11px] text-slate-400 font-semibold tracking-wider uppercase">
                Hardware Annunciator Rack
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-label-mono font-bold uppercase tracking-wider ${
                indicators.state === 'safe'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : indicators.state === 'caution'
                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                  : 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse'
              }`}>
                ANNUNCIATOR: {indicators.state.toUpperCase()}
              </span>
            </div>

            {/* Realistic Physical Glowing Diodes */}
            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 mb-4">
              
              {/* GREEN LED DIODE */}
              <div className="flex flex-col items-center">
                <div className="relative mb-2 flex items-center justify-center">
                  {/* Metal bezel rim */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-b from-slate-600 via-slate-800 to-slate-950 p-1 shadow-lg flex items-center justify-center">
                    {/* Glass dome lens */}
                    <div
                      className={`w-11 h-11 rounded-full transition-all duration-300 relative flex items-center justify-center ${
                        indicators.ledGreen
                          ? 'bg-emerald-400 shadow-[0_0_30px_10px_rgba(16,185,129,0.7),inset_0_2px_4px_rgba(255,255,255,0.8)]'
                          : 'bg-emerald-950/40 shadow-inner'
                      }`}
                    >
                      {/* Cathode post specular reflection */}
                      <div className={`w-3 h-3 rounded-full ${indicators.ledGreen ? 'bg-white/90' : 'bg-emerald-900/40'} blur-[1px]`} />
                    </div>
                  </div>
                  {indicators.ledGreen && (
                    <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl animate-pulse pointer-events-none" />
                  )}
                </div>
                <span className={`font-label-mono text-xs font-bold ${indicators.ledGreen ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'text-slate-500'}`}>
                  SAFE
                </span>
                <span className="font-label-mono text-[10px] text-slate-400 mt-0.5">GPIO 18</span>
              </div>

              {/* YELLOW LED DIODE */}
              <div className="flex flex-col items-center">
                <div className="relative mb-2 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-b from-slate-600 via-slate-800 to-slate-950 p-1 shadow-lg flex items-center justify-center">
                    <div
                      className={`w-11 h-11 rounded-full transition-all duration-300 relative flex items-center justify-center ${
                        indicators.ledYellow
                          ? 'bg-amber-400 shadow-[0_0_30px_10px_rgba(245,158,11,0.7),inset_0_2px_4px_rgba(255,255,255,0.8)]'
                          : 'bg-amber-950/40 shadow-inner'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${indicators.ledYellow ? 'bg-white/90' : 'bg-amber-900/40'} blur-[1px]`} />
                    </div>
                  </div>
                  {indicators.ledYellow && (
                    <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse pointer-events-none" />
                  )}
                </div>
                <span className={`font-label-mono text-xs font-bold ${indicators.ledYellow ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'text-slate-500'}`}>
                  CAUTION
                </span>
                <span className="font-label-mono text-[10px] text-slate-400 mt-0.5">GPIO 19</span>
              </div>

              {/* RED LED DIODE */}
              <div className="flex flex-col items-center">
                <div className="relative mb-2 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-b from-slate-600 via-slate-800 to-slate-950 p-1 shadow-lg flex items-center justify-center">
                    <div
                      className={`w-11 h-11 rounded-full transition-all duration-300 relative flex items-center justify-center ${
                        indicators.ledRed
                          ? 'bg-rose-500 shadow-[0_0_35px_12px_rgba(244,63,94,0.8),inset_0_2px_4px_rgba(255,255,255,0.9)] animate-pulse'
                          : 'bg-rose-950/40 shadow-inner'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${indicators.ledRed ? 'bg-white/90' : 'bg-rose-900/40'} blur-[1px]`} />
                    </div>
                  </div>
                  {indicators.ledRed && (
                    <div className="absolute inset-0 rounded-full bg-rose-500/30 blur-2xl animate-ping pointer-events-none" />
                  )}
                </div>
                <span className={`font-label-mono text-xs font-bold ${indicators.ledRed ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'text-slate-500'}`}>
                  HAZARD
                </span>
                <span className="font-label-mono text-[10px] text-slate-400 mt-0.5">GPIO 23</span>
              </div>

            </div>

            {/* Acoustic Buzzer Sounder Box */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
              indicators.buzzer || isTestAlarmActive
                ? 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  indicators.buzzer || isTestAlarmActive
                    ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-bounce'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  <span className="material-symbols-outlined text-xl">
                    {indicators.buzzer || isTestAlarmActive ? 'volume_up' : 'campaign'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-mono text-xs font-bold text-white">Piezo Buzzer (GPIO 22)</span>
                    {(indicators.buzzer || isTestAlarmActive) && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-label-mono font-bold bg-rose-500 text-white">
                        ACTIVE ALARM
                      </span>
                    )}
                  </div>
                  <span className="font-label-mono text-[10px] text-slate-400 block">
                    {indicators.buzzer || isTestAlarmActive ? 'Emitting 2400 Hz acoustic alert pulses' : 'Standby · Silent during Safe / Caution bands'}
                  </span>
                </div>
              </div>

              {/* Sound wave graphic */}
              <div className="flex items-center gap-1">
                <span className={`w-1 h-3 rounded-full ${indicators.buzzer || isTestAlarmActive ? 'bg-rose-400 animate-pulse' : 'bg-slate-700'}`} />
                <span className={`w-1 h-5 rounded-full ${indicators.buzzer || isTestAlarmActive ? 'bg-rose-400 animate-pulse delay-75' : 'bg-slate-700'}`} />
                <span className={`w-1 h-7 rounded-full ${indicators.buzzer || isTestAlarmActive ? 'bg-rose-400 animate-pulse delay-150' : 'bg-slate-700'}`} />
                <span className={`w-1 h-4 rounded-full ${indicators.buzzer || isTestAlarmActive ? 'bg-rose-400 animate-pulse delay-100' : 'bg-slate-700'}`} />
              </div>
            </div>
          </div>

          {/* Bottom Metrology Summary Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-label-mono text-slate-400">
            <span>Trip Rule: CO₂ &gt; 1200 or PM2.5 &gt; 50</span>
            <span className="text-teal-400 font-semibold">Zero False-Positive Filtered</span>
          </div>
        </div>

        {/* ECE Transducer Telemetry (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          
          {/* Card 1: MQ-135 Semiconductor Gas Transducer */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-label-mono text-xs font-bold text-amber-300">
                  MQ-135 Gas Transducer (Tin Dioxide SnO₂)
                </span>
              </div>
              <span className="font-label-mono text-[10px] text-slate-400">GPIO 34 · ADC1_CH6</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-label-mono text-xs">
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Raw 12-Bit ADC</span>
                <span className="text-white font-bold text-sm">{ece.rawGasAdc} <span className="text-[10px] text-slate-500">/ 4095</span></span>
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Sensor Output Vo</span>
                <span className="text-amber-300 font-bold text-sm">{ece.gasVoltage.toFixed(2)} <span className="text-[10px] text-slate-500">V</span></span>
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Temp/RH Comp Cf</span>
                <span className="text-teal-400 font-bold text-sm">{ece.rhCompFactor.toFixed(3)} <span className="text-[10px] text-slate-500">x</span></span>
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Compensated CO₂</span>
                <span className="text-emerald-400 font-bold text-sm">{latest?.co2 ?? 420} <span className="text-[10px] text-slate-500">ppm</span></span>
              </div>
            </div>
            <div className="mt-2 text-[10px] font-label-mono text-slate-400 flex items-center justify-between">
              <span>Rs/R0 Ratio: {ece.rsR0Ratio} (Clean air R0 = 76.63 kΩ)</span>
              <span>TVOC Index: {latest?.tvoc ?? 45} ppb</span>
            </div>
          </div>

          {/* Card 2: GP2Y1010AU0F Optical Scattering Dust Transducer */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span className="font-label-mono text-xs font-bold text-sky-300">
                  GP2Y1010AU0F Infrared Optical Dust Transducer
                </span>
              </div>
              <span className="font-label-mono text-[10px] text-slate-400">GPIO 5 (Pulse) & GPIO 35 (Vo)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-label-mono text-xs">
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">IR Pulse Width</span>
                <span className="text-white font-bold text-sm">280 <span className="text-[10px] text-slate-500">µs</span></span>
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Sampled Vo</span>
                <span className="text-sky-300 font-bold text-sm">{ece.dustVoltage.toFixed(2)} <span className="text-[10px] text-slate-500">V</span></span>
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Clean Air Offset</span>
                <span className="text-slate-300 font-bold text-sm">0.55 <span className="text-[10px] text-slate-500">V</span></span>
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Filtered PM2.5</span>
                <span className="text-emerald-400 font-bold text-sm">{latest?.dust?.toFixed(1) ?? '2.8'} <span className="text-[10px] text-slate-500">µg/m³</span></span>
              </div>
            </div>
            <div className="mt-2 text-[10px] font-label-mono text-slate-400 flex items-center justify-between">
              <span>Transfer Characteristic: 0.5V per 100 µg/m³</span>
              <span>Filter: 32x Burst Oversampling + EMA (α=0.35)</span>
            </div>
          </div>

          {/* Card 3: DHT22 Digital Climate Transducer & Dew Point */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span className="font-label-mono text-xs font-bold text-teal-300">
                  DHT22 Polymer Capacitive & NTC Thermistor
                </span>
              </div>
              <span className="font-label-mono text-[10px] text-slate-400">GPIO 4 · 1-Wire Single Bus</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-label-mono text-xs">
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Temperature</span>
                <span className="text-teal-300 font-bold text-sm">{latest?.temperature?.toFixed(1) ?? '21.4'} <span className="text-[10px] text-slate-500">°C</span></span>
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Fahrenheit</span>
                <span className="text-white font-bold text-sm">{latest ? ((latest.temperature * 1.8) + 32).toFixed(1) : '70.5'} <span className="text-[10px] text-slate-500">°F</span></span>
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Relative Humidity</span>
                <span className="text-sky-300 font-bold text-sm">{latest?.humidity ?? 48} <span className="text-[10px] text-slate-500">% RH</span></span>
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Magnus Dew Point</span>
                <span className="text-indigo-300 font-bold text-sm">{ece.dewPoint.toFixed(1)} <span className="text-[10px] text-slate-500">°C</span></span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
