import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { image } = await request.json();

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
                  base64: image
                }
              }
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Clarifai Error:', errorText);
      return NextResponse.json({ 
        error: `Clarifai API error: ${response.status} ${response.statusText}`,
        details: errorText
      }, { status: response.status });
    }

    const result = await response.json();
    
    // Log the raw response to see what we're getting
    console.log('Raw Clarifai response:', JSON.stringify(result, null, 2));

    // Lower the confidence threshold to 0.5 (50%)
    const concepts = result.outputs[0].data.concepts
      .filter(concept => concept.value > 0.5)
      .map(concept => ({
        name: concept.name,
        confidence: concept.value
      }));

    return NextResponse.json({
      concepts,
      rawResponse: result // Include raw response for debugging
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}