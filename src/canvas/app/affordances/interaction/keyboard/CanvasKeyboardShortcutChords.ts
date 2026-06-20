export type CanvasKeyboardShortcutChord = {
  key: string
  shiftKey?: boolean
}

export type CanvasKeyboardReservedShortcut = {
  label: string
  shortcut: CanvasKeyboardShortcutChord
}

export type CanvasKeyboardShortcutModifier = 'mod'

export type CanvasKeyboardShortcutMatchOptions = {
  code?: string
  ignoreKey?: boolean
  key?: string
  keys?: readonly string[]
  modifier?: CanvasKeyboardShortcutModifier
  shiftInsensitive?: boolean
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
  return matchesCanvasKeyboardShortcutBinding({ event, shortcut })
}

export function matchesCanvasKeyboardShortcutBinding({
  event,
  options = {},
  shortcut,
}: {
  event: KeyboardEvent
  options?: CanvasKeyboardShortcutMatchOptions
  shortcut: CanvasKeyboardShortcutChord
}) {
  if (!matchesCanvasKeyboardShortcutModifiers({ event, options, shortcut })) {
    return false
  }

  if (options.code && event.code !== options.code) {
    return false
  }

  if (options.ignoreKey) {
    return true
  }

  const inputKey = normalizeCanvasKeyboardShortcutKey(
    options.key ?? event.key,
  ).toLowerCase()
  const shortcutKeys = options.keys ?? [shortcut.key]

  return shortcutKeys.some((shortcutKey) =>
    normalizeCanvasKeyboardShortcutKey(shortcutKey).toLowerCase() === inputKey
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

export function formatCanvasKeyboardShortcutAriaKey(
  shortcut: CanvasKeyboardShortcutChord,
) {
  const key = normalizeCanvasKeyboardShortcutKey(shortcut.key)
  const ariaKey = shortcut.shiftKey && key.length === 1
    ? key.toUpperCase()
    : key

  return shortcut.shiftKey ? `Shift+${ariaKey}` : ariaKey
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

function matchesCanvasKeyboardShortcutModifiers({
  event,
  options,
  shortcut,
}: {
  event: KeyboardEvent
  options: CanvasKeyboardShortcutMatchOptions
  shortcut: CanvasKeyboardShortcutChord
}) {
  if (event.altKey) {
    return false
  }

  const mod = event.metaKey || event.ctrlKey

  if (options.modifier === 'mod') {
    if (!mod) {
      return false
    }
  } else if (mod) {
    return false
  }

  if (options.shiftInsensitive) {
    return true
  }

  return event.shiftKey === (shortcut.shiftKey ?? false)
}
