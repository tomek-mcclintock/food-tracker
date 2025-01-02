import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { image } = await request.json();

    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }

    const dataUrl = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;

    const requestBody = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Return a simple JSON object describing this food in this format: {\"mainItem\": \"name\"}" 
            },
            {
              type: "image_url",
              image_url: {
                "url": dataUrl
              }
            }
          ]
        }
      ]
    };

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

    // Debug logging
    console.log('Raw GPT response content:', data.choices[0].message.content);

    try {
      const parsedContent = JSON.parse(data.choices[0].message.content.trim());
      return NextResponse.json({
        model: 'gpt4o',
        analysis: parsedContent,
        rawContent: data.choices[0].message.content // Include raw content for debugging
      });
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return NextResponse.json({
        error: 'JSON parsing failed',
        rawContent: data.choices[0].message.content
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}