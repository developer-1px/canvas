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
import { DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER } from '../rendering/CanvasAppItemLayerAdapter'
import { DEFAULT_CANVAS_APP_STAGE_ADAPTER } from '../rendering/CanvasAppStageAdapter'
import { DEFAULT_CANVAS_WORKSPACE_STORAGE_PROVIDER } from '../document/CanvasWorkspacePersistence'
import type { CanvasAppAssembly } from './CanvasAppAssemblyTypes'
import { snapshotCanvasAppAssembly } from './CanvasAppAssemblySnapshot'

const DEFAULT_CANVAS_APP_INITIAL_SELECTION = [
  'component-sticky',
  'component-card',
]

export const DEFAULT_CANVAS_APP_ASSEMBLY: CanvasAppAssembly =
  snapshotCanvasAppAssembly({
    affordanceConfig: DEFAULT_CANVAS_AFFORDANCE_CONFIG,
    componentLibrary: CANVAS_COMPONENT_LIBRARY,
    componentPresentationRenderers:
      DEFAULT_CANVAS_APP_COMPONENT_PRESENTATION_RENDERERS,
    customCommands: [],
    customCreationTools: [],
    customItemRenderers: DEFAULT_CANVAS_APP_CUSTOM_ITEM_RENDERERS,
    customItemValidators: {},
    inspectorPanels: [],
    initialItems: INITIAL_ITEMS,
    initialSelection: DEFAULT_CANVAS_APP_INITIAL_SELECTION,
    itemAdapters: CANVAS_ITEM_ENGINE_ADAPTERS,
    itemLayerAdapter: DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER,
    stageAdapter: DEFAULT_CANVAS_APP_STAGE_ADAPTER,
    workspaceStorageProvider: DEFAULT_CANVAS_WORKSPACE_STORAGE_PROVIDER,
  })
