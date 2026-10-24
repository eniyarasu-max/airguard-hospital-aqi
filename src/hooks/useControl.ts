import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, off } from 'firebase/database';
import { database } from '../firebase';
import { RoomControl, RoomData } from '../types';
import { computeAQI, ZONE_THRESHOLDS } from '../utils/aqi';
import { INITIAL_MOCK_CONTROLS } from '../utils/mockData';

export function useControl(rooms: Record<string, RoomData>, demoMode: boolean) {
  const [controls, setControls] = useState<Record<string, RoomControl>>(INITIAL_MOCK_CONTROLS);

  // 1. Subscribe to Firebase /control
  useEffect(() => {
    if (demoMode || !database) return;

    const controlRef = ref(database, 'control');
    const unsubscribe = onValue(controlRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val() as Record<string, any>;
        const parsed: Record<string, RoomControl> = {};
        Object.entries(val).forEach(([roomId, data]) => {
          parsed[roomId] = {
            roomId,
            mode: data.mode === 'manual' ? 'manual' : 'auto',
            fan: Boolean(data.fan),
            damper: data.damper ?? 70,
            uvc: data.uvc ?? true,
            carbonBed: data.carbonBed ?? true,
            ionization: data.ionization ?? false
          };
        });
        setControls((prev) => ({ ...prev, ...parsed }));
      }
    });

    return () => {
      off(controlRef);
    };
  }, [demoMode]);

  // 2. Automated ventilation trigger:
  // "In auto mode, the fan is requested ON when AQI drops below the threshold."
  useEffect(() => {
    Object.values(rooms).forEach((room) => {
      const roomCtrl = controls[room.id] || { roomId: room.id, mode: 'auto', fan: false };
      if (roomCtrl.mode === 'auto') {
        const aqiResult = computeAQI(room.latest, room.zone);
        const limits = ZONE_THRESHOLDS[room.zone] || ZONE_THRESHOLDS.general;
        const shouldFanBeOn = aqiResult.score < limits.aqiWarningThreshold;

        if (roomCtrl.fan !== shouldFanBeOn) {
          updateControl(room.id, { fan: shouldFanBeOn });
        }
      }
    });
  }, [rooms, controls]);

  const updateControl = useCallback(async (roomId: string, patch: Partial<RoomControl>) => {
    setControls((prev) => {
      const existing = prev[roomId] || { roomId, mode: 'auto', fan: false, damper: 70 };
      const updated = { ...existing, ...patch };
      return {
        ...prev,
        [roomId]: updated
      };
    });

    if (!demoMode && database) {
      try {
        const targetRef = ref(database, `control/${roomId}`);
        const current = controls[roomId] || { roomId, mode: 'auto', fan: false };
        await set(targetRef, {
          mode: patch.mode ?? current.mode,
          fan: patch.fan ?? current.fan,
          ...(patch.damper !== undefined && { damper: patch.damper }),
          ...(patch.uvc !== undefined && { uvc: patch.uvc }),
          ...(patch.carbonBed !== undefined && { carbonBed: patch.carbonBed }),
          ...(patch.ionization !== undefined && { ionization: patch.ionization })
        });
      } catch (err) {
        console.error(`[AirGuard] Failed to write control for room ${roomId}:`, err);
      }
    }
  }, [demoMode, controls]);

  return {
    controls,
    updateControl
  };
}
