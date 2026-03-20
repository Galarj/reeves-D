import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { COMPARE_SYSTEM_PROMPT } from '@/prompts/compare';
import { getMockComparison } from '@/lib/mock-data';

export async function POST(req: NextRequest) {
  try {
    const { sources } = await req.json();

    if (!sources || sources.length < 2) {
      return NextResponse.json({ error: 'At least 2 sources required' }, { status: 400 });
    }

    // CHECK MOCK STATUS
    if (process.env.USE_MOCK === 'true') {
      // Small delay to feel real
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json(getMockComparison());
    }

    // FIX: Handle both NotebookEntry structure and raw Source structure
    const papersPayload = sources.map((item: any, i: number) => {
      // If it's a NotebookEntry, use item.source. If it's a raw Source, use item.
      const s = item.source || item;

      return {
        paper: `Paper ${i + 1}`,
        title: s.title || 'Unknown Title',
        authors: s.authors || 'Unknown Authors',
        year: s.year || 'N/A',
        abstract: s.abstract || 'No abstract provided'
      };
    });

    const userMessage = `Compare these academic papers:\n${JSON.stringify(papersPayload, null, 2)}`;

    const result = await callClaude(COMPARE_SYSTEM_PROMPT, userMessage);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[/api/compare] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}