import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { getMockFollowup } from '@/lib/mock-data';

const FOLLOWUP_SYSTEM_PROMPT = `You are REAVES's research assistant. A student has read an AI synthesis of academic sources and is asking a follow-up question.
Answer the question clearly in 2-4 sentences, drawing from the synthesis context. Be accurate and academic but accessible.
Return ONLY valid JSON:
{
  "answer": "Your 2-4 sentence answer here."
}
No markdown. JSON only.`;

export async function POST(req: NextRequest) {
  try {
    const { synthesis, question, agreements, conflicts } = await req.json();
    
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }

    // Mock mode
    if (process.env.USE_MOCK === 'true') {
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json(getMockFollowup(question));
    }

    const context = `Synthesis: ${synthesis || '(none)'}
Agreements: ${(agreements || []).join(', ')}
Conflicts: ${(conflicts || []).join(', ')}
Question: ${question}`;

    const result = await callClaude(FOLLOWUP_SYSTEM_PROMPT, context) as { answer: string };
    return NextResponse.json(result);
  } catch (error) {
    console.error('[/api/followup]', error);
    return NextResponse.json(
      { error: 'Failed to answer follow-up', details: String(error) },
      { status: 500 }
    );
  }
}
