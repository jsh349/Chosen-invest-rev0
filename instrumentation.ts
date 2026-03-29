export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Patch broken localStorage polyfill that some environments inject
    // without proper method implementations (getItem, setItem, etc.)
    const isBroken =
      typeof globalThis.localStorage === 'undefined' ||
      typeof (globalThis.localStorage as Storage | undefined)?.getItem !== 'function'

    if (isBroken) {
      Object.defineProperty(globalThis, 'localStorage', {
        value: {
          getItem: (_key: string): string | null => null,
          setItem: (_key: string, _value: string): void => {},
          removeItem: (_key: string): void => {},
          clear: (): void => {},
          key: (_index: number): string | null => null,
          length: 0,
        },
        writable: true,
        configurable: true,
      })
    }
  }
}
