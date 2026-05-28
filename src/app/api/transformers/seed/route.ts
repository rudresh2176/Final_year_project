import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    if (!db) {
      return NextResponse.json({ success: false, error: 'db_unavailable' }, { status: 503 });
    }

    // Clear existing data
    await db.dataLog.deleteMany({});
    await db.transformer.deleteMany({});

    // Create 3 demo transformers
    const tx1 = await db.transformer.create({
      data: {
        transformerId: 'TX001',
        name: 'Main Distribution Transformer',
        kva: 2,
        primaryVoltage: 230,
        secondaryVoltage: 120,
        location: 'EEE Lab',
        phase: 'single',
        status: 'Online',
      },
    });

    const tx2 = await db.transformer.create({
      data: {
        transformerId: 'TX002',
        name: 'Workshop Transformer',
        kva: 1,
        primaryVoltage: 230,
        secondaryVoltage: 110,
        location: 'Mechanical Workshop',
        phase: 'single',
        status: 'Online',
      },
    });

    const tx3 = await db.transformer.create({
      data: {
        transformerId: 'TX003',
        name: 'Power Lab Transformer',
        kva: 5,
        primaryVoltage: 440,
        secondaryVoltage: 230,
        location: 'Power Systems Lab',
        phase: 'single',
        status: 'Offline',
      },
    });

    // Generate demo logs for TX001 (2 KVA, 230V/120V)
    const tx001Logs = [
      // Normal conditions (10 records)
      ...generateLogs(tx1.transformerId, 10, {
        pv: 230, pi: 8.7, pp: 1955, pf: 0.97,
        sv: 120, si: 16.0, sp: 1862, sf: 0.97,
        loss: 93, lossPct: 4.76, loadPct: 87, eff: 95.24,
        status: 'Normal', severity: 'Normal', faultType: null,
        warnings: '[]',
      }),
      // Over Voltage fault (3 records)
      ...generateLogs(tx1.transformerId, 3, {
        pv: 258, pi: 9.5, pp: 2380, pf: 0.97,
        sv: 134, si: 17.5, sp: 2278, sf: 0.97,
        loss: 102, lossPct: 4.29, loadPct: 95, eff: 95.71,
        status: 'Fault', severity: 'High', faultType: 'Over Voltage',
        warnings: '["High Load Warning"]',
      }),
      // Under Voltage fault (3 records)
      ...generateLogs(tx1.transformerId, 3, {
        pv: 198, pi: 7.2, pp: 1383, pf: 0.97,
        sv: 103, si: 13.2, sp: 1318, sf: 0.97,
        loss: 65, lossPct: 4.70, loadPct: 72, eff: 95.30,
        status: 'Fault', severity: 'Medium', faultType: 'Under Voltage',
        warnings: '[]',
      }),
      // Overload fault (3 records)
      ...generateLogs(tx1.transformerId, 3, {
        pv: 228, pi: 11.5, pp: 2550, pf: 0.97,
        sv: 119, si: 21.0, sp: 2424, sf: 0.97,
        loss: 126, lossPct: 4.94, loadPct: 115, eff: 95.06,
        status: 'Fault', severity: 'High', faultType: 'Over Load',
        warnings: '["High Loss Warning"]',
      }),
      // High Loss fault (2 records)
      ...generateLogs(tx1.transformerId, 2, {
        pv: 230, pi: 8.5, pp: 1896, pf: 0.97,
        sv: 118, si: 15.5, sp: 1781, sf: 0.97,
        loss: 115, lossPct: 6.07, loadPct: 85, eff: 93.93,
        status: 'Fault', severity: 'Medium', faultType: 'High Loss',
        warnings: '["Low Efficiency Warning"]',
      }),
      // Low Efficiency fault (2 records)
      ...generateLogs(tx1.transformerId, 2, {
        pv: 229, pi: 8.8, pp: 1955, pf: 0.97,
        sv: 115, si: 15.8, sp: 1761, sf: 0.97,
        loss: 194, lossPct: 9.92, loadPct: 88, eff: 90.08,
        status: 'Fault', severity: 'Medium', faultType: 'Low Efficiency',
        warnings: '["High Loss Warning"]',
      }),
      // Warning records (3 records)
      ...generateLogs(tx1.transformerId, 3, {
        pv: 245, pi: 9.0, pp: 2135, pf: 0.97,
        sv: 127, si: 16.5, sp: 2035, sf: 0.97,
        loss: 100, lossPct: 4.68, loadPct: 90, eff: 95.32,
        status: 'Warning', severity: 'Low', faultType: null,
        warnings: '["Over Voltage Warning","High Load Warning"]',
      }),
      // Offline (2 records)
      ...generateLogs(tx1.transformerId, 2, {
        pv: 0, pi: 0, pp: 0, pf: 0,
        sv: 0, si: 0, sp: 0, sf: 0,
        loss: 0, lossPct: 0, loadPct: 0, eff: 0,
        status: 'Offline', severity: 'Low', faultType: null,
        warnings: '[]',
      }),
    ];

    // Generate demo logs for TX002 (1 KVA, 230V/110V)
    const tx002Logs = [
      // Normal (8 records)
      ...generateLogs(tx2.transformerId, 8, {
        pv: 230, pi: 4.35, pp: 972, pf: 0.97,
        sv: 110, si: 9.1, sp: 970, sf: 0.97,
        loss: 2, lossPct: 0.21, loadPct: 85, eff: 99.79,
        status: 'Normal', severity: 'Normal', faultType: null,
        warnings: '[]',
      }),
      // Over Voltage (2 records)
      ...generateLogs(tx2.transformerId, 2, {
        pv: 255, pi: 4.5, pp: 1112, pf: 0.97,
        sv: 122, si: 9.5, sp: 1124, sf: 0.97,
        loss: 12, lossPct: 1.07, loadPct: 88, eff: 98.93,
        status: 'Fault', severity: 'High', faultType: 'Over Voltage',
        warnings: '[]',
      }),
      // Overload (2 records)
      ...generateLogs(tx2.transformerId, 2, {
        pv: 228, pi: 5.2, pp: 1150, pf: 0.97,
        sv: 108, si: 10.8, sp: 1133, sf: 0.97,
        loss: 17, lossPct: 1.47, loadPct: 102, eff: 98.53,
        status: 'Fault', severity: 'Medium', faultType: 'Over Load',
        warnings: '["High Loss Warning"]',
      }),
      // Warning (3 records)
      ...generateLogs(tx2.transformerId, 3, {
        pv: 243, pi: 4.4, pp: 1038, pf: 0.97,
        sv: 116, si: 9.2, sp: 1031, sf: 0.97,
        loss: 7, lossPct: 0.67, loadPct: 86, eff: 99.33,
        status: 'Warning', severity: 'Low', faultType: null,
        warnings: '["Over Voltage Warning"]',
      }),
    ];

    // Generate demo logs for TX003 (5 KVA, 440V/230V)
    const tx003Logs = [
      // Normal (7 records)
      ...generateLogs(tx3.transformerId, 7, {
        pv: 440, pi: 10.5, pp: 4486, pf: 0.97,
        sv: 230, si: 20.0, sp: 4462, sf: 0.97,
        loss: 24, lossPct: 0.54, loadPct: 80, eff: 99.46,
        status: 'Normal', severity: 'Normal', faultType: null,
        warnings: '[]',
      }),
      // Under Voltage (2 records)
      ...generateLogs(tx3.transformerId, 2, {
        pv: 390, pi: 9.8, pp: 3711, pf: 0.97,
        sv: 200, si: 18.5, sp: 3589, sf: 0.97,
        loss: 122, lossPct: 3.29, loadPct: 75, eff: 96.71,
        status: 'Fault', severity: 'Medium', faultType: 'Under Voltage',
        warnings: '[]',
      }),
      // High Loss (2 records)
      ...generateLogs(tx3.transformerId, 2, {
        pv: 438, pi: 11.0, pp: 4675, pf: 0.97,
        sv: 228, si: 20.5, sp: 4536, sf: 0.97,
        loss: 139, lossPct: 2.97, loadPct: 84, eff: 97.03,
        status: 'Fault', severity: 'Medium', faultType: 'High Loss',
        warnings: '["Low Efficiency Warning"]',
      }),
      // Offline (3 records)
      ...generateLogs(tx3.transformerId, 3, {
        pv: 0, pi: 0, pp: 0, pf: 0,
        sv: 0, si: 0, sp: 0, sf: 0,
        loss: 0, lossPct: 0, loadPct: 0, eff: 0,
        status: 'Offline', severity: 'Low', faultType: null,
        warnings: '[]',
      }),
    ];

    // Batch insert all logs
    const allLogs = [...tx001Logs, ...tx002Logs, ...tx003Logs];

    for (const log of allLogs) {
      await db.dataLog.create({ data: log });
    }

    return NextResponse.json({
      success: true,
      transformers: 3,
      totalLogs: allLogs.length,
      breakdown: {
        TX001: tx001Logs.length,
        TX002: tx002Logs.length,
        TX003: tx003Logs.length,
      },
    });
  } catch (error) {
    console.warn('[Seed] Failed:', error);
    return NextResponse.json({ success: false, error: 'seed_failed' }, { status: 500 });
  }
}

// Helper: generate N log entries with random variation
function generateLogs(
  transformerId: string,
  count: number,
  base: {
    pv: number; pi: number; pp: number; pf: number;
    sv: number; si: number; sp: number; sf: number;
    loss: number; lossPct: number; loadPct: number; eff: number;
    status: string; severity: string; faultType: string | null;
    warnings: string;
  }
) {
  const logs = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    // Spread records across the last 14 days with random hours
    const daysAgo = Math.floor(Math.random() * 14);
    const hoursOffset = Math.floor(Math.random() * 24);
    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(hoursOffset, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0);

    // Add small random noise for realism
    const noise = () => (Math.random() - 0.5) * 2;

    logs.push({
      transformerId,
      timestamp,
      primaryVoltage: base.pv > 0 ? +(base.pv + noise()).toFixed(2) : 0,
      primaryCurrent: base.pi > 0 ? +(base.pi + noise() * 0.3).toFixed(2) : 0,
      primaryPower: base.pp > 0 ? +(base.pp + noise() * 5).toFixed(2) : 0,
      primaryEnergy: base.pp > 0 ? +(base.pp * 0.5 + noise()).toFixed(2) : 0,
      primaryFrequency: base.pp > 0 ? +(50 + noise() * 0.2).toFixed(2) : 0,
      primaryPowerFactor: base.pf > 0 ? +(base.pf + noise() * 0.01).toFixed(2) : 0,
      secondaryVoltage: base.sv > 0 ? +(base.sv + noise()).toFixed(2) : 0,
      secondaryCurrent: base.si > 0 ? +(base.si + noise() * 0.3).toFixed(2) : 0,
      secondaryPower: base.sp > 0 ? +(base.sp + noise() * 5).toFixed(2) : 0,
      secondaryEnergy: base.sp > 0 ? +(base.sp * 0.5 + noise()).toFixed(2) : 0,
      secondaryFrequency: base.sf > 0 ? +(50 + noise() * 0.2).toFixed(2) : 0,
      secondaryPowerFactor: base.sf > 0 ? +(base.sf + noise() * 0.01).toFixed(2) : 0,
      loss: base.loss > 0 ? +(base.loss + noise() * 3).toFixed(2) : 0,
      lossPercentage: base.lossPct > 0 ? +(base.lossPct + noise() * 0.2).toFixed(2) : 0,
      loadPercentage: base.loadPct > 0 ? +(base.loadPct + noise()).toFixed(2) : 0,
      efficiency: base.eff > 0 ? +(base.eff + noise() * 0.3).toFixed(2) : 0,
      status: base.status,
      severity: base.severity,
      faultType: base.faultType,
      warnings: base.warnings,
    });
  }

  return logs;
}
