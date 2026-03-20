import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { BIAS_SYSTEM_PROMPT } from '@/prompts/bias';
import { getMockBias } from '@/lib/mock-data';
import { BiasFlag } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { source } = await req.json();
    
    if (!source) {
      return NextResponse.json({ error: 'source is required' }, { status: 400 });
    }

    // Mock mode
    if (process.env.USE_MOCK === 'true') {
      await new Promise((r) => setTimeout(r, 600));
      return NextResponse.json(getMockBias(source.id));
    }

    const userMessage = `Title: ${source.title}\nAuthors: ${source.authors}\nJournal: ${source.journal}\nAbstract: ${source.abstract}`;
    const result = await callClaude(BIAS_SYSTEM_PROMPT, userMessage) as BiasFlag;
    return NextResponse.json(result);
  } catch (error) {
    console.error('[/api/bias]', error);
    return NextResponse.json(
      { error: 'Failed to detect bias', details: String(error) },
      { status: 500 }
    );
  }
}
