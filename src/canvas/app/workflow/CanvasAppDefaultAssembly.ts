import {
  CANVAS_STICKY_NOTE_EXTENSION,
} from '../../foundation'
import { DEFAULT_CANVAS_AFFORDANCE_CONFIG } from '../../engine'
import {
  CANVAS_COMPONENT_DEFINITION_REGISTRY,
  CANVAS_COMPONENT_LIBRARY,
  CANVAS_ITEM_ENGINE_ADAPTERS,
  INITIAL_ITEMS,
} from '../../host'
import {
  DEFAULT_CANVAS_APP_COMPONENT_PRESENTATION_RENDERERS,
  DEFAULT_CANVAS_APP_CUSTOM_ITEM_RENDERERS,
} from '../rendering/CanvasAppRendererRegistries'
import {
  createCanvasAppExtensionBundle,
  mergeCanvasAppExtensionBundle,
} from '../extensions/CanvasAppExtensionBundle'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_EXTENSION_BUNDLE,
  DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
  DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS,
  getCanvasAppInstalledFeaturePackManifestIds,
} from '../feature-packs'
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

export const DEFAULT_CANVAS_APP_BASE_EXTENSION_BUNDLE =
  createCanvasAppExtensionBundle({
    customItemRenderers: DEFAULT_CANVAS_APP_CUSTOM_ITEM_RENDERERS,
    foundationExtensions: [CANVAS_STICKY_NOTE_EXTENSION],
  })

const DEFAULT_CANVAS_APP_EXTENSION_BUNDLE = mergeCanvasAppExtensionBundle({
  current: DEFAULT_CANVAS_APP_BASE_EXTENSION_BUNDLE,
  entries: DEFAULT_CANVAS_APP_FEATURE_PACK_EXTENSION_BUNDLE,
  owner: 'app assembly',
})

export const DEFAULT_CANVAS_APP_ASSEMBLY: CanvasAppAssembly =
  snapshotCanvasAppAssembly({
    ...DEFAULT_CANVAS_APP_EXTENSION_BUNDLE,
    affordanceConfig: DEFAULT_CANVAS_AFFORDANCE_CONFIG,
    capabilities: CANVAS_APP_EDITOR_CAPABILITIES,
    componentDefinitionRegistry: CANVAS_COMPONENT_DEFINITION_REGISTRY,
    componentLibrary: CANVAS_COMPONENT_LIBRARY,
    componentPresentationRenderers:
      DEFAULT_CANVAS_APP_COMPONENT_PRESENTATION_RENDERERS,
    featurePackViewRenderers: DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS,
    installedFeaturePackIds: getCanvasAppInstalledFeaturePackManifestIds(
      DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
    ),
    initialItems: INITIAL_ITEMS,
    initialSelection: DEFAULT_CANVAS_APP_INITIAL_SELECTION,
    itemAdapters: CANVAS_ITEM_ENGINE_ADAPTERS,
    itemLayerAdapter: DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER,
    presenceProvider: EMPTY_CANVAS_APP_PRESENCE_PROVIDER,
    stageAdapter: DEFAULT_CANVAS_APP_STAGE_ADAPTER,
    workspaceStorageProvider: DEFAULT_CANVAS_WORKSPACE_STORAGE_PROVIDER,
  })
