import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { RAG_SYSTEM_PROMPT } from '@/prompts/rag';
import { EvidenceResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { chunks, query } = await req.json();

    if (!query || !chunks || chunks.length === 0) {
      return NextResponse.json({ error: 'Missing query or page content chunks' }, { status: 400 });
    }

    const pageContent = chunks.join(' ');

    if (process.env.USE_MOCK === 'true') {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json({
        answer: "Based on the mock page content, researchers found a significant correlation between social media use and youth mental health decline across several longitudinal studies.",
        evidence_snippet: "correlation between social media use and youth mental health decline",
        confidence_score: 0.95,
        location_context: "In the methodology section"
      } as EvidenceResponse);
    }

    // Build the system prompt
    let systemPrompt = RAG_SYSTEM_PROMPT.replace('{user_question}', query);
    systemPrompt = systemPrompt.replace('{page_content}', pageContent);
    
    // In callClaude, the systemPrompt is the first argument. We just say 'extract evidence' as the user message.
    const userMessage = "Analyze the page content and answer my question, ensuring you extract an exact excerpt.";

    const rawResult = await callClaude(systemPrompt, userMessage) as any;
    
    // Format normalization to ensure type matching
    const result: EvidenceResponse = {
      answer: rawResult.answer || "I could not generate an answer.",
      evidence_snippet: rawResult.evidence_snippet || null,
      confidence_score: rawResult.confidence_score || 0,
      location_context: rawResult.location_context || "Unknown location"
    };

    // Validation: The 'literal match' rule on the server side just in case the AI hallucinates a typo.
    // If it's not a true substring, we nullify it so the frontend doesn't crash trying to highlight.
    if (result.evidence_snippet && !pageContent.includes(result.evidence_snippet)) {
      console.warn('AI returned an evidence snippet that is not a literal match. Nullifying to protect frontend highlighter.');
      result.evidence_snippet = null;
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[/api/page-search] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
