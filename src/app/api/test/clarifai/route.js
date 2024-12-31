import { NextResponse } from 'next/server';

const PAT = process.env.CLARIFAI_PAT;
const USER_ID = 'clarifai';
const APP_ID = 'main';
const MODEL_ID = 'food-item-recognition';
const MODEL_VERSION_ID = '1d5fd481e0cf4826aa72ec3ff049e044';

export async function POST(request) {
  try {
    const { image } = await request.json();

    const raw = JSON.stringify({
      "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
      },
      "inputs": [
        {
          "data": {
            "image": {
              "base64": image
            }
          }
        }
      ]
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT
      },
      body: raw
    };

    const response = await fetch(
      `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
      requestOptions
    );
    
    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: result.status.description }, { status: response.status });
    }

    const concepts = result.outputs[0].data.concepts.map(concept => ({
      name: concept.name,
      confidence: concept.value
    }));

    return NextResponse.json({ concepts });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}