import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react'
import type {
  Bounds,
  CanvasItem,
  EditingText,
  Point,
  Tool,
  Viewport,
} from '../../entities'
import type { CanvasItemReadModel } from '../../host'
import type {
  CanvasAffordanceConfig,
  CanvasCreationAdapter,
  CanvasDraftArrowOverlay,
  CanvasDraftStrokeOverlay,
  CanvasSceneAdapter,
  CanvasSnapGuides,
  CanvasTransformAdapter,
} from '../../engine'
import type { Interaction } from '../pointer/CanvasInteractionState'
import { useCanvasPointerDownHandlers } from '../pointer/useCanvasPointerDownHandlers'
import { useCanvasPointerDragHandlers } from '../pointer/useCanvasPointerDragHandlers'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from './CanvasWorkflowContract'

type CanvasAppPointerCommandModel = {
  cloneItems: (ids: string[], offset: Point) => CanvasItem[]
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
}

type CanvasAppPointerInteractionModel = {
  interactionRef: MutableRefObject<Interaction>
  setDraftArrow: Dispatch<SetStateAction<CanvasDraftArrowOverlay | null>>
  setDraftRect: Dispatch<SetStateAction<Bounds | null>>
  setDraftStroke: Dispatch<SetStateAction<CanvasDraftStrokeOverlay | null>>
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setMarquee: Dispatch<SetStateAction<Bounds | null>>
  setSnapGuides: Dispatch<SetStateAction<CanvasSnapGuides>>
  setTool: Dispatch<SetStateAction<Tool>>
  spaceDown: boolean
  tool: Tool
}

type CanvasAppPointerItemAdapters = {
  creation: CanvasCreationAdapter<CanvasItem>
  transform: CanvasTransformAdapter<CanvasItem>
}

type CanvasAppPointerWorkspaceModel = {
  itemReadModel: CanvasItemReadModel
  items: CanvasItem[]
  scene: CanvasSceneAdapter
  selectedBounds: Bounds | null
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setLiveItems: Dispatch<SetStateAction<CanvasItem[]>>
  setSelection: Dispatch<SetStateAction<string[]>>
  setViewport: Dispatch<SetStateAction<Viewport>>
  viewport: Viewport
}

type UseCanvasAppPointerModelArgs = {
  command: CanvasAppPointerCommandModel
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  interaction: CanvasAppPointerInteractionModel
  itemAdapters: CanvasAppPointerItemAdapters
  stageElement: CanvasAppStageElement
  workspace: CanvasAppPointerWorkspaceModel
}

export function useCanvasAppPointerModel({
  command,
  config,
  createId,
  customCreationTools,
  interaction,
  itemAdapters,
  stageElement,
  workspace,
}: UseCanvasAppPointerModelArgs) {
  const downHandlers = useCanvasPointerDownHandlers({
    cloneItems: command.cloneItems,
    commitItemsChange: command.commitItemsChange,
    commitSelection: command.commitSelection,
    config,
    createId,
    creationAdapter: itemAdapters.creation,
    customCreationTools,
    interactionRef: interaction.interactionRef,
    itemReadModel: workspace.itemReadModel,
    items: workspace.items,
    scene: workspace.scene,
    selectedBounds: workspace.selectedBounds,
    selection: workspace.selection,
    setDraftArrow: interaction.setDraftArrow,
    setDraftRect: interaction.setDraftRect,
    setDraftStroke: interaction.setDraftStroke,
    setEditing: workspace.setEditing,
    setGesture: interaction.setGesture,
    setLiveItems: workspace.setLiveItems,
    setSelection: workspace.setSelection,
    setTool: interaction.setTool,
    spaceDown: interaction.spaceDown,
    stageElement,
    tool: interaction.tool,
    viewport: workspace.viewport,
  })
  const dragHandlers = useCanvasPointerDragHandlers({
    commitItemsChange: command.commitItemsChange,
    commitSelection: command.commitSelection,
    config,
    createId,
    creationAdapter: itemAdapters.creation,
    customCreationTools,
    interactionRef: interaction.interactionRef,
    scene: workspace.scene,
    selection: workspace.selection,
    setDraftArrow: interaction.setDraftArrow,
    setDraftRect: interaction.setDraftRect,
    setDraftStroke: interaction.setDraftStroke,
    setEditing: workspace.setEditing,
    setGesture: interaction.setGesture,
    setLiveItems: workspace.setLiveItems,
    setMarquee: interaction.setMarquee,
    setSelection: workspace.setSelection,
    setSnapGuides: interaction.setSnapGuides,
    setTool: interaction.setTool,
    setViewport: workspace.setViewport,
    stageElement,
    transformAdapter: itemAdapters.transform,
    viewport: workspace.viewport,
  })

  return {
    itemLayerHandlers: {
      onItemPointerDown: downHandlers.handleItemPointerDown,
      onTextDoubleClick: downHandlers.handleTextDoubleClick,
    },
    stageHandlers: {
      onCanvasPointerDown: downHandlers.handleCanvasPointerDown,
      onPointerCancel: dragHandlers.handlePointerCancel,
      onPointerMove: dragHandlers.handlePointerMove,
      onPointerUp: dragHandlers.handlePointerUp,
      onResizePointerDown: downHandlers.handleResizePointerDown,
    },
  }
}
