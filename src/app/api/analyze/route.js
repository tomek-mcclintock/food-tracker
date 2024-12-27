import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Backend: Sending request to Anthropic');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log('Backend: Received response from Anthropic:', data);

    if (!response.ok) {
      throw new Error(`Failed to analyze image: ${data.error?.message || 'Unknown error'}`);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Backend: Analysis error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}