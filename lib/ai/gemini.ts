import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

export const geminiFlash = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
export const geminiPro   = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

// Serverless functions have hard execution limits. Enforce an explicit timeout
// so slow Gemini responses fail with a clear error rather than a generic hang.
const GEMINI_TIMEOUT_MS = 15_000

export async function generatePortfolioSummary(prompt: string): Promise<string> {
  let timeoutId: ReturnType<typeof setTimeout>
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error('[gemini] Request timed out after 15s')),
      GEMINI_TIMEOUT_MS,
    )
  })
  try {
    const result = await Promise.race([geminiFlash.generateContent(prompt), timeout])
    return result.response.text()
  } finally {
    clearTimeout(timeoutId!)
  }
}
