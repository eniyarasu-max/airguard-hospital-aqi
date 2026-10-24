# AirGuard · Hospital Indoor Air Quality & Clinical Aerometrics Dashboard

AirGuard is a hospital-grade, real-time indoor air quality (AQI) telemetry and HVAC diagnostics dashboard. Built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Firebase Realtime Database (v9+ Modular SDK)**, it faithfully recreates the luminous clinical glassmorphism and skeuomorphic instrumentation designed in Google Stitch.

---

## 🚀 Quick Start

### 1. Install Dependencies & Start Dev Server
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note:** By default, AirGuard starts in **Demo Mode** if placeholder Firebase keys are detected, generating realistic live simulation telemetry for all 6 specialized hospital chambers (ICU, Operating Theatre, General Ward, Pharmacy Sterile Core, Emergency Waiting Hall, and Pathogen Bio-Lab).

---

## ⚙️ Connecting Your Real Firebase Realtime Database

### Step 1: Add Your Firebase Config
Open [`src/firebase.ts`](file:///e:/stitch_airguard_hospital_aqi_dashboard/src/firebase.ts) and replace the placeholder keys with your project credentials from the **Firebase Console** (*Project Settings* → *General* → *Your Apps*):

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyYourActualKeyHere...",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### Step 2: Set Database Security Rules
In the **Firebase Console**, navigate to **Build** → **Realtime Database** → **Rules**, and paste the following rules:

```json
{
  "rules": {
    "rooms": {
      ".read": true,
      "$roomId": {
        ".write": true,
        "latest": {
          ".validate": "newData.hasChildren(['temperature', 'humidity', 'co2', 'tvoc', 'dust', 'gas', 'timestamp'])"
        },
        "device": {
          ".validate": "newData.hasChildren(['lastSeen'])"
        }
      }
    },
    "alerts": {
      ".read": true,
      "$alertId": {
        ".write": true
      }
    },
    "control": {
      ".read": true,
      "$roomId": {
        ".write": true
      }
    }
  }
}
```

---

## 📡 ESP32 Hardware Data Structure

An ESP32 microcontroller with sensors (e.g., DHT22/BME280 for Temp/RH, MQ-135 for Gas/VOC, and PMS5003 for PM2.5 Dust) pushes data over HTTPS/REST or WebSockets to Firebase at:

### 1. Room Telemetry (`/rooms/{roomId}/`)
```json
{
  "name": "ICU Suite 401",
  "zone": "icu",
  "latest": {
    "temperature": 20.8,
    "humidity": 48.0,
    "co2": 440,
    "tvoc": 52,
    "dust": 3.1,
    "gas": 195,
    "timestamp": 1729674000000
  },
  "history": {
    "-O8xF0...": {
      "temperature": 20.8,
      "humidity": 48.0,
      "co2": 440,
      "tvoc": 52,
      "dust": 3.1,
      "gas": 195,
      "timestamp": 1729674000000
    }
  },
  "device": {
    "wifiRssi": -62,
    "uptime": 142850,
    "sensorStatus": "nominal",
    "online": true,
    "lastSeen": 1729674000000
  }
}
```

### 2. Ventilation Control (`/control/{roomId}/`)
```json
{
  "mode": "auto",
  "fan": true,
  "damper": 78
}
```

### 3. Alerts Stream (`/alerts/{alertId}/`)
```json
{
  "roomId": "icu",
  "type": "co2_spike",
  "severity": "warning",
  "message": "ICU Suite 401: CO₂ elevated to 720 ppm (Ceiling: 700 ppm)",
  "timestamp": 1729674000000,
  "acknowledged": false
}
```

---

## 🧮 AQI Calculation Formula & Thresholds

AirGuard calculates an environmental biocontrol score from **0 to 100** (where **100 is pristine cleanroom air** and **<50 is poor/hazardous**) located in [`src/utils/aqi.ts`](file:///e:/stitch_airguard_hospital_aqi_dashboard/src/utils/aqi.ts):

$$\text{AQI} = 0.30 \cdot S_{\text{CO}_2} + 0.25 \cdot S_{\text{Dust}} + 0.20 \cdot S_{\text{TVOC}} + 0.15 \cdot S_{\text{RH}} + 0.10 \cdot S_{\text{Temp}}$$

### Status Categories:
- **Good (80 – 100)**: `#059669` (Sterile Emerald) — Meets ISO Class 5–7 cleanroom standards.
- **Moderate (50 – 79)**: `#d97706` (Clinical Amber) — Parameter watch; auto exhaust activates.
- **Poor (< 50)**: `#dc2626` (Surgical Alert Red) — Bio-hazard threshold breached; purge triggered.

### Clinical Zone Matrix:
| Clinical Zone | Max CO₂ | Max PM2.5 | Max TVOC | Temp Spec | RH Spec | AQI Warning Limit |
|---|---|---|---|---|---|---|
| **Operating Theatre (`ot`)** | 650 ppm | 8 µg/m³ | 120 ppb | 18–22 °C | 42–58 % | < 80 AQI |
| **Intensive Care (`icu`)** | 700 ppm | 10 µg/m³ | 150 ppb | 19–23 °C | 40–60 % | < 75 AQI |
| **General Ward (`ward`)** | 900 ppm | 20 µg/m³ | 300 ppb | 20–25 °C | 35–65 % | < 65 AQI |
| **General Areas (`general`)** | 1000 ppm | 25 µg/m³ | 400 ppb | 19–26 °C | 30–70 % | < 60 AQI |

---

## 🧩 Key Architecture

- **`src/firebase.ts`**: Modular Firebase v9+ initialization with placeholder detection and safe fallbacks.
- **`src/utils/aqi.ts`**: Weighted 0–100 AQI calculation and zone thresholds.
- **`src/utils/mockData.ts`**: Realistic hospital telemetry generator and jitter engine for Demo Mode.
- **`src/hooks/useRooms.ts`**: Real-time Firebase `onValue` listener with 60-second device heartbeat timeout detection.
- **`src/hooks/useAlerts.ts`**: Auto-alert generator with 5-minute deduplication and Firebase synchronization.
- **`src/hooks/useControl.ts`**: Automated and manual HVAC fan actuators synced to `/control/{roomId}`.
- **`src/components/AqiDial.tsx`**: Machined circular skeuomorphic gauge with animated needle and conic gradient bezel.
- **`src/components/SensorTile.tsx`**: High-fidelity tiles with live SVG sparklines.
- **`src/components/TrendChart.tsx`**: Recharts 24-hour volatility trace with 1H / 24H / 7D / 30D switchers and dashed hospital thresholds.
- **`src/components/RoomDetailModal.tsx`**: In-depth room inspection modal with per-sensor sub-gauges, history, and device health diagnostics.
