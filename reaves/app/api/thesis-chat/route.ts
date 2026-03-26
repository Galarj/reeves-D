import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { THESIS_CHAT_SYSTEM_PROMPT } from '@/prompts/thesis-chat';

// 1. THE KEY POOL: Define your waterfall keys here.
const apiKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY_6,
].filter(Boolean) as string[];

export async function POST(req: NextRequest) {
  try {
    const { messages, thesis, sources } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    if (apiKeys.length === 0) {
      console.error('[/api/thesis-chat] ERROR: No Gemini API keys found in .env');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    // --- YOUR THESIS & SOURCE CONTEXT STAYS INTACT ---
    const thesisContext = `
THESIS STATEMENT: ${thesis?.thesis}
STANCE: ${thesis?.stance}
RESEARCH GAP FILLED: ${thesis?.gap_it_fills}
SUPPORTING SOURCES: ${(thesis?.supporting_sources || []).join(', ')}
`.trim();

    const sourceContext = (sources || [])
      .map((s: any, i: number) =>
        `[Source ${i + 1}] "${s.title}" by ${s.authors} (${s.year})\nAbstract: ${s.abstract}`
      )
      .join('\n\n---\n\n');

    const systemPrompt = THESIS_CHAT_SYSTEM_PROMPT +
      '\n\n--- THESIS CONTEXT ---\n\n' + thesisContext +
      '\n\n--- NOTEBOOK SOURCES ---\n\n' + sourceContext;

    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;
    let reply = null;

    // 2. THE WATERFALL LOOP
    for (let i = 0; i < apiKeys.length; i++) {
      try {
        console.log(`[/api/thesis-chat] Attempting inference with Key #${i + 1}...`);

        // Initialize Gemini dynamically with the current key
        const genAI = new GoogleGenerativeAI(apiKeys[i]);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: systemPrompt,
          generationConfig: { temperature: 0.5 },
        });

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(lastMessage);
        reply = result.response.text();

        console.log(`[/api/thesis-chat] Success with Key #${i + 1}! Breaking loop.`);
        break; // Stop the loop on success

      } catch (error: any) {
        const msg = error.message || '';
        // FATAL: Developer errors — stop immediately, don't waste other keys
        if (msg.includes('404') || msg.includes('403')) {
          console.error(`[/api/thesis-chat] FATAL on Key #${i + 1}: ${msg}`);
          throw error;
        }
        // TRANSIENT: 429 (quota) or 503 (overload) — cascade to next key
        console.warn(`[/api/thesis-chat] Key #${i + 1} failed (${msg}). Cascading...`);
      }
    }

    // 3. THE FAILSAFE
    if (!reply) {
      console.error('[/api/thesis-chat] CRITICAL: All API keys exhausted.');
      return NextResponse.json(
        { error: 'AI Services are experiencing maximum load. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('[/api/thesis-chat] Fatal Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate thesis chat response', details: String(error) },
      { status: 500 }
    );
  }
}