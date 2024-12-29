import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { history } = body;

    // Filter to last 14 days
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const recentHistory = history.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= twoWeeksAgo;
    });

    // Sort by date to ensure chronological order
    recentHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Debug logs to understand the data being analyzed
    console.log('Two weeks ago date:', twoWeeksAgo);
    console.log('Total entries:', history.length);
    console.log('Filtered entries:', recentHistory.length);
    console.log('First entry date:', new Date(recentHistory[0]?.date));
    console.log('Last entry date:', new Date(recentHistory[recentHistory.length - 1]?.date));
    console.log('Recent history:', JSON.stringify(recentHistory, null, 2));

    const prompt = `Analyze this food diary and wellness data. The data is chronologically sorted over a 2-week period, from oldest to newest entries: ${JSON.stringify(recentHistory)}

Important: The data is sorted chronologically. The earliest entries are first, and the most recent are last.

Consider:
- How wellness and food patterns have changed from the beginning to the end of this period
- Most recent 48 hours should be based on the latest entries
- Overall trends across the full 2 weeks
- Ingredients that consistently appear before changes in wellness

Return a JSON object with exactly this format:
{
  "mainInsight": "Most significant pattern you notice in their data",
  "recentPattern": "What happened in last 48h (based on the latest entries)",
  "historicalPattern": "Key trends or changes you notice comparing earlier vs later entries in the 2-week period",
  "suggestion": "Brief, actionable suggestion based on what you notice. Encourage continued tracking",
  "ingredients": ["ingredient1", "ingredient2"] // List 1-3 ingredients that might be affecting wellness, if any patterns exist
}

Keep insights concise and personal, using "you" when speaking to the user.`;


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