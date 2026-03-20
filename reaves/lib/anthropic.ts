// lib/anthropic.ts
// (We are keeping the filename and function name so your API routes don't break!)

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the free Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function callClaude(systemPrompt: string, userMessage: string): Promise<unknown> {
  // We use Gemini 1.5 Flash because it is incredibly fast and completely free
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.2,
      // This is the magic bullet: forces perfect JSON output
      responseMimeType: "application/json",
    }
  });

  try {
    const result = await model.generateContent(userMessage);
    const rawText = result.response.text();

    // Keep your brilliant markdown-stripping logic just in case
    const cleaned = rawText.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

    return JSON.parse(cleaned);
  } catch (error: any) {
    console.error("Gemini API Error:", error.message);
    throw new Error(`AI generated invalid data or failed: ${error.message}`);
  }
}