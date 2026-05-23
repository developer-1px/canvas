import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react'
import type {
  CanvasDraftArrowOverlay,
  CanvasDraftStrokeOverlay,
  CanvasAffordanceConfig,
} from '../../engine'
import type {
  Bounds,
  EditingText,
  Tool,
} from '../../entities'
import type { Interaction } from '../pointer/CanvasInteractionState'
import type { CommitCanvasSelection } from '../workflow/CanvasWorkflowContract'
import type { CanvasKeyboardShortcutIntent } from './CanvasKeyboardShortcutIntent'
import { shouldReleaseCanvasKeyboardTemporaryPan } from './CanvasKeyboardSystemShortcuts'

export type CanvasKeyboardSystemHandlers = {
  commitSelection: CommitCanvasSelection
  interactionRef: MutableRefObject<Interaction>
  openFindReplace: () => void
  setDraftArrow: Dispatch<SetStateAction<CanvasDraftArrowOverlay | null>>
  setDraftRect: Dispatch<SetStateAction<Bounds | null>>
  setDraftStroke: Dispatch<SetStateAction<CanvasDraftStrokeOverlay | null>>
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setMarquee: Dispatch<SetStateAction<Bounds | null>>
  setSpaceDown: Dispatch<SetStateAction<boolean>>
  setTool: Dispatch<SetStateAction<Tool>>
}

export type CanvasKeyboardSystemReleaseHandlers = Pick<
  CanvasKeyboardSystemHandlers,
  'setSpaceDown'
>

type CanvasKeyboardSystemIntentKind =
  | 'escape'
  | 'open-find-replace'
  | 'temporary-pan'

export type CanvasKeyboardSystemIntent = Extract<
  CanvasKeyboardShortcutIntent,
  { kind: CanvasKeyboardSystemIntentKind }
>

const CANVAS_KEYBOARD_SYSTEM_INTENT_KINDS = Object.freeze([
  'escape',
  'open-find-replace',
  'temporary-pan',
] satisfies readonly CanvasKeyboardSystemIntentKind[])

export function isCanvasKeyboardSystemIntent(
  intent: CanvasKeyboardShortcutIntent,
): intent is CanvasKeyboardSystemIntent {
  return CANVAS_KEYBOARD_SYSTEM_INTENT_KINDS.includes(
    intent.kind as CanvasKeyboardSystemIntentKind,
  )
}

export function runCanvasKeyboardSystemIntent({
  handlers,
  intent,
}: {
  handlers: CanvasKeyboardSystemHandlers
  intent: CanvasKeyboardSystemIntent
}) {
  switch (intent.kind) {
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
  }

  return assertUnhandledCanvasKeyboardSystemIntent(intent)
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

function assertUnhandledCanvasKeyboardSystemIntent(
  intent: never,
): never {
  throw new Error(`Unhandled canvas keyboard system intent: ${String(intent)}`)
}
