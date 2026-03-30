import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // ── Generated UI components ─────────────────────────────────────────────
  // shadcn/ui generates empty-interface extends (e.g. `interface InputProps extends HTMLInputAttributes {}`).
  // Suppress the TypeScript rule that flags these as errors in generated files only.
  {
    files: ['components/ui/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },

  // ── Architecture boundary ────────────────────────────────────────────────
  // features/ and components/ must not import infrastructure modules directly.
  // Use adapters, API routes, or server actions as the data-access seam instead.
  {
    files: ['features/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/lib/db', '@/lib/db/*'],
              message:
                'Direct DB access is not allowed in features/ or components/. Use a lib/adapters module or an API route.',
            },
            {
              group: ['@/lib/supabase', '@/lib/supabase/*'],
              message:
                'Direct Supabase access is not allowed in features/ or components/. Use a lib/adapters module or an API route.',
            },
            {
              group: ['@/lib/env/server'],
              message:
                'Server-only env vars must not be imported from features/ or components/.',
            },
          ],
        },
      ],
    },
  },
]
