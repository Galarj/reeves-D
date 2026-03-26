import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NOTEBOOK_CHAT_SYSTEM_PROMPT } from '@/prompts/notebook-chat';

// 1. THE KEY POOL: Define your waterfall keys here. 
// We use your original 'GEMINI_API_KEY' as the primary, and add fallbacks.
const apiKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[];

export async function POST(req: NextRequest) {
  try {
    const { messages, sources } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    if (apiKeys.length === 0) {
      console.error('[/api/notebook-chat] ERROR: No Gemini API keys found in .env');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    // --- YOUR ORIGINAL REAVES LOGIC STAYS INTACT ---
    const sourceContext = (sources || [])
      .map((s: any, i: number) =>
        `[Source ${i + 1}] "${s.title}" by ${s.authors} (${s.year})
Journal: ${s.journal}
Trust Score: ${s.trust_score}/100 — ${s.trust_reason}
Abstract: ${s.abstract}
${s.user_note ? `User Note: ${s.user_note}` : ''}
${s.tag ? `Tag: ${s.tag}` : ''}`
      )
      .join('\n\n---\n\n');

    const systemPrompt = NOTEBOOK_CHAT_SYSTEM_PROMPT +
      '\n\n--- NOTEBOOK SOURCES ---\n\n' + sourceContext;

    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;
    let reply = null;

    // 2. THE WATERFALL LOOP (Wrapping your chat logic)
    for (let i = 0; i < apiKeys.length; i++) {
      try {
        console.log(`[/api/notebook-chat] Attempting inference with Key #${i + 1}...`);

        // Initialize Gemini with the current key in the loop
        const genAI = new GoogleGenerativeAI(apiKeys[i]);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: systemPrompt,
          generationConfig: { temperature: 0.5 },
        });

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(lastMessage);
        reply = result.response.text();

        console.log(`[/api/notebook-chat] Success with Key #${i + 1}! Breaking loop.`);
        break; // It worked! Stop the loop.

      } catch (error: any) {
        console.warn(`[/api/notebook-chat] Key #${i + 1} failed: ${error.message}. Cascading...`);
        // Loop automatically continues to the next key
      }
    }

    // 3. THE FAILSAFE
    if (!reply) {
      console.error('[/api/notebook-chat] CRITICAL: All API keys exhausted.');
      return NextResponse.json(
        { error: 'AI Services are experiencing maximum load. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ reply });

  } catch (error) {
    console.error('[/api/notebook-chat] Fatal Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate chat response', details: String(error) },
      { status: 500 }
    );
  }
}