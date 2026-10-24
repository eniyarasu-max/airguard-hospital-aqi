import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, set, off, push } from 'firebase/database';
import { database } from '../firebase';
import { AlertData, RoomData } from '../types';
import { ZONE_THRESHOLDS } from '../utils/aqi';
import { INITIAL_MOCK_ALERTS } from '../utils/mockData';

export function useAlerts(rooms: Record<string, RoomData>, demoMode: boolean) {
  const [alerts, setAlerts] = useState<Record<string, AlertData>>(INITIAL_MOCK_ALERTS);
  const [loading, setLoading] = useState<boolean>(true);
  const lastAlertTimes = useRef<Record<string, number>>({});

  // 1. Subscribe to /alerts from Firebase Realtime Database
  useEffect(() => {
    if (demoMode) {
      setLoading(false);
      return;
    }

    if (!database) {
      return;
    }

    setLoading(true);
    const alertsRef = ref(database, 'alerts');

    const unsubscribe = onValue(
      alertsRef,
      (snapshot) => {
        setLoading(false);
        if (snapshot.exists()) {
          const data = snapshot.val() as Record<string, any>;
          const parsedAlerts: Record<string, AlertData> = {};
          Object.entries(data).forEach(([key, val]) => {
            parsedAlerts[key] = {
              alertId: key,
              roomId: val.roomId || 'unknown',
              roomName: val.roomName || val.roomId,
              type: val.type || 'general',
              severity: val.severity || 'warning',
              message: val.message || 'Environmental parameter alert',
              timestamp: val.timestamp || Date.now(),
              acknowledged: Boolean(val.acknowledged)
            };
          });
          setAlerts(parsedAlerts);
        } else {
          setAlerts(INITIAL_MOCK_ALERTS);
        }
      },
      (err) => {
        console.error("[AirGuard] Firebase error on /alerts:", err);
        setLoading(false);
      }
    );

    return () => {
      off(alertsRef);
    };
  }, [demoMode]);

  // 2. Acknowledge alert helper
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    // Update local state immediately for snappy UX
    setAlerts((prev) => {
      if (!prev[alertId]) return prev;
      return {
        ...prev,
        [alertId]: {
          ...prev[alertId],
          acknowledged: true
        }
      };
    });

    // If Firebase is active and not in pure local mode, update Firebase Realtime Database
    if (!demoMode && database) {
      try {
        const targetRef = ref(database, `alerts/${alertId}/acknowledged`);
        await set(targetRef, true);
      } catch (err) {
        console.error("[AirGuard] Failed to update acknowledged state in Firebase:", err);
      }
    }
  }, [demoMode]);

  // 3. Auto-generate alert when reading crosses threshold (5-min deduplication)
  useEffect(() => {
    const now = Date.now();
    const DEDUPE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

    Object.values(rooms).forEach((room) => {
      const { latest, zone, name, id } = room;
      const limits = ZONE_THRESHOLDS[zone] || ZONE_THRESHOLDS.general;

      const candidates: Array<{ type: string; severity: 'warning' | 'critical'; message: string }> = [];

      // CO2 check
      if (latest.co2 > limits.co2Max) {
        const severity = latest.co2 > limits.co2Max * 1.3 ? 'critical' : 'warning';
        candidates.push({
          type: 'co2_spike',
          severity,
          message: `${name}: CO₂ elevated to ${latest.co2} ppm (Clinical ceiling: ${limits.co2Max} ppm).`
        });
      }

      // Dust PM2.5 check
      if (latest.dust > limits.dustMax) {
        const severity = latest.dust > limits.dustMax * 1.5 ? 'critical' : 'warning';
        candidates.push({
          type: 'dust_elevation',
          severity,
          message: `${name}: PM2.5 particulate spike at ${latest.dust} µg/m³ (Cleanroom limit: ${limits.dustMax} µg/m³).`
        });
      }

      // Humidity check
      if (latest.humidity < limits.humidityMin || latest.humidity > limits.humidityMax) {
        candidates.push({
          type: 'rh_deviation',
          severity: 'warning',
          message: `${name}: RH ${latest.humidity}% deviated outside clinical spec (${limits.humidityMin}-${limits.humidityMax}%).`
        });
      }

      // Process candidates with deduplication
      candidates.forEach((cand) => {
        const dedupeKey = `${id}_${cand.type}`;
        const lastTime = lastAlertTimes.current[dedupeKey] || 0;

        if (now - lastTime > DEDUPE_WINDOW_MS) {
          lastAlertTimes.current[dedupeKey] = now;

          const newAlert: AlertData = {
            alertId: `alert_${now}_${Math.random().toString(36).substring(2, 6)}`,
            roomId: id,
            roomName: name,
            type: cand.type,
            severity: cand.severity,
            message: cand.message,
            timestamp: now,
            acknowledged: false
          };

          // Save locally
          setAlerts((prev) => ({
            [newAlert.alertId]: newAlert,
            ...prev
          }));

          // Push to Firebase if live
          if (!demoMode && database) {
            try {
              const alertsListRef = ref(database, 'alerts');
              const newRef = push(alertsListRef);
              set(newRef, newAlert);
            } catch (err) {
              console.error("[AirGuard] Could not push auto-alert to Firebase:", err);
            }
          }
        }
      });
    });
  }, [rooms, demoMode]);

  return {
    alerts,
    loading,
    acknowledgeAlert
  };
}
