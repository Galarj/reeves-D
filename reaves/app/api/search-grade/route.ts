import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';

/**
 * POST /api/search-grade
 * Body: { title: string, url: string, snippet: string }
 *
 * Returns: { trustScore: number (0-100), tooltip: string }
 *
 * Deep credibility analysis for web search results. Designed for the
 * REAVES Google Search Grader extension feature.
 *
 * Note: /api/bias already exists for paper-level bias detection.
 * This route handles search-result-level Trust scoring.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const FALLBACK = { trustScore: 50, tooltip: 'AI analysis failed. Proceed with caution.' };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title:   string = (body?.title   ?? '').trim().slice(0, 300);
    const url:     string = (body?.url     ?? '').trim().slice(0, 500);
    const snippet: string = (body?.snippet ?? '').trim().slice(0, 600);

    if (!url && !title) {
      return NextResponse.json(FALLBACK, { status: 400, headers: CORS_HEADERS });
    }

    const systemPrompt = `You are the "REAVES Credibility Engine," an ultra-strict, academic-level fact-checker.
Analyze the following search result for trustworthiness, bias, and academic value.

URL: ${url}
TITLE: ${title}
SNIPPET: ${snippet}

# GRADING RUBRIC:
1. URL Authority: .edu, .gov, or known peer-reviewed journals (Nature, IEEE, NCBI) get high scores (85-100). Major news (BBC, Reuters, AP) get medium-high (70-85). Blogs, social media (Reddit, Twitter/X), and heavy commercial sites get low scores (0-50).
2. Title Sensationalism: Deduct points for clickbait, ALL CAPS, or highly emotional language.
3. Snippet Objectivity: Deduct points for subjective opinions, lack of sources, or extreme political bias.

# OUTPUT FORMAT:
You MUST return ONLY a valid JSON object. Do not include markdown formatting or backticks.
{
  "trustScore": <Number between 0 and 100>,
  "tooltip": "<A short, 1-2 sentence explanation of WHY this score was given. Maximum 20 words. Example: 'Peer-reviewed medical journal. Highly objective.' or 'Commercial blog. Potential conflict of interest.'>"
}`;

    let result: { trustScore: number; tooltip: string };

    try {
      result = await callClaude(systemPrompt, 'Analyze now.') as { trustScore: number; tooltip: string };
    } catch {
      return NextResponse.json(FALLBACK, { headers: CORS_HEADERS });
    }

    if (typeof result?.trustScore !== 'number' || typeof result?.tooltip !== 'string') {
      return NextResponse.json(FALLBACK, { headers: CORS_HEADERS });
    }

    return NextResponse.json(
      {
        trustScore: Math.min(100, Math.max(0, Math.round(result.trustScore))),
        tooltip:    result.tooltip.slice(0, 200),
      },
      { headers: CORS_HEADERS }
    );

  } catch (error) {
    console.error('[/api/search-grade]', error);
    return NextResponse.json(FALLBACK, { headers: CORS_HEADERS });
  }
}
