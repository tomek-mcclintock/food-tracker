import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { history } = body;

    // Prepare the data for Claude's analysis
    const prompt = `Analyze this food and wellness diary data carefully. Consider correlations between foods eaten and subsequent wellness checks within 48 hours. Look for patterns in ingredients or food types that might affect stomach comfort or energy levels.

History data: ${JSON.stringify(history)}

Provide a brief, friendly analysis focusing on:
1. Recent patterns in the last 48 hours
2. Any recurring patterns over the past two weeks
3. Specific ingredients that might be affecting wellness
4. A clear, actionable suggestion

Return a JSON object with this exact format:
{
  "mainInsight": "Brief 1-2 sentence summary of most important recent pattern",
  "recentPattern": "Pattern from last 48h",
  "historicalPattern": "Pattern from past 2 weeks",
  "suggestion": "Specific, actionable suggestion",
  "ingredients": ["ingredient1", "ingredient2"] // List of ingredients to watch
}`;

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