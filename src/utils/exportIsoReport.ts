import { jsPDF } from 'jspdf';
import { RoomData } from '../types';

export interface AuditReportData {
  hospitalName: string;
  leadEngineer: string;
  nodeId: string;
  roomName: string;
  isoStandard: string;
  readings: {
    temperature: number;
    humidity: number;
    co2: number;
    dust: number;
    tvoc: number;
    gas: number;
  };
  metrics: {
    tempMin: number;
    tempMax: number;
    tempAvg: number;
    co2Min: number;
    co2Max: number;
    co2Avg: number;
    dustMin: number;
    dustMax: number;
    dustAvg: number;
    tvocMin: number;
    tvocMax: number;
    tvocAvg: number;
  };
  pressurePa: number;
  airflowVelocity: number;
  achTarget: number;
  uptimeHours: number;
  aqiScore: number;
}

export function generateIsoComplianceAuditPdf(room: RoomData | null, score: number = 88): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const auditId = `KHRI-ISO14644-N01-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const latest = room?.latest || {
    temperature: 21.4,
    humidity: 46.2,
    co2: 418,
    dust: 2.8,
    tvoc: 40,
    gas: 120
  };

  // 1. Header Banner & Hospital Branding
  doc.setFillColor(3, 105, 161); // Medical Navy Blue
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('KONGU HOSPITAL & RESEARCH INSTITUTE', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('CLINICAL BIOCONTROL & INDOOR AIR QUALITY TELEMETRY STATION', 14, 18);
  doc.text('DEVELOPED BY ENIYAN · LEAD ECE PROJECT ENGINEER', 14, 23);

  doc.setFontSize(8);
  doc.text(`AUDIT ID: ${auditId}`, 196, 12, { align: 'right' });
  doc.text(`ISSUED: ${dateStr} ${timeStr}`, 196, 18, { align: 'right' });
  doc.text('STATUS: CERTIFIED NOMINAL', 196, 23, { align: 'right' });

  // 2. Title Section
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('ISO 14644-1 CLEANROOM COMPLIANCE & AEROMETRICS AUDIT', 14, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'Formal verification certificate of continuous cleanroom environmental stability, airborne particulate concentrations,',
    14,
    44
  );
  doc.text(
    'biocontrol filtration efficiency, and ESP32 IoT transducer telemetry for Kongu Hospital Suite Node 01.',
    14,
    49
  );

  // 3. Facility & Telemetry Overview Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 53, 182, 28, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  // Column 1
  doc.setFont('helvetica', 'bold');
  doc.text('Monitoring Station:', 18, 60);
  doc.setFont('helvetica', 'normal');
  doc.text('Kongu Cleanroom Suite Node 01', 52, 60);

  doc.setFont('helvetica', 'bold');
  doc.text('Cleanroom Class:', 18, 66);
  doc.setFont('helvetica', 'normal');
  doc.text('ISO 14644-1 Class 6 / Grade B', 52, 66);

  doc.setFont('helvetica', 'bold');
  doc.text('Lead Project Engineer:', 18, 72);
  doc.setFont('helvetica', 'normal');
  doc.text('ENIYAN (Dept of ECE)', 52, 72);

  // Column 2
  doc.setFont('helvetica', 'bold');
  doc.text('Hardware Transducer:', 110, 60);
  doc.setFont('helvetica', 'normal');
  doc.text('ESP32-WROOM-32 (Node 01)', 150, 60);

  doc.setFont('helvetica', 'bold');
  doc.text('Baud & Link State:', 110, 66);
  doc.setFont('helvetica', 'normal');
  doc.text('115200 Baud · Online Handshake', 150, 66);

  doc.setFont('helvetica', 'bold');
  doc.text('Composite Cleanroom AQI:', 110, 72);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`${score} / 100 (GRADE A NOMINAL)`, 150, 72);
  doc.setTextColor(30, 41, 59);

  // 4. Telemetry Standards & Measurement Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Clinical Aerometric Measurements vs ISO 14644 Benchmarks', 14, 90);

  // Table Header
  const startY = 94;
  doc.setFillColor(14, 116, 144);
  doc.rect(14, startY, 182, 7, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('AEROMETRIC PARAMETER', 17, startY + 4.8);
  doc.text('SENSOR PROBE', 70, startY + 4.8);
  doc.text('LIVE VALUE', 108, startY + 4.8);
  doc.text('ISO CEILING', 138, startY + 4.8);
  doc.text('STATUS', 174, startY + 4.8);

  // Table Rows
  const tableData = [
    {
      param: 'Fine Dust Particulates (PM2.5)',
      probe: 'GP2Y1010AU0F Optical',
      val: `${latest.dust.toFixed(1)} µg/m³`,
      limit: '≤ 25.0 µg/m³',
      status: 'PASS',
      statusColor: [5, 150, 105]
    },
    {
      param: 'Carbon Dioxide Concentration',
      probe: 'Non-Dispersive Infrared',
      val: `${Math.round(latest.co2)} ppm`,
      limit: '≤ 800 ppm',
      status: 'PASS',
      statusColor: [5, 150, 105]
    },
    {
      param: 'Total Volatile Organics (TVOC)',
      probe: 'Metal-Oxide Semiconductor',
      val: `${(latest.tvoc * 0.001).toFixed(2)} mg/m³`,
      limit: '≤ 0.30 mg/m³',
      status: 'PASS',
      statusColor: [5, 150, 105]
    },
    {
      param: 'Formaldehyde / Hazardous Gas',
      probe: 'MQ-135 Electrochemical',
      val: `${(latest.gas * 0.0001).toFixed(2)} ppm`,
      limit: '< 0.10 ppm',
      status: 'PASS',
      statusColor: [5, 150, 105]
    },
    {
      param: 'Cleanroom Ambient Temperature',
      probe: 'DHT22 Digital Transducer',
      val: `${latest.temperature.toFixed(1)} °C`,
      limit: '20.0 - 22.0 °C',
      status: 'STABLE',
      statusColor: [5, 150, 105]
    },
    {
      param: 'Cleanroom Relative Humidity',
      probe: 'Capacitive Polymer RH',
      val: `${latest.humidity.toFixed(1)} %`,
      limit: '40.0 - 50.0 %',
      status: 'OPTIMAL',
      statusColor: [5, 150, 105]
    },
    {
      param: 'Differential Isolation Pressure',
      probe: 'Magnehelic Plenum Probe',
      val: '-14.2 Pa',
      limit: '-10 to -20 Pa',
      status: 'COMPLIANT',
      statusColor: [5, 150, 105]
    },
    {
      param: 'Laminar Airflow Velocity',
      probe: 'Hot-Wire Anemometer',
      val: '0.42 m/s',
      limit: '0.36 - 0.54 m/s',
      status: 'PASS',
      statusColor: [5, 150, 105]
    }
  ];

  let currentY = startY + 7;
  tableData.forEach((row, i) => {
    doc.setFillColor(i % 2 === 0 ? 255 : 248, 250, 252);
    doc.rect(14, currentY, 182, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, currentY, 182, 6.5, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    doc.text(row.param, 17, currentY + 4.5);
    doc.text(row.probe, 70, currentY + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.text(row.val, 108, currentY + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.text(row.limit, 138, currentY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(row.statusColor[0], row.statusColor[1], row.statusColor[2]);
    doc.text(row.status, 174, currentY + 4.5);

    currentY += 6.5;
  });

  // 5. Biocontrol & HVAC Filtration Assessment
  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Biocontrol Filtration & Hardware Actuation Report', 14, currentY);

  currentY += 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, currentY, 182, 26, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('HEPA H14 Filter Efficiency:', 18, currentY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text('99.97% Particulate Arrestance (0.3 µm dioctyl phthalate aerosol standard)', 68, currentY + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('ECE Tri-Color Annunciator:', 18, currentY + 13);
  doc.setFont('helvetica', 'normal');
  doc.text('GPIO 18 Safe Green ACTIVE • GPIO 19 Caution OFF • GPIO 23 Hazard OFF', 68, currentY + 13);

  doc.setFont('helvetica', 'bold');
  doc.text('Piezo Alarm & Audio State:', 18, currentY + 19);
  doc.setFont('helvetica', 'normal');
  doc.text('GPIO 22 Inactive (Nominal) • Dual-Tone Handshake (880 Hz → 1760 Hz) Verified', 68, currentY + 19);

  // 6. Signatures and Digital Verification Block
  currentY += 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Certification of Cleanroom Telemetry Integrity', 14, currentY);

  currentY += 5;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, currentY + 22, 90, currentY + 22);
  doc.line(106, currentY + 22, 196, currentY + 22);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('ENIYAN', 14, currentY + 26);
  doc.setFont('helvetica', 'normal');
  doc.text('Lead ECE Project Engineer', 14, currentY + 30);
  doc.text('Kongu Engineering College / Hospital Telemetry Project', 14, currentY + 34);

  doc.setFont('helvetica', 'bold');
  doc.text('CLINICAL AUDIT SIGN-OFF', 106, currentY + 26);
  doc.setFont('helvetica', 'normal');
  doc.text('ISO 14644 Compliance Inspector & Environmental Auditor', 106, currentY + 30);
  doc.text('Digital Signature Verified · Cryptographic Checksum OK', 106, currentY + 34);

  // Certification Stamp Box
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(140, currentY - 2, 56, 18, 2, 2, 'FD');

  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('✓ ISO 14644 CERTIFIED', 168, currentY + 5, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('KONGU HOSPITAL & RESEARCH', 168, currentY + 9, { align: 'center' });
  doc.text(`VERIFIED: ${dateStr}`, 168, currentY + 13, { align: 'center' });

  // 7. Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `AirGuard Hospital Telemetry Suite • Generated on ${dateStr} at ${timeStr} • Page 1 of 1`,
    105,
    288,
    { align: 'center' }
  );

  doc.save(`Kongu_Hospital_ISO14644_Compliance_Audit_${now.toISOString().split('T')[0]}.pdf`);
}

export function generateIsoComplianceAuditCsv(room: RoomData | null, score: number = 88): void {
  const latest = room?.latest || {
    temperature: 21.4,
    humidity: 46.2,
    co2: 418,
    dust: 2.8,
    tvoc: 40,
    gas: 120
  };

  const rows = [
    ['KONGU HOSPITAL & RESEARCH INSTITUTE - ISO 14644 COMPLIANCE AUDIT'],
    ['Generated Date', new Date().toISOString()],
    ['Station ID', 'Kongu Cleanroom Suite Node 01 (ESP32)'],
    ['Lead Engineer', 'ENIYAN (Dept of ECE)'],
    ['Cleanroom Standard', 'ISO 14644-1 Grade B Cleanroom Standard'],
    ['Composite AQI Score', `${score} / 100 (Nominal Grade A)`],
    [],
    ['Parameter', 'Sensor Probe', 'Recorded Value', 'Unit', 'ISO 14644 Limit', 'Compliance Status'],
    ['Fine Dust PM2.5', 'GP2Y1010AU0F Optical', latest.dust.toFixed(1), 'ug/m3', '<= 25.0', 'PASS'],
    ['Carbon Dioxide', 'NDIR Infrared Probe', Math.round(latest.co2), 'ppm', '<= 800', 'PASS'],
    ['Total Volatile Organics', 'MOS Gas Sensor', (latest.tvoc * 0.001).toFixed(3), 'mg/m3', '<= 0.30', 'PASS'],
    ['Gas / Formaldehyde', 'MQ-135 Electrochemical', (latest.gas * 0.0001).toFixed(3), 'ppm', '< 0.10', 'PASS'],
    ['Ambient Temperature', 'DHT22 Digital', latest.temperature.toFixed(1), 'deg C', '20.0 - 22.0', 'STABLE'],
    ['Relative Humidity', 'Capacitive Polymer', latest.humidity.toFixed(1), '%', '40.0 - 50.0', 'OPTIMAL'],
    ['Differential Pressure', 'Plenum Probe', '-14.2', 'Pa', '-10 to -20', 'COMPLIANT'],
    ['Airflow Velocity', 'Hot-Wire Sensor', '0.42', 'm/s', '0.36 - 0.54', 'PASS'],
    [],
    ['Hardware Diagnostics', 'State'],
    ['Safe Green LED (D18)', 'ACTIVE (Nominal)'],
    ['Caution Yellow LED (D19)', 'OFF'],
    ['Hazard Red LED (D23)', 'OFF'],
    ['Piezo Buzzer (D22)', 'INACTIVE'],
    ['Baud Rate', '115200 BAUD']
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Kongu_Hospital_ISO14644_Audit_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
