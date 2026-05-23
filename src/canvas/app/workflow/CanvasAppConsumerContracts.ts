import type {
  Dispatch,
  SetStateAction,
} from 'react'
import type {
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
  CanvasItem,
  Point,
  Tool,
} from '../../entities'
import type { CanvasAppCustomCommandState } from '../commands/CanvasAppCustomCommandExecution'
import type { CanvasAppStageElementController } from '../stage/CanvasAppStageElement'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CanvasAppCustomCreationToolState } from '../tools/CanvasAppCustomCreationToolRuntime'
import type { Interaction } from '../pointer/CanvasInteractionState'
import type { CanvasAppControlCommandHandlers } from './CanvasAppControlCommandContracts'

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
