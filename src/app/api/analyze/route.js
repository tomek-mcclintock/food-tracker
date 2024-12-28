import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Request received, body size:', JSON.stringify(body).length);

    // Update the prompt in the request body
    body.messages[0].content[0].text = "Analyze this food image carefully and return a JSON object with three properties:\n1. mainItem: detailed name of the dish\n2. ingredients: list of all ingredients you can see or that would typically be used (including basics like salt, oil)\n3. sensitivities: list of common food sensitivities present in this dish. Include ONLY these categories if present: dairy, gluten, nuts, soy, eggs, fish, shellfish, spicy, citrus, nightshades\n\nExample format: {\"mainItem\": \"Spicy Shrimp Pad Thai\", \"ingredients\": [\"rice noodles\", \"shrimp\", \"eggs\", \"peanuts\", ...], \"sensitivities\": [\"shellfish\", \"eggs\", \"nuts\", \"spicy\"]}";

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