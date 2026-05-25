import { NextRequest, NextResponse } from 'next/server';
import { predict } from '@/lib/ml-predict';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Run prediction directly (embedded ML engine — no external micro-service needed)
    const result = predict(body);

    console.log(
      `[Predict] status=${result.status}, severity=${result.severity}, faults=[${result.faults.join(', ')}], confidence=${result.confidence}`
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { success: false, error: 'Prediction failed' },
      { status: 500 }
    );
  }
}
