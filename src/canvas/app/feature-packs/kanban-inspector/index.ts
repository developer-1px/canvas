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
  CANVAS_KANBAN_INSPECTOR_PANEL,
} from './CanvasKanbanInspectorPanel'

export {
  addCanvasKanbanCard,
  CANVAS_KANBAN_INSPECTOR_PANEL,
  changeCanvasKanbanCardText,
  moveCanvasKanbanCard,
  removeCanvasKanbanCard,
} from './CanvasKanbanInspectorPanel'

export const CANVAS_APP_KANBAN_INSPECTOR_FEATURE_PACK =
  createCanvasAppFeaturePack({
    extensionBundle: createCanvasAppExtensionBundle({
      inspectorPanels: [CANVAS_KANBAN_INSPECTOR_PANEL],
    }),
    id: 'kanban-inspector',
    label: 'Kanban inspector',
  })

export const CANVAS_APP_KANBAN_INSPECTOR_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    extensionFeaturePack: CANVAS_APP_KANBAN_INSPECTOR_FEATURE_PACK,
    id: 'kanban-inspector',
    label: 'Kanban inspector',
  })
