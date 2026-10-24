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
    // sinusoidal variation simulating shift handoffs, day/night cycles
    const hourOfDay = new Date(time).getHours();
    const peakFactor = Math.sin((hourOfDay - 6) / 12 * Math.PI); // peak around 12-15h

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

export const INITIAL_MOCK_ROOMS: Record<string, RoomData> = {
  icu: {
    id: 'icu',
    name: 'ICU Suite 401',
    zone: 'icu',
    pressurePa: -14.2,
    achTarget: 16,
    latest: {
      temperature: 20.8,
      humidity: 48,
      co2: 440,
      tvoc: 52,
      dust: 3.1,
      gas: 195,
      timestamp: Date.now()
    },
    history: generateHistory({ temperature: 20.8, humidity: 48, co2: 440, dust: 3.1 }),
    device: {
      wifiRssi: -62,
      uptime: 142850,
      sensorStatus: 'nominal',
      online: true,
      lastSeen: Date.now()
    }
  },
  ot: {
    id: 'ot',
    name: 'Operating Theatre 1',
    zone: 'ot',
    pressurePa: 24.8,
    achTarget: 22,
    latest: {
      temperature: 19.5,
      humidity: 51,
      co2: 418,
      tvoc: 40,
      dust: 1.8,
      gas: 172,
      timestamp: Date.now()
    },
    history: generateHistory({ temperature: 19.5, humidity: 51, co2: 418, dust: 1.8 }),
    device: {
      wifiRssi: -55,
      uptime: 298400,
      sensorStatus: 'nominal',
      online: true,
      lastSeen: Date.now()
    }
  },
  ward: {
    id: 'ward',
    name: 'General Ward East',
    zone: 'ward',
    pressurePa: 4.5,
    achTarget: 8,
    latest: {
      temperature: 22.1,
      humidity: 45,
      co2: 580,
      tvoc: 140,
      dust: 8.4,
      gas: 230,
      timestamp: Date.now()
    },
    history: generateHistory({ temperature: 22.1, humidity: 45, co2: 580, dust: 8.4 }),
    device: {
      wifiRssi: -68,
      uptime: 89400,
      sensorStatus: 'nominal',
      online: true,
      lastSeen: Date.now()
    }
  },
  pharmacy: {
    id: 'pharmacy',
    name: 'Pharmacy Sterile Core',
    zone: 'general',
    pressurePa: 18.0,
    achTarget: 14,
    latest: {
      temperature: 18.9,
      humidity: 42,
      co2: 410,
      tvoc: 35,
      dust: 1.2,
      gas: 165,
      timestamp: Date.now()
    },
    history: generateHistory({ temperature: 18.9, humidity: 42, co2: 410, dust: 1.2 }),
    device: {
      wifiRssi: -58,
      uptime: 541200,
      sensorStatus: 'nominal',
      online: true,
      lastSeen: Date.now()
    }
  },
  waiting: {
    id: 'waiting',
    name: 'Emergency Waiting Hall',
    zone: 'general',
    pressurePa: 0.0,
    achTarget: 12,
    latest: {
      temperature: 23.4,
      humidity: 52,
      co2: 842,
      tvoc: 260,
      dust: 14.2,
      gas: 310,
      timestamp: Date.now()
    },
    history: generateHistory({ temperature: 23.4, humidity: 52, co2: 842, dust: 14.2 }),
    device: {
      wifiRssi: -74,
      uptime: 43200,
      sensorStatus: 'warning',
      online: true,
      lastSeen: Date.now()
    }
  },
  lab: {
    id: 'lab',
    name: 'Pathogen Bio-Lab 3',
    zone: 'general',
    pressurePa: -32.0,
    achTarget: 20,
    latest: {
      temperature: 20.0,
      humidity: 44,
      co2: 425,
      tvoc: 48,
      dust: 2.1,
      gas: 180,
      timestamp: Date.now()
    },
    history: generateHistory({ temperature: 20.0, humidity: 44, co2: 425, dust: 2.1 }),
    device: {
      wifiRssi: -60,
      uptime: 382900,
      sensorStatus: 'nominal',
      online: true,
      lastSeen: Date.now()
    }
  }
};

export const INITIAL_MOCK_ALERTS: Record<string, AlertData> = {
  alert_1: {
    alertId: 'alert_1',
    roomId: 'waiting',
    roomName: 'Emergency Waiting Hall',
    type: 'co2_spike',
    severity: 'warning',
    message: 'CO₂ elevated to 842 ppm (Threshold: 800 ppm). Vent damper throttled to 68%.',
    timestamp: Date.now() - 1000 * 60 * 12, // 12 mins ago
    acknowledged: false
  },
  alert_2: {
    alertId: 'alert_2',
    roomId: 'ot',
    roomName: 'Operating Theatre 1',
    type: 'filter_hepa',
    severity: 'warning',
    message: 'HEPA filter pressure differential reached 285 Pa inspection benchmark.',
    timestamp: Date.now() - 1000 * 60 * 35, // 35 mins ago
    acknowledged: false
  },
  alert_3: {
    alertId: 'alert_3',
    roomId: 'pharmacy',
    roomName: 'Pharmacy Sterile Core',
    type: 'rh_deviation',
    severity: 'warning',
    message: 'Relative Humidity stabilized back to nominal 42% after autoclave purge.',
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    acknowledged: true
  }
};

export const INITIAL_MOCK_CONTROLS: Record<string, RoomControl> = {
  icu: { roomId: 'icu', mode: 'auto', fan: true, damper: 75, uvc: true, carbonBed: true },
  ot: { roomId: 'ot', mode: 'auto', fan: true, damper: 85, uvc: true, carbonBed: true },
  ward: { roomId: 'ward', mode: 'auto', fan: false, damper: 40, uvc: false, carbonBed: false },
  pharmacy: { roomId: 'pharmacy', mode: 'auto', fan: true, damper: 60, uvc: true, carbonBed: true },
  waiting: { roomId: 'waiting', mode: 'manual', fan: true, damper: 68, uvc: true, carbonBed: false },
  lab: { roomId: 'lab', mode: 'auto', fan: true, damper: 90, uvc: true, carbonBed: true }
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
