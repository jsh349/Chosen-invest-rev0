/**
 * AI provider seam.
 *
 * Feature code and API routes should import from '@/lib/ai', not from
 * individual provider files directly. This keeps provider selection in
 * one place: to switch providers, change the re-export below.
 *
 * Current active provider: Anthropic (askClaude → generateText)
 * To switch to Gemini: replace the re-export with './gemini'
 */

// Stable name for the active text-generation entry point.
// Feature code calls generateText(prompt) without knowing the provider.
export { askClaude as generateText } from './anthropic'

// Gemini-specific export — retained for cases that explicitly need Gemini.
// Prefer generateText for new call sites unless the model difference matters.
export { generatePortfolioSummary } from './gemini'
