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
  CANVAS_ARROW_ROUTING_INSPECTOR_PANEL,
} from './CanvasArrowRoutingInspectorPanel'

export {
  CANVAS_ARROW_ROUTING_INSPECTOR_PANEL,
  changeCanvasArrowRouting,
} from './CanvasArrowRoutingInspectorPanel'

export const CANVAS_APP_ARROW_ROUTING_INSPECTOR_FEATURE_PACK =
  createCanvasAppFeaturePack({
    extensionBundle: createCanvasAppExtensionBundle({
      inspectorPanels: [CANVAS_ARROW_ROUTING_INSPECTOR_PANEL],
    }),
    id: 'arrow-routing-inspector',
    label: 'Arrow routing inspector',
  })

export const CANVAS_APP_ARROW_ROUTING_INSPECTOR_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    extensionFeaturePack: CANVAS_APP_ARROW_ROUTING_INSPECTOR_FEATURE_PACK,
    id: 'arrow-routing-inspector',
    label: 'Arrow routing inspector',
  })
