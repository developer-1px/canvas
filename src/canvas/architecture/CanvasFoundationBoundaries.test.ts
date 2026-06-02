import { describe, expect, it } from 'vitest'

import {
  getImportsFrom,
  sourceFiles,
  targetsAnyLayer,
} from './CanvasArchitectureTestSources'

describe('Canvas foundation boundaries', () => {
  it('keeps foundation independent from Host, App, Renderer, and UI implementation layers', () => {
    const violations = getImportsFrom('src/canvas/foundation/')
      .filter((reference) =>
        targetsAnyLayer(reference, ['app', 'host', 'renderer', 'ui']),
      )

    expect(violations).toEqual([])
  })

  it('keeps foundation free of Demo item storage vocabulary and zod-crud ownership', () => {
    const demoItemTerms =
      /\b(CanvasItem|RectItem|TextItem|GroupItem|CanvasComponentItem|CANVAS_COMPONENT_LIBRARY)\b/
    const violations = sourceFiles
      .filter((file) => file.path.startsWith('src/canvas/foundation/'))
      .flatMap((file) =>
        demoItemTerms.test(file.source) ||
          file.source.includes('zod-crud') ||
          file.source.includes('@zod-crud/')
          ? [file.path]
          : [],
      )

    expect(violations).toEqual([])
  })
})
