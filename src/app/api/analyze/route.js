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
  const predictions = result.outputs[0].data.concepts;

  // Get the highest confidence prediction
  const topPrediction = predictions[0];
  if (!topPrediction) return [];

  // Only include other predictions if:
  // 1. They're at least 50% as confident as the top prediction
  // 2. They make sense as accompanying items (sides, toppings, etc.)
  const relatedPredictions = predictions
    .slice(1)
    .filter(pred => {
      // Must be at least 50% as confident as top prediction
      const confidenceRatio = pred.value / topPrediction.value;
      if (confidenceRatio < 0.5) return false;

      // If it's very confident (>80% of top confidence), include it
      if (confidenceRatio > 0.8) return true;

      // Common pairs that make sense together
      const commonPairs = {
        hamburger: ['french fries', 'cheese', 'lettuce', 'tomato', 'bacon'],
        cheeseburger: ['french fries', 'lettuce', 'tomato', 'bacon'],
        'french fries': ['hamburger', 'cheeseburger', 'sandwich'],
        sandwich: ['chips', 'french fries', 'pickle'],
        pizza: ['cheese', 'pepperoni', 'tomato'],
        salad: ['lettuce', 'tomato', 'cucumber', 'cheese'],
        pasta: ['cheese', 'tomato', 'meat'],
        chicken: ['french fries', 'rice', 'salad'],
        rice: ['chicken', 'beef', 'vegetables'],
        sushi: ['rice', 'fish', 'seafood']
      };

      // Check if this prediction makes sense with the top prediction
      const topItem = topPrediction.name.toLowerCase();
      const currentItem = pred.name.toLowerCase();
      return commonPairs[topItem]?.includes(currentItem) || 
             Object.entries(commonPairs).some(([main, sides]) => 
               main === currentItem && sides.includes(topItem)
             );
    })
    .map(pred => pred.name);

  return [topPrediction.name, ...relatedPredictions];
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

    const enhancedPrompt = `${predictions.length > 0 ? `Automatic food detection has identified these items: ${predictions.join(', ')}. ` : ''}
${foodDescription ? `The user has also provided this description: ${foodDescription}. ` : ''}
Use all this information, prioritizing the user's description when provided, to break down this food into its components.

Please analyze this food and break it down into its component ingredients. Return a JSON object with exactly this format:
{
  "mainItem": "primary dish name with sides (e.g., 'Cheeseburger with French Fries')",
  "ingredients": [
    // List individual ingredients, not dish names
    // Example: Instead of "cheeseburger", list "beef patty", "cheese", "bun"
    // Example: Instead of "french fries", list "potatoes", "oil"
  ],
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
- Break down detected dishes into their component ingredients
- List only actual ingredients, not descriptions
- For sauces and seasonings, break down into core ingredients (e.g. instead of "seasoning" list "garlic", "salt", "pepper")
- Keep ingredients simple and direct (e.g. "sugar" not "sugar additive", "rice" not "steamed rice")
- DO NOT list "hamburger" or "cheeseburger" as ingredients; instead list "beef patty", "cheese", "bun", etc.
- DO NOT list "french fries" as an ingredient; instead list "potatoes", "oil"
- Avoid repeating ingredients
- Still use the detections to identify all components accurately
- Include common preparation ingredients even if not visible (e.g., oil for frying)
- Include sensitivities for all ingredients identified
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