import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react'
import type {
  CanvasAffordanceConfig,
  CanvasCreationAdapter,
  CanvasDraftArrowOverlay,
  CanvasDraftShapeOverlay,
  CanvasLaserTrailOverlay,
  CanvasDraftStrokeOverlay,
  CanvasSceneAdapter,
  CanvasSnapGuides,
  CanvasTransformAdapter,
} from '../../engine'
import type {
  Bounds,
  CanvasArrowEndpoint,
  CanvasEditableTextItem,
  CanvasItem,
  EditingText,
  Point,
  ResizeHandle,
  Tool,
  Viewport,
} from '../../entities'
import type { CanvasAppComponentLibrary } from './CanvasAppComponentAssemblyContracts'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import type { CanvasDrawingStrokeStyleSet } from '../../host'
import type { CanvasAppPointerInput } from '../pointer/CanvasAppPointerInput'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { Interaction } from '../pointer/CanvasInteractionState'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from './CanvasWorkflowContract'

export type CanvasAppPointerItemLayerHandlers = {
  onArrowEndpointPointerDown: (
    event: CanvasAppPointerInput,
    itemId: string,
    endpoint: CanvasArrowEndpoint,
  ) => void
  onItemPointerDown: (
    event: CanvasAppPointerInput,
    itemId: string,
  ) => void
  onTextDoubleClick: (item: CanvasEditableTextItem) => void
}

export type CanvasAppPointerStageHandlers = {
  onCanvasPointerDown: (event: CanvasAppPointerInput) => void
  onPointerCancel: (event: CanvasAppPointerInput) => void
  onPointerMove: (event: CanvasAppPointerInput) => void
  onPointerUp: (event: CanvasAppPointerInput) => void
  onResizePointerDown: (
    event: CanvasAppPointerInput,
    handle: ResizeHandle,
  ) => void
}

export type CanvasAppPointerConsumerModel = {
  itemLayerHandlers: CanvasAppPointerItemLayerHandlers
  stageHandlers: CanvasAppPointerStageHandlers
}

export type CanvasAppPointerDownRuntime = {
  handleArrowEndpointPointerDown: (
    event: CanvasAppPointerInput,
    itemId: string,
    endpoint: CanvasArrowEndpoint,
  ) => void
  handleCanvasPointerDown: (event: CanvasAppPointerInput) => void
  handleItemPointerDown: (
    event: CanvasAppPointerInput,
    itemId: string,
  ) => void
  handleResizePointerDown: (
    event: CanvasAppPointerInput,
    handle: ResizeHandle,
  ) => void
  handleTextDoubleClick: (item: CanvasEditableTextItem) => void
}

export type CanvasAppPointerDragRuntime = {
  handlePointerCancel: (event: CanvasAppPointerInput) => void
  handlePointerMove: (event: CanvasAppPointerInput) => void
  handlePointerUp: (event: CanvasAppPointerInput) => void
}

export type CanvasAppPointerConsumerModelInput = {
  downHandlers: CanvasAppPointerDownRuntime
  dragHandlers: CanvasAppPointerDragRuntime
}

export type CanvasAppPointerCommandModel = {
  cloneItems: (ids: string[], offset: Point) => CanvasItem[]
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
}

export type CanvasAppPointerInteractionModel = {
  interactionRef: MutableRefObject<Interaction>
  setDraftArrow: Dispatch<SetStateAction<CanvasDraftArrowOverlay | null>>
  setDraftRect: Dispatch<SetStateAction<CanvasDraftShapeOverlay | null>>
  setDraftStroke: Dispatch<SetStateAction<CanvasDraftStrokeOverlay | null>>
  setLaserTrail: Dispatch<SetStateAction<CanvasLaserTrailOverlay | null>>
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setMarquee: Dispatch<SetStateAction<Bounds | null>>
  setSnapGuides: Dispatch<SetStateAction<CanvasSnapGuides>>
  setTool: Dispatch<SetStateAction<Tool>>
  spaceDown: boolean
  tool: Tool
}

export type CanvasAppPointerItemAdapters = {
  creation: CanvasCreationAdapter<CanvasItem>
  transform: CanvasTransformAdapter<CanvasItem>
}

export type CanvasAppPointerWorkspaceModel = {
  itemReadModel: CanvasAppItemReadModel
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

export type CanvasAppPointerModelInput = {
  command: CanvasAppPointerCommandModel
  componentLibrary: CanvasAppComponentLibrary
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  drawingStyles: CanvasDrawingStrokeStyleSet
  interaction: CanvasAppPointerInteractionModel
  itemAdapters: CanvasAppPointerItemAdapters
  stageElement: CanvasAppStageElement
  workspace: CanvasAppPointerWorkspaceModel
}
