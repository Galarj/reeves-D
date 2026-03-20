import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { SEARCH_SCORE_SYSTEM_PROMPT } from '@/prompts/search-score';
import { getMockSearchResult } from '@/lib/mock-data';
import { SearchResult } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { refined_query } = await req.json();
    
    if (!refined_query || typeof refined_query !== 'string') {
      return NextResponse.json({ error: 'refined_query is required' }, { status: 400 });
    }

    // Mock mode — zero API calls
    if (process.env.USE_MOCK === 'true') {
      await new Promise((r) => setTimeout(r, 1500));
      return NextResponse.json(getMockSearchResult(refined_query));
    }

    const raw = await callClaude(
      SEARCH_SCORE_SYSTEM_PROMPT,
      `Research query: ${refined_query}`
    ) as Record<string, unknown>;

    // Normalize: ensure all expected fields exist
    const result: SearchResult = {
      sources: Array.isArray(raw.sources) ? raw.sources : [],
      synthesis: typeof raw.synthesis === 'string' ? raw.synthesis : '',
      agreements: Array.isArray(raw.agreements) ? raw.agreements : [],
      conflicts: Array.isArray(raw.conflicts) ? raw.conflicts : [],
      research_gaps: Array.isArray(raw.research_gaps) ? raw.research_gaps : [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('[/api/search]', error);
    return NextResponse.json(
      { error: 'Failed to search sources', details: String(error) },
      { status: 500 }
    );
  }
}
