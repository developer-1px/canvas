import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react'
import type {
  CanvasAffordanceConfig,
  CanvasDraftArrowOverlay,
  CanvasDraftStrokeOverlay,
} from '../../engine'
import type {
  Bounds,
  EditingText,
  Tool,
} from '../../entities'
import type { Interaction } from '../pointer/CanvasInteractionState'
import type { CommitCanvasSelection } from '../workflow/CanvasWorkflowContract'
import type { CanvasAppCustomCreationToolState } from '../tools/CanvasAppCustomCreationToolRuntime'
import { getCanvasKeyboardShortcutIntent } from './CanvasKeyboardShortcutIntent'
import {
  isCanvasKeyboardCommandIntent,
  runCanvasKeyboardCommandIntent,
  type CanvasKeyboardCommandHandlers,
} from './CanvasKeyboardCommandDispatch'

export type CanvasKeyboardShortcutHandlers = CanvasKeyboardCommandHandlers & {
  commitSelection: CommitCanvasSelection
  config: CanvasAffordanceConfig
  customCreationTools: readonly CanvasAppCustomCreationToolState[]
  fitToItems: (ids?: string[]) => void
  interactionRef: MutableRefObject<Interaction>
  openFindReplace: () => void
  resetViewport: () => void
  selection: string[]
  setDraftRect: Dispatch<SetStateAction<Bounds | null>>
  setDraftArrow: Dispatch<SetStateAction<CanvasDraftArrowOverlay | null>>
  setDraftStroke: Dispatch<SetStateAction<CanvasDraftStrokeOverlay | null>>
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setMarquee: Dispatch<SetStateAction<Bounds | null>>
  setSpaceDown: Dispatch<SetStateAction<boolean>>
  setTool: Dispatch<SetStateAction<Tool>>
  zoomBy: (multiplier: number) => void
}

export function handleCanvasKeyboardShortcut(
  event: globalThis.KeyboardEvent,
  handlers: CanvasKeyboardShortcutHandlers,
) {
  const intent = getCanvasKeyboardShortcutIntent({
    config: handlers.config,
    customCreationTools: handlers.customCreationTools,
    event,
    selection: handlers.selection,
  })

  if (intent.preventDefault) {
    event.preventDefault()
  }

  if (isCanvasKeyboardCommandIntent(intent)) {
    runCanvasKeyboardCommandIntent({ handlers, intent })
    return
  }

  switch (intent.kind) {
    case 'none':
      return
    case 'open-find-replace':
      handlers.openFindReplace()
      return
    case 'temporary-pan':
      handlers.setSpaceDown(true)
      return
    case 'escape':
      handlers.interactionRef.current = { kind: 'none' }
      handlers.setGesture('none')
      handlers.setMarquee(null)
      handlers.setDraftArrow(null)
      handlers.setDraftRect(null)
      handlers.setDraftStroke(null)
      handlers.setEditing(null)
      handlers.commitSelection([])
      handlers.setTool('select')
      return
    case 'zoom-by':
      handlers.zoomBy(intent.multiplier)
      return
    case 'reset-viewport':
      handlers.resetViewport()
      return
    case 'fit-all':
      handlers.fitToItems()
      return
    case 'fit-selection':
      handlers.fitToItems(intent.ids)
      return
    case 'set-tool':
      handlers.setTool(intent.tool)
      return
  }

  return assertUnhandledCanvasKeyboardShortcutIntent(intent)
}

function assertUnhandledCanvasKeyboardShortcutIntent(
  intent: never,
): never {
  throw new Error(`Unhandled canvas keyboard shortcut intent: ${String(intent)}`)
}
