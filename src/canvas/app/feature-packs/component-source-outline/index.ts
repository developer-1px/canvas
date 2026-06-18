import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY,
} from '../component-library'

export const CANVAS_APP_COMPONENT_SOURCE_OUTLINE_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    category: 'inspection',
    contributes: {
      surfaces: ['overlay'],
    },
    id: 'component-source-outline',
    label: 'Component source outline',
    lifecycle: {
      hotReloadable: true,
      partialUpdate: ['overlay'],
      runtimeToggleable: true,
    },
    requires: [CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY],
  })
