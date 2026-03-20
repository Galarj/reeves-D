import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function callClaude(systemPrompt: string, userMessage: string): Promise<unknown> {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  // Strip any accidental markdown fences
  const raw = content.text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Claude returned invalid JSON: ${raw.slice(0, 200)}`);
  }
}

export default anthropic;
