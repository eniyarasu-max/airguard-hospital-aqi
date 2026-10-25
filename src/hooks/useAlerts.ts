import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, set, off, push, remove } from 'firebase/database';
import { database } from '../firebase';
import { AlertData, RoomData } from '../types';
import { ZONE_THRESHOLDS } from '../utils/aqi';

/**
 * AirGuard Alert Engine
 * ─────────────────────
 * • Subscribes to /alerts in Firebase RTDB (live mode).
 * • Auto-generates threshold-breach alerts with 5-minute per-type deduplication.
 * • Auto-RESOLVES (deletes from Firebase + clears local state) alerts whose
 *   readings have returned within spec — eliminates false-positive latching.
 * • Starts empty in live mode; uses no mock seed alerts.
 */
export function useAlerts(rooms: Record<string, RoomData>, demoMode: boolean) {
  const [alerts, setAlerts] = useState<Record<string, AlertData>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const lastAlertTimes = useRef<Record<string, number>>({});
  // Track which Firebase keys map to which deduplication keys so we can auto-clear
  const alertKeyMap = useRef<Record<string, string>>({}); // dedupeKey -> firebaseKey

  // ─── 1. Subscribe to /alerts in Firebase RTDB ───────────────────────────────
  useEffect(() => {
    if (demoMode) {
      setLoading(false);
      setAlerts({});
      return;
    }

    if (!database) {
      setLoading(false);
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
            // Reconstruct dedupeKey -> firebaseKey map
            const dKey = `${val.roomId || 'unknown'}_${val.type || 'general'}`;
            alertKeyMap.current[dKey] = key;
          });
          setAlerts(parsedAlerts);
        } else {
          setAlerts({});
        }
      },
      (err) => {
        console.error('[AirGuard] Firebase error on /alerts:', err);
        setLoading(false);
      }
    );

    return () => {
      off(alertsRef);
    };
  }, [demoMode]);

  // ─── 2. Acknowledge alert helper ─────────────────────────────────────────────
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    setAlerts((prev) => {
      if (!prev[alertId]) return prev;
      return { ...prev, [alertId]: { ...prev[alertId], acknowledged: true } };
    });

    if (!demoMode && database) {
      try {
        const targetRef = ref(database, `alerts/${alertId}/acknowledged`);
        await set(targetRef, true);
      } catch (err) {
        console.error('[AirGuard] Failed to update acknowledged state in Firebase:', err);
      }
    }
  }, [demoMode]);

  // ─── 3. Auto-resolve helper ───────────────────────────────────────────────────
  const resolveAlert = useCallback(async (dedupeKey: string) => {
    const firebaseKey = alertKeyMap.current[dedupeKey];
    if (!firebaseKey) return;

    // Clear from local state
    setAlerts((prev) => {
      const next = { ...prev };
      delete next[firebaseKey];
      return next;
    });

    // Clear from Firebase
    if (!demoMode && database) {
      try {
        const alertRef = ref(database, `alerts/${firebaseKey}`);
        await remove(alertRef);
      } catch (err) {
        console.error('[AirGuard] Failed to auto-resolve alert in Firebase:', err);
      }
    }

    // Remove map entry
    delete alertKeyMap.current[dedupeKey];
    // Reset deduplication timer so the alert can re-fire if condition returns
    delete lastAlertTimes.current[dedupeKey];
  }, [demoMode]);

  // ─── 4. Threshold evaluation: auto-generate + auto-resolve ───────────────────
  useEffect(() => {
    const now = Date.now();
    const DEDUPE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes per type per room

    Object.values(rooms).forEach((room) => {
      const { latest, zone, name, id } = room;
      const limits = ZONE_THRESHOLDS[zone] || ZONE_THRESHOLDS.general;

      const breachKeys = new Set<string>();

      // ── CO2 ──────────────────────────────────────────────────────────────────
      const co2Key = `${id}_co2_spike`;
      if (latest.co2 > limits.co2Max) {
        breachKeys.add(co2Key);
        const severity = latest.co2 > limits.co2Max * 1.4 ? 'critical' : 'warning';
        const dedupeKey = co2Key;
        const lastTime = lastAlertTimes.current[dedupeKey] || 0;
        if (now - lastTime > DEDUPE_WINDOW_MS) {
          lastAlertTimes.current[dedupeKey] = now;
          fireAlert({
            id, name, zone,
            type: 'co2_spike', severity, dedupeKey,
            message: `${name}: CO₂ elevated to ${latest.co2} ppm (ceiling: ${limits.co2Max} ppm).`
          });
        }
      } else {
        // Auto-resolve if back within spec
        if (alertKeyMap.current[co2Key]) resolveAlert(co2Key);
      }

      // ── Dust PM2.5 ───────────────────────────────────────────────────────────
      const dustKey = `${id}_dust_elevation`;
      if (latest.dust > limits.dustMax) {
        breachKeys.add(dustKey);
        const severity = latest.dust > limits.dustMax * 1.5 ? 'critical' : 'warning';
        const lastTime = lastAlertTimes.current[dustKey] || 0;
        if (now - lastTime > DEDUPE_WINDOW_MS) {
          lastAlertTimes.current[dustKey] = now;
          fireAlert({
            id, name, zone,
            type: 'dust_elevation', severity, dedupeKey: dustKey,
            message: `${name}: PM2.5 particulate spike at ${latest.dust} µg/m³ (limit: ${limits.dustMax} µg/m³).`
          });
        }
      } else {
        if (alertKeyMap.current[dustKey]) resolveAlert(dustKey);
      }

      // ── Humidity ─────────────────────────────────────────────────────────────
      const rhKey = `${id}_rh_deviation`;
      const rhOutOfSpec = latest.humidity < limits.humidityMin || latest.humidity > limits.humidityMax;
      if (rhOutOfSpec) {
        breachKeys.add(rhKey);
        const lastTime = lastAlertTimes.current[rhKey] || 0;
        if (now - lastTime > DEDUPE_WINDOW_MS) {
          lastAlertTimes.current[rhKey] = now;
          fireAlert({
            id, name, zone,
            type: 'rh_deviation', severity: 'warning', dedupeKey: rhKey,
            message: `${name}: RH ${latest.humidity}% is outside clinical spec (${limits.humidityMin}–${limits.humidityMax}%).`
          });
        }
      } else {
        if (alertKeyMap.current[rhKey]) resolveAlert(rhKey);
      }

      // ── Temperature ──────────────────────────────────────────────────────────
      const tempKey = `${id}_temp_deviation`;
      const tempOutOfSpec = latest.temperature < limits.tempMin || latest.temperature > limits.tempMax;
      if (tempOutOfSpec) {
        breachKeys.add(tempKey);
        const lastTime = lastAlertTimes.current[tempKey] || 0;
        if (now - lastTime > DEDUPE_WINDOW_MS) {
          lastAlertTimes.current[tempKey] = now;
          fireAlert({
            id, name, zone,
            type: 'temp_deviation', severity: 'warning', dedupeKey: tempKey,
            message: `${name}: Temperature ${latest.temperature}°C is outside clinical range (${limits.tempMin}–${limits.tempMax}°C).`
          });
        }
      } else {
        if (alertKeyMap.current[tempKey]) resolveAlert(tempKey);
      }

      // Suppress unused var warning
      void breachKeys;
    });

    // Helper scoped inside effect closure so resolveAlert is captured correctly
    function fireAlert(params: {
      id: string; name: string; zone: string;
      type: string; severity: 'warning' | 'critical'; dedupeKey: string; message: string;
    }) {
      const newAlert: AlertData = {
        alertId: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        roomId: params.id,
        roomName: params.name,
        type: params.type,
        severity: params.severity,
        message: params.message,
        timestamp: Date.now(),
        acknowledged: false
      };

      setAlerts((prev) => ({ [newAlert.alertId]: newAlert, ...prev }));

      if (!demoMode && database) {
        const alertsListRef = ref(database, 'alerts');
        push(alertsListRef, newAlert).then((newRef) => {
          // Map dedupeKey to the actual Firebase push key for later auto-resolve
          const fbKey = newRef.key;
          if (fbKey) {
            alertKeyMap.current[params.dedupeKey] = fbKey;
          }
        }).catch((err) => {
          console.error('[AirGuard] Could not push auto-alert to Firebase:', err);
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, demoMode]);

  return { alerts, loading, acknowledgeAlert };
}
