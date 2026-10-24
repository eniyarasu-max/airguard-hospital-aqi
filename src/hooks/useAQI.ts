import { useMemo } from 'react';
import { RoomData, AQIResult, ZoneThresholds } from '../types';
import { computeAQI } from '../utils/aqi';

export function useAQI(
  rooms: Record<string, RoomData>,
  selectedRoomId?: string,
  customThresholds?: Partial<ZoneThresholds>
) {
  return useMemo(() => {
    const roomList = Object.values(rooms);
    if (roomList.length === 0) {
      return {
        compositeAQI: 85,
        status: 'Good' as const,
        color: '#059669',
        label: 'Pristine · Cleanroom Grade A',
        activeRoom: null,
        roomAQIs: {} as Record<string, AQIResult>
      };
    }

    const roomAQIs: Record<string, AQIResult> = {};
    let totalScore = 0;

    roomList.forEach((r) => {
      const res = computeAQI(r.latest, r.zone, customThresholds);
      roomAQIs[r.id] = res;
      totalScore += res.score;
    });

    const avgScore = Math.round(totalScore / roomList.length);
    const targetRoom = selectedRoomId ? rooms[selectedRoomId] : roomList[0];
    const targetAQI = targetRoom ? roomAQIs[targetRoom.id] : null;

    // Use target room AQI if focused, otherwise facility average
    const finalScore = targetAQI ? targetAQI.score : avgScore;
    const finalResult = targetAQI ? targetAQI : computeAQI(
      roomList[0].latest,
      'general',
      customThresholds
    );

    return {
      compositeAQI: finalScore,
      status: finalResult.status,
      color: finalResult.color,
      label: finalResult.label,
      activeRoom: targetRoom,
      roomAQIs
    };
  }, [rooms, selectedRoomId, customThresholds]);
}
