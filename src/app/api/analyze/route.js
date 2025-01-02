import { NextResponse } from 'next/server';

async function analyzeWithGPT4o(imageBase64, description = '') {
  const requestBody = {
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert food analyzer with deep knowledge of ingredients, allergens, and dietary sensitivities. Your analysis should be thorough, precise, and always prioritize user-provided descriptions over automated detection when available. Pay special attention to hidden ingredients and common allergens that might not be immediately visible."
      },
      {
        role: "user",
        content: [
          { 
            type: "text", 
            text: `${description ? `The user describes this food as: ${description}\n\n` : ''}Analyze this food and:

Return a JSON object with exactly this format:
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

Important guidelines:
- PRIORITIZE THE USER'S DESCRIPTION when provided, using it as the primary source of information
- Include all visible ingredients and common preparation ingredients
- Consider cooking methods and typical recipe components
- Include sensitivities for ALL ingredients, including garnishes and sides
- Be thorough in checking every sensitivity category
- Consider these common patterns:
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
              "url": imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
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
  if (!response.ok) throw new Error(data.error?.message || 'GPT-4o analysis failed');

  const cleanContent = data.choices[0].message.content
    .replace(/```json\n/, '')
    .replace(/\n```/, '')
    .trim();
  
  return JSON.parse(cleanContent);
}

export async function POST(request) {
  try {
    const body = await request.json();
    let foodDescription = body.messages[0].content[0].text;
    let imageContent = body.messages[0].content.find(c => c.type === 'image');
    
    if (imageContent) {
      try {
        const imageBase64 = imageContent.source.data;
        return NextResponse.json(await analyzeWithGPT4o(imageBase64, foodDescription));
      } catch (error) {
        console.error('GPT-4o analysis failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // Text-only analysis
      return NextResponse.json(await analyzeWithGPT4o(null, foodDescription));
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}