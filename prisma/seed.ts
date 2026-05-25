import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// Realistic single-phase 230V/120V, 2 KVA transformer readings
const sampleReadings = [
  // Normal readings
  { pv: 231.2, pi: 8.4, pp: 1920.5, pe: 3.2, pf: 50.01, ppf: 0.98, sv: 118.6, si: 15.8, sp: 1854.2, se: 2.9, sf: 49.98, spf: 0.97, loss: 66.3, eff: 96.5, status: 'Normal', severity: 'Normal' },
  { pv: 229.8, pi: 8.2, pp: 1870.1, pe: 3.1, pf: 50.00, ppf: 0.97, sv: 119.1, si: 15.5, sp: 1812.8, se: 2.8, sf: 49.99, spf: 0.97, loss: 57.3, eff: 96.9, status: 'Normal', severity: 'Normal' },
  { pv: 230.5, pi: 8.6, pp: 1965.3, pe: 3.3, pf: 50.02, ppf: 0.99, sv: 118.2, si: 16.1, sp: 1890.7, se: 3.0, sf: 50.01, spf: 0.98, loss: 74.6, eff: 96.2, status: 'Normal', severity: 'Normal' },
  { pv: 228.9, pi: 7.9, pp: 1798.4, pe: 3.0, pf: 49.99, ppf: 0.96, sv: 119.5, si: 14.9, sp: 1760.1, se: 2.7, sf: 49.98, spf: 0.96, loss: 38.3, eff: 97.9, status: 'Normal', severity: 'Normal' },
  { pv: 232.1, pi: 8.8, pp: 2018.7, pe: 3.4, pf: 50.03, ppf: 0.98, sv: 117.8, si: 16.5, sp: 1929.8, se: 3.1, sf: 50.02, spf: 0.97, loss: 88.9, eff: 95.6, status: 'Normal', severity: 'Normal' },
  // Slightly high loss (warning range)
  { pv: 233.5, pi: 9.2, pp: 2122.0, pe: 3.6, pf: 50.01, ppf: 0.95, sv: 117.2, si: 16.8, sp: 1954.2, se: 3.3, sf: 49.97, spf: 0.94, loss: 167.8, eff: 92.1, status: 'Warning', severity: 'Low' },
  { pv: 234.1, pi: 9.5, pp: 2195.8, pe: 3.7, pf: 49.98, ppf: 0.94, sv: 116.8, si: 17.2, sp: 1989.5, se: 3.4, sf: 49.96, spf: 0.93, loss: 206.3, eff: 90.6, status: 'Warning', severity: 'Medium' },
  { pv: 235.2, pi: 9.8, pp: 2286.6, pe: 3.9, pf: 50.02, ppf: 0.93, sv: 116.1, si: 17.6, sp: 2014.3, se: 3.5, sf: 50.00, spf: 0.92, loss: 272.3, eff: 88.1, status: 'Warning', severity: 'Medium' },
  // Fault: very high loss
  { pv: 236.8, pi: 11.2, pp: 2623.8, pe: 4.4, pf: 49.95, ppf: 0.88, sv: 113.5, si: 18.1, sp: 2021.2, se: 3.6, sf: 49.90, spf: 0.85, loss: 602.6, eff: 77.0, status: 'Fault', severity: 'High' },
  { pv: 238.5, pi: 12.5, pp: 2948.1, pe: 5.0, pf: 49.92, ppf: 0.82, sv: 110.2, si: 18.5, sp: 2007.4, se: 3.5, sf: 49.88, spf: 0.80, loss: 940.7, eff: 68.1, status: 'Fault', severity: 'High' },
  // Recovery back to normal
  { pv: 230.1, pi: 8.3, pp: 1896.2, pe: 3.2, pf: 50.00, ppf: 0.98, sv: 118.8, si: 15.6, sp: 1839.4, se: 2.9, sf: 49.99, spf: 0.97, loss: 56.8, eff: 97.0, status: 'Normal', severity: 'Normal' },
  { pv: 229.5, pi: 8.1, pp: 1847.1, pe: 3.1, pf: 50.01, ppf: 0.97, sv: 119.2, si: 15.4, sp: 1822.5, se: 2.8, sf: 50.00, spf: 0.96, loss: 24.6, eff: 98.7, status: 'Normal', severity: 'Normal' },
  { pv: 231.8, pi: 8.7, pp: 1998.4, pe: 3.3, pf: 49.98, ppf: 0.99, sv: 118.0, si: 16.3, sp: 1905.7, se: 3.0, sf: 49.97, spf: 0.98, loss: 92.7, eff: 95.4, status: 'Normal', severity: 'Normal' },
  { pv: 228.4, pi: 7.8, pp: 1768.5, pe: 2.9, pf: 50.02, ppf: 0.96, sv: 119.8, si: 14.7, sp: 1742.9, se: 2.7, sf: 50.01, spf: 0.95, loss: 25.6, eff: 98.6, status: 'Normal', severity: 'Normal' },
  // Warning: high current
  { pv: 230.8, pi: 10.5, pp: 2398.2, pe: 4.0, pf: 49.99, ppf: 0.92, sv: 117.5, si: 19.2, sp: 2224.5, se: 3.8, sf: 49.98, spf: 0.90, loss: 173.7, eff: 92.8, status: 'Warning', severity: 'Low' },
  // Normal again
  { pv: 229.9, pi: 8.0, pp: 1821.5, pe: 3.0, pf: 50.01, ppf: 0.97, sv: 119.0, si: 15.2, sp: 1795.6, se: 2.8, sf: 50.00, spf: 0.96, loss: 25.9, eff: 98.6, status: 'Normal', severity: 'Normal' },
  { pv: 231.5, pi: 8.5, pp: 1954.8, pe: 3.3, pf: 49.97, ppf: 0.98, sv: 118.4, si: 16.0, sp: 1879.2, se: 3.0, sf: 49.96, spf: 0.97, loss: 75.6, eff: 96.1, status: 'Normal', severity: 'Normal' },
  { pv: 230.3, pi: 8.2, pp: 1869.2, pe: 3.1, pf: 50.03, ppf: 0.97, sv: 118.9, si: 15.5, sp: 1814.7, se: 2.8, sf: 50.02, spf: 0.96, loss: 54.5, eff: 97.1, status: 'Normal', severity: 'Normal' },
  { pv: 232.5, pi: 8.9, pp: 2039.8, pe: 3.4, pf: 49.96, ppf: 0.98, sv: 117.6, si: 16.6, sp: 1935.8, se: 3.1, sf: 49.95, spf: 0.97, loss: 104.0, eff: 94.9, status: 'Normal', severity: 'Normal' },
  { pv: 229.2, pi: 7.7, pp: 1743.6, pe: 2.9, pf: 50.04, ppf: 0.95, sv: 119.6, si: 14.5, sp: 1718.9, se: 2.6, sf: 50.03, spf: 0.94, loss: 24.7, eff: 98.6, status: 'Normal', severity: 'Normal' },
  // Slight voltage fluctuation warning
  { pv: 224.5, pi: 8.1, pp: 1805.8, pe: 3.0, pf: 49.90, ppf: 0.97, sv: 116.2, si: 15.3, sp: 1755.2, se: 2.7, sf: 49.88, spf: 0.96, loss: 50.6, eff: 97.2, status: 'Warning', severity: 'Low' },
  { pv: 225.8, pi: 8.3, pp: 1854.6, pe: 3.1, pf: 49.92, ppf: 0.98, sv: 116.8, si: 15.5, sp: 1798.1, se: 2.8, sf: 49.90, spf: 0.97, loss: 56.5, eff: 97.0, status: 'Normal', severity: 'Normal' },
  { pv: 230.6, pi: 8.4, pp: 1924.0, pe: 3.2, pf: 50.00, ppf: 0.98, sv: 118.3, si: 15.7, sp: 1844.2, se: 2.9, sf: 49.99, spf: 0.97, loss: 79.8, eff: 95.9, status: 'Normal', severity: 'Normal' },
  { pv: 231.0, pi: 8.5, pp: 1942.2, pe: 3.3, pf: 50.02, ppf: 0.98, sv: 118.1, si: 15.9, sp: 1863.0, se: 3.0, sf: 50.01, spf: 0.98, loss: 79.2, eff: 95.9, status: 'Normal', severity: 'Normal' },
];

async function seedData() {
  console.log('🌱 Seeding sample transformer data...');

  const now = new Date();

  // Create entries spread over the last 7 days (3-4 entries per day)
  const entries = [];
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const baseDate = new Date(now);
    baseDate.setDate(baseDate.getDate() - dayOffset);

    // Pick 3-4 readings per day at different hours
    const indicesPerDay: number[][] = [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9, 10, 11],
      [12, 13, 14, 15],
      [16, 17, 18, 19],
      [20, 21, 22, 23],
      [0, 1, 2], // today: fewer entries
    ];

    const indices = indicesPerDay[6 - dayOffset];
    const hours = [8, 10, 14, 17, 9, 12, 15, 16, 11, 13];

    for (let i = 0; i < indices.length; i++) {
      const reading = sampleReadings[indices[i]];
      const entryDate = new Date(baseDate);
      entryDate.setHours(hours[i] ?? (8 + i * 2), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0);

      entries.push({
        primaryVoltage: reading.pv + (Math.random() * 2 - 1),
        primaryCurrent: reading.pi + (Math.random() * 0.4 - 0.2),
        primaryPower: reading.pp + (Math.random() * 10 - 5),
        primaryEnergy: reading.pe + (Math.random() * 0.2),
        primaryFrequency: reading.pf + (Math.random() * 0.04 - 0.02),
        primaryPowerFactor: reading.ppf + (Math.random() * 0.02 - 0.01),
        secondaryVoltage: reading.sv + (Math.random() * 1.5 - 0.75),
        secondaryCurrent: reading.si + (Math.random() * 0.6 - 0.3),
        secondaryPower: reading.sp + (Math.random() * 8 - 4),
        secondaryEnergy: reading.se + (Math.random() * 0.2),
        secondaryFrequency: reading.sf + (Math.random() * 0.04 - 0.02),
        secondaryPowerFactor: reading.spf + (Math.random() * 0.02 - 0.01),
        loss: reading.loss + (Math.random() * 5 - 2.5),
        efficiency: Math.min(100, Math.max(0, reading.eff + (Math.random() * 1 - 0.5))),
        status: reading.status,
        severity: reading.severity,
        timestamp: entryDate,
        createdAt: entryDate,
      });
    }
  }

  // Insert in batches
  const batchSize = 50;
  let inserted = 0;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    await db.dataLog.createMany({ data: batch });
    inserted += batch.length;
  }

  console.log(`✅ Successfully seeded ${inserted} data log entries across 7 days`);
  console.log(`   - Normal: ${entries.filter(e => e.status === 'Normal').length}`);
  console.log(`   - Warning: ${entries.filter(e => e.status === 'Warning').length}`);
  console.log(`   - Fault:   ${entries.filter(e => e.status === 'Fault').length}`);
}

seedData()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
