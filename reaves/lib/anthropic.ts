// lib/anthropic.ts
// (We are keeping the filename and function name so your API routes don't break!)

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey || apiKey.startsWith('REPLACE_WITH')) {
  throw new Error('Lakers Alert: Gemini API Key is missing!');
}

// Initialize the free Gemini client
const genAI = new GoogleGenerativeAI(apiKey);

export async function callClaude(systemPrompt: string, userMessage: string): Promise<unknown> {
  // We use Gemini 2.0 Flash because it is incredibly fast and completely free
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