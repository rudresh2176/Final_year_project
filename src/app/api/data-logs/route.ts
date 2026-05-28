import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Helper: Generate transformer ID based on transformer name
async function generateTransformerId(transformerName: string): Promise<string> {
  // Try to find existing transformers with similar name
  const existing = await db.dataLog.findMany({
    where: { transformerName: transformerName },
    select: { transformerId: true },
    distinct: ['transformerId'],
  });
  
  if (existing.length > 0) {
    return existing[0].transformerId;
  }
  
  // Generate new ID: TX + count of unique transformers + 1
  const count = await db.dataLog.findMany({
    distinct: ['transformerId'],
  });
  
  const newId = `TX${String(count.length + 1).padStart(3, '0')}`;
  return newId;
}

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ success: true, skipped: true, reason: 'db_unavailable' }, { status: 200 });
    }

    const body = await request.json();

    // Generate or use provided transformerId
    let transformerId = body.transformerId || 'TX001';
    if (body.transformerName && transformerId === 'TX001') {
      transformerId = await generateTransformerId(body.transformerName);
    }

    const dataLog = await db.dataLog.create({
      data: {
        transformerId: transformerId,
        transformerName: body.transformerName ?? 'Unknown',
        location: body.location ?? 'N/A',
        kva: body.kva ?? 0,
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
    const transformerId = searchParams.get('transformerId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    // Filter by transformerId or transformerName
    if (transformerId && transformerId !== 'all') {
      where.transformerId = transformerId;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    // Enhanced search: now searches by transformer name, ID, and fault type
    if (search) {
      where.OR = [
        { transformerId: { contains: search, mode: 'insensitive' } },
        { transformerName: { contains: search, mode: 'insensitive' } },
        { faultType: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Date range filtering
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
