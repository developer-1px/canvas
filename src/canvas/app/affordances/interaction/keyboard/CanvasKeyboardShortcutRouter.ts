import type { CanvasAffordanceConfig } from '../../../../engine'
import type {
  CanvasAppCustomCreationToolState,
} from '../../../extensions/CanvasAppExtensionStateContracts'
import {
  runCanvasKeyboardShortcutIntent,
  type CanvasKeyboardShortcutDispatchHandlers,
} from './CanvasKeyboardShortcutDispatch'
import { getCanvasKeyboardShortcutIntent } from './CanvasKeyboardShortcutIntent'

export type CanvasKeyboardShortcutHandlers =
  CanvasKeyboardShortcutDispatchHandlers & {
    config: CanvasAffordanceConfig
    customCreationTools: readonly CanvasAppCustomCreationToolState[]
    selection: string[]
  }

export function handleCanvasKeyboardShortcut(
  event: globalThis.KeyboardEvent,
  handlers: CanvasKeyboardShortcutHandlers,
) {
  if (event.defaultPrevented) {
    return
  }

  const intent = getCanvasKeyboardShortcutIntent({
    config: handlers.config,
    customCreationTools: handlers.customCreationTools,
    event,
    selection: handlers.selection,
  })

  if (intent.preventDefault) {
    event.preventDefault()
  }

  runCanvasKeyboardShortcutIntent({ handlers, intent })
}
