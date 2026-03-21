import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';

/**
 * POST /api/define
 * Body: { word: string }
 *
 * Returns:
 *   {
 *     word: string,
 *     short_definition: string | null,   ← shown in the hover popup (≤25 words)
 *     detailed_explanation: string | null ← shown in the sidebar panel
 *   }
 *
 * Used by the REAVES Chrome Extension's Smart Glossary Hover feature.
 */

export interface DefineResponse {
  word: string;
  short_definition: string | null;
  detailed_explanation: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const word: string = (body?.word ?? '').trim();

    if (!word) {
      return NextResponse.json({ error: 'word is required' }, { status: 400 });
    }

    // Safety: max 5 words
    if (word.split(/\s+/).length > 7) {
      return NextResponse.json(
        { error: 'Selection too long. Max 5 words.' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a glossary engine for academic research. Your job is to define terms clearly for college students.

For the term provided, return ONLY valid JSON with this exact shape:
{
  "word": "the term as provided",
  "short_definition": "1-2 sentences, max 25 words, suitable for a small hover tooltip",
  "detailed_explanation": "A full paragraph (3-5 sentences) that explains the concept deeply, including why it matters in academic research"
}

Rules:
- If the term is a common filler word (e.g., "the", "and", "is") OR is gibberish, return null for both fields.
- Do NOT include markdown, code fences, or any text outside the JSON object.`;

    const userMessage = `Define this academic term: "${word}"`;

    const result = await callClaude(systemPrompt, userMessage) as DefineResponse;

    // Validate shape
    if (typeof result !== 'object' || result === null || !('short_definition' in result)) {
      throw new Error('Unexpected response shape from AI');
    }

    return NextResponse.json({
      word:                 result.word               ?? word,
      short_definition:     result.short_definition   ?? null,
      detailed_explanation: result.detailed_explanation ?? null,
    } satisfies DefineResponse);

  } catch (error) {
    console.error('[/api/define]', error);
    return NextResponse.json(
      {
        word:                 '',
        short_definition:     null,
        detailed_explanation: null,
        error:                String(error),
      },
      { status: 500 }
    );
  }
}
