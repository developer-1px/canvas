import { describe, expect, it } from 'vitest'
import {
  CANVAS_COMPONENT_LIBRARY,
  CANVAS_ITEM_ENGINE_ADAPTERS,
  INITIAL_ITEMS,
} from '../../host'
import { DEFAULT_CANVAS_AFFORDANCE_CONFIG } from '../../engine'
import {
  DEFAULT_CANVAS_APP_COMPONENT_PRESENTATION_RENDERERS,
  DEFAULT_CANVAS_APP_CUSTOM_ITEM_RENDERERS,
} from '../rendering/CanvasAppRendererRegistries'
import { DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER } from '../rendering/CanvasAppItemLayerAdapter'
import { DEFAULT_CANVAS_APP_STAGE_ADAPTER } from '../rendering/CanvasAppStageAdapter'
import { DEFAULT_CANVAS_WORKSPACE_STORAGE_PROVIDER } from '../document/CanvasWorkspacePersistence'
import {
  CANVAS_LINK_PREVIEW_INSPECTOR_PANEL,
} from '../link/CanvasLinkPreviewInspectorPanel'
import { DEFAULT_CANVAS_APP_ASSEMBLY } from './CanvasAppDefaultAssembly'

describe('CanvasAppDefaultAssembly', () => {
  it('keeps the built-in canvas app baseline in one module', () => {
    expect(DEFAULT_CANVAS_APP_ASSEMBLY.affordanceConfig).toEqual(
      DEFAULT_CANVAS_AFFORDANCE_CONFIG,
    )
    expect(DEFAULT_CANVAS_APP_ASSEMBLY.componentLibrary).toEqual(
      CANVAS_COMPONENT_LIBRARY,
    )
    expect(DEFAULT_CANVAS_APP_ASSEMBLY.componentPresentationRenderers).toEqual(
      DEFAULT_CANVAS_APP_COMPONENT_PRESENTATION_RENDERERS,
    )
    expect(DEFAULT_CANVAS_APP_ASSEMBLY.customItemRenderers).toEqual(
      DEFAULT_CANVAS_APP_CUSTOM_ITEM_RENDERERS,
    )
    expect(DEFAULT_CANVAS_APP_ASSEMBLY.inspectorPanels).toEqual([
      CANVAS_LINK_PREVIEW_INSPECTOR_PANEL,
    ])
    expect(DEFAULT_CANVAS_APP_ASSEMBLY.initialItems).toEqual(INITIAL_ITEMS)
    expect(DEFAULT_CANVAS_APP_ASSEMBLY.initialSelection).toEqual([
      'component-sticky',
      'component-card',
    ])
    expect(DEFAULT_CANVAS_APP_ASSEMBLY.itemAdapters).toEqual(
      CANVAS_ITEM_ENGINE_ADAPTERS,
    )
    expect(DEFAULT_CANVAS_APP_ASSEMBLY.itemLayerAdapter).toEqual(
      DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER,
    )
    expect(DEFAULT_CANVAS_APP_ASSEMBLY.stageAdapter).toEqual(
      DEFAULT_CANVAS_APP_STAGE_ADAPTER,
    )
    expect(DEFAULT_CANVAS_APP_ASSEMBLY.workspaceStorageProvider).toBe(
      DEFAULT_CANVAS_WORKSPACE_STORAGE_PROVIDER,
    )
  })

  it('snapshots the default baseline against accidental mutation', () => {
    expect(Object.isFrozen(DEFAULT_CANVAS_APP_ASSEMBLY)).toBe(true)
    expect(Object.isFrozen(
      DEFAULT_CANVAS_APP_ASSEMBLY.initialSelection,
    )).toBe(true)
    expect(Object.isFrozen(DEFAULT_CANVAS_APP_ASSEMBLY.initialItems)).toBe(true)
    expect(Object.isFrozen(DEFAULT_CANVAS_APP_ASSEMBLY.itemAdapters)).toBe(true)
  })
})
