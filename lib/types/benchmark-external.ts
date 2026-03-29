import type { BenchmarkFile } from '@/lib/types/benchmark-import'

/**
 * Typed contract for benchmark data received from an external source.
 *
 * Wraps a BenchmarkFile (the canonical in-app schema) with fetch-context metadata
 * so callers can track freshness and provenance without polluting BenchmarkFile itself.
 *
 * When a real HTTP fetch layer is added, it should produce this type.
 * The adapter layer converts it to BenchmarkFile via externalPayloadToFile().
 */
export type ExternalBenchmarkPayload = {
  /** ISO 8601 timestamp when this data was fetched from the external source */
  fetchedAt: string
  /**
   * ISO 8601 timestamp after which this data should be re-fetched or treated as stale.
   * Omit if the source does not publish an expiry.
   */
  expiresAt?: string
  /**
   * URL or stable identifier for the external source.
   * Used for display, audit logging, and fingerprinting — not for live fetching.
   */
  sourceUrl: string
  /** The benchmark data — same schema as a locally imported BenchmarkFile. */
  data: BenchmarkFile
}
