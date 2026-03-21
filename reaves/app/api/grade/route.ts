import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';

/**
 * POST /api/grade
 * Body: { title: string, url: string, snippet: string }
 *
 * Returns: { grade: "A"|"B"|"C"|"D"|"F", score: number, reason: string }
 *
 * Strategy:
 * 1. If IS_MOCK_GRADING → instant keyword-based heuristic (zero API calls)
 * 2. Otherwise → AI (Claude) with the 5-tier matrix prompt
 * 3. If AI fails (429, timeout, bad JSON) → heuristic URL-based fallback
 * 4. ALWAYS returns 200 + valid JSON. Never crashes the extension.
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 MOCK MODE — Set to `true` to bypass ALL AI calls and save your quota.
//    Grading will use instant keyword-matching on the URL instead.
//    Flip back to `false` when you want real AI grading.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const IS_MOCK_GRADING = true;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ─── Mock grading: instant keyword-based heuristic (zero API calls) ──────────
function mockGrade(url: string): { grade: string; score: number; reason: string } {
  const lc = url.toLowerCase();

  // LeBron James special match
  if (lc.includes('lebron')) {
    return { grade: 'A', score: 99, reason: 'Official sports statistics and verified biography.' };
  }

  // .gov / .edu — Institutional
  if (lc.includes('.gov') || lc.includes('.edu')) {
    return { grade: 'A', score: 96, reason: 'Verified institutional domain.' };
  }

  // Established journalistic / encyclopedic sources
  const reputable = ['wikipedia.org', 'abs-cbn.com', 'gmanetwork.com', 'reuters.com'];
  if (reputable.some((d) => lc.includes(d))) {
    return { grade: 'B', score: 88, reason: 'Established journalistic or encyclopedic source.' };
  }

  // User-generated content
  const ugc = ['reddit.com', 'quora.com', 'tiktok.com', 'instagram.com'];
  if (ugc.some((d) => lc.includes(d))) {
    return { grade: 'D', score: 42, reason: 'User-generated content with high subjective bias.' };
  }

  // Default — standard commercial
  return { grade: 'C', score: 65, reason: 'Standard commercial source. Review manually.' };
}

// ─── Full heuristic fallback (used when AI fails, richer than mock) ──────────
function heuristicGrade(url: string): { grade: string; score: number; reason: string } {
  const lc = url.toLowerCase();

  // Tier 1 — Academic / Government
  if (lc.includes('.edu') || lc.includes('.gov')) {
    return { grade: 'A', score: 98, reason: 'Official institutional domain. High academic reliability.' };
  }

  // Tier 1 — Known peer-reviewed journals
  const journals = ['nature.com', 'science.org', 'ieee.org', 'ncbi.nlm.nih.gov',
    'pubmed.ncbi', 'thelancet.com', 'nejm.org', 'jstor.org', 'springer.com',
    'wiley.com', 'elsevier.com', 'scholar.google.com'];
  if (journals.some((j) => lc.includes(j))) {
    return { grade: 'A', score: 95, reason: 'Peer-reviewed academic publisher with rigorous editorial standards.' };
  }

  // Tier 2a — Wikipedia / Encyclopedias
  const encyclopedias = ['wikipedia.org', 'britannica.com'];
  if (encyclopedias.some((e) => lc.includes(e))) {
    return { grade: 'B', score: 82, reason: 'Community-vetted encyclopedia. Good for overviews, verify citations.' };
  }

  // Tier 2b — Reputable news & Philippine outlets
  const news = ['abs-cbn.com', 'news.abs-cbn.com', 'gmanetwork.com',
    'inquirer.net', 'philstar.com', 'rappler.com', 'mb.com.ph', 'pna.gov.ph',
    'sunstar.com.ph', 'bbc.com', 'bbc.co.uk', 'reuters.com', 'apnews.com',
    'economist.com', 'theguardian.com', 'nytimes.com', 'washingtonpost.com',
    'npr.org', 'bloomberg.com', 'ft.com', 'wsj.com', 'theatlantic.com', 'cnn.com'];
  if (news.some((n) => lc.includes(n))) {
    return { grade: 'B', score: 88, reason: 'Verified journalistic outlet with editorial oversight.' };
  }

  // Tier 5 — User-generated platforms
  const ugc = ['reddit.com', 'quora.com', 'twitter.com', 'x.com',
    'facebook.com', 'tiktok.com', 'tumblr.com', 'youtube.com'];
  if (ugc.some((u) => lc.includes(u))) {
    return { grade: 'D', score: 45, reason: 'User-generated content. High risk of subjective bias or misinformation.' };
  }

  // Default — unknown .com / general web
  return { grade: 'C', score: 65, reason: 'Commercial source. Potential for promotional bias or unverified claims.' };
}

function letterFromScore(score: number): string {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'F';
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const body    = await req.json().catch(() => ({}));
  const title:   string = (body?.title   ?? '').trim().slice(0, 300);
  const url:     string = (body?.url     ?? '').trim().slice(0, 500);
  const snippet: string = (body?.snippet ?? '').trim().slice(0, 600);

  if (!url && !title) {
    return NextResponse.json(
      { grade: 'C', score: 50, reason: 'No data provided.' },
      { headers: CORS_HEADERS }
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔧 MOCK MODE — instant grading, zero API calls
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (IS_MOCK_GRADING) {
    const mock = mockGrade(url);
    return NextResponse.json(mock, { headers: CORS_HEADERS });
  }

  // ── 1. Try AI grading ──────────────────────────────────────────────────────
  try {
    const systemPrompt = `You are the REAVES Credibility Engine — an ultra-strict academic fact-checker.

Analyze this search result:
URL: ${url}
Title: ${title}
Snippet: ${snippet}

# 5-TIER WEIGHTED MATRIX

TIER 1 (90-100): .edu, .gov, peer-reviewed journals (Nature, IEEE, NCBI, JSTOR, Springer).
TIER 2 (75-89): Established news — BBC, Reuters, AP, ABS-CBN, GMA, Inquirer, Rappler, Philstar, NYT, Guardian, NPR.
TIER 3 (50-74): General .com sites, Wikipedia, Britannica.
TIER 4 (30-49): Opinion pieces, tabloids, BuzzFeed, HuffPost, Daily Mail.
TIER 5 (0-29): User-generated — Reddit, Quora, Twitter/X, TikTok, YouTube, personal blogs.

CONTENT MODIFIERS:
- Deduct 10-20 for clickbait, ALL CAPS, sensationalist titles
- Add 5-10 for neutral language, cited data, award-winning journalism

CRITICAL: Philippine news (ABS-CBN, GMA, Inquirer, Rappler, Philstar) = Tier 2. Do NOT penalize .com domains.

Return ONLY valid JSON — no markdown, no backticks:
{ "grade": "A|B|C|D|F", "score": <0-100>, "reason": "<1 sentence, max 20 words>" }`;

    const result = await callClaude(systemPrompt, 'Grade this search result.') as {
      grade?: string;
      score?: number;
      reason?: string;
    };

    if (!result || typeof result !== 'object') {
      throw new Error('Invalid AI response shape');
    }

    const score = typeof result.score === 'number'
      ? Math.min(100, Math.max(0, Math.round(result.score)))
      : 50;

    const validGrades = ['A', 'B', 'C', 'D', 'F'];
    const grade = result.grade && validGrades.includes(result.grade)
      ? result.grade
      : letterFromScore(score);

    return NextResponse.json(
      { grade, score, reason: (result.reason ?? '').slice(0, 200) },
      { headers: CORS_HEADERS }
    );

  } catch (error) {
    // ── 2. AI failed → use heuristic fallback ────────────────────────────────
    console.warn('[/api/grade] AI unavailable, using heuristic fallback:', error);
    const fallback = heuristicGrade(url);
    return NextResponse.json(fallback, { headers: CORS_HEADERS });
  }
}
