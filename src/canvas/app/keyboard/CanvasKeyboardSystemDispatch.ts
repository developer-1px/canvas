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

type CanvasKeyboardSystemShortcutIntentKind =
  CanvasKeyboardShortcutIntent['kind']

type CanvasKeyboardSystemIntentRunner<
  TKind extends CanvasKeyboardSystemShortcutIntentKind,
> = (args: {
  handlers: CanvasKeyboardSystemHandlers
  intent: Extract<CanvasKeyboardShortcutIntent, { kind: TKind }>
}) => void

function defineCanvasKeyboardSystemIntentRunners<
  const TRunners extends Partial<{
    [TKind in CanvasKeyboardSystemShortcutIntentKind]:
      CanvasKeyboardSystemIntentRunner<TKind>
  }>,
>(runners: TRunners) {
  return Object.freeze(runners)
}

const CANVAS_KEYBOARD_SYSTEM_INTENT_RUNNERS =
  defineCanvasKeyboardSystemIntentRunners({
    escape: ({ handlers }) => {
      handlers.interactionRef.current = { kind: 'none' }
      handlers.setGesture('none')
      handlers.setMarquee(null)
      handlers.setDraftArrow(null)
      handlers.setDraftRect(null)
      handlers.setDraftStroke(null)
      handlers.setEditing(null)
      handlers.commitSelection([])
      handlers.setTool('select')
    },
    'open-find-replace': ({ handlers }) => {
      handlers.openFindReplace()
    },
    'temporary-pan': ({ handlers }) => {
      handlers.setSpaceDown(true)
    },
  })

type CanvasKeyboardSystemIntentKind = Extract<
  keyof typeof CANVAS_KEYBOARD_SYSTEM_INTENT_RUNNERS,
  CanvasKeyboardSystemShortcutIntentKind
>

type CanvasKeyboardAnySystemIntentRunner =
  CanvasKeyboardSystemIntentRunner<CanvasKeyboardSystemIntentKind>

function hasCanvasKeyboardSystemIntentRunner(
  kind: string,
): kind is CanvasKeyboardSystemIntentKind {
  return Object.prototype.hasOwnProperty.call(
    CANVAS_KEYBOARD_SYSTEM_INTENT_RUNNERS,
    kind,
  )
}

function getCanvasKeyboardSystemIntentRunner(
  kind: CanvasKeyboardSystemIntentKind,
): CanvasKeyboardAnySystemIntentRunner {
  return CANVAS_KEYBOARD_SYSTEM_INTENT_RUNNERS[
    kind
  ] as CanvasKeyboardAnySystemIntentRunner
}

export type CanvasKeyboardSystemIntent = Extract<
  CanvasKeyboardShortcutIntent,
  { kind: CanvasKeyboardSystemIntentKind }
>

export function isCanvasKeyboardSystemIntent(
  intent: CanvasKeyboardShortcutIntent,
): intent is CanvasKeyboardSystemIntent {
  return hasCanvasKeyboardSystemIntentRunner(intent.kind)
}

export function runCanvasKeyboardSystemIntent({
  handlers,
  intent,
}: {
  handlers: CanvasKeyboardSystemHandlers
  intent: CanvasKeyboardSystemIntent
}) {
  getCanvasKeyboardSystemIntentRunner(intent.kind)({ handlers, intent })
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
