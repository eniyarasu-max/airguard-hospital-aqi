import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

/**
 * Firebase Realtime Database Configuration
 * ----------------------------------------------------
 * Project: airguard-hospital-aqi
 * Console: https://console.firebase.google.com/project/airguard-hospital-aqi
 *
 * Firebase Database Path structure:
 *   /rooms/{roomId}/name          string
 *   /rooms/{roomId}/zone          "icu" | "ot" | "ward" | "general"
 *   /rooms/{roomId}/latest/       SensorReadings (temperature, humidity, co2, tvoc, dust, gas, timestamp)
 *   /rooms/{roomId}/history/{id}/ SensorReadings (same fields, push-ID keyed)
 *   /rooms/{roomId}/device/       wifiRssi, uptime, sensorStatus, online, lastSeen
 */
const firebaseConfig = {
  apiKey:            "AIzaSyBTJ4S7RHnb5L5L6N8eSOmGJKj-648dzQM",
  authDomain:        "airguard-hospital-aqi.firebaseapp.com",
  databaseURL:       "https://airguard-hospital-aqi-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "airguard-hospital-aqi",
  storageBucket:     "airguard-hospital-aqi.firebasestorage.app",
  messagingSenderId: "451744713646",
  appId:             "1:451744713646:web:1a829ca691830517c8d63f",
  measurementId:     "G-PRTWHLBCPW"
};

/**
 * Returns true when the config contains real (non-placeholder) credentials.
 * The app auto-switches to Demo Mode when this is false.
 */
export const isFirebaseConfigured = (): boolean => {
  return (
    Boolean(firebaseConfig.apiKey) &&
    !firebaseConfig.apiKey.includes('PLACEHOLDER') &&
    Boolean(firebaseConfig.databaseURL) &&
    firebaseConfig.databaseURL.startsWith('https://')
  );
};

// Initialize Firebase SDK (safe — only runs when real credentials are present)
let app: FirebaseApp | null = null;
let database: Database | null = null;

if (isFirebaseConfigured()) {
  try {
    // Avoid double-init if module is hot-reloaded in dev
    app = getApps().length === 0
      ? initializeApp(firebaseConfig)
      : getApps()[0];
    database = getDatabase(app);
    console.info('[AirGuard] Firebase Realtime Database connected ✅');
  } catch (err) {
    console.error('[AirGuard] Firebase init error — falling back to Demo Mode.', err);
    app = null;
    database = null;
  }
}

export { app, database };
export const db = database;
