import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react'
import type {
  CanvasDraftArrowOverlay,
  CanvasDraftShapeOverlay,
  CanvasLaserTrailOverlay,
  CanvasDraftStrokeOverlay,
  CanvasAffordanceConfig,
} from '../../../../engine'
import type {
  Bounds,
  EditingText,
  Tool,
} from '../../../../entities'
import type { Interaction } from '../pointer/CanvasInteractionState'
import type { CommitCanvasSelection } from '../../../workflow/CanvasWorkflowContract'
import { createCanvasKeyboardIntentDispatchTable } from './CanvasKeyboardIntentDispatchTable'
import type {
  CanvasKeyboardShortcutIntent,
} from './CanvasKeyboardShortcutIntentContracts'
import { shouldReleaseCanvasKeyboardTemporaryPan } from './CanvasKeyboardSystemShortcuts'

export type CanvasKeyboardSystemHandlers = {
  closeCursorChat: () => void
  commitSelection: CommitCanvasSelection
  interactionRef: MutableRefObject<Interaction>
  openCommandPalette: () => void
  openCursorChat: () => void
  openFindReplace: () => void
  openShortcutHelp: () => void
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

export type CanvasKeyboardSystemReleaseHandlers = {
  setSpaceDown: Dispatch<SetStateAction<boolean>>
}

const CANVAS_KEYBOARD_SYSTEM_INTENT_DISPATCH =
  createCanvasKeyboardIntentDispatchTable<
    CanvasKeyboardShortcutIntent,
    CanvasKeyboardSystemHandlers
  >()({
    escape: ({ handlers }) => {
      handlers.interactionRef.current = { kind: 'none' }
      handlers.setGesture('none')
      handlers.setMarquee(null)
      handlers.setDraftArrow(null)
      handlers.setDraftRect(null)
      handlers.setDraftStroke(null)
      handlers.setLaserTrail(null)
      handlers.setEditing(null)
      handlers.closeCursorChat()
      handlers.commitSelection([])
      handlers.setTool('select')
    },
    'open-cursor-chat': ({ handlers }) => {
      handlers.openCursorChat()
    },
    'open-command-palette': ({ handlers }) => {
      handlers.openCommandPalette()
    },
    'open-find-replace': ({ handlers }) => {
      handlers.openFindReplace()
    },
    'open-shortcut-help': ({ handlers }) => {
      handlers.openShortcutHelp()
    },
    'temporary-pan': ({ handlers }) => {
      handlers.setSpaceDown(true)
    },
  })

type CanvasKeyboardSystemIntentKind = Extract<
  keyof typeof CANVAS_KEYBOARD_SYSTEM_INTENT_DISPATCH.runners,
  CanvasKeyboardShortcutIntent['kind']
>

export type CanvasKeyboardSystemIntent = Extract<
  CanvasKeyboardShortcutIntent,
  { kind: CanvasKeyboardSystemIntentKind }
>

export function isCanvasKeyboardSystemIntent(
  intent: CanvasKeyboardShortcutIntent,
): intent is CanvasKeyboardSystemIntent {
  return CANVAS_KEYBOARD_SYSTEM_INTENT_DISPATCH.hasKind(intent.kind)
}

export function runCanvasKeyboardSystemIntent({
  handlers,
  intent,
}: {
  handlers: CanvasKeyboardSystemHandlers
  intent: CanvasKeyboardSystemIntent
}) {
  CANVAS_KEYBOARD_SYSTEM_INTENT_DISPATCH.run({ handlers, intent })
}

export function runCanvasKeyboardSystemKeyUp({
  config,
  event,
  handlers,
}: {
  config: CanvasAffordanceConfig
  event: globalThis.KeyboardEvent
  handlers: CanvasKeyboardSystemReleaseHandlers
}) {
  if (shouldReleaseCanvasKeyboardTemporaryPan({ config, event })) {
    handlers.setSpaceDown(false)
  }
}

export function runCanvasKeyboardSystemWindowBlur({
  handlers,
}: {
  handlers: CanvasKeyboardSystemReleaseHandlers
}) {
  handlers.setSpaceDown(false)
}
