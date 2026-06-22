import { describe, expect, it } from 'vitest'

const workspacePackageSourceModules = import.meta.glob(
  [
    '../../../packages/**/*.{ts,tsx}',
    '!../../../packages/**/dist/**',
  ],
  {
    eager: true,
    import: 'default',
    query: '?raw',
  },
) as Record<string, string>

const appSourceModules = import.meta.glob('../../../src/**/*.{ts,tsx}', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const sourceRelativeCanvasImportPattern =
  /(?:from\s+|import\s*\(\s*)['"][^'"]*src\/canvas(?:\/[^'"]*)?['"]/g
const workspacePackageSourceImportPattern =
  /(?:from\s+|import\s+|import\s*\(\s*)['"][^'"]*packages\/[^'"]+\/src(?:\/[^'"]*)?['"]/g

describe('Canvas workspace package boundaries', () => {
  it('keeps workspace packages on public canvas package subpaths', () => {
    const violations = Object.entries(workspacePackageSourceModules).flatMap(
      ([path, source]) =>
        [...source.matchAll(sourceRelativeCanvasImportPattern)].map(
          ([importStatement]) => `${path}: ${importStatement}`,
        ),
    )

    expect(violations).toEqual([])
  })

  it('keeps app code on public workspace package specifiers', () => {
    const violations = Object.entries(appSourceModules).flatMap(
      ([path, source]) =>
        [...source.matchAll(workspacePackageSourceImportPattern)].map(
          ([importStatement]) => `${path}: ${importStatement}`,
        ),
    )

    expect(violations).toEqual([])
  })
})
