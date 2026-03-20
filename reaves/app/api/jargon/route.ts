import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { JARGON_SYSTEM_PROMPT } from '@/prompts/jargon';
import { getMockJargon } from '@/lib/mock-data';
import { JargonResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { abstract } = await req.json();
    
    if (!abstract || typeof abstract !== 'string') {
      return NextResponse.json({ error: 'abstract is required' }, { status: 400 });
    }

    // Mock mode
    if (process.env.USE_MOCK === 'true') {
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json(getMockJargon(abstract));
    }

    const result = await callClaude(JARGON_SYSTEM_PROMPT, `Abstract: ${abstract}`) as JargonResponse;
    return NextResponse.json(result);
  } catch (error) {
    console.error('[/api/jargon]', error);
    return NextResponse.json(
      { error: 'Failed to simplify jargon', details: String(error) },
      { status: 500 }
    );
  }
}
