import { SensorReadings, ZoneThresholds, ZoneType, AQIResult } from '../types';

/**
 * Hospital Clinical Aerometrics: Zone-Specific Environmental Thresholds
 * ---------------------------------------------------------------------
 * Specific clinical limits tailored for hospital environments:
 * - Operating Theatre (OT): Strictest laminar sterile standard (ISO Class 5-6)
 * - ICU: Critical airborne isolation and pathogen defense (ISO Class 6-7)
 * - Ward: Patient comfort and cross-infection mitigation
 * - General: Waiting areas, reception, and standard facility rooms
 */
export const ZONE_THRESHOLDS: Record<ZoneType, ZoneThresholds> = {
  ot: {
    co2Max: 650,        // ppm
    tvocMax: 120,       // ppb
    dustMax: 8,         // µg/m³ PM2.5
    tempMin: 18.0,      // °C
    tempMax: 22.0,      // °C
    humidityMin: 42.0,  // %
    humidityMax: 58.0,  // %
    aqiWarningThreshold: 80
  },
  icu: {
    co2Max: 700,
    tvocMax: 150,
    dustMax: 10,
    tempMin: 19.0,
    tempMax: 23.0,
    humidityMin: 40.0,
    humidityMax: 60.0,
    aqiWarningThreshold: 75
  },
  ward: {
    co2Max: 900,
    tvocMax: 300,
    dustMax: 20,
    tempMin: 20.0,
    tempMax: 25.0,
    humidityMin: 35.0,
    humidityMax: 65.0,
    aqiWarningThreshold: 65
  },
  general: {
    co2Max: 1000,
    tvocMax: 400,
    dustMax: 25,
    tempMin: 19.0,
    tempMax: 26.0,
    humidityMin: 30.0,
    humidityMax: 70.0,
    aqiWarningThreshold: 60
  }
};

/**
 * Normalization Weights for Hospital Air Quality Index (Sum = 1.0)
 * -----------------------------------------------------------------
 * Prioritizes hazardous airborne vectors: CO2 (stagnation) and Dust PM2.5 (pathogen carriers)
 */
const WEIGHTS = {
  co2: 0.30,         // 30% - Respiration and ventilation rate
  dust: 0.25,        // 25% - PM2.5 particulate matter and aerosol carriers
  tvoc: 0.20,        // 20% - Chemical / sterilizer fumes and solvents
  humidity: 0.15,    // 15% - Mucosal barrier and microbial survivability
  temperature: 0.10  // 10% - Thermal biocontrol
};

/**
 * Calculates a 0-100 subscore for a single-bounded contaminant (lower is better)
 */
function calculateContaminantSubscore(value: number, baseline: number, maxThreshold: number): number {
  if (value <= baseline) return 100;
  if (value >= maxThreshold * 1.5) return 0;
  if (value <= maxThreshold) {
    // 100 -> 60 between baseline and maxThreshold
    const fraction = (value - baseline) / (maxThreshold - baseline);
    return Math.round(100 - fraction * 40);
  }
  // 60 -> 0 above maxThreshold
  const fraction = (value - maxThreshold) / (maxThreshold * 0.5);
  return Math.max(0, Math.round(60 - fraction * 60));
}

/**
 * Calculates a 0-100 subscore for a dual-bounded metric (e.g. temp, humidity)
 */
function calculateRangeSubscore(value: number, minIdeal: number, maxIdeal: number, tolerance: number): number {
  if (value >= minIdeal && value <= maxIdeal) return 100;
  if (value < minIdeal) {
    const delta = minIdeal - value;
    if (delta >= tolerance) return 0;
    return Math.max(0, Math.round(100 - (delta / tolerance) * 70));
  } else {
    const delta = value - maxIdeal;
    if (delta >= tolerance) return 0;
    return Math.max(0, Math.round(100 - (delta / tolerance) * 70));
  }
}

/**
 * Compute the composite Air Quality Index (AQI: 0 - 100, higher is better)
 * 
 * Formula:
 * AQI = (W_co2 * S_co2) + (W_dust * S_dust) + (W_tvoc * S_tvoc) + (W_rh * S_rh) + (W_temp * S_temp)
 * 
 * Categorization:
 * - Good (80 - 100):   Emerald (#059669) - Pristine ISO Standard
 * - Moderate (50 - 79): Amber   (#d97706) - Advisory / Throttle HVAC
 * - Poor (< 50):       Red     (#dc2626) - Clinical Alert / Contamination Breach
 */
export function computeAQI(
  readings: SensorReadings,
  zone: ZoneType = 'general',
  customThresholds?: Partial<ZoneThresholds>
): AQIResult {
  const baseLimits = ZONE_THRESHOLDS[zone] || ZONE_THRESHOLDS.general;
  const limits = customThresholds ? { ...baseLimits, ...customThresholds } : baseLimits;

  // 1. CO2 Subscore (Baseline: 400 ppm atmospheric background)
  const co2Score = calculateContaminantSubscore(readings.co2 || 400, 420, limits.co2Max);

  // 2. Dust Subscore (PM2.5 Baseline: 2 µg/m³)
  const dustScore = calculateContaminantSubscore(readings.dust || 0, 2.5, limits.dustMax);

  // 3. TVOC Subscore (Baseline: 30 ppb clean background)
  const tvocScore = calculateContaminantSubscore(readings.tvoc || 0, 40, limits.tvocMax);

  // 4. Humidity Subscore
  const humScore = calculateRangeSubscore(
    readings.humidity || 50,
    limits.humidityMin,
    limits.humidityMax,
    15 // tolerance before 0
  );

  // 5. Temperature Subscore
  const tempScore = calculateRangeSubscore(
    readings.temperature || 21,
    limits.tempMin,
    limits.tempMax,
    5 // tolerance before 0
  );

  // Weighted sum
  const finalScore = Math.round(
    co2Score * WEIGHTS.co2 +
    dustScore * WEIGHTS.dust +
    tvocScore * WEIGHTS.tvoc +
    humScore * WEIGHTS.humidity +
    tempScore * WEIGHTS.temperature
  );

  const clampedScore = Math.max(0, Math.min(100, finalScore));

  let status: AQIResult['status'];
  let color: string;
  let label: string;

  if (clampedScore >= 80) {
    status = 'Good';
    color = '#059669'; // Sterile Emerald
    label = zone === 'ot' || zone === 'icu' ? 'Pristine · Cleanroom Grade A' : 'Optimal · Hospital Standard';
  } else if (clampedScore >= 50) {
    status = 'Moderate';
    color = '#d97706'; // Clinical Amber
    label = 'Moderate · Threshold Advisory';
  } else {
    status = 'Poor';
    color = '#dc2626'; // Surgical Alert Red
    label = 'Degraded · Bio-Hazard Warning';
  }

  return {
    score: clampedScore,
    status,
    color,
    label,
    subscores: {
      co2: co2Score,
      tvoc: tvocScore,
      dust: dustScore,
      humidity: humScore,
      temperature: tempScore
    }
  };
}

/**
 * Needle rotation angle in degrees for the skeuomorphic circular dial.
 * The arc spans roughly -120° (0 AQI) to +120° (100 AQI).
 */
export function aqiToNeedleAngle(aqi: number): number {
  // Clamped between 0 and 100
  const normalized = Math.max(0, Math.min(100, aqi));
  // 0 -> -120deg, 50 -> 0deg, 100 -> +120deg
  return -120 + (normalized / 100) * 240;
}
