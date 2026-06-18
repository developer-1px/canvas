import {
  createCanvasAppExtensionBundle,
} from '../../extensions/CanvasAppExtensionBundle'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  createCanvasAppFeaturePack,
} from '../CanvasAppFeaturePacks'
import {
  CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY,
} from '../component-library'
import {
  CANVAS_COMPONENT_INSPECTOR_PANEL,
} from './CanvasComponentInspectorPanel'

export {
  CANVAS_COMPONENT_INSPECTOR_PANEL,
  getCanvasComponentInspectorPanelModel,
  type CanvasComponentInspectorPanelModel,
} from './CanvasComponentInspectorPanel'

export const CANVAS_APP_COMPONENT_INSPECTOR_FEATURE_PACK =
  createCanvasAppFeaturePack({
    extensionBundle: createCanvasAppExtensionBundle({
      inspectorPanels: [CANVAS_COMPONENT_INSPECTOR_PANEL],
    }),
    id: 'component-inspector',
    label: 'Component inspector',
  })

export const CANVAS_APP_COMPONENT_INSPECTOR_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    category: 'inspection',
    contributes: {
      surfaces: ['inspector'],
    },
    extensionFeaturePack: CANVAS_APP_COMPONENT_INSPECTOR_FEATURE_PACK,
    id: 'component-inspector',
    label: 'Component inspector',
    lifecycle: {
      hotReloadable: true,
      partialUpdate: ['inspector'],
      runtimeToggleable: true,
    },
    requires: [CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY],
  })
