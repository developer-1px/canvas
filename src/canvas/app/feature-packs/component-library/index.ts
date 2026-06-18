import {
  CANVAS_COMPONENT_DEFINITION_REGISTRY,
  CANVAS_COMPONENT_LIBRARY,
  DEFAULT_CANVAS_COMPONENT_TEMPLATES,
} from '../../../host'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'

export const CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    category: 'foundation',
    contributes: {
      surfaces: ['item-schema', 'runtime-model'],
    },
    id: 'component-library',
    label: 'Component library',
    lifecycle: {
      hotReloadable: true,
      partialUpdate: ['runtime-model'],
      runtimeToggleable: true,
    },
    runtimeFeaturePacks: {
      componentDefinitionRegistry: CANVAS_COMPONENT_DEFINITION_REGISTRY,
      componentLibrary: CANVAS_COMPONENT_LIBRARY,
      templates: DEFAULT_CANVAS_COMPONENT_TEMPLATES,
    },
  })
