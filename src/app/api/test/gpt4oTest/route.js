import { NextResponse } from 'next/server';

async function getClarifaiPredictions(imageBase64) {
  const response = await fetch(
    'https://api.clarifai.com/v2/models/food-item-recognition/versions/1d5fd481e0cf4826aa72ec3ff049e044/outputs',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLARIFAI_PAT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_app_id: {
          user_id: process.env.CLARIFAI_USER_ID,
          app_id: process.env.CLARIFAI_APP_ID
        },
        inputs: [
          {
            data: {
              image: {
                base64: imageBase64
              }
            }
          }
        ]
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Clarifai API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result.outputs[0].data.concepts
    .slice(0, 5)
    .map(concept => concept.name);
}

export async function POST(request) {
  try {
    const { image } = await request.json();

    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }

    // Get Clarifai predictions first
    let predictions = [];
    try {
      predictions = await getClarifaiPredictions(image);
      console.log('Clarifai predictions:', predictions);
    } catch (error) {
      console.error('Clarifai analysis failed:', error);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Automatic food detection has identified these items: ${predictions.join(', ')}. 
                
These predictions are from reliable food recognition software and should be considered accurate. Analyze this food and use these predictions to enhance your analysis.

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
}

Important:
- Include ALL items detected by the automatic detection
- Add any additional ingredients you can see
- Include common ingredients used in these dishes even if not visible
- Include sensitivities for both main dishes and side items
- Be thorough in checking for ALL sensitivity categories that apply
- Common relationships to remember:
  * French fries → nightshades (potatoes)
  * Chocolate desserts → caffeine
  * Pickled/fermented items → histamine
  * Sauces often contain alliums (garlic/onion)
  * Many seasonings contain salicylates
  * Pre-made sauces often contain sulfites
  * Breads/buns contain gluten and often corn
  * Most condiments contain FODMAP ingredients`
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return NextResponse.json({ error: data.error }, { status: response.status });
    }

    return NextResponse.json({
      model: 'gpt4',
      clarifaiPredictions: predictions,
      analysis: JSON.parse(data.choices[0].message.content)
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}