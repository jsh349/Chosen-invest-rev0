/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  // Only treat *.test.ts files as test suites; leaves fixture/helper files alone.
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  // Baseline coverage thresholds — set ~8 points below current actuals so
  // normal feature work has headroom, but large regressions fail CI.
  // Current actuals (2026-03-30): statements 79%, branches 77%, functions 77%, lines 80%.
  // Raise these incrementally as coverage improves, never lower them.
  coverageThreshold: {
    global: {
      statements: 70,
      branches:   70,
      functions:  70,
      lines:      70,
    },
  },
}
