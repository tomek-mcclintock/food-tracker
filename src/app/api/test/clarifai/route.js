import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { image } = await request.json();

    const response = await fetch(
      'https://api.clarifai.com/v2/models/general-image-recognition/versions/aa7f35c01e0642fda5cf400f543e7c40/outputs',
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
      const errorText = await response.text();
      console.error('Clarifai Error:', errorText);
      return NextResponse.json({ 
        error: `Clarifai API error: ${response.status} ${response.statusText}`,
        details: errorText
      }, { status: response.status });
    }

    const result = await response.json();
    const concepts = result.outputs[0].data.concepts
      .filter(concept => concept.value > 0.9)  // Only keep high-confidence predictions
      .map(concept => ({
        name: concept.name,
        confidence: concept.value
      }));

    return NextResponse.json({ concepts });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}