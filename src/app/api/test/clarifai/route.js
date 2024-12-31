import { NextResponse } from 'next/server';
import { ClarifaiStub, grpc } from 'clarifai-nodejs-grpc';

const PAT = process.env.CLARIFAI_PAT;
const USER_ID = 'clarifai';
const APP_ID = 'main';
const MODEL_ID = 'food-item-recognition';
const MODEL_VERSION_ID = '1d5fd481e0cf4826aa72ec3ff049e044';

const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set('authorization', `Key ${PAT}`);

export async function POST(request) {
  try {
    const { image } = await request.json();

    return new Promise((resolve) => {
      stub.PostModelOutputs(
        {
          user_app_id: {
            user_id: USER_ID,
            app_id: APP_ID
          },
          model_id: MODEL_ID,
          version_id: MODEL_VERSION_ID,
          inputs: [{
            data: {
              image: {
                base64: image
              }
            }
          }]
        },
        metadata,
        (err, response) => {
          if (err) {
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          
          if (response.status.code !== 10000) {
            resolve(NextResponse.json({ 
              error: response.status.description 
            }, { status: 400 }));
            return;
          }

          const concepts = response.outputs[0].data.concepts.map(concept => ({
            name: concept.name,
            confidence: concept.value
          }));

          resolve(NextResponse.json({ concepts }));
        }
      );
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}