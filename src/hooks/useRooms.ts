import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database, isFirebaseConfigured } from '../firebase';
import { RoomData, SensorReadings, EceDiagnostics } from '../types';
import { INITIAL_MOCK_ROOMS, simulateRoomUpdate } from '../utils/mockData';
import { evaluateHardwareIndicators, computeEceDiagnostics } from '../utils/eceCalculations';

const DEMO_MODE_STORAGE_KEY = 'airguard_demo_mode';

export function useRooms() {
  const [demoMode, setDemoModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
    // Default: Real hardware mode. Demo can be enabled via Settings.
    return false;
  });

  const [rooms, setRooms] = useState<Record<string, RoomData>>(INITIAL_MOCK_ROOMS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const toggleDemoMode = useCallback((enabled?: boolean) => {
    setDemoModeState((prev) => {
      const next = enabled !== undefined ? enabled : !prev;
      localStorage.setItem(DEMO_MODE_STORAGE_KEY, String(next));
      // When switching back to real mode, reset to offline state
      // so the UI waits for real ESP32 data rather than showing stale mock
      if (!next) {
        setRooms(INITIAL_MOCK_ROOMS);
      }
      return next;
    });
  }, []);

  // 1. Firebase Live Subscription when Demo Mode is OFF
  useEffect(() => {
    if (demoMode) {
      setLoading(false);
      setError(null);
      return;
    }

    if (!database) {
      setError("Firebase database is not initialized. Using simulated fallback.");
      return;
    }

    setLoading(true);
    const roomsRef = ref(database, 'rooms');

    const unsubscribe = onValue(
      roomsRef,
      (snapshot) => {
        setLoading(false);
        setError(null);
        if (snapshot.exists()) {
          const rawData = snapshot.val() as Record<string, any>;
          const parsedRooms: Record<string, RoomData> = {};
          const now = Date.now();

          Object.entries(rawData).forEach(([roomId, val]) => {
            const lastSeen = val.device?.lastSeen || val.latest?.timestamp || 0;
            // Requirement 7: Mark a device offline if there has been no update for 60 seconds
            const isOnline = now - lastSeen < 60000;

            const rawTemp = val.latest?.temperature;
            const rawHum = val.latest?.humidity;
            const isTempValid = typeof rawTemp === 'number' && rawTemp > -40 && rawTemp < 80;
            const isHumValid = typeof rawHum === 'number' && rawHum >= 0 && rawHum <= 100;

            const latestReadings: SensorReadings = {
              temperature: isTempValid ? rawTemp : 21.4,
              humidity: isHumValid ? rawHum : 46.5,
              co2: typeof val.latest?.co2 === 'number' && val.latest.co2 > 0 ? val.latest.co2 : 420,
              tvoc: typeof val.latest?.tvoc === 'number' ? val.latest.tvoc : 50,
              dust: typeof val.latest?.dust === 'number' && val.latest.dust >= 0 ? val.latest.dust : 2.5,
              gas: typeof val.latest?.gas === 'number' && val.latest.gas >= 0 ? val.latest.gas : 180,
              timestamp: val.latest?.timestamp || now
            };

            const indicators = val.indicators ||
              val.latest?.indicators ||
              evaluateHardwareIndicators(latestReadings.co2, latestReadings.dust, latestReadings.gas);

            const baseEce = computeEceDiagnostics(latestReadings);
            const ece: EceDiagnostics = {
              ...baseEce,
              ...(val.ece || {}),
              ...(val.latest?.ece || {})
            };

            latestReadings.indicators = indicators;
            latestReadings.ece = ece;

            parsedRooms[roomId] = {
              id: roomId,
              name: val.name || roomId,
              zone: val.zone || 'general',
              latest: latestReadings,
              history: val.history || {},
              device: {
                wifiRssi: val.device?.wifiRssi ?? -70,
                uptime: val.device?.uptime ?? 0,
                sensorStatus: val.device?.sensorStatus || 'nominal',
                online: isOnline,
                lastSeen: lastSeen
              },
              pressurePa: val.pressurePa ?? (val.zone === 'ot' ? 24.8 : val.zone === 'icu' ? -14.2 : 0),
              achTarget: val.achTarget ?? (val.zone === 'ot' ? 22 : val.zone === 'icu' ? 16 : 10),
              indicators,
              ece
            };
          });

          // Clean single-node presentation for Kongu Hospital Mini Project
          if (Object.keys(parsedRooms).length === 0) {
            setRooms(INITIAL_MOCK_ROOMS);
          } else {
            setRooms(parsedRooms);
          }
        } else {
          // Empty state: default with mock rooms so UI doesn't break
          setRooms(INITIAL_MOCK_ROOMS);
        }
      },
      (err) => {
        console.error("[AirGuard] Firebase error on /rooms:", err);
        setError(`Firebase error: ${err.message}. Using simulated telemetry.`);
        setLoading(false);
      }
    );

    return () => {
      off(roomsRef);
    };
  }, [demoMode]);

  // 2. Demo Mode Simulation Loop: periodic jitter every 3s
  useEffect(() => {
    if (!demoMode) return;

    const interval = setInterval(() => {
      setRooms((prev) => {
        const next: Record<string, RoomData> = {};
        Object.entries(prev).forEach(([id, room]) => {
          next[id] = simulateRoomUpdate(room);
        });
        return next;
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [demoMode]);

  // 3. Real-time liveness check: recalculate offline status every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setRooms((prev) => {
        let changed = false;
        const next = { ...prev };
        Object.entries(prev).forEach(([id, room]) => {
          const wasOnline = room.device.online;
          const isOnline = now - room.device.lastSeen < 60000;
          if (wasOnline !== isOnline) {
            changed = true;
            next[id] = {
              ...room,
              device: {
                ...room.device,
                online: isOnline
              }
            };
          }
        });
        return changed ? next : prev;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return {
    rooms,
    loading,
    error,
    demoMode,
    toggleDemoMode
  };
}
