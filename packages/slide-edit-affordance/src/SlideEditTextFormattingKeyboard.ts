export type SlideEditTextFormattingKeyboardIntentKind =
  | 'toggle-bold'
  | 'toggle-italic'
  | 'toggle-underline'

export type SlideEditTextFormattingKeyboardShortcut =
  | 'Cmd/Ctrl+B'
  | 'Cmd/Ctrl+I'
  | 'Cmd/Ctrl+U'

export type SlideEditTextFormattingKeyboardIntent = {
  commandId: SlideEditTextFormattingKeyboardIntentKind
  kind: SlideEditTextFormattingKeyboardIntentKind
  preventDefault: true
  shortcut: SlideEditTextFormattingKeyboardShortcut
}

export type SlideEditTextFormattingKeyboardIntentInput = {
  altKey?: boolean
  key: string
  mod: boolean
  shiftKey?: boolean
}

export function getSlideEditTextFormattingKeyboardIntent({
  altKey = false,
  key,
  mod,
  shiftKey = false,
}: SlideEditTextFormattingKeyboardIntentInput):
  SlideEditTextFormattingKeyboardIntent | null {
  if (!mod || altKey || shiftKey) {
    return null
  }

  const normalizedKey = key.toLowerCase()

  if (normalizedKey === 'b') {
    return {
      commandId: 'toggle-bold',
      kind: 'toggle-bold',
      preventDefault: true,
      shortcut: 'Cmd/Ctrl+B',
    }
  }

  if (normalizedKey === 'i') {
    return {
      commandId: 'toggle-italic',
      kind: 'toggle-italic',
      preventDefault: true,
      shortcut: 'Cmd/Ctrl+I',
    }
  }

  if (normalizedKey === 'u') {
    return {
      commandId: 'toggle-underline',
      kind: 'toggle-underline',
      preventDefault: true,
      shortcut: 'Cmd/Ctrl+U',
    }
  }

  return null
}
