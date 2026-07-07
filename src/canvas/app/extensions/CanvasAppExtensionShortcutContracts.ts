import {
  getCanvasKeyboardReservedShortcuts,
} from '../affordances/interaction/keyboard/CanvasKeyboardReservedShortcuts'
import {
  formatCanvasKeyboardShortcutChord,
  getCanvasKeyboardShortcutChordKey,
  type CanvasKeyboardShortcutChord,
} from '../affordances/interaction/keyboard/CanvasKeyboardShortcutChords'

export type CanvasAppExtensionShortcutEntry = {
  owner: string
  shortcut?: CanvasKeyboardShortcutChord
}

export function assertCanvasAppExtensionShortcuts(
  entries: readonly CanvasAppExtensionShortcutEntry[],
) {
  const reserved = new Map(
    getCanvasKeyboardReservedShortcuts().map((entry) => [
      getCanvasKeyboardShortcutChordKey(entry.shortcut),
      entry.label,
    ]),
  )
  const seen = new Map<string, string>()

  for (const entry of entries) {
    if (!entry.shortcut) {
      continue
    }

    const key = getCanvasKeyboardShortcutChordKey(entry.shortcut)
    const label = formatCanvasKeyboardShortcutChord(entry.shortcut)
    const reservedLabel = reserved.get(key)
    const existingOwner = seen.get(key)

    if (reservedLabel) {
      throw new Error(
        `Canvas app extension shortcut conflicts with ${reservedLabel}: ${entry.owner} uses ${label}`,
      )
    }

    if (existingOwner) {
      throw new Error(
        `Duplicate canvas app extension shortcut: ${existingOwner} and ${entry.owner} use ${label}`,
      )
    }

    seen.set(key, entry.owner)
  }
}
