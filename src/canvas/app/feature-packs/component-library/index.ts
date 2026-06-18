import {
  CANVAS_COMPONENT_DEFINITION_REGISTRY,
  DEFAULT_CANVAS_COMPONENT_TEMPLATES,
  createCanvasComponentLibrary,
} from '../../../host'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'

export const CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY =
  'component-runtime'

const CANVAS_APP_COMPONENT_RUNTIME_LIBRARY = createCanvasComponentLibrary({
  templates: DEFAULT_CANVAS_COMPONENT_TEMPLATES,
})

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
    provides: [CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY],
    runtimeFeaturePacks: {
      componentDefinitionRegistry: CANVAS_COMPONENT_DEFINITION_REGISTRY,
      componentLibrary: CANVAS_APP_COMPONENT_RUNTIME_LIBRARY,
      templates: DEFAULT_CANVAS_COMPONENT_TEMPLATES,
    },
  })
