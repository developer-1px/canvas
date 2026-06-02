import {
  CANVAS_STICKY_NOTE_EXTENSION,
} from '../../foundation'
import { DEFAULT_CANVAS_AFFORDANCE_CONFIG } from '../../engine'
import {
  CANVAS_COMPONENT_LIBRARY,
  CANVAS_ITEM_ENGINE_ADAPTERS,
  INITIAL_ITEMS,
} from '../../host'
import {
  DEFAULT_CANVAS_APP_COMPONENT_PRESENTATION_RENDERERS,
  DEFAULT_CANVAS_APP_CUSTOM_ITEM_RENDERERS,
} from '../rendering/CanvasAppRendererRegistries'
import { createCanvasAppExtensionBundle } from '../extensions/CanvasAppExtensionBundle'
import {
  CANVAS_CHECKLIST_INSPECTOR_PANEL,
} from '../affordances/editing/component-panels/checklist/CanvasChecklistInspectorPanel'
import {
  CANVAS_ARROW_ROUTING_INSPECTOR_PANEL,
} from '../affordances/editing/arrow-routing/CanvasArrowRoutingInspectorPanel'
import {
  CANVAS_KANBAN_INSPECTOR_PANEL,
} from '../affordances/editing/component-panels/kanban/CanvasKanbanInspectorPanel'
import {
  CANVAS_LINK_PREVIEW_INSPECTOR_PANEL,
} from '../affordances/io/link-preview/CanvasLinkPreviewInspectorPanel'
import { DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER } from '../rendering/CanvasAppItemLayerAdapter'
import { DEFAULT_CANVAS_APP_STAGE_ADAPTER } from '../rendering/CanvasAppStageAdapter'
import { DEFAULT_CANVAS_WORKSPACE_STORAGE_PROVIDER } from '../workspace/document/CanvasWorkspacePersistence'
import {
  CANVAS_APP_EDITOR_CAPABILITIES,
} from './CanvasAppCapabilityAssembly'
import {
  EMPTY_CANVAS_APP_PRESENCE_PROVIDER,
} from './CanvasAppCollaborationAssembly'
import type { CanvasAppAssembly } from './CanvasAppAssemblyTypes'
import { snapshotCanvasAppAssembly } from './CanvasAppAssemblySnapshot'

const DEFAULT_CANVAS_APP_INITIAL_SELECTION = [
  'component-sticky',
  'component-card',
]

export const DEFAULT_CANVAS_APP_ASSEMBLY: CanvasAppAssembly =
  snapshotCanvasAppAssembly({
    ...createCanvasAppExtensionBundle({
      customItemRenderers: DEFAULT_CANVAS_APP_CUSTOM_ITEM_RENDERERS,
      foundationExtensions: [CANVAS_STICKY_NOTE_EXTENSION],
      inspectorPanels: [
        CANVAS_LINK_PREVIEW_INSPECTOR_PANEL,
        CANVAS_ARROW_ROUTING_INSPECTOR_PANEL,
        CANVAS_CHECKLIST_INSPECTOR_PANEL,
        CANVAS_KANBAN_INSPECTOR_PANEL,
      ],
    }),
    affordanceConfig: DEFAULT_CANVAS_AFFORDANCE_CONFIG,
    capabilities: CANVAS_APP_EDITOR_CAPABILITIES,
    componentLibrary: CANVAS_COMPONENT_LIBRARY,
    componentPresentationRenderers:
      DEFAULT_CANVAS_APP_COMPONENT_PRESENTATION_RENDERERS,
    initialItems: INITIAL_ITEMS,
    initialSelection: DEFAULT_CANVAS_APP_INITIAL_SELECTION,
    itemAdapters: CANVAS_ITEM_ENGINE_ADAPTERS,
    itemLayerAdapter: DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER,
    presenceProvider: EMPTY_CANVAS_APP_PRESENCE_PROVIDER,
    stageAdapter: DEFAULT_CANVAS_APP_STAGE_ADAPTER,
    workspaceStorageProvider: DEFAULT_CANVAS_WORKSPACE_STORAGE_PROVIDER,
  })
