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
    .filter(concept => concept.value > 0.5)
    .map(concept => concept.name);
}

export async function POST(request) {
  try {
    const { image } = await request.json();

    // Get Clarifai predictions first
    let predictions = [];
    try {
      predictions = await getClarifaiPredictions(image);
      console.log('Clarifai predictions:', predictions); // Debug log
    } catch (error) {
      console.error('Clarifai analysis failed:', error);
    }

    // Combine with Claude analysis
    const prompt = `The image shows: ${predictions.join(', ')}. 
    
Analyze this food carefully and thoroughly. Return a JSON object with exactly this format:
{
  "mainItem": "detailed name of the dish",
  "ingredients": ["ingredient1", "ingredient2", ...],
  "sensitivities": ["dairy", "gluten", "nuts", "soy", "eggs", "fish", "shellfish", "spicy", "citrus", "nightshades"]
}

Include sensitivities only if they are present in the dish. Use the provided Clarifai detections to enhance your analysis.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt },
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
      clarifaiPredictions: predictions,
      combinedAnalysis: JSON.parse(data.content[0].text)
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}