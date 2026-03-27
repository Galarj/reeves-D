import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { SEARCH_SCORE_SYSTEM_PROMPT } from '@/prompts/search-score';
import { fetchAllAcademicSources } from '@/lib/academic-apis';
import { getMockSearchResult } from '@/lib/mock-data';
import { SearchResult } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { refined_query, offset = 0, limit = 10 } = await req.json();

    if (!refined_query || typeof refined_query !== 'string') {
      return NextResponse.json({ error: 'refined_query is required' }, { status: 400 });
    }

    // Mock mode — zero API calls
    if (process.env.USE_MOCK === 'true') {
      await new Promise((r) => setTimeout(r, 1500));
      return NextResponse.json(getMockSearchResult(refined_query));
    }

    // Step 1: Fetch real academic papers concurrently from Semantic Scholar + PubMed
    // Adjust limit for "load more" if offset is present, default to 5 more
    const fetchLimit = offset > 0 ? (limit || 5) : limit;
    const rawPapers = await fetchAllAcademicSources(refined_query, fetchLimit, offset);

    // Step 2: Serialize raw papers for Claude — include all trust_factors so the
    //         scoring prompt can apply its rubric to real data
    const papersPayload = rawPapers.map((p, i) => ({
      id: p.id ?? `paper-${i + 1}`,
      title: p.title ?? 'Untitled',
      authors: p.authors ?? 'Unknown',
      year: p.year ?? 0,
      journal: p.journal ?? 'Unknown Journal',
      doi: p.doi ?? '',
      abstract: p.abstract ?? '',
      trust_factors: p.trust_factors ?? {
        peer_reviewed: false,
        citation_count: 0,
        author_hindex: 0,
        recency_years: 0,
        open_access: false,
      },
    }));

    const userMessage = `Research query: "${refined_query}"

Raw papers from academic APIs (${papersPayload.length} found):
${JSON.stringify(papersPayload, null, 2)}`;

    // Step 3: Let Claude score, enrich, and synthesize
    const raw = await callClaude(
      SEARCH_SCORE_SYSTEM_PROMPT,
      userMessage
    ) as Record<string, unknown>;

    // Normalize: ensure all expected fields exist before returning
    const result: SearchResult = {
      sources: Array.isArray(raw.sources) ? raw.sources : [],
      synthesis: typeof raw.synthesis === 'string' ? raw.synthesis : '',
      agreements: Array.isArray(raw.agreements) ? raw.agreements : [],
      conflicts: Array.isArray(raw.conflicts) ? raw.conflicts : [],
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[/api/search] Full error:', error);
    const message = error?.message || String(error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
