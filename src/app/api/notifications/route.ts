import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET: Return all notifications ordered by timestamp desc
export async function GET() {
  try {
    const notifications = await db.notification.findMany({
      orderBy: { timestamp: 'desc' },
    });
    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.warn('[Notifications] DB read skipped (unavailable):', error);
    return NextResponse.json({ success: true, data: [], dbUnavailable: true });
  }
}

// POST: Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const notification = await db.notification.create({
      data: {
        type: body.type ?? 'info',
        title: body.title ?? '',
        message: body.message ?? '',
        severity: body.severity ?? 'Low',
        isRead: body.isRead ?? false,
        faults: body.faults ? JSON.stringify(body.faults) : null,
        warnings: body.warnings ? JSON.stringify(body.warnings) : null,
      },
    });

    return NextResponse.json({ success: true, data: notification }, { status: 201 });
  } catch (error) {
    console.warn('[Notifications] DB write skipped (unavailable):', error);
    return NextResponse.json({ success: true, skipped: true }, { status: 200 });
  }
}

// PUT: Mark all as read or update a specific notification
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === 'markAllRead') {
      await db.notification.updateMany({
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (body.id) {
      const notification = await db.notification.update({
        where: { id: body.id },
        data: { isRead: body.isRead ?? true },
      });
      return NextResponse.json({ success: true, data: notification });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request: provide id or action' },
      { status: 400 }
    );
  } catch (error) {
    console.warn('[Notifications] DB update skipped (unavailable):', error);
    return NextResponse.json({ success: true, skipped: true }, { status: 200 });
  }
}

// DELETE: Delete all notifications
export async function DELETE() {
  try {
    await db.notification.deleteMany();
    return NextResponse.json({ success: true, message: 'All notifications deleted' });
  } catch (error) {
    console.warn('[Notifications] DB delete skipped (unavailable):', error);
    return NextResponse.json({ success: true, skipped: true }, { status: 200 });
  }
}
