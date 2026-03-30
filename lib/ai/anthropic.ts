import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Serverless functions have hard execution limits. Enforce an explicit timeout
// so slow Anthropic responses fail with a clear error rather than a generic hang.
const ANTHROPIC_TIMEOUT_MS = 15_000

export async function askClaude(prompt: string): Promise<string> {
  let timeoutId: ReturnType<typeof setTimeout>
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error('[anthropic] Request timed out after 15s')),
      ANTHROPIC_TIMEOUT_MS,
    )
  })
  try {
    const message = await Promise.race([
      anthropic.messages.create({
        model:      'claude-sonnet-4-6',
        max_tokens: 1024,
        messages:   [{ role: 'user', content: prompt }],
      }),
      timeout,
    ])
    const block = message.content[0]
    return block.type === 'text' ? block.text : ''
  } catch (err) {
    // Log only the message — never the full SDK error object, which may carry
    // request headers (Authorization), prompt text, or response metadata.
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[anthropic] askClaude failed: ${message}`)
    throw new Error(`[anthropic] ${message}`)
  } finally {
    clearTimeout(timeoutId!)
  }
}
