import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { image, model = 'haiku' } = await request.json();

    // Map model names to their identifiers
    const modelIds = {
      'haiku': 'claude-3-haiku-20240307',
      'sonnet': 'claude-3-sonnet-20240229',
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: modelIds[model],
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this food image carefully and thoroughly. Return a JSON object with exactly this format: { \"mainItem\": \"detailed name of the dish\", \"ingredients\": [\"ingredient1\", \"ingredient2\"], \"sensitivities\": [\"dairy\", \"gluten\", \"nuts\", \"soy\", \"eggs\", \"fish\", \"shellfish\", \"spicy\", \"citrus\", \"nightshades\"] }. Include sensitivities only if they are present in the dish."
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: image
              }
            }
          ]
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.error }, { status: response.status });
    }

    return NextResponse.json({
      model: model,
      analysis: JSON.parse(data.content[0].text)
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}