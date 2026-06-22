import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import type {
  CanvasAffordanceConfigInput,
} from '../../../engine'

export const CANVAS_APP_SHAPE_AUTHORING_FEATURE_PACK_ID = 'shape-authoring'

const CANVAS_APP_SHAPE_AUTHORING_DISABLED_CONFIG = {
  gestures: {
    createShape: false,
  },
  overlays: {
    draftRect: false,
  },
  shortcuts: {
    ellipseTool: false,
    rectTool: false,
  },
  tools: {
    diamond: false,
    ellipse: false,
    rect: false,
  },
} satisfies CanvasAffordanceConfigInput

export const CANVAS_APP_SHAPE_AUTHORING_RUNTIME_FEATURE_PACK = Object.freeze({
  disabledConfig: CANVAS_APP_SHAPE_AUTHORING_DISABLED_CONFIG,
  featurePackId: CANVAS_APP_SHAPE_AUTHORING_FEATURE_PACK_ID,
  id: CANVAS_APP_SHAPE_AUTHORING_FEATURE_PACK_ID,
})

export const CANVAS_APP_SHAPE_AUTHORING_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
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
    id: CANVAS_APP_SHAPE_AUTHORING_FEATURE_PACK_ID,
    label: 'Shape authoring',
    lifecycle: {
      orphanedDataPolicy: 'preserve',
      orphanedDataScopeIds: [CANVAS_APP_SHAPE_AUTHORING_FEATURE_PACK_ID],
      partialUpdate: ['item-renderer', 'inspector', 'tool'],
      runtimeToggleable: true,
    },
    runtimeFeaturePacks: {
      shapeAuthoring: CANVAS_APP_SHAPE_AUTHORING_RUNTIME_FEATURE_PACK,
    },
  })
