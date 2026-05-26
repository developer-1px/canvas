import { describe, expect, it } from 'vitest'

import { sourceFiles } from './CanvasArchitectureTestSources'

describe('Canvas UI folder structure', () => {
  it('keeps shared ui folders primitive-only', () => {
    const uiTopLevelFolders = Array.from(
      new Set(
        sourceFiles
          .filter((file) => file.path.startsWith('src/canvas/ui/'))
          .filter((file) => file.path.split('/').length > 4)
          .map((file) => file.path.split('/')[3])
          .filter((folder): folder is string => folder !== undefined),
      ),
    ).sort()

    expect(uiTopLevelFolders).toEqual(['icons'])
  })
})
