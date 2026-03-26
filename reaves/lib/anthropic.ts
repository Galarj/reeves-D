// lib/anthropic.ts
// Keeping the filename and function name so all API routes that import callClaude keep working.
// Uses Google Gemini 1.5 Flash with a 3-key waterfall.

import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. THE KEY POOL — load all keys, filter empties
const apiKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY_6,
].filter(Boolean) as string[];

export async function callClaude(systemPrompt: string, userMessage: string): Promise<unknown> {
  if (apiKeys.length === 0) {
    throw new Error('REAVES Fatal: All Gemini API Keys are missing from environment variables.');
  }

  let rawText: string | null = null;

  // 2. THE WATERFALL LOOP
  for (let i = 0; i < apiKeys.length; i++) {
    try {
      console.log(`[lib/anthropic] Attempting inference with Key #${i + 1}...`);

      const genAI = new GoogleGenerativeAI(apiKeys[i]);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(userMessage);
      rawText = result.response.text();

      console.log(`[lib/anthropic] Success with Key #${i + 1}! Breaking loop.`);
      break; // Success — exit the loop

    } catch (error: any) {
      const status = error?.status ?? error?.httpStatusCode ?? 0;
      const msg: string = error?.message || String(error);

      // ── FATAL errors: bad request, forbidden, model not found ──
      // Throw immediately so the real error shows in Vercel logs.
      if (
        status === 400 || status === 403 || status === 404 ||
        msg.includes('400') || msg.includes('403') || msg.includes('404')
      ) {
        console.error(`[lib/anthropic] FATAL on Key #${i + 1} (status ${status}): ${msg}`);
        throw error;
      }

      // ── TRANSIENT errors: rate-limit or overloaded ──
      // 429 (quota exhausted) or 503 (service overloaded) → try the next key
      if (
        status === 429 || status === 503 ||
        msg.includes('429') || msg.includes('503') ||
        msg.includes('RESOURCE_EXHAUSTED') || msg.includes('overloaded')
      ) {
        console.warn(`[lib/anthropic] Key #${i + 1} hit transient error (${status || msg}). Cascading to next key...`);
        continue;
      }

      // ── UNKNOWN errors: log and cascade ──
      console.warn(`[lib/anthropic] Key #${i + 1} failed with unknown error: ${msg}. Cascading...`);
      continue;
    }
  }

  // 3. THE FAILSAFE — all keys burned out
  if (!rawText) {
    console.error('[lib/anthropic] CRITICAL: All API keys exhausted. No response obtained.');
    throw new Error('AI Services are experiencing maximum load. Please try again later.');
  }

  // 4. THE JSON PARSER — strip markdown fences if present, then parse
  try {
    const cleaned = rawText
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (parseError: any) {
    console.error('[lib/anthropic] JSON Parse Error:', parseError.message);
    console.error('[lib/anthropic] Raw text was:', rawText.substring(0, 500));
    throw new Error(`AI generated invalid JSON data: ${parseError.message}`);
  }
}