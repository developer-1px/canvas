import {
  useMemo,
} from 'react'
import type {
  CanvasOverlayState,
} from '../../engine'
import {
  useCanvasTextPasteImport,
} from '../feature-packs'
import {
  useCanvasAppCustomFocus,
} from '../extensions/custom-focus'
import {
  useCanvasAppStageElement,
} from '../rendering/stage/CanvasAppStageElement'
import {
  createCanvasAppAssembly,
} from './CanvasAppAssembly'
import type {
  CanvasAppAssemblyInput,
} from './CanvasAppAssemblyTypes'
import {
  useCanvasAppInspectorModel,
} from './useCanvasAppInspectorModel'
import {
  useCanvasAppViewportModel,
} from './useCanvasAppViewportModel'
import {
  useCanvasWorkspaceModel,
} from './useCanvasWorkspaceModel'

const EMPTY_CANVAS_OVERLAYS: CanvasOverlayState = {
  alignmentGuides: [],
  draftArrow: null,
  draftRect: null,
  draftStroke: null,
  emoteBursts: [],
  grid: false,
  itemOutlineIds: new Set(),
  laserTrail: null,
  marquee: null,
  presence: [],
  resizeHandles: [],
  selectionBounds: null,
  spacingGuides: [],
}

export function useCanvasAppPreviewModel({
  assemblyInput,
}: {
  assemblyInput?: CanvasAppAssemblyInput
}) {
  const assembly = useMemo(
    () => createCanvasAppAssembly(assemblyInput),
    [assemblyInput],
  )
  const stageElement = useCanvasAppStageElement()
  const workspace = useCanvasWorkspaceModel({
    customItemTextTargets: assembly.customItemTextTargets,
    customItemValidators: assembly.customItemValidators,
    documentAuthority: assembly.documentAuthority,
    foundationExtensionRuntime: assembly.foundationExtensionRuntime,
    initialItems: assembly.initialItems,
    initialSelection: assembly.initialSelection,
    storageProvider: assembly.workspaceStorageProvider,
  })
  const customFocus = useCanvasAppCustomFocus({
    selection: workspace.inspector.selection,
  })
  const inspector = useCanvasAppInspectorModel({
    ...workspace.inspector,
    config: assembly.affordanceConfig,
    customFocus,
    inspectorPanels: assembly.inspectorPanels,
  })

  useCanvasTextPasteImport({
    ...workspace.textPaste,
    config: assembly.affordanceConfig,
    stageElement,
    textPasteImporters: assembly.textPasteImporters,
  })
  const viewportControls = useCanvasAppViewportModel({
    config: assembly.affordanceConfig,
    itemReadModel: workspace.viewport.itemReadModel,
    setViewport: workspace.viewport.setViewport,
    stageElement,
  })

  return {
    inspector,
    setViewport: workspace.viewport.setViewport,
    stage: assembly.stageAdapter.renderStage({
      activeMode: 'select',
      children: assembly.itemLayerAdapter.renderItems({
        componentPresentationRenderers:
          assembly.componentPresentationRenderers,
        customItemRenderers: assembly.customItemRenderers,
        getComponentPresentation: getCanvasAppPreviewComponentPresentation,
        items: workspace.itemLayer.items,
        onArrowEndpointPointerDown: noop,
        onItemPointerDown: noop,
        canEditText: () => false,
        onTextDoubleClick: noop,
        outlineIds: EMPTY_CANVAS_OVERLAYS.itemOutlineIds,
        selected: workspace.itemLayer.selected,
      }),
      gesture: 'none',
      onCanvasPointerDown: noop,
      onContextMenu: preventCanvasAppPreviewContextMenu,
      onPointerCancel: noop,
      onPointerMove: noop,
      onPointerUp: noop,
      onResizePointerDown: noop,
      overlays: EMPTY_CANVAS_OVERLAYS,
      stageElement: stageElement.mount,
      viewport: workspace.stage.viewport,
    }),
    viewport: workspace.stage.viewport,
    viewportControls: viewportControls.control,
  }
}

function getCanvasAppPreviewComponentPresentation(component: string) {
  return component
}

function preventCanvasAppPreviewContextMenu(
  event: { preventDefault: () => void },
) {
  event.preventDefault()
}

function noop() {
  return undefined
}
