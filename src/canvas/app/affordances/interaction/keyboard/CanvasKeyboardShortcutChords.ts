export type CanvasKeyboardShortcutChord = {
  key: string
  shiftKey?: boolean
}

export type CanvasKeyboardReservedShortcut = {
  label: string
  shortcut: CanvasKeyboardShortcutChord
}

type CanvasKeyboardShortcutReservationOptions = {
  shiftInsensitive?: boolean
}

export function matchesCanvasKeyboardShortcutChord({
  event,
  shortcut,
}: {
  event: KeyboardEvent
  shortcut: CanvasKeyboardShortcutChord
}) {
  return (
    normalizeCanvasKeyboardShortcutKey(event.key).toLowerCase() ===
      normalizeCanvasKeyboardShortcutKey(shortcut.key).toLowerCase() &&
    event.shiftKey === (shortcut.shiftKey ?? false)
  )
}

export function getCanvasKeyboardShortcutChordKey(
  shortcut: CanvasKeyboardShortcutChord,
) {
  const key = normalizeCanvasKeyboardShortcutKey(shortcut.key).toLowerCase()

  return `${shortcut.shiftKey === true ? 'shift+' : ''}${key}`
}

export function formatCanvasKeyboardShortcutChord(
  shortcut: CanvasKeyboardShortcutChord,
) {
  const key = formatCanvasKeyboardShortcutKey(shortcut.key)

  return shortcut.shiftKey ? `Shift+${key}` : key
}

export function reserveCanvasKeyboardShortcut(
  label: string,
  shortcut: CanvasKeyboardShortcutChord,
  options: CanvasKeyboardShortcutReservationOptions = {},
): CanvasKeyboardReservedShortcut[] {
  if (!options.shiftInsensitive) {
    return [{ label, shortcut }]
  }

  return [
    { label, shortcut },
    { label, shortcut: { ...shortcut, shiftKey: true } },
  ]
}

export function normalizeCanvasKeyboardShortcutKey(key: string) {
  return key === ' ' ? 'Space' : key
}

function formatCanvasKeyboardShortcutKey(key: string) {
  const normalizedKey = normalizeCanvasKeyboardShortcutKey(key)

  if (normalizedKey === 'Space') {
    return 'Space'
  }

  if (normalizedKey.startsWith('Arrow')) {
    return normalizedKey
  }

  return normalizedKey.length === 1
    ? normalizedKey.toUpperCase()
    : normalizedKey
}
