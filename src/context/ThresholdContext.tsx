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
    presetName: 'ISO 14644 Class 6 / Grade B (Strict Sterile)',
    co2Max: 650,
    dustMax: 10,
    gasMax: 150,
    tvocMax: 120,
    tempMin: 20.0,
    tempMax: 22.0,
    humidityMin: 42.0,
    humidityMax: 50.0,
    aqiWarningThreshold: 80
  },
  icu_suite: {
    preset: 'icu_suite',
    presetName: 'ICU Critical Isolation (Pathogen Defense)',
    co2Max: 750,
    dustMax: 18,
    gasMax: 250,
    tvocMax: 200,
    tempMin: 19.5,
    tempMax: 23.0,
    humidityMin: 40.0,
    humidityMax: 58.0,
    aqiWarningThreshold: 72
  },
  general_ward: {
    preset: 'general_ward',
    presetName: 'General Hospital Ward & Outpatient (Standard)',
    co2Max: 950,
    dustMax: 30,
    gasMax: 350,
    tvocMax: 350,
    tempMin: 20.0,
    tempMax: 25.5,
    humidityMin: 35.0,
    humidityMax: 65.0,
    aqiWarningThreshold: 62
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
    return PRESET_CONFIGS.iso_cleanroom;
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
    setThresholds(PRESET_CONFIGS.iso_cleanroom);
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
