import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function askClaude(prompt: string): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1024,
      messages:   [{ role: 'user', content: prompt }],
    })
    const block = message.content[0]
    return block.type === 'text' ? block.text : ''
  } catch (err) {
    // Log only the message — never the full SDK error object, which may carry
    // request headers (Authorization), prompt text, or response metadata.
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[anthropic] askClaude failed: ${message}`)
    throw new Error(`[anthropic] ${message}`)
  }
}
