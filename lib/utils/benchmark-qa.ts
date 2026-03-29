import type { BenchmarkBucket } from '@/lib/types/rank'

export type BucketIssue = {
  dataset: string
  /** Row index within the dataset (-1 = dataset-level issue) */
  index: number
  message: string
}

/**
 * Lightweight QA check for a single BenchmarkBucket array.
 * Returns an array of issue descriptors (empty = clean).
 * Never throws.
 */
export function validateBuckets(dataset: string, buckets: BenchmarkBucket[]): BucketIssue[] {
  const issues: BucketIssue[] = []

  if (!Array.isArray(buckets) || buckets.length === 0) {
    issues.push({ dataset, index: -1, message: 'Empty or missing bucket array.' })
    return issues
  }

  for (let i = 0; i < buckets.length; i++) {
    const b = buckets[i]

    // percentile — must be a number in [0, 100]
    if (typeof b.percentile !== 'number' || isNaN(b.percentile)) {
      issues.push({ dataset, index: i, message: 'percentile is not a valid number.' })
    } else if (b.percentile < 0 || b.percentile > 100) {
      issues.push({ dataset, index: i, message: `percentile ${b.percentile} is outside [0, 100].` })
    }

    // minValue / maxValue — must be numbers (±Infinity allowed, NaN is not)
    if (typeof b.minValue !== 'number' || isNaN(b.minValue)) {
      issues.push({ dataset, index: i, message: 'minValue is not a valid number.' })
    }
    if (typeof b.maxValue !== 'number' || isNaN(b.maxValue)) {
      issues.push({ dataset, index: i, message: 'maxValue is not a valid number.' })
    }

    // maxValue must be strictly greater than minValue
    if (
      typeof b.minValue === 'number' && !isNaN(b.minValue) &&
      typeof b.maxValue === 'number' && !isNaN(b.maxValue) &&
      b.maxValue <= b.minValue
    ) {
      issues.push({ dataset, index: i, message: `maxValue (${b.maxValue}) must be > minValue (${b.minValue}).` })
    }

    // ageRange — if present must be a valid [lo, hi] tuple
    if (b.ageRange !== undefined) {
      if (!Array.isArray(b.ageRange) || b.ageRange.length !== 2) {
        issues.push({ dataset, index: i, message: 'ageRange must be a [min, max] tuple.' })
      } else if (
        typeof b.ageRange[0] !== 'number' ||
        typeof b.ageRange[1] !== 'number' ||
        b.ageRange[0] > b.ageRange[1]
      ) {
        issues.push({ dataset, index: i, message: `ageRange [${b.ageRange[0]}, ${b.ageRange[1]}] is invalid.` })
      }
    }
  }

  return issues
}

/**
 * Run QA on all four standard benchmark datasets.
 * Logs console.warn for each issue found; never throws or blocks.
 * Returns total issue count (0 = all clean).
 */
export function runBenchmarkQA(
  datasets: Record<string, BenchmarkBucket[]>,
  { silent = false }: { silent?: boolean } = {},
): number {
  let total = 0
  for (const [name, buckets] of Object.entries(datasets)) {
    const issues = validateBuckets(name, buckets)
    total += issues.length
    if (!silent && issues.length > 0) {
      for (const issue of issues) {
        console.warn(`[BenchmarkQA] ${issue.dataset}[${issue.index}]: ${issue.message}`)
      }
    }
  }
  return total
}
