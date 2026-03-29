/**
 * Curated benchmark dataset slot.
 *
 * To swap the active rank benchmark dataset:
 *   1. Replace `null` below with a BenchmarkFile object (version "1" shape).
 *   2. The adapter will validate it at startup and use it in place of the defaults.
 *   3. If the value is null or fails validation, the built-in defaults are used.
 *
 * To revert to defaults, set this back to null.
 */
import type { BenchmarkFile } from '@/lib/types/benchmark-import'

export const CURATED_BENCHMARK_FILE: BenchmarkFile | null = null
