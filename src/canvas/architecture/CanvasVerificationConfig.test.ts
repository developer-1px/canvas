import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = fileURLToPath(new URL('../../..', import.meta.url))
const packageJson = JSON.parse(readFixture('package.json')) as {
  scripts: Record<string, string>
}
const workflow = readFixture('.github/workflows/e2e.yml')

describe('Canvas verification config', () => {
  it('provides one local and release verification contract', () => {
    expect(packageJson.scripts.verify).toBe(
      'pnpm lint && pnpm test && pnpm build && pnpm smoke:package && pnpm smoke:package:tarball',
    )
    expect(packageJson.scripts['release:check']).toBe('pnpm verify')
    expect(packageJson.scripts['smoke:package:tarball']).toBe(
      'node scripts/smoke-packed-package.mjs',
    )
  })

  it('makes the full verification contract and existing e2e suite PR gates', () => {
    expect(workflow).toContain('pnpm install --no-frozen-lockfile')
    expect(workflow).toContain('--config.link-workspace-packages=false')
    expect(workflow).not.toContain('--frozen-lockfile')
    expect(workflow).toContain('run: pnpm verify')
    expect(workflow).toContain(
      'pnpm exec playwright install --with-deps chromium webkit',
    )
    expect(workflow).toContain('run: pnpm test:e2e')
    expect(workflow).toContain('if: failure()')
    expect(workflow).toContain('uses: actions/upload-artifact@v4')
    expect(workflow).toContain('playwright-report/')
    expect(workflow).toContain('test-results/')
  })
})

function readFixture(path: string) {
  return readFileSync(`${root}/${path}`, 'utf8')
}
