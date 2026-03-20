import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { SYNTHESIZE_SYSTEM_PROMPT } from '@/prompts/synthesize';

export async function POST(req: NextRequest) {
  try {
    const { sources, query } = await req.json();
    
    if (!sources || !Array.isArray(sources)) {
      return NextResponse.json({ error: 'sources array is required' }, { status: 400 });
    }

    const sourceSummary = sources.map((s: { title: string; abstract: string; authors: string; year: number; journal: string }) =>
      `Title: ${s.title}\nAuthors: ${s.authors}\nYear: ${s.year}\nJournal: ${s.journal}\nAbstract: ${s.abstract}`
    ).join('\n\n---\n\n');

    const result = await callClaude(
      SYNTHESIZE_SYSTEM_PROMPT,
      `Research query: ${query || 'Not specified'}\n\nSources:\n${sourceSummary}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('[/api/synthesize]', error);
    return NextResponse.json(
      { error: 'Failed to synthesize sources', details: String(error) },
      { status: 500 }
    );
  }
}
