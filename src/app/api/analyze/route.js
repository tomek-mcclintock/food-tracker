import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const originalText = body.messages[0].content[0].text;
    
    body.messages[0].content[0].text = `${originalText}

Analyze this food carefully and thoroughly. List all ingredients that:
1. You can visually identify in the food
2. Would typically be used in this dish's preparation
3. Are basic cooking ingredients like salt, oil, or seasonings

Return a JSON object with exactly this format:
{
  "mainItem": "detailed name of the dish",
  "ingredients": ["ingredient1", "ingredient2", ...],
  "sensitivities": ["dairy", "gluten", "nuts", "soy", "eggs", "fish", "shellfish", "spicy", "citrus", "nightshades"]
}

Include sensitivities only if they are present in the dish. Be thorough with ingredients but only include relevant sensitivities.`;

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
    
    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return NextResponse.json({
        error: {
          message: data.error?.message || JSON.stringify(data.error) || 'Unknown error',
          details: data
        }
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      error: {
        message: error.message,
        stack: error.stack
      }
    }, { status: 500 });
  }
}