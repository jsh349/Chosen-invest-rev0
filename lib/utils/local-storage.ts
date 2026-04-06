/** Safely read a raw string from localStorage. Returns null on server or any error. */
export function readScalar(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Safely write a raw string to localStorage.
 * Returns true on success, false on failure (quota exceeded, security error, etc.).
 */
export function writeScalar(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/** Safely remove a key from localStorage. Silently ignores errors. */
export function removeKey(key: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore quota or security errors
  }
}

/** Safely read and parse JSON from localStorage. Returns fallback on any error. */
export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

/**
 * Safely write JSON to localStorage.
 * Returns true on success, false on failure (quota exceeded, security error, etc.).
 */
export function writeJSON(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
