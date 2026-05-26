import { describe, expect, it } from 'vitest'

import { sourceFiles } from './CanvasArchitectureTestSources'

describe('Canvas App folder structure', () => {
  it('keeps app source grouped by the current feature map', () => {
    const appTopLevelFolders = Array.from(
      new Set(
        sourceFiles
          .filter((file) => file.path.startsWith('src/canvas/app/'))
          .filter((file) => file.path.split('/').length > 4)
          .map((file) => file.path.split('/')[3])
          .filter((folder): folder is string => folder !== undefined),
      ),
    ).sort()

    expect(appTopLevelFolders).toEqual([
      'affordances',
      'authoring',
      'extensions',
      'rendering',
      'shell',
      'workflow',
      'workspace',
    ])
  })


  it('keeps learned App affordances grouped under the internal affordance module', () => {
    const affordanceFolders = Array.from(
      new Set(
        sourceFiles
          .filter((file) =>
            file.path.startsWith('src/canvas/app/affordances/'),
          )
          .filter((file) => file.path.split('/').length > 5)
          .map((file) => file.path.split('/')[4])
          .filter((folder): folder is string => folder !== undefined),
      ),
    ).sort()

    expect(affordanceFolders).toEqual([
      'authoring',
      'commands',
      'controls',
      'editing',
      'interaction',
      'io',
    ])
  })
})
