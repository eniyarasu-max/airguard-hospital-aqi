// Types for AirGuard Hospital Indoor Air Quality Monitoring System

export type ZoneType = 'icu' | 'ot' | 'ward' | 'general';

export interface HardwareIndicators {
  ledGreen: boolean;     // Safe / Normal state indicator
  ledYellow: boolean;    // Caution / Elevated state indicator
  ledRed: boolean;       // Hazard / Critical state indicator
  buzzer: boolean;       // Active Piezo acoustic sounder alarm
  state: 'safe' | 'caution' | 'hazard';
}

export interface EceDiagnostics {
  rawGasAdc: number;     // 12-bit ADC raw count (0 - 4095)
  gasVoltage: number;    // Vo in Volts (ADC * 3.3 / 4095)
  rsR0Ratio: number;     // Rs / R0 sensor resistance ratio
  rhCompFactor: number;  // Temperature & Relative Humidity compensation multiplier
  dustVoltage: number;   // Sharp GP2Y1010AU0F analog output voltage (V)
  dewPoint: number;      // Calculated dew point (°C) using Magnus-Tetens formula
}

export interface SensorReadings {
  temperature: number; // °C
  humidity: number;    // %
  co2: number;         // ppm
  tvoc: number;        // ppb
  dust: number;        // µg/m³ (PM2.5)
  gas: number;         // raw MQ-135 value
  timestamp: number;   // ms
  indicators?: HardwareIndicators;
  ece?: EceDiagnostics;
}

export interface DeviceHealth {
  wifiRssi: number;    // dBm, e.g. -65
  uptime: number;      // seconds
  sensorStatus: string;// e.g. "nominal", "calibrating", "warning"
  online: boolean;     // computed: lastSeen within 60s
  lastSeen: number;    // timestamp ms
}

export interface RoomData {
  id: string;
  name: string;
  zone: ZoneType;
  latest: SensorReadings;
  history?: Record<string, SensorReadings>;
  device: DeviceHealth;
  pressurePa?: number; // Differential airlock pressure, e.g. -24.8 or +12.5 Pa
  achTarget?: number;  // Air changes per hour, e.g. 14
  indicators?: HardwareIndicators;
  ece?: EceDiagnostics;
}

export interface AlertData {
  alertId: string;
  roomId: string;
  roomName?: string;
  type: string;        // e.g. "co2_spike", "dust_elevation", "rh_deviation", "general"
  severity: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

export interface RoomControl {
  roomId: string;
  mode: 'auto' | 'manual';
  fan: boolean;
  damper?: number;     // 0-100%
  uvc?: boolean;
  carbonBed?: boolean;
  ionization?: boolean;
}

export interface ZoneThresholds {
  co2Max: number;        // ppm
  tvocMax: number;       // ppb
  dustMax: number;       // µg/m³
  tempMin: number;       // °C
  tempMax: number;       // °C
  humidityMin: number;   // %
  humidityMax: number;   // %
  aqiWarningThreshold: number; // minimum AQI before triggering warning
}

export type AQIStatusCategory = 'Good' | 'Moderate' | 'Poor';

export interface AQIResult {
  score: number;         // 0 - 100 (higher is better)
  status: AQIStatusCategory;
  color: string;         // Emerald / Amber / Red hex
  label: string;         // e.g. "Pristine · Cleanroom Grade B"
  subscores: {
    co2: number;
    tvoc: number;
    dust: number;
    temperature: number;
    humidity: number;
  };
}
