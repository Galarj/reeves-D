import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { CLARIFIER_SYSTEM_PROMPT } from '@/prompts/clarifier';
import { getMockClarifier } from '@/lib/mock-data';
import { ClarifierResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { raw_query } = await req.json();
    
    if (!raw_query || typeof raw_query !== 'string') {
      return NextResponse.json({ error: 'raw_query is required' }, { status: 400 });
    }

    // Mock mode — zero API calls
    if (process.env.USE_MOCK === 'true') {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json(getMockClarifier(raw_query));
    }

    const result = await callClaude(CLARIFIER_SYSTEM_PROMPT, raw_query) as ClarifierResponse;
    return NextResponse.json(result);
  } catch (error) {
    console.error('[/api/clarify]', error);
    return NextResponse.json(
      { error: 'Failed to clarify query', details: String(error) },
      { status: 500 }
    );
  }
}
