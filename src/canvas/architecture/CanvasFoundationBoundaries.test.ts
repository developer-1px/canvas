import { describe, expect, it } from 'vitest'

import {
  getImportsFrom,
  sourceFiles,
  targetsAnyLayer,
} from './CanvasArchitectureTestSources'

describe('Canvas foundation boundaries', () => {
  it('keeps foundation independent from Engine, Host, App, Renderer, and UI implementation layers', () => {
    const violations = getImportsFrom('src/canvas/foundation/')
      .filter((reference) =>
        targetsAnyLayer(reference, ['app', 'engine', 'host', 'renderer', 'ui']),
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

  it('keeps promoted foundation source out of engine implementation folders', () => {
    const paths = new Set(sourceFiles.map((file) => file.path))

    expect(paths.has('src/canvas/foundation/CanvasAlignmentSnap.ts')).toBe(true)
    expect(paths.has('src/canvas/foundation/CanvasCommandAvailability.ts'))
      .toBe(true)
    expect(paths.has('src/canvas/foundation/CanvasCommandAvailabilityRules.ts'))
      .toBe(true)
    expect(paths.has('src/canvas/foundation/CanvasCommandSelectionRules.ts'))
      .toBe(true)
    expect(paths.has('src/canvas/foundation/CanvasCommandTypes.ts')).toBe(true)
    expect(paths.has('src/canvas/foundation/CanvasFirstPartyExtensions.ts'))
      .toBe(true)
    expect(paths.has('src/canvas/foundation/CanvasGestureEngine.ts')).toBe(true)
    expect(paths.has('src/canvas/foundation/CanvasGridSnap.ts')).toBe(true)
    expect(paths.has('src/canvas/foundation/CanvasSceneAdapter.ts')).toBe(true)
    expect(paths.has('src/canvas/foundation/CanvasSelectionEngine.ts')).toBe(true)
    expect(paths.has('src/canvas/foundation/CanvasSnapEngine.ts')).toBe(true)
    expect(paths.has('src/canvas/foundation/CanvasSnapGeometry.ts')).toBe(true)
    expect(paths.has('src/canvas/foundation/CanvasSnapGuides.ts')).toBe(true)
    expect(paths.has('src/canvas/foundation/CanvasSpacingSnap.ts')).toBe(true)
    expect(paths.has('src/canvas/foundation/CanvasToolGestureRouting.ts'))
      .toBe(true)
    expect(paths.has('src/canvas/foundation/CanvasTransformEngine.ts')).toBe(true)
    expect(paths.has('src/canvas/engine/gesture/CanvasGestureEngine.ts'))
      .toBe(false)
    expect(paths.has('src/canvas/engine/snap/CanvasAlignmentSnap.ts'))
      .toBe(false)
    expect(paths.has('src/canvas/engine/snap/CanvasGridSnap.ts')).toBe(false)
    expect(paths.has('src/canvas/engine/snap/CanvasSnapEngine.ts')).toBe(false)
    expect(paths.has('src/canvas/engine/snap/CanvasSnapGeometry.ts'))
      .toBe(false)
    expect(paths.has('src/canvas/engine/snap/CanvasSnapGuides.ts')).toBe(false)
    expect(paths.has('src/canvas/engine/snap/CanvasSpacingSnap.ts'))
      .toBe(false)
    expect(paths.has('src/canvas/engine/command/CanvasCommandAvailability.ts'))
      .toBe(false)
    expect(paths.has('src/canvas/engine/command/CanvasCommandAvailabilityRules.ts'))
      .toBe(false)
    expect(paths.has('src/canvas/engine/command/CanvasCommandSelectionRules.ts'))
      .toBe(false)
    expect(paths.has('src/canvas/engine/command/CanvasCommandTypes.ts'))
      .toBe(false)
    expect(paths.has('src/canvas/engine/scene/CanvasSceneAdapter.ts')).toBe(false)
    expect(paths.has('src/canvas/engine/selection/CanvasSelectionEngine.ts'))
      .toBe(false)
    expect(paths.has('src/canvas/engine/gesture/CanvasToolGestureRouting.ts'))
      .toBe(false)
    expect(paths.has('src/canvas/engine/transform/CanvasTransformEngine.ts'))
      .toBe(false)
  })
})
