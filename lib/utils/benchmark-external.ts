import type { BenchmarkFile } from '@/lib/types/benchmark-import'
import type { ExternalBenchmarkPayload } from '@/lib/types/benchmark-external'
import { validateBenchmarkFile } from '@/lib/utils/benchmark-import'

/**
 * Validates an unknown value against the ExternalBenchmarkPayload contract.
 * Returns null if valid, or an error string describing the first problem found.
 *
 * Call this before trusting any data from an external source.
 * After validation passes, cast to ExternalBenchmarkPayload and call externalPayloadToFile().
 */
export function validateExternalPayload(raw: unknown): string | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return 'Payload must be a JSON object.'
  }
  const p = raw as Record<string, unknown>

  if (typeof p.fetchedAt !== 'string' || !p.fetchedAt) {
    return 'Missing field: fetchedAt (ISO 8601 string).'
  }
  if (typeof p.sourceUrl !== 'string' || !p.sourceUrl) {
    return 'Missing field: sourceUrl (string).'
  }
  if (p.expiresAt !== undefined && typeof p.expiresAt !== 'string') {
    return 'Field expiresAt must be a string when present.'
  }
  if (typeof p.data !== 'object' || p.data === null || Array.isArray(p.data)) {
    return 'Missing field: data (BenchmarkFile object).'
  }

  const dataError = validateBenchmarkFile(p.data)
  if (dataError) return `Invalid benchmark data: ${dataError}`

  return null
}

/**
 * Extracts the BenchmarkFile from a validated ExternalBenchmarkPayload.
 * This is the value to pass to parseBenchmarkFile() or rankBenchmarksAdapterFromFile().
 *
 * Precondition: validateExternalPayload(payload) === null.
 */
export function externalPayloadToFile(payload: ExternalBenchmarkPayload): BenchmarkFile {
  return payload.data
}

/**
 * Returns true if the payload has an expiresAt timestamp that is in the past.
 * Returns false if expiresAt is absent (treat as non-expiring).
 *
 * @param payload - A validated ExternalBenchmarkPayload.
 * @param now     - Reference time for comparison; defaults to the current time.
 */
export function isExternalPayloadExpired(
  payload: ExternalBenchmarkPayload,
  now: Date = new Date(),
): boolean {
  if (!payload.expiresAt) return false
  return new Date(payload.expiresAt) < now
}
