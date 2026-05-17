import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch('http://localhost:3003/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ML service error:', errorText);
      return NextResponse.json(
        { success: false, error: 'ML service unavailable' },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error proxying to ML service:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reach ML service' },
      { status: 502 }
    );
  }
}
