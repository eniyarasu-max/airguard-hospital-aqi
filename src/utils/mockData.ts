import { RoomData, AlertData, RoomControl, SensorReadings } from '../types';
import { evaluateHardwareIndicators, computeEceDiagnostics } from './eceCalculations';

/**
 * Generate 24 hours of realistic historical environmental data points
 */
export function generateHistory(base: Partial<SensorReadings>, hours = 24, count = 24): Record<string, SensorReadings> {
  const history: Record<string, SensorReadings> = {};
  const now = Date.now();
  const stepMs = (hours * 3600 * 1000) / count;

  for (let i = count; i >= 0; i--) {
    const time = now - i * stepMs;
    const hourOfDay = new Date(time).getHours();
    const peakFactor = Math.sin((hourOfDay - 6) / 12 * Math.PI);

    const temp = Number(((base.temperature ?? 21.0) + (peakFactor * 0.8) + (Math.random() * 0.3 - 0.15)).toFixed(1));
    const hum = Math.round((base.humidity ?? 46) + (peakFactor * 4) + (Math.random() * 2 - 1));
    const co2 = Math.round((base.co2 ?? 420) + Math.max(0, peakFactor * 120) + (Math.random() * 20 - 10));
    const tvoc = Number(((base.tvoc ?? 45) + Math.max(0, peakFactor * 15) + (Math.random() * 5 - 2.5)).toFixed(0));
    const dust = Number(((base.dust ?? 2.8) + Math.max(0, peakFactor * 2.2) + (Math.random() * 0.6 - 0.3)).toFixed(1));
    const gas = Math.round((base.gas ?? 185) + (peakFactor * 25) + (Math.random() * 10 - 5));

    const pushId = `hist_${time}`;
    history[pushId] = {
      temperature: temp,
      humidity: hum,
      co2,
      tvoc,
      dust,
      gas,
      timestamp: time
    };
  }
  return history;
}

/**
 * Single Primary Hardware Node for Kongu Hospital Mini Project
 */
export const INITIAL_MOCK_ROOMS: Record<string, RoomData> = {
  icu: {
    id: 'icu',
    name: 'Kongu Cleanroom Suite (Node 01)',
    zone: 'icu',
    pressurePa: -14.2,
    achTarget: 16,
    latest: {
      temperature: 21.2,
      humidity: 47,
      co2: 435,
      tvoc: 48,
      dust: 2.8,
      gas: 185,
      timestamp: Date.now()
    },
    history: generateHistory({ temperature: 21.2, humidity: 47, co2: 435, dust: 2.8 }),
    device: {
      wifiRssi: -58,
      uptime: 142850,
      sensorStatus: 'nominal',
      online: true,
      lastSeen: Date.now()
    }
  }
};

export const INITIAL_MOCK_ALERTS: Record<string, AlertData> = {
  alert_node1: {
    alertId: 'alert_node1',
    roomId: 'icu',
    roomName: 'Kongu Cleanroom Suite (Node 01)',
    type: 'general',
    severity: 'info',
    message: 'Kongu AirGuard Hardware Node 01 active. DHT22, MQ-135, and GP2Y1010AU0F calibrated & nominal.',
    timestamp: Date.now() - 1000 * 60 * 5,
    acknowledged: true
  }
};

export const INITIAL_MOCK_CONTROLS: Record<string, RoomControl> = {
  icu: { roomId: 'icu', mode: 'auto', fan: true, damper: 75, uvc: true, carbonBed: true }
};

/**
 * Creates live simulation jitter for Demo Mode
 */
export function simulateRoomUpdate(room: RoomData): RoomData {
  const current = room.latest;
  const tempJitter = Number(((Math.random() - 0.5) * 0.1).toFixed(2));
  const humJitter = Math.round((Math.random() - 0.5) * 0.8);
  const co2Jitter = Math.round((Math.random() - 0.48) * 4);
  const tvocJitter = Math.round((Math.random() - 0.5) * 2);
  const dustJitter = Number(((Math.random() - 0.5) * 0.15).toFixed(2));

  const newTemp = Number(Math.max(16, Math.min(30, current.temperature + tempJitter)).toFixed(1));
  const newHum = Math.max(25, Math.min(80, current.humidity + humJitter));
  const newCo2 = Math.max(380, Math.min(1400, current.co2 + co2Jitter));
  const newTvoc = Math.max(10, Math.min(800, current.tvoc + tvocJitter));
  const newDust = Number(Math.max(0.4, Math.min(60, current.dust + dustJitter)).toFixed(1));

  const updatedReadings: SensorReadings = {
    temperature: newTemp,
    humidity: newHum,
    co2: newCo2,
    tvoc: newTvoc,
    dust: newDust,
    gas: current.gas + Math.round((Math.random() - 0.5) * 3),
    timestamp: Date.now()
  };

  const indicators = evaluateHardwareIndicators(newCo2, newDust, updatedReadings.gas);
  const ece = computeEceDiagnostics(updatedReadings);
  updatedReadings.indicators = indicators;
  updatedReadings.ece = ece;

  const updatedHistory = { ...room.history };
  const pushId = `stream_${Date.now()}`;
  updatedHistory[pushId] = updatedReadings;

  // Keep latest 30 historical points
  const keys = Object.keys(updatedHistory);
  if (keys.length > 30) {
    delete updatedHistory[keys[0]];
  }

  return {
    ...room,
    latest: updatedReadings,
    history: updatedHistory,
    indicators,
    ece,
    device: {
      ...room.device,
      lastSeen: Date.now(),
      online: true
    }
  };
}
