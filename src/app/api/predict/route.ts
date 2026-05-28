import { NextRequest, NextResponse } from 'next/server';
import { predict } from '@/lib/ml-predict';
import type { TransformerThresholds } from '@/lib/ml-predict';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract thresholds if provided (from transformer config)
    let thresholds: TransformerThresholds | undefined;
    if (body.thresholds) {
      thresholds = body.thresholds as TransformerThresholds;
      // Remove thresholds from the payload so predict() doesn't try to use them as sensor data
      delete body.thresholds;
    }

    const result = predict(body, thresholds);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { success: false, error: 'Prediction failed' },
      { status: 500 }
    );
  }
}
