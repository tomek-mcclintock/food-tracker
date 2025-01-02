import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { image } = await request.json();

    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }

    // Create the request body
    const requestBody = {
      model: "chatgpt-4o-latest",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this food and:

Return a JSON object with exactly this format:
{
  "mainItem": "detailed name of the dish",
  "ingredients": ["ingredient1", "ingredient2", ...],
  "sensitivities": [
    "dairy",      // milk, cheese, butter, cream, yogurt
    "gluten",     // wheat, barley, rye
    "nuts",       // all tree nuts and peanuts
    "soy",        // soybeans and soy products
    "eggs",
    "fish",
    "shellfish",
    "nightshades", // potatoes, tomatoes, peppers, eggplant
    "caffeine",    // coffee, tea, chocolate, cola
    "histamine",   // aged cheeses, fermented foods, cured meats
    "sulfites",    // wine, dried fruits, processed foods
    "fructose",    // fruits, honey, HFCS
    "fodmap",      // garlic, onion, wheat, certain fruits
    "cruciferous", // broccoli, cauliflower, cabbage, brussels sprouts
    "alliums",     // garlic, onions, leeks, chives
    "citrus",      // oranges, lemons, limes, grapefruit
    "legumes",     // beans, peas, lentils, peanuts
    "corn",
    "salicylates", // many fruits, vegetables, spices, mint
    "spicy"        // chili peppers, hot spices
  ]
}`
            },
            {
              type: "image_url",
              url: image
            }
          ]
        }
      ],
      max_tokens: 1000
    };

    // Log the request body
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    // Log the response for debugging
    console.log('OpenAI Response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return NextResponse.json({ error: data.error }, { status: response.status });
    }

    return NextResponse.json({
      model: 'chatgpt-4o',
      analysis: JSON.parse(data.choices[0].message.content)
    });
  } catch (error) {
    console.error('Full error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}