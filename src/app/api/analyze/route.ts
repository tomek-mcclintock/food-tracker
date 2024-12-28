import { NextResponse } from 'next/server';
import { FoodAnalysisResult } from '../../../lib/types';

const ALLOWED_MODELS = ['claude-3-haiku-20240307'];
const MAX_CONTENT_LENGTH = 10 * 1024 * 1024; // 10MB limit for request size

interface AnthropicMessage {
  role: string;
  content: {
    type: string;
    text?: string;
    source?: {
      type: string;
      media_type: string;
      data: string;
    };
  }[];
}

interface AnthropicRequest {
  model: string;
  max_tokens: number;
  messages: AnthropicMessage[];
}

interface AnthropicError {
  error?: {
    message?: string;
    type?: string;
  };
}

const validateRequest = (body: any): body is AnthropicRequest => {
  if (!body || typeof body !== 'object') return false;
  if (!ALLOWED_MODELS.includes(body.model)) return false;
  if (!Array.isArray(body.messages) || body.messages.length === 0) return false;
  
  const message = body.messages[0];
  if (!message || !Array.isArray(message.content)) return false;
  
  return true;
};

const ANALYSIS_PROMPT = `
Analyze this food carefully and thoroughly. List all ingredients that:
1. You can visually identify in the food
2. Would typically be used in this dish's preparation
3. Are basic cooking ingredients like salt, oil, or seasonings

Return a JSON object with exactly this format:
{
  "mainItem": "detailed name of the dish",
  "ingredients": ["ingredient1", "ingredient2", ...],
  "sensitivities": ["dairy", "gluten", "nuts", "soy", "eggs", "fish", "shellfish", "spicy", "citrus", "nightshades"]
}

Include sensitivities only if they are present in the dish. Be thorough with ingredients but only include relevant sensitivities.`;

export async function POST(request: Request) {
  try {
    // Check content length
    const contentLength = parseInt(request.headers.get('content-length') || '0');
    if (contentLength > MAX_CONTENT_LENGTH) {
      return NextResponse.json({
        error: { message: 'Request too large' }
      }, { status: 413 });
    }

    const body = await request.json();
    
    if (!validateRequest(body)) {
      return NextResponse.json({
        error: { message: 'Invalid request format' }
      }, { status: 400 });
    }

    const originalText = body.messages[0].content[0].text || '';
    body.messages[0].content[0].text = `${originalText}\n\n${ANALYSIS_PROMPT}`;

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const data: AnthropicError = await response.json();
    
    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return NextResponse.json({
        error: {
          message: data.error?.message || 'Analysis failed',
          type: data.error?.type || 'unknown'
        }
      }, { status: response.status });
    }

    try {
      // Validate the response matches our expected format
      const parsedResults: FoodAnalysisResult = JSON.parse(data.content[0].text);
      if (!parsedResults.mainItem || !Array.isArray(parsedResults.ingredients)) {
        throw new Error('Invalid response format from AI');
      }
      return NextResponse.json(parsedResults);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json({
        error: { message: 'Failed to parse analysis results' }
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      error: {
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}
