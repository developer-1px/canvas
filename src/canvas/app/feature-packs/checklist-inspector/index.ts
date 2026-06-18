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
  CANVAS_CHECKLIST_INSPECTOR_PANEL,
} from './CanvasChecklistInspectorPanel'

export {
  addCanvasChecklistItem,
  CANVAS_CHECKLIST_INSPECTOR_PANEL,
  changeCanvasChecklistItemChecked,
  changeCanvasChecklistItemText,
  removeCanvasChecklistItem,
} from './CanvasChecklistInspectorPanel'

export const CANVAS_APP_CHECKLIST_INSPECTOR_FEATURE_PACK =
  createCanvasAppFeaturePack({
    extensionBundle: createCanvasAppExtensionBundle({
      inspectorPanels: [CANVAS_CHECKLIST_INSPECTOR_PANEL],
    }),
    id: 'checklist-inspector',
    label: 'Checklist inspector',
  })

export const CANVAS_APP_CHECKLIST_INSPECTOR_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    extensionFeaturePack: CANVAS_APP_CHECKLIST_INSPECTOR_FEATURE_PACK,
    id: 'checklist-inspector',
    label: 'Checklist inspector',
  })
