// lib/anthropic.ts
// (We are keeping the filename and function name so your API routes don't break!)

import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. THE KEY POOL: Load all keys and filter out empties
const apiKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[];

export async function callClaude(systemPrompt: string, userMessage: string): Promise<unknown> {
  if (apiKeys.length === 0) {
    throw new Error('Lakers Alert: All Gemini API Keys are missing from .env!');
  }

  let rawText = null;

  // 2. THE WATERFALL LOOP
  for (let i = 0; i < apiKeys.length; i++) {
    try {
      console.log(`[lib/anthropic] Attempting inference with Key #${i + 1}...`);

      // Initialize the client dynamically with the current key
      const genAI = new GoogleGenerativeAI(apiKeys[i]);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature: 0.2,
          // This is the magic bullet: forces perfect JSON output
          responseMimeType: "application/json",
        }
      });

      const result = await model.generateContent(userMessage);
      rawText = result.response.text();

      console.log(`[lib/anthropic] Success with Key #${i + 1}! Breaking loop.`);
      break; // It worked! Stop the loop.

    } catch (error: any) {
      const msg = error.message || '';
      // FATAL: Developer errors — stop immediately, don't waste other keys
      if (msg.includes('404') || msg.includes('403')) {
        console.error(`[lib/anthropic] FATAL on Key #${i + 1}: ${msg}`);
        throw error;
      }
      // TRANSIENT: 429 (quota) or 503 (overload) — cascade to next key
      console.warn(`[lib/anthropic] Key #${i + 1} failed (${msg}). Cascading...`);
    }
  }

  // 3. THE FAILSAFE: If all keys burn out
  if (!rawText) {
    console.error("[lib/anthropic] CRITICAL: All API keys exhausted.");
    throw new Error("AI Services are experiencing maximum load. Please try again later.");
  }

  // 4. THE JSON PARSER (Keeping your brilliant stripping logic safe)
  try {
    const cleaned = rawText.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    return JSON.parse(cleaned);
  } catch (parseError: any) {
    console.error("[lib/anthropic] JSON Parse Error:", parseError.message);
    throw new Error(`AI generated invalid JSON data: ${parseError.message}`);
  }
}