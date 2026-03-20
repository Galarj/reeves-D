import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface PageExcerpt {
  text: string;
  score: number;
  chunkIndex: number;
}

export async function POST(req: NextRequest) {
  try {
    const { chunks, query } = (await req.json()) as {
      chunks: string[];
      query: string;
    };

    if (!chunks?.length || !query?.trim()) {
      return NextResponse.json({ error: 'Missing chunks or query' }, { status: 400 });
    }

    // Keep at most 30 chunks to stay within token limits (~24k tokens)
    const trimmedChunks = chunks.slice(0, 30);

    const prompt = `You are a research assistant. A user is reading a webpage and wants to find the most relevant passages for their query.

QUERY: "${query}"

Below are numbered text chunks from the webpage. For each chunk, score its relevance to the query from 0.0 to 1.0.
Return ONLY a JSON array of objects in this exact format (no other text):
[{"chunkIndex": 0, "score": 0.85, "excerpt": "most relevant sentence or two from this chunk"}, ...]

Only include chunks with score >= 0.3. Return at most 5 results, sorted by score descending.

TEXT CHUNKS:
${trimmedChunks.map((chunk, i) => `[${i}] ${chunk}`).join('\n\n')}`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected AI response' }, { status: 500 });
    }

    // Parse JSON response — handle possible markdown code fences
    const raw = content.text.trim().replace(/^```json?\n?/, '').replace(/\n?```$/, '');
    let parsed: Array<{ chunkIndex: number; score: number; excerpt: string }>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response', raw }, { status: 500 });
    }

    const excerpts: PageExcerpt[] = parsed.map((item) => ({
      text: item.excerpt || trimmedChunks[item.chunkIndex]?.slice(0, 400) || '',
      score: Math.max(0, Math.min(1, item.score)),
      chunkIndex: item.chunkIndex,
    }));

    return NextResponse.json({ excerpts });
  } catch (err) {
    console.error('[page-search]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
