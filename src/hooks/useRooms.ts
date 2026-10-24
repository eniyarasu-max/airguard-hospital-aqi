import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database, isFirebaseConfigured } from '../firebase';
import { RoomData } from '../types';
import { INITIAL_MOCK_ROOMS, simulateRoomUpdate } from '../utils/mockData';
import { evaluateHardwareIndicators, computeEceDiagnostics } from '../utils/eceCalculations';

const DEMO_MODE_STORAGE_KEY = 'airguard_demo_mode';

export function useRooms() {
  const [demoMode, setDemoModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
    // Default to demo mode if Firebase has placeholder keys
    return !isFirebaseConfigured();
  });

  const [rooms, setRooms] = useState<Record<string, RoomData>>(INITIAL_MOCK_ROOMS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const toggleDemoMode = useCallback((enabled?: boolean) => {
    setDemoModeState((prev) => {
      const next = enabled !== undefined ? enabled : !prev;
      localStorage.setItem(DEMO_MODE_STORAGE_KEY, String(next));
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

            const latestReadings = val.latest || {
              temperature: 21,
              humidity: 50,
              co2: 420,
              tvoc: 50,
              dust: 2.5,
              gas: 180,
              timestamp: now
            };

            const indicators = val.indicators ||
              val.latest?.indicators ||
              evaluateHardwareIndicators(latestReadings.co2, latestReadings.dust, latestReadings.gas);

            const ece = val.ece ||
              val.latest?.ece ||
              computeEceDiagnostics(latestReadings);

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

          // If only ICU is real hardware, merge simulated rooms for the other 5 units
          // "Only the ICU should be a real unit; the others are simulated."
          if (!parsedRooms.ot && INITIAL_MOCK_ROOMS.ot) parsedRooms.ot = INITIAL_MOCK_ROOMS.ot;
          if (!parsedRooms.ward && INITIAL_MOCK_ROOMS.ward) parsedRooms.ward = INITIAL_MOCK_ROOMS.ward;
          if (!parsedRooms.pharmacy && INITIAL_MOCK_ROOMS.pharmacy) parsedRooms.pharmacy = INITIAL_MOCK_ROOMS.pharmacy;
          if (!parsedRooms.waiting && INITIAL_MOCK_ROOMS.waiting) parsedRooms.waiting = INITIAL_MOCK_ROOMS.waiting;
          if (!parsedRooms.lab && INITIAL_MOCK_ROOMS.lab) parsedRooms.lab = INITIAL_MOCK_ROOMS.lab;

          setRooms(parsedRooms);
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
