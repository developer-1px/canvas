import type {
  CanvasAppCustomCommandState,
} from '../../../extensions/CanvasAppExtensionStateContracts'
import {
  matchesCanvasKeyboardShortcutChord,
} from './CanvasKeyboardShortcutChords'

export function getCanvasKeyboardCustomCommandShortcutIntent({
  customCommands,
  event,
}: {
  customCommands: readonly CanvasAppCustomCommandState[]
  event: globalThis.KeyboardEvent
}): string | null {
  const command = customCommands.find(
    (candidate) =>
      !candidate.disabled &&
      candidate.shortcut &&
      matchesCanvasKeyboardShortcutChord({
        event,
        shortcut: candidate.shortcut,
      }),
  )

  return command?.id ?? null
}
