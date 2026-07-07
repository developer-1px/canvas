import { describe, expect, it } from 'vitest'

import { sourceFiles } from './CanvasArchitectureTestSources'

describe('Canvas demo naming boundaries', () => {
  it('keeps demo lineage vocabulary out of canvas package sources', () => {
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('src/canvas/') &&
        !file.path.startsWith('src/canvas/architecture/'),
      )
      .flatMap((file) => /Demo/.test(file.source) ? [file.path] : [])

    expect(violations).toEqual([])
  })

  it('keeps demo lineage names out of canvas package file names', () => {
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('src/canvas/') &&
        !file.path.startsWith('src/canvas/architecture/'),
      )
      .flatMap((file) =>
        /demo/i.test(file.path.split('/').pop() ?? '') ? [file.path] : [],
      )

    expect(violations).toEqual([])
  })

  it('keeps the src root down to the single app entry file', () => {
    const rootEntries = sourceFiles
      .filter((file) => /^src\/[^/]+\.(ts|tsx)$/.test(file.path))
      .map((file) => file.path)

    expect(rootEntries).toEqual(['src/main.tsx'])
  })
})
