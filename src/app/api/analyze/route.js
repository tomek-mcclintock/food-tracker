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
    .slice(0, 5)  // Get top 5 predictions
    .map(concept => concept.name);
}

export async function POST(request) {
  try {
    const body = await request.json();
    let foodDescription = body.messages[0].content[0].text;
    let imageContent = body.messages[0].content.find(c => c.type === 'image');
    let predictions = [];

    // If there's an image, analyze it with Clarifai first
    if (imageContent) {
      try {
        const imageBase64 = imageContent.source.data;
        predictions = await getClarifaiPredictions(imageBase64);
      } catch (error) {
        console.error('Clarifai analysis failed:', error);
        // Continue with original description if Clarifai fails
      }
    }

    const enhancedPrompt = `${predictions.length > 0 ? `Automatic food detection has identified these items: ${predictions.join(', ')}. THESE ITEMS MUST BE INCLUDED IN YOUR INGREDIENTS LIST. ` : ''}
${foodDescription}

Please analyze this food INCLUDING ALL DETECTED ITEMS AS INGREDIENTS. Return a JSON object with exactly this format:
{
  "mainItem": "detailed name of the dish WITH ANY SIDES",
  "ingredients": ["INCLUDE ALL DETECTED AND VISIBLE ITEMS HERE", "ingredient2", ...],
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
- YOU MUST INCLUDE ALL AUTOMATICALLY DETECTED ITEMS IN THE INGREDIENTS LIST
- If french fries were detected, list them as a separate ingredient
- If multiple dishes are detected (like burger and fries), include them all in mainItem
- Include both main and side dishes in ingredients list
- The mainItem should reflect BOTH the main dish and sides (e.g., "Cheeseburger with French Fries")
- Include common ingredients used in these dishes even if not visible
- Include sensitivities for both main dishes and side items
- Common relationships to remember:
  * French fries → nightshades (potatoes)
  * Chocolate desserts → caffeine
  * Pickled/fermented items → histamine
  * Sauces often contain alliums (garlic/onion)
  * Many seasonings contain salicylates
  * Pre-made sauces often contain sulfites
  * Breads/buns contain gluten and often corn
  * Most condiments contain FODMAP ingredients`;

    // Replace original message content with enhanced prompt
    body.messages[0].content[0].text = enhancedPrompt;

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