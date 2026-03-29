#!/usr/bin/env node
/**
 * Generates a valid Auth.js v5 JWE session token from AUTH_SECRET.
 * Reads AUTH_SECRET from .env.local, writes token to stdout.
 * Called by Playwright test setup via execSync.
 */
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '../../../.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const secretLine = envContent.split('\n').find((l) => l.startsWith('AUTH_SECRET='))
const secret = secretLine ? secretLine.split('=').slice(1).join('=').trim() : ''

if (!secret) {
  process.stderr.write('AUTH_SECRET not found in .env.local\n')
  process.exit(1)
}

async function main() {
  const { encode } = require('@auth/core/jwt')
  const now = Math.floor(Date.now() / 1000)
  const token = await encode({
    token: {
      sub: 'pw_test_user',
      name: 'Playwright User',
      email: 'pw@example.com',
      picture: null,
      iat: now,
      exp: now + 3600,
      jti: 'pw-' + Date.now(),
    },
    secret,
    salt: 'authjs.session-token',
  })
  process.stdout.write(token)
}

main().catch((e) => {
  process.stderr.write(e.message + '\n')
  process.exit(1)
})
