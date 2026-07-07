import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react'
import type { CanvasViewportZoomDirection } from '../../core'
import type {
  CanvasAffordanceConfig,
  CanvasDraftArrowOverlay,
  CanvasDraftShapeOverlay,
  CanvasLaserTrailOverlay,
  CanvasDraftStrokeOverlay,
  CanvasReorderMode,
} from '../../engine'
import type {
  Bounds,
  EditingText,
  Tool,
} from '../../entities'
import type {
  CanvasAppCustomCommandState,
  CanvasAppCustomCreationToolState,
} from '../extensions/CanvasAppExtensionStateContracts'
import type { Interaction } from '../affordances/interaction/pointer/CanvasInteractionState'
import type { CanvasAppComponentKeyboardContext } from './CanvasAppComponentConsumerContracts'
import type { CanvasWorkspaceKeyboardContext } from './CanvasWorkspaceConsumerContracts'

export type CanvasAppKeyboardCommandContext = {
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

export type CanvasAppKeyboardCursorChatContext = {
  closeCursorChat: () => void
  openCursorChat: () => void
}

export type CanvasAppKeyboardInteractionContext = {
  interactionRef: MutableRefObject<Interaction>
  setDraftArrow: Dispatch<SetStateAction<CanvasDraftArrowOverlay | null>>
  setDraftRect: Dispatch<SetStateAction<CanvasDraftShapeOverlay | null>>
  setDraftStroke: Dispatch<SetStateAction<CanvasDraftStrokeOverlay | null>>
  setLaserTrail: Dispatch<SetStateAction<CanvasLaserTrailOverlay | null>>
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setMarquee: Dispatch<SetStateAction<Bounds | null>>
  setSpaceDown: Dispatch<SetStateAction<boolean>>
  setTool: Dispatch<SetStateAction<Tool>>
}

export type CanvasAppKeyboardViewportContext = {
  fitToItems: (ids?: string[]) => void
  resetViewport: () => void
  zoom: (direction: CanvasViewportZoomDirection) => void
}

export type CanvasAppKeyboardModelInput = {
  command: CanvasAppKeyboardCommandContext
  component: CanvasAppComponentKeyboardContext
  config: CanvasAffordanceConfig
  cursorChat: CanvasAppKeyboardCursorChatContext
  customCommands: readonly CanvasAppCustomCommandState[]
  customCreationTools: readonly CanvasAppCustomCreationToolState[]
  interaction: CanvasAppKeyboardInteractionContext
  runCustomCommand: (commandId: string) => void
  openCommandPalette: () => void
  openFindReplace: () => void
  openShortcutHelp: () => void
  viewport: CanvasAppKeyboardViewportContext
  workspace: CanvasWorkspaceKeyboardContext
}
