import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react'
import type {
  CanvasAffordanceConfig,
  CanvasAlignMode,
  CanvasDistributeMode,
  CanvasDraftArrowOverlay,
  CanvasDraftStrokeOverlay,
  CanvasOverlayState,
  CanvasReorderMode,
  CanvasSnapGuides,
} from '../../engine'
import type {
  Bounds,
  CanvasInteractionKind,
  CanvasItem,
  EditingText,
  Point,
  ResizeHandle,
  Tool,
  Viewport,
} from '../../entities'
import type { CanvasEditableTextItem } from '../../host'
import type {
  CanvasAppCustomCommandState,
  CanvasAppCustomCreationToolState,
} from '../extensions/CanvasAppExtensionStateContracts'
import type { CanvasAppPointerInput } from '../pointer/CanvasAppPointerInput'
import type { CanvasAppStageElementController } from '../stage/CanvasAppStageElement'
import type {
  CanvasAppItemLayerAdapter,
} from '../rendering/CanvasAppItemLayerAdapter'
import type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppCustomItemRenderers,
} from '../rendering/CanvasAppRendererRegistries'
import type {
  CanvasAppStageAdapter,
  CanvasAppStageMount,
} from '../rendering/CanvasAppStageAdapter'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { Interaction } from '../pointer/CanvasInteractionState'
import type { CanvasAppControlCommandHandlers } from './CanvasAppControlCommandContracts'
import type { CommitCanvasSelection } from './CanvasWorkflowContract'

export type CanvasAppCommandRuntime = {
  alignSelection: (mode: CanvasAlignMode) => void
  cloneItems: (ids: string[], offset: Point) => CanvasItem[]
  copySelection: () => void
  cutSelection: () => void
  deleteSelection: () => void
  distributeSelection: (mode: CanvasDistributeMode) => void
  duplicateSelection: (sourceIds?: string[], offset?: Point) => CanvasItem[]
  groupSelection: () => void
  lockSelection: () => void
  moveSelection: (dx: number, dy: number) => void
  pasteSelection: () => void
  redoHistory: () => void
  reorderSelection: (mode: CanvasReorderMode) => void
  selectAll: () => void
  undoHistory: () => void
  ungroupSelection: () => void
  unlockAll: () => void
}

export type CanvasAppCommandControlContext = {
  commandHandlers: CanvasAppControlCommandHandlers
}

export type CanvasAppCommandKeyboardContext = {
  copySelection: () => void
  cutSelection: () => void
  deleteSelection: () => void
  duplicateSelection: (sourceIds?: string[], offset?: Point) => CanvasItem[]
  groupSelection: () => void
  lockSelection: () => void
  moveSelection: (dx: number, dy: number) => void
  pasteSelection: () => void
  redoHistory: () => void
  reorderSelection: (mode: CanvasReorderMode) => void
  selectAll: () => void
  undoHistory: () => void
  ungroupSelection: () => void
  unlockAll: () => void
}

export type CanvasAppCommandPointerContext = {
  cloneItems: (ids: string[], offset: Point) => CanvasItem[]
}

export type CanvasAppCommandConsumerModel = {
  control: CanvasAppCommandControlContext
  keyboard: CanvasAppCommandKeyboardContext
  pointer: CanvasAppCommandPointerContext
}

export type CanvasAppExtensionRuntime = {
  customCommandStates: CanvasAppCustomCommandState[]
  customCreationToolStates: CanvasAppCustomCreationToolState[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  runCustomCommand: (commandId: string) => boolean
}

export type CanvasAppExtensionControlContext = {
  customCommands: readonly CanvasAppCustomCommandState[]
  customTools: readonly CanvasAppCustomCreationToolState[]
  onRunCustomCommand: (commandId: string) => boolean
}

export type CanvasAppExtensionKeyboardContext = {
  customCreationTools: readonly CanvasAppCustomCreationToolState[]
}

export type CanvasAppExtensionPointerContext = {
  customCreationTools: readonly CanvasAppCustomCreationTool[]
}

export type CanvasAppExtensionModel = {
  control: CanvasAppExtensionControlContext
  keyboard: CanvasAppExtensionKeyboardContext
  pointer: CanvasAppExtensionPointerContext
}

export type CanvasAppKeyboardCommandContext = {
  commitSelection: CommitCanvasSelection
  copySelection: () => void
  cutSelection: () => void
  deleteSelection: () => void
  duplicateSelection: () => void
  groupSelection: () => void
  lockSelection: () => void
  moveSelection: (dx: number, dy: number) => void
  pasteSelection: () => void
  redoHistory: () => void
  reorderSelection: (mode: CanvasReorderMode) => void
  selectAll: () => void
  undoHistory: () => void
  ungroupSelection: () => void
  unlockAll: () => void
}

export type CanvasAppKeyboardInteractionContext = {
  interactionRef: MutableRefObject<Interaction>
  setDraftArrow: Dispatch<SetStateAction<CanvasDraftArrowOverlay | null>>
  setDraftRect: Dispatch<SetStateAction<Bounds | null>>
  setDraftStroke: Dispatch<SetStateAction<CanvasDraftStrokeOverlay | null>>
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setMarquee: Dispatch<SetStateAction<Bounds | null>>
  setSpaceDown: Dispatch<SetStateAction<boolean>>
  setTool: Dispatch<SetStateAction<Tool>>
}

export type CanvasAppKeyboardViewportContext = {
  fitToItems: (ids?: string[]) => void
  resetViewport: () => void
  zoomBy: (multiplier: number) => void
}

export type CanvasAppKeyboardModelInput = {
  command: CanvasAppKeyboardCommandContext
  config: CanvasAffordanceConfig
  customCreationTools: readonly CanvasAppCustomCreationToolState[]
  interaction: CanvasAppKeyboardInteractionContext
  openFindReplace: () => void
  selection: string[]
  viewport: CanvasAppKeyboardViewportContext
}

export type CanvasInteractionDraftWriters = {
  setDraftArrow: Dispatch<SetStateAction<CanvasDraftArrowOverlay | null>>
  setDraftRect: Dispatch<SetStateAction<Bounds | null>>
  setDraftStroke: Dispatch<SetStateAction<CanvasDraftStrokeOverlay | null>>
}

export type CanvasInteractionMarqueeWriters = {
  setMarquee: Dispatch<SetStateAction<Bounds | null>>
}

export type CanvasInteractionConsumerModelInput = {
  draft: CanvasInteractionDraftWriters
  gesture: Interaction['kind']
  marquee: CanvasInteractionMarqueeWriters
  overlays: CanvasOverlayState
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setSnapGuides: Dispatch<SetStateAction<CanvasSnapGuides>>
  setSpaceDown: Dispatch<SetStateAction<boolean>>
  setTool: Dispatch<SetStateAction<Tool>>
  spaceDown: boolean
  tool: Tool
}

export type CanvasInteractionComponentContext = {
  setTool: Dispatch<SetStateAction<Tool>>
}

export type CanvasInteractionControlContext = {
  gesture: Interaction['kind']
  onToolChange: Dispatch<SetStateAction<Tool>>
  tool: Tool
}

export type CanvasInteractionKeyboardContext =
  CanvasInteractionDraftWriters &
  CanvasInteractionMarqueeWriters & {
    setGesture: Dispatch<SetStateAction<Interaction['kind']>>
    setSpaceDown: Dispatch<SetStateAction<boolean>>
    setTool: Dispatch<SetStateAction<Tool>>
  }

export type CanvasInteractionPointerContext =
  CanvasInteractionDraftWriters &
  CanvasInteractionMarqueeWriters & {
    setGesture: Dispatch<SetStateAction<Interaction['kind']>>
    setSnapGuides: Dispatch<SetStateAction<CanvasSnapGuides>>
    setTool: Dispatch<SetStateAction<Tool>>
    spaceDown: boolean
    tool: Tool
  }

export type CanvasInteractionStageContext = {
  activeMode: Tool
  gesture: Interaction['kind']
  overlays: CanvasOverlayState
}

export type CanvasInteractionConsumerModel = {
  component: CanvasInteractionComponentContext
  control: CanvasInteractionControlContext
  keyboard: CanvasInteractionKeyboardContext
  pointer: CanvasInteractionPointerContext
  stage: CanvasInteractionStageContext
}

export type CanvasAppPointerItemLayerHandlers = {
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

export type CanvasAppStageItemLayerContext = {
  items: CanvasItem[]
  selected: Set<string>
}

export type CanvasAppStageRenderingContext = {
  componentPresentationRenderers: CanvasAppComponentPresentationRenderers
  customItemRenderers: CanvasAppCustomItemRenderers
  getComponentPresentation: (component: string) => string
  itemLayerAdapter: CanvasAppItemLayerAdapter
  stageAdapter: CanvasAppStageAdapter
}

export type CanvasAppStageContext = {
  activeMode: Tool
  gesture: CanvasInteractionKind
  overlays: CanvasOverlayState
  stageElement: CanvasAppStageMount
  viewport: Viewport
}

export type CanvasAppStageModelInput = {
  blurTextEditor: () => void
  itemLayer: CanvasAppStageItemLayerContext
  pointer: CanvasAppPointerConsumerModel
  rendering: CanvasAppStageRenderingContext
  stage: CanvasAppStageContext
}

export type CanvasAppStageElementConsumerModelInput = {
  stageElement: CanvasAppStageElementController
}

export type CanvasAppStageElementControllerContext = {
  stageElement: CanvasAppStageElementController
}

export type CanvasAppStageElementStageContext = {
  stageElement: CanvasAppStageElementController['mount']
}

export type CanvasAppStageElementConsumerModel = {
  command: CanvasAppStageElementControllerContext
  component: CanvasAppStageElementControllerContext
  pointer: CanvasAppStageElementControllerContext
  stage: CanvasAppStageElementStageContext
  viewport: CanvasAppStageElementControllerContext
}
