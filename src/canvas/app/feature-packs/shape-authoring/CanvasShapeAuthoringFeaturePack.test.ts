import { describe, expect, it } from 'vitest'

import {
  createCanvasAffordanceConfig,
} from '../../../engine'
import {
  getCanvasAppShapeAuthoringFeatureConfig,
  getCanvasAppRuntimeFeatureConfig,
} from '../CanvasAppFeaturePackRuntimeModel'
import {
  CANVAS_APP_SHAPE_AUTHORING_FEATURE_PACK_ID,
  CANVAS_APP_SHAPE_AUTHORING_FEATURE_PACK_MANIFEST,
  CANVAS_APP_SHAPE_AUTHORING_RUNTIME_FEATURE_PACK,
} from './index'

describe('CanvasShapeAuthoringFeaturePack', () => {
  it('declares shape authoring as a complete feature pack contract', () => {
    expect(CANVAS_APP_SHAPE_AUTHORING_FEATURE_PACK_MANIFEST).toMatchObject({
      category: 'authoring',
      contributes: {
        surfaces: [
          'command',
          'inspector',
          'item-renderer',
          'item-schema',
          'migration',
          'tool',
        ],
      },
      id: 'shape-authoring',
      label: 'Shape authoring',
      lifecycle: {
        orphanedDataPolicy: 'preserve',
        orphanedDataScopeIds: ['shape-authoring'],
        partialUpdate: ['item-renderer', 'inspector', 'tool'],
        runtimeToggleable: true,
      },
      package: {
        name: '@interactive-os/canvas',
        subpath: undefined,
      },
    })
    expect(CANVAS_APP_SHAPE_AUTHORING_FEATURE_PACK_MANIFEST.runtimeFeaturePacks)
      .toEqual({
        shapeAuthoring: CANVAS_APP_SHAPE_AUTHORING_RUNTIME_FEATURE_PACK,
      })
  })

  it('masks shape authoring affordances when the pack is disabled', () => {
    const config = createCanvasAffordanceConfig()
    const disabledConfig = getCanvasAppShapeAuthoringFeatureConfig({
      config,
      enabledFeaturePackIds: [],
    })

    expect(disabledConfig.gestures.createShape).toBe(false)
    expect(disabledConfig.overlays.draftRect).toBe(false)
    expect(disabledConfig.shortcuts.ellipseTool).toBe(false)
    expect(disabledConfig.shortcuts.rectTool).toBe(false)
    expect(disabledConfig.tools.diamond).toBe(false)
    expect(disabledConfig.tools.ellipse).toBe(false)
    expect(disabledConfig.tools.rect).toBe(false)
    expect(disabledConfig.tools.text).toBe(true)
  })

  it('keeps shape authoring affordances enabled when the pack is enabled', () => {
    const config = createCanvasAffordanceConfig()
    const enabledConfig = getCanvasAppShapeAuthoringFeatureConfig({
      config,
      enabledFeaturePackIds: [CANVAS_APP_SHAPE_AUTHORING_FEATURE_PACK_ID],
    })

    expect(enabledConfig.gestures.createShape).toBe(true)
    expect(enabledConfig.overlays.draftRect).toBe(true)
    expect(enabledConfig.shortcuts.ellipseTool).toBe(true)
    expect(enabledConfig.shortcuts.rectTool).toBe(true)
    expect(enabledConfig.tools.diamond).toBe(true)
    expect(enabledConfig.tools.ellipse).toBe(true)
    expect(enabledConfig.tools.rect).toBe(true)
  })

  it('exposes the disabled affordance mask as a runtime descriptor', () => {
    const config = createCanvasAffordanceConfig()
    const disabledConfig = getCanvasAppRuntimeFeatureConfig({
      config,
      disabledConfig:
        CANVAS_APP_SHAPE_AUTHORING_RUNTIME_FEATURE_PACK.disabledConfig,
      enabled: false,
    })

    expect(disabledConfig.tools.rect).toBe(false)
  })

  it('keeps the pack id aligned across manifest and runtime descriptor', () => {
    expect(CANVAS_APP_SHAPE_AUTHORING_FEATURE_PACK_ID).toBe('shape-authoring')
    expect(CANVAS_APP_SHAPE_AUTHORING_FEATURE_PACK_MANIFEST.id)
      .toBe(CANVAS_APP_SHAPE_AUTHORING_FEATURE_PACK_ID)
    expect(CANVAS_APP_SHAPE_AUTHORING_RUNTIME_FEATURE_PACK.featurePackId)
      .toBe(CANVAS_APP_SHAPE_AUTHORING_FEATURE_PACK_ID)
  })
})
