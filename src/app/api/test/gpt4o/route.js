import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { image } = await request.json();

    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }

    const requestBody = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyze this food and return a JSON object with exactly this format: { \"mainItem\": \"detailed name of the dish\", \"ingredients\": [\"ingredient1\", \"ingredient2\"], \"sensitivities\": [\"dairy\", \"gluten\", \"nuts\", \"soy\", \"eggs\", \"fish\", \"shellfish\", \"nightshades\", \"caffeine\", \"histamine\", \"sulfites\", \"fructose\", \"fodmap\", \"cruciferous\", \"alliums\", \"citrus\", \"legumes\", \"corn\", \"salicylates\", \"spicy\"] }" 
            },
            {
              type: "image_url",
              image_url: {
                "url": image
              }
            }
          ]
        }
      ]
    };

    console.log('Sending request to OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return NextResponse.json({ error: data.error }, { status: response.status });
    }

    return NextResponse.json({
      model: 'gpt4o',
      analysis: JSON.parse(data.choices[0].message.content)
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}