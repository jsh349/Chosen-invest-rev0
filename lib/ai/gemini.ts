import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

export const geminiFlash = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
export const geminiPro   = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

export async function generatePortfolioSummary(prompt: string): Promise<string> {
  const result = await geminiFlash.generateContent(prompt)
  return result.response.text()
}
