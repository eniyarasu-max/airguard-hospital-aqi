import React, { createContext, useContext, useState, useEffect } from 'react';

export type WardPreset = 'iso_cleanroom' | 'icu_suite' | 'general_ward' | 'custom';

export interface WardThresholds {
  preset: WardPreset;
  presetName: string;
  co2Max: number;        // ppm limit
  dustMax: number;       // µg/m³ PM2.5 limit
  gasMax: number;        // MQ-135 threshold
  tvocMax: number;       // ppb limit
  tempMin: number;       // °C
  tempMax: number;       // °C
  humidityMin: number;   // %
  humidityMax: number;   // %
  aqiWarningThreshold: number;
}

export const PRESET_CONFIGS: Record<Exclude<WardPreset, 'custom'>, WardThresholds> = {
  iso_cleanroom: {
    preset: 'iso_cleanroom',
    presetName: 'ISO 14644 Cleanroom Suite (Controlled Environment)',
    co2Max: 800,
    dustMax: 15,
    gasMax: 200,
    tvocMax: 150,
    tempMin: 18.0,
    tempMax: 28.0,
    humidityMin: 35.0,
    humidityMax: 75.0,
    aqiWarningThreshold: 80
  },
  icu_suite: {
    preset: 'icu_suite',
    presetName: 'ICU Critical Care & Airborne Isolation Suite',
    co2Max: 900,
    dustMax: 25,
    gasMax: 300,
    tvocMax: 250,
    tempMin: 18.0,
    tempMax: 31.0,
    humidityMin: 30.0,
    humidityMax: 82.0,
    aqiWarningThreshold: 72
  },
  general_ward: {
    preset: 'general_ward',
    presetName: 'Hospital Inpatient Ward & Ambient Suite (Nominal)',
    co2Max: 1100,
    dustMax: 35,
    gasMax: 450,
    tvocMax: 400,
    tempMin: 18.0,
    tempMax: 32.0,
    humidityMin: 25.0,
    humidityMax: 85.0,
    aqiWarningThreshold: 60
  }
};

interface ThresholdContextType {
  thresholds: WardThresholds;
  setPreset: (preset: WardPreset) => void;
  updateThreshold: (key: keyof WardThresholds, value: number) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'airguard_hospital_threshold_matrix';

const ThresholdContext = createContext<ThresholdContextType | undefined>(undefined);

export const ThresholdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [thresholds, setThresholds] = useState<WardThresholds>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return PRESET_CONFIGS.icu_suite;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(thresholds));
    } catch {}
  }, [thresholds]);

  const setPreset = (preset: WardPreset) => {
    if (preset === 'custom') {
      setThresholds((prev) => ({ ...prev, preset: 'custom', presetName: 'Custom Custom Ward Sliders' }));
    } else {
      setThresholds(PRESET_CONFIGS[preset]);
    }
  };

  const updateThreshold = (key: keyof WardThresholds, value: number) => {
    setThresholds((prev) => ({
      ...prev,
      preset: 'custom',
      presetName: 'Custom Ward Sliders',
      [key]: value
    }));
  };

  const resetToDefaults = () => {
    setThresholds(PRESET_CONFIGS.icu_suite);
  };

  return (
    <ThresholdContext.Provider value={{ thresholds, setPreset, updateThreshold, resetToDefaults }}>
      {children}
    </ThresholdContext.Provider>
  );
};

export const useThresholds = (): ThresholdContextType => {
  const context = useContext(ThresholdContext);
  if (!context) {
    throw new Error('useThresholds must be used within a ThresholdProvider');
  }
  return context;
};
