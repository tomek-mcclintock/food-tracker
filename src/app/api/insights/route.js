import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { history } = body;

    const prompt = `Analyze this food and wellness diary data: ${JSON.stringify(history)}

Write a friendly, personal analysis speaking directly to the user (using "you" not "the user"). Be concise but warm. Focus on one key pattern you notice in their recent food and wellness data, any clear correlations between specific foods and how they felt within 48 hours.

Return a JSON object with exactly this format:
{
  "mainInsight": "One clear, conversational sentence about the strongest pattern you notice",
  "recentPattern": "Short, friendly note about what happened in last 48h",
  "suggestion": "Brief, actionable suggestion that includes encouragement to keep tracking in the app",
  "ingredients": ["ingredient1", "ingredient2"] // 1-3 specific ingredients to watch, if any patterns exist
}

Examples of good language:
"Looks like dairy might be affecting your energy levels"
"I noticed you felt less energetic after meals with gluten"
"Try avoiding tomatoes for a few days and keep tracking - it'll help us spot any patterns!"`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({
        error: {
          message: errorData.error?.message || 'Failed to generate insights',
          details: errorData
        }
      }, { status: response.status });
    }

    const data = await response.json();
    const insights = JSON.parse(data.content[0].text);

    return NextResponse.json(insights);
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