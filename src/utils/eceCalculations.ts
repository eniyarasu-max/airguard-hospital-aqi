import { HardwareIndicators, EceDiagnostics, SensorReadings } from '../types';

/**
 * ============================================================================
 *  ECE Metrology & Transducer Calculations
 *  Biomedical Instrumentation & Signal Processing Algorithms
 * ============================================================================
 */

// Magnus-Tetens Dew Point Constants
const MAGNUS_A = 17.27;
const MAGNUS_B = 237.7;

// ESP32 ADC & Circuit Constants
const ADC_VREF = 3.30;
const ADC_MAX_COUNTS = 4095;
const MQ135_RL_KOHM = 10.0;
const MQ135_R0_KOHM = 76.63;
const DUST_V_OFFSET = 0.55;
const DUST_SENSITIVITY = 0.005; // 0.005 V / (µg/m³)

/**
 * Calculate Dew Point (°C) from dry bulb temperature and relative humidity
 * using the Magnus-Tetens empirical equation.
 */
export function calculateDewPoint(tempC: number, humidityRh: number): number {
  if (humidityRh <= 0) return 0;
  const rhRatio = Math.max(0.01, Math.min(1.0, humidityRh / 100));
  const gamma = (MAGNUS_A * tempC) / (MAGNUS_B + tempC) + Math.log(rhRatio);
  const dewPoint = (MAGNUS_B * gamma) / (MAGNUS_A - gamma);
  return Number(dewPoint.toFixed(1));
}

/**
 * Bivariate atmospheric correction factor for SnO2 metal oxide semiconductor (MQ-135)
 */
export function calculateMq135CorrectionFactor(tempC: number, humidityRh: number): number {
  const t = Math.max(-10, Math.min(60, tempC));
  const rh = Math.max(5, Math.min(99, humidityRh));
  const factor = (-0.00035 * t * t) - (0.02718 * t) + 1.39538 - ((rh - 33.0) * 0.0018);
  return Number(Math.max(0.45, Math.min(1.85, factor)).toFixed(3));
}

/**
 * Compute ECE diagnostics from raw and physical transducer values
 */
export function computeEceDiagnostics(reading: Partial<SensorReadings>): EceDiagnostics {
  const temp = reading.temperature ?? 22.0;
  const rh = reading.humidity ?? 48.0;
  const rawGas = reading.gas ?? 380;
  const dust = reading.dust ?? 12.0;

  // Gas electrical values
  const gasVolt = Number(((rawGas / ADC_MAX_COUNTS) * ADC_VREF).toFixed(2));
  const rs = gasVolt > 0.01 ? (MQ135_RL_KOHM * (ADC_VREF - gasVolt)) / gasVolt : MQ135_RL_KOHM * 10;
  const rsR0Ratio = Number((rs / MQ135_R0_KOHM).toFixed(2));
  const rhCompFactor = calculateMq135CorrectionFactor(temp, rh);

  // Sharp dust sensor voltage approximation: Vo = V_offset + (dust * sensitivity)
  const dustVolt = Number(Math.min(ADC_VREF, DUST_V_OFFSET + (dust * DUST_SENSITIVITY)).toFixed(2));

  // Dew point
  const dewPoint = calculateDewPoint(temp, rh);

  return {
    rawGasAdc: rawGas,
    gasVoltage: gasVolt,
    rsR0Ratio,
    rhCompFactor,
    dustVoltage: dustVolt,
    dewPoint
  };
}

/**
 * Tri-state ECE indicator logic: Green / Yellow / Red LEDs and Piezo Buzzer
 * Thresholds:
 *   - SAFE / NORMAL: CO2 <= 800 ppm AND Dust <= 25 µg/m³
 *   - CAUTION / ELEVATED: CO2 801-1200 ppm OR Dust 26-50 µg/m³
 *   - HAZARD / CRITICAL: CO2 > 1200 ppm OR Dust > 50 µg/m³ OR Raw Gas > 2000
 */
export function evaluateHardwareIndicators(
  co2Ppm: number,
  dustDensity: number,
  rawGas?: number
): HardwareIndicators {
  const isHazard = co2Ppm > 1200 || dustDensity > 50 || (rawGas !== undefined && rawGas > 2000);
  const isCaution = !isHazard && (co2Ppm > 800 || dustDensity > 25 || (rawGas !== undefined && rawGas > 1000));

  if (isHazard) {
    return {
      ledGreen: false,
      ledYellow: false,
      ledRed: true,
      buzzer: true,
      state: 'hazard'
    };
  }

  if (isCaution) {
    return {
      ledGreen: false,
      ledYellow: true,
      ledRed: false,
      buzzer: false,
      state: 'caution'
    };
  }

  // Safe / Pristine
  return {
    ledGreen: true,
    ledYellow: false,
    ledRed: false,
    buzzer: false,
    state: 'safe'
  };
}
