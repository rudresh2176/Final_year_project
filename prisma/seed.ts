import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// All 5 fault types + all 5 warning types + normal readings
// Based on ML service thresholds:
//   Voltage: Normal 220-240V, Warning 207-220V or 240-253V, Fault <207V or >253V
//   Load:    Normal ≤95%, Warning 95-100%, Fault >100% (rated current = 8.7A)
//   Loss:    Normal ≤150W, Warning 150-300W, Fault >300W
//   Efficiency: Normal ≥90%, Warning 80-90%, Fault <80%

const sampleReadings = [
  // ──────────── NORMAL readings ────────────
  { pv: 231.2, pi: 8.4, pp: 1920.5, pe: 3.2, pf: 50.01, ppf: 0.98, sv: 118.6, si: 15.8, sp: 1854.2, se: 2.9, sf: 49.98, spf: 0.97, loss: 66.3, eff: 96.5, status: 'Normal', severity: 'Normal', faultType: null, warnings: null },
  { pv: 229.8, pi: 8.2, pp: 1870.1, pe: 3.1, pf: 50.00, ppf: 0.97, sv: 119.1, si: 15.5, sp: 1812.8, se: 2.8, sf: 49.99, spf: 0.97, loss: 57.3, eff: 96.9, status: 'Normal', severity: 'Normal', faultType: null, warnings: null },
  { pv: 230.5, pi: 8.6, pp: 1965.3, pe: 3.3, pf: 50.02, ppf: 0.99, sv: 118.2, si: 16.1, sp: 1890.7, se: 3.0, sf: 50.01, spf: 0.98, loss: 74.6, eff: 96.2, status: 'Normal', severity: 'Normal', faultType: null, warnings: null },
  { pv: 228.9, pi: 7.9, pp: 1798.4, pe: 3.0, pf: 49.99, ppf: 0.96, sv: 119.5, si: 14.9, sp: 1760.1, se: 2.7, sf: 49.98, spf: 0.96, loss: 38.3, eff: 97.9, status: 'Normal', severity: 'Normal', faultType: null, warnings: null },
  { pv: 232.1, pi: 8.8, pp: 2018.7, pe: 3.4, pf: 50.03, ppf: 0.98, sv: 117.8, si: 16.5, sp: 1929.8, se: 3.1, sf: 50.02, spf: 0.97, loss: 88.9, eff: 95.6, status: 'Normal', severity: 'Normal', faultType: null, warnings: null },

  // ──────────── FAULT TYPE 1: Over Voltage (>253V) ────────────
  { pv: 256.3, pi: 8.5, pp: 2152.8, pe: 3.6, pf: 50.02, ppf: 0.95, sv: 128.4, si: 16.2, sp: 2045.6, se: 3.4, sf: 50.01, spf: 0.93, loss: 107.2, eff: 95.0, status: 'Fault', severity: 'Medium', faultType: 'Over Voltage', warnings: null },
  { pv: 261.8, pi: 8.7, pp: 2248.5, pe: 3.8, pf: 49.97, ppf: 0.93, sv: 131.2, si: 16.5, sp: 2108.3, se: 3.5, sf: 49.96, spf: 0.91, loss: 140.2, eff: 93.8, status: 'Fault', severity: 'Medium', faultType: 'Over Voltage', warnings: null },
  { pv: 268.5, pi: 9.2, pp: 2436.2, pe: 4.1, pf: 49.92, ppf: 0.90, sv: 135.8, si: 17.1, sp: 2218.5, se: 3.7, sf: 49.90, spf: 0.88, loss: 217.7, eff: 91.1, status: 'Fault', severity: 'Medium', faultType: 'Over Voltage', warnings: null },

  // ──────────── FAULT TYPE 2: Under Voltage (<207V) ────────────
  { pv: 204.2, pi: 7.6, pp: 1534.5, pe: 2.6, pf: 49.98, ppf: 0.95, sv: 105.8, si: 14.2, sp: 1478.6, se: 2.5, sf: 49.97, spf: 0.93, loss: 55.9, eff: 96.4, status: 'Fault', severity: 'Medium', faultType: 'Under Voltage', warnings: null },
  { pv: 198.5, pi: 7.2, pp: 1418.3, pe: 2.4, pf: 49.95, ppf: 0.93, sv: 102.1, si: 13.6, sp: 1368.4, se: 2.3, sf: 49.94, spf: 0.91, loss: 49.9, eff: 96.5, status: 'Fault', severity: 'Medium', faultType: 'Under Voltage', warnings: null },
  { pv: 192.8, pi: 6.8, pp: 1298.7, pe: 2.2, pf: 49.90, ppf: 0.91, sv: 98.5, si: 12.8, sp: 1245.2, se: 2.1, sf: 49.88, spf: 0.89, loss: 53.5, eff: 95.9, status: 'Fault', severity: 'Medium', faultType: 'Under Voltage', warnings: null },

  // ──────────── FAULT TYPE 3: Over Load (>100%, current > 8.7A) ────────────
  { pv: 230.5, pi: 9.8, pp: 2238.6, pe: 3.7, pf: 50.00, ppf: 0.97, sv: 118.2, si: 18.5, sp: 2155.3, se: 3.6, sf: 49.99, spf: 0.95, loss: 83.3, eff: 96.3, status: 'Fault', severity: 'Medium', faultType: 'Over Load', warnings: null },
  { pv: 231.2, pi: 10.5, pp: 2398.4, pe: 4.0, pf: 50.01, ppf: 0.95, sv: 117.8, si: 19.8, sp: 2298.6, se: 3.9, sf: 50.00, spf: 0.93, loss: 99.8, eff: 95.8, status: 'Fault', severity: 'Medium', faultType: 'Over Load', warnings: null },
  { pv: 229.8, pi: 11.8, pp: 2684.5, pe: 4.5, pf: 49.98, ppf: 0.92, sv: 116.5, si: 22.1, sp: 2548.2, se: 4.3, sf: 49.97, spf: 0.90, loss: 136.3, eff: 94.9, status: 'Fault', severity: 'Medium', faultType: 'Over Load', warnings: null },

  // ──────────── FAULT TYPE 4: High Loss (>300W) ────────────
  { pv: 234.5, pi: 12.2, pp: 2796.8, pe: 4.7, pf: 49.98, ppf: 0.88, sv: 113.2, si: 19.5, sp: 2185.4, se: 3.7, sf: 49.96, spf: 0.85, loss: 611.4, eff: 78.1, status: 'Fault', severity: 'Medium', faultType: 'High Loss', warnings: null },
  { pv: 236.8, pi: 11.2, pp: 2623.8, pe: 4.4, pf: 49.95, ppf: 0.88, sv: 113.5, si: 18.1, sp: 2021.2, se: 3.6, sf: 49.90, spf: 0.85, loss: 602.6, eff: 77.0, status: 'Fault', severity: 'Medium', faultType: 'High Loss', warnings: null },
  { pv: 238.5, pi: 12.5, pp: 2948.1, pe: 5.0, pf: 49.92, ppf: 0.82, sv: 110.2, si: 18.5, sp: 2007.4, se: 3.5, sf: 49.88, spf: 0.80, loss: 940.7, eff: 68.1, status: 'Fault', severity: 'Medium', faultType: 'High Loss', warnings: '["Low Efficiency Warning"]' },

  // ──────────── FAULT TYPE 5: Low Efficiency (<80%) ────────────
  { pv: 230.2, pi: 9.5, pp: 2154.8, pe: 3.6, pf: 50.00, ppf: 0.93, sv: 112.8, si: 17.2, sp: 1654.2, se: 2.8, sf: 49.99, spf: 0.86, loss: 500.6, eff: 76.8, status: 'Fault', severity: 'Medium', faultType: 'Low Efficiency', warnings: '["High Loss Warning"]' },
  { pv: 231.5, pi: 10.2, pp: 2328.6, pe: 3.9, pf: 49.98, ppf: 0.91, sv: 110.5, si: 18.5, sp: 1728.4, se: 2.9, sf: 49.97, spf: 0.84, loss: 600.2, eff: 74.2, status: 'Fault', severity: 'Medium', faultType: 'Low Efficiency', warnings: '["High Loss Warning"]' },
  { pv: 229.8, pi: 10.8, pp: 2442.5, pe: 4.1, pf: 49.96, ppf: 0.89, sv: 108.2, si: 19.2, sp: 1685.6, se: 2.8, sf: 49.95, spf: 0.82, loss: 756.9, eff: 69.0, status: 'Fault', severity: 'Medium', faultType: 'Low Efficiency', warnings: '["High Loss Warning"]' },

  // ──────────── COMBINED FAULTS (High Severity) ────────────
  { pv: 258.2, pi: 11.5, pp: 2924.8, pe: 4.9, pf: 49.92, ppf: 0.85, sv: 128.5, si: 20.2, sp: 2195.3, se: 3.7, sf: 49.88, spf: 0.80, loss: 729.5, eff: 75.1, status: 'Fault', severity: 'High', faultType: 'Over Voltage, Over Load, High Loss', warnings: '["Low Efficiency Warning"]' },
  { pv: 195.5, pi: 11.8, pp: 2278.6, pe: 3.8, pf: 49.88, ppf: 0.88, sv: 95.2, si: 20.5, sp: 1785.4, se: 3.0, sf: 49.85, spf: 0.82, loss: 493.2, eff: 78.4, status: 'Fault', severity: 'High', faultType: 'Under Voltage, Over Load, High Loss', warnings: '["Low Efficiency Warning"]' },
  { pv: 265.5, pi: 12.8, pp: 3352.4, pe: 5.6, pf: 49.85, ppf: 0.80, sv: 132.8, si: 22.5, sp: 2485.6, se: 4.2, sf: 49.82, spf: 0.76, loss: 866.8, eff: 74.1, status: 'Fault', severity: 'High', faultType: 'Over Voltage, Over Load, Low Efficiency', warnings: '["High Loss Warning"]' },

  // ──────────── WARNING TYPE 1: High Voltage Warning (240-253V) ────────────
  { pv: 244.5, pi: 8.4, pp: 2018.2, pe: 3.4, pf: 50.00, ppf: 0.97, sv: 125.8, si: 15.8, sp: 1932.5, se: 3.2, sf: 49.99, spf: 0.95, loss: 85.7, eff: 95.8, status: 'Warning', severity: 'Low', faultType: null, warnings: '["High Voltage Warning"]' },
  { pv: 248.2, pi: 8.6, pp: 2085.8, pe: 3.5, pf: 49.98, ppf: 0.96, sv: 127.5, si: 16.2, sp: 1992.8, se: 3.4, sf: 49.97, spf: 0.94, loss: 93.0, eff: 95.5, status: 'Warning', severity: 'Low', faultType: null, warnings: '["High Voltage Warning"]' },

  // ──────────── WARNING TYPE 2: Low Voltage Warning (207-220V) ────────────
  { pv: 215.2, pi: 8.1, pp: 1722.5, pe: 2.9, pf: 49.96, ppf: 0.97, sv: 110.5, si: 15.2, sp: 1662.8, se: 2.8, sf: 49.95, spf: 0.95, loss: 59.7, eff: 96.5, status: 'Warning', severity: 'Low', faultType: null, warnings: '["Low Voltage Warning"]' },
  { pv: 210.8, pi: 7.9, pp: 1648.6, pe: 2.8, pf: 49.94, ppf: 0.96, sv: 108.2, si: 14.8, sp: 1586.5, se: 2.6, sf: 49.92, spf: 0.94, loss: 62.1, eff: 96.2, status: 'Warning', severity: 'Low', faultType: null, warnings: '["Low Voltage Warning"]' },

  // ──────────── WARNING TYPE 3: Over Load Warning (95-100%, current ~8.3-8.7A) ────────────
  { pv: 231.2, pi: 8.9, pp: 2028.5, pe: 3.4, pf: 50.00, ppf: 0.98, sv: 118.5, si: 16.8, sp: 1954.2, se: 3.3, sf: 49.99, spf: 0.96, loss: 74.3, eff: 96.3, status: 'Warning', severity: 'Low', faultType: null, warnings: '["Over Load Warning"]' },
  { pv: 230.8, pi: 8.6, pp: 1962.8, pe: 3.3, pf: 50.01, ppf: 0.97, sv: 118.2, si: 16.3, sp: 1892.5, se: 3.1, sf: 50.00, spf: 0.96, loss: 70.3, eff: 96.4, status: 'Warning', severity: 'Low', faultType: null, warnings: '["Over Load Warning"]' },

  // ──────────── WARNING TYPE 4: High Loss Warning (150-300W) ────────────
  { pv: 233.5, pi: 9.2, pp: 2122.0, pe: 3.6, pf: 50.01, ppf: 0.95, sv: 117.2, si: 16.8, sp: 1954.2, se: 3.3, sf: 49.97, spf: 0.94, loss: 167.8, eff: 92.1, status: 'Warning', severity: 'Low', faultType: null, warnings: '["High Loss Warning"]' },
  { pv: 234.1, pi: 9.5, pp: 2195.8, pe: 3.7, pf: 49.98, ppf: 0.94, sv: 116.8, si: 17.2, sp: 1989.5, se: 3.4, sf: 49.96, spf: 0.93, loss: 206.3, eff: 90.6, status: 'Warning', severity: 'Low', faultType: null, warnings: '["High Loss Warning"]' },
  { pv: 235.2, pi: 9.8, pp: 2286.6, pe: 3.9, pf: 50.02, ppf: 0.93, sv: 116.1, si: 17.6, sp: 2014.3, se: 3.5, sf: 50.00, spf: 0.92, loss: 272.3, eff: 88.1, status: 'Warning', severity: 'Low', faultType: null, warnings: '["High Loss Warning", "Low Efficiency Warning"]' },

  // ──────────── WARNING TYPE 5: Low Efficiency Warning (80-90%) ────────────
  { pv: 231.5, pi: 9.4, pp: 2134.2, pe: 3.6, pf: 49.98, ppf: 0.94, sv: 115.8, si: 17.5, sp: 1885.4, se: 3.2, sf: 49.96, spf: 0.90, loss: 248.8, eff: 88.4, status: 'Warning', severity: 'Low', faultType: null, warnings: '["High Loss Warning", "Low Efficiency Warning"]' },
  { pv: 230.2, pi: 9.8, pp: 2218.5, pe: 3.7, pf: 49.96, ppf: 0.92, sv: 114.2, si: 18.2, sp: 1925.6, se: 3.3, sf: 49.94, spf: 0.88, loss: 292.9, eff: 86.8, status: 'Warning', severity: 'Low', faultType: null, warnings: '["High Loss Warning", "Low Efficiency Warning"]' },

  // ──────────── More Normal (recovery) ────────────
  { pv: 230.1, pi: 8.3, pp: 1896.2, pe: 3.2, pf: 50.00, ppf: 0.98, sv: 118.8, si: 15.6, sp: 1839.4, se: 2.9, sf: 49.99, spf: 0.97, loss: 56.8, eff: 97.0, status: 'Normal', severity: 'Normal', faultType: null, warnings: null },
  { pv: 229.5, pi: 8.1, pp: 1847.1, pe: 3.1, pf: 50.01, ppf: 0.97, sv: 119.2, si: 15.4, sp: 1822.5, se: 2.8, sf: 50.00, spf: 0.96, loss: 24.6, eff: 98.7, status: 'Normal', severity: 'Normal', faultType: null, warnings: null },
  { pv: 231.8, pi: 8.7, pp: 1998.4, pe: 3.3, pf: 49.98, ppf: 0.99, sv: 118.0, si: 16.3, sp: 1905.7, se: 3.0, sf: 49.97, spf: 0.98, loss: 92.7, eff: 95.4, status: 'Normal', severity: 'Normal', faultType: null, warnings: null },
  { pv: 228.4, pi: 7.8, pp: 1768.5, pe: 2.9, pf: 50.02, ppf: 0.96, sv: 119.8, si: 14.7, sp: 1742.9, se: 2.7, sf: 50.01, spf: 0.95, loss: 25.6, eff: 98.6, status: 'Normal', severity: 'Normal', faultType: null, warnings: null },
  { pv: 229.9, pi: 8.0, pp: 1821.5, pe: 3.0, pf: 50.01, ppf: 0.97, sv: 119.0, si: 15.2, sp: 1795.6, se: 2.8, sf: 50.00, spf: 0.96, loss: 25.9, eff: 98.6, status: 'Normal', severity: 'Normal', faultType: null, warnings: null },
  { pv: 231.5, pi: 8.5, pp: 1954.8, pe: 3.3, pf: 49.97, ppf: 0.98, sv: 118.4, si: 16.0, sp: 1879.2, se: 3.0, sf: 49.96, spf: 0.97, loss: 75.6, eff: 96.1, status: 'Normal', severity: 'Normal', faultType: null, warnings: null },
  { pv: 230.3, pi: 8.2, pp: 1869.2, pe: 3.1, pf: 50.03, ppf: 0.97, sv: 118.9, si: 15.5, sp: 1814.7, se: 2.8, sf: 50.02, spf: 0.96, loss: 54.5, eff: 97.1, status: 'Normal', severity: 'Normal', faultType: null, warnings: null },
  { pv: 232.5, pi: 8.9, pp: 2039.8, pe: 3.4, pf: 49.96, ppf: 0.98, sv: 117.6, si: 16.6, sp: 1935.8, se: 3.1, sf: 49.95, spf: 0.97, loss: 104.0, eff: 94.9, status: 'Normal', severity: 'Normal', faultType: null, warnings: null },
];

async function seedData() {
  console.log('🌱 Seeding sample transformer data with ALL fault types...');

  // Clear existing
  const deleted = await db.dataLog.deleteMany();
  console.log(`🗑️  Cleared ${deleted.count} existing records`);

  const now = new Date();

  // Distribute entries across 7 days, ~5-6 per day
  const entries: any[] = [];
  const entriesPerDay = Math.ceil(sampleReadings.length / 7);
  const hoursOfDay = [7, 9, 11, 13, 15, 17, 19];

  for (let i = 0; i < sampleReadings.length; i++) {
    const reading = sampleReadings[i];
    const dayOffset = Math.floor(i / entriesPerDay);
    const dayBase = new Date(now);
    dayBase.setDate(dayBase.getDate() - (6 - dayOffset));

    const hourIdx = i % hoursOfDay.length;
    const entryDate = new Date(dayBase);
    entryDate.setHours(
      hoursOfDay[hourIdx],
      Math.floor(Math.random() * 60),
      Math.floor(Math.random() * 60),
      Math.floor(Math.random() * 1000)
    );

    entries.push({
      primaryVoltage: reading.pv + (Math.random() * 1.5 - 0.75),
      primaryCurrent: reading.pi + (Math.random() * 0.3 - 0.15),
      primaryPower: reading.pp + (Math.random() * 8 - 4),
      primaryEnergy: reading.pe + (Math.random() * 0.15),
      primaryFrequency: reading.pf + (Math.random() * 0.03 - 0.015),
      primaryPowerFactor: Math.min(1, Math.max(0, reading.ppf + (Math.random() * 0.015 - 0.0075))),
      secondaryVoltage: reading.sv + (Math.random() * 1 - 0.5),
      secondaryCurrent: reading.si + (Math.random() * 0.4 - 0.2),
      secondaryPower: reading.sp + (Math.random() * 6 - 3),
      secondaryEnergy: reading.se + (Math.random() * 0.15),
      secondaryFrequency: reading.sf + (Math.random() * 0.03 - 0.015),
      secondaryPowerFactor: Math.min(1, Math.max(0, reading.spf + (Math.random() * 0.015 - 0.0075))),
      loss: Math.max(0, reading.loss + (Math.random() * 4 - 2)),
      efficiency: Math.min(100, Math.max(0, reading.eff + (Math.random() * 0.8 - 0.4))),
      status: reading.status,
      severity: reading.severity,
      faultType: reading.faultType,
      warnings: reading.warnings,
      timestamp: entryDate,
      createdAt: entryDate,
    });
  }

  // Insert in batches
  const batchSize = 50;
  let inserted = 0;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    await db.dataLog.createMany({ data: batch });
    inserted += batch.length;
  }

  // Stats
  const normal = entries.filter(e => e.status === 'Normal').length;
  const warning = entries.filter(e => e.status === 'Warning').length;
  const fault = entries.filter(e => e.status === 'Fault').length;

  // Count each fault type
  const faultTypes: Record<string, number> = {};
  for (const e of entries) {
    if (e.faultType) {
      const types = e.faultType.split(', ');
      for (const t of types) {
        faultTypes[t] = (faultTypes[t] || 0) + 1;
      }
    }
  }

  console.log(`✅ Successfully seeded ${inserted} data log entries across 7 days`);
  console.log(`   - Normal:  ${normal}`);
  console.log(`   - Warning: ${warning}`);
  console.log(`   - Fault:   ${fault}`);
  console.log(`   Fault type breakdown:`);
  for (const [type, count] of Object.entries(faultTypes)) {
    console.log(`     • ${type}: ${count}`);
  }
}

seedData()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
