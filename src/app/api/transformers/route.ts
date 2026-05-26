import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({ success: true, transformers: [], dbUnavailable: true });
    }

    const transformers = await db.transformer.findMany({
      orderBy: { transformerId: 'asc' },
    });

    return NextResponse.json({ success: true, transformers });
  } catch (error) {
    console.warn('[Transformers] DB read skipped:', error);
    return NextResponse.json({ success: true, transformers: [], dbUnavailable: true });
  }
}

export async function POST(request: Request) {
  try {
    if (!db) {
      return NextResponse.json({ success: false, error: 'db_unavailable' }, { status: 503 });
    }

    const body = await request.json();

    // Auto-generate next TX ID
    const existing = await db.transformer.findMany({
      orderBy: { transformerId: 'desc' },
      take: 1,
    });

    let nextNum = 1;
    if (existing.length > 0) {
      const lastId = existing[0].transformerId;
      const match = lastId.match(/TX(\d+)/);
      if (match) {
        nextNum = parseInt(match[1]) + 1;
      }
    }
    const newTransformerId = `TX${String(nextNum).padStart(3, '0')}`;

    const transformer = await db.transformer.create({
      data: {
        transformerId: newTransformerId,
        name: body.name ?? 'Untitled Transformer',
        kva: body.kva ?? 1,
        primaryVoltage: body.primaryVoltage ?? 230,
        secondaryVoltage: body.secondaryVoltage ?? 120,
        location: body.location ?? 'N/A',
        phase: body.phase ?? 'single',
        status: body.status ?? 'Online',
      },
    });

    return NextResponse.json({ success: true, transformer }, { status: 201 });
  } catch (error) {
    console.warn('[Transformers] DB create skipped:', error);
    return NextResponse.json({ success: false, error: 'create_failed' }, { status: 500 });
  }
}
