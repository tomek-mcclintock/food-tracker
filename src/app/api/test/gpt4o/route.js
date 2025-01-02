import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { image } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
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
      return NextResponse.json({ error: data.error }, { status: response.status });
    }

    try {
      const cleanContent = data.choices[0].message.content
        .replace(/```json\n/, '')
        .replace(/\n```/, '')
        .trim();
      
      const parsedContent = JSON.parse(cleanContent);
      return NextResponse.json({
        model: 'gpt4o',
        analysis: parsedContent
      });
    } catch (parseError) {
      return NextResponse.json({
        error: 'JSON parsing failed',
        rawContent: data.choices[0].message.content
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}