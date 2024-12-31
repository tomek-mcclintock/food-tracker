import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { image } = await request.json();

    const response = await fetch(
      'https://api.clarifai.com/v2/models/food-item-recognition/outputs',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLARIFAI_PAT}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
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
      console.error('Clarifai Error:', await response.text());
      return NextResponse.json({ 
        error: `Clarifai API error: ${response.status} ${response.statusText}`,
        token: process.env.CLARIFAI_PAT ? 'Token exists' : 'No token found'
      }, { status: response.status });
    }

    const result = await response.json();
    const concepts = result.outputs[0].data.concepts.map(concept => ({
      name: concept.name,
      confidence: concept.value
    }));

    return NextResponse.json({ concepts });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}