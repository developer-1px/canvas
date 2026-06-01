import {
  useMemo,
} from 'react'
import type {
  CanvasOverlayState,
} from '../../engine'
import {
  useCanvasTextPasteImport,
} from '../affordances/io/text-paste/useCanvasTextPasteImport'
import {
  useCanvasAppCustomFocus,
} from '../affordances/interaction/focus/useCanvasAppCustomFocus'
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

export function useCanvasDevToolsAppModel({
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
    customItemValidators: assembly.customItemValidators,
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
        getComponentPresentation: getCanvasDevToolsComponentPresentation,
        items: workspace.itemLayer.items,
        onArrowEndpointPointerDown: noop,
        onItemPointerDown: noop,
        onTextDoubleClick: noop,
        outlineIds: EMPTY_CANVAS_OVERLAYS.itemOutlineIds,
        selected: workspace.itemLayer.selected,
      }),
      gesture: 'none',
      onCanvasPointerDown: noop,
      onContextMenu: preventCanvasDevToolsContextMenu,
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

function getCanvasDevToolsComponentPresentation(component: string) {
  return component
}

function preventCanvasDevToolsContextMenu(event: { preventDefault: () => void }) {
  event.preventDefault()
}

function noop() {
  return undefined
}
