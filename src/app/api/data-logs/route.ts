import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ success: true, skipped: true, reason: 'db_unavailable' }, { status: 200 });
    }

    const body = await request.json();

    const dataLog = await db.dataLog.create({
      data: {
        primaryVoltage: body.primaryVoltage ?? 0,
        primaryCurrent: body.primaryCurrent ?? 0,
        primaryPower: body.primaryPower ?? 0,
        primaryEnergy: body.primaryEnergy ?? 0,
        primaryFrequency: body.primaryFrequency ?? 0,
        primaryPowerFactor: body.primaryPowerFactor ?? 0,
        secondaryVoltage: body.secondaryVoltage ?? 0,
        secondaryCurrent: body.secondaryCurrent ?? 0,
        secondaryPower: body.secondaryPower ?? 0,
        secondaryEnergy: body.secondaryEnergy ?? 0,
        secondaryFrequency: body.secondaryFrequency ?? 0,
        secondaryPowerFactor: body.secondaryPowerFactor ?? 0,
        loss: body.loss ?? 0,
        lossPercentage: body.lossPercentage ?? 0,
        loadPercentage: body.loadPercentage ?? 0,
        efficiency: body.efficiency ?? 0,
        status: body.status ?? 'OFFLINE',
        severity: body.severity ?? 'Normal',
        faultType: body.faultType ?? null,
        warnings: body.warnings ?? null,
      },
    });

    return NextResponse.json({ success: true, data: dataLog }, { status: 201 });
  } catch (error) {
    console.warn('[DataLogs] DB write skipped:', error);
    return NextResponse.json({ success: true, skipped: true }, { status: 200 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ success: true, data: [], total: 0, dbUnavailable: true });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

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

    const skip = offset ? parseInt(offset) : 0;
    const take = limit ? parseInt(limit) : 10000;

    const [dataLogs, total] = await Promise.all([
      db.dataLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      db.dataLog.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: dataLogs, total });
  } catch (error) {
    console.warn('[DataLogs] DB read skipped:', error);
    return NextResponse.json({ success: true, data: [], total: 0, dbUnavailable: true });
  }
}
