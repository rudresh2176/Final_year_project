import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database not available in this environment' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = {};

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) (where.timestamp as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        (where.timestamp as Record<string, unknown>).lte = end;
      }
    }

    const dataLogs = await db.dataLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (dataLogs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No data to export' },
        { status: 404 }
      );
    }

    const headers = [
      'Timestamp',
      'Status',
      'Fault Type',
      'Warnings',
      'Primary Voltage (V)',
      'Primary Current (A)',
      'Primary Power (W)',
      'Secondary Voltage (V)',
      'Secondary Current (A)',
      'Secondary Power (W)',
      'Loss (W)',
      'Efficiency (%)',
      'Severity',
    ];

    const escapeCSV = (val: string | number | null | undefined) => {
      const str = val === null || val === undefined ? '-' : String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = dataLogs.map((log) => [
      escapeCSV(log.createdAt.toISOString()),
      escapeCSV(log.status),
      escapeCSV(log.faultType),
      escapeCSV(log.warnings ? (() => { try { return JSON.parse(log.warnings).join('; '); } catch { return log.warnings; } })() : null),
      escapeCSV(log.primaryVoltage.toFixed(2)),
      escapeCSV(log.primaryCurrent.toFixed(2)),
      escapeCSV(log.primaryPower.toFixed(2)),
      escapeCSV(log.secondaryVoltage.toFixed(2)),
      escapeCSV(log.secondaryCurrent.toFixed(2)),
      escapeCSV(log.secondaryPower.toFixed(2)),
      escapeCSV(log.loss.toFixed(2)),
      escapeCSV(log.efficiency.toFixed(2)),
      escapeCSV(log.severity),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const filename = `transmonitor-data-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.warn('[Export] DB export skipped:', error);
    return NextResponse.json(
      { success: false, error: 'Database unavailable in this environment' },
      { status: 503 }
    );
  }
}
