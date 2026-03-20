import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { THESIS_SYSTEM_PROMPT } from '@/prompts/thesis';
import { getMockThesis } from '@/lib/mock-data';
import { ThesisResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { topic, sources } = await req.json();
    
    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      return NextResponse.json({ error: 'sources array is required' }, { status: 400 });
    }

    // Mock mode
    if (process.env.USE_MOCK === 'true') {
      await new Promise((r) => setTimeout(r, 1200));
      return NextResponse.json(getMockThesis());
    }

    const sourcesJson = JSON.stringify(sources.map((s: { id: string; title: string; abstract: string }) => ({
      id: s.id,
      title: s.title,
      abstract: s.abstract,
    })));

    const result = await callClaude(
      THESIS_SYSTEM_PROMPT,
      `Research topic: ${topic || 'General research'}\nSources: ${sourcesJson}`
    ) as ThesisResponse;

    return NextResponse.json(result);
  } catch (error) {
    console.error('[/api/thesis]', error);
    return NextResponse.json(
      { error: 'Failed to build thesis', details: String(error) },
      { status: 500 }
    );
  }
}
