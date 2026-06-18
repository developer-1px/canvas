export type InlineEditHistoryDirection = 'undo' | 'redo'

export const CANVAS_INLINE_EDIT_DOM_MODEL = 'canvas-inline-edit-dom'

export type CanvasInlineEditKeyboardIntent =
  | {
    historyDirection: InlineEditHistoryDirection
    kind: 'history'
    preventDefault: false
  }
  | {
    inputType: 'insertParagraph'
    kind: 'line-break'
    preventDefault: boolean
  }
  | {
    kind: 'commit'
    preventDefault: true
    source: 'enter' | 'shortcut-enter'
  }
  | {
    kind: 'cancel'
    preventDefault: true
  }
  | {
    kind: 'none'
    preventDefault: false
  }

export type CanvasInlineEditKeyboardIntentInput = Pick<
  KeyboardEvent,
  'altKey' | 'ctrlKey' | 'key' | 'metaKey' | 'shiftKey'
> & {
  altEnterInsertsLineBreak?: boolean
  commitOnEnter?: boolean
  lineBreakMode?: 'manual' | 'native'
  multiline?: boolean
}

type InlineEditTextPosition = {
  node: Text
  offset: number
}

export function inlineEditHistoryDirectionFromInputType(
  inputType: string,
): InlineEditHistoryDirection | null {
  if (inputType === 'historyUndo') {
    return 'undo'
  }

  if (inputType === 'historyRedo') {
    return 'redo'
  }

  return null
}

export function inlineEditHistoryDirectionFromKeydown(
  event: Pick<
    KeyboardEvent,
    'altKey' | 'ctrlKey' | 'key' | 'metaKey' | 'shiftKey'
  >,
): InlineEditHistoryDirection | null {
  if (!(event.metaKey || event.ctrlKey) || event.altKey) {
    return null
  }

  const key = event.key.toLowerCase()
  if (key === 'z') {
    return event.shiftKey ? 'redo' : 'undo'
  }

  if (key === 'y') {
    return 'redo'
  }

  return null
}

export function getCanvasInlineEditKeyboardIntent({
  altEnterInsertsLineBreak = false,
  altKey,
  commitOnEnter = false,
  ctrlKey,
  key,
  lineBreakMode = 'native',
  metaKey,
  multiline = true,
  shiftKey,
}: CanvasInlineEditKeyboardIntentInput): CanvasInlineEditKeyboardIntent {
  const historyDirection = inlineEditHistoryDirectionFromKeydown({
    altKey,
    ctrlKey,
    key,
    metaKey,
    shiftKey,
  })

  if (historyDirection) {
    return {
      historyDirection,
      kind: 'history',
      preventDefault: false,
    }
  }

  if (key === 'Escape') {
    return {
      kind: 'cancel',
      preventDefault: true,
    }
  }

  if (key !== 'Enter') {
    return {
      kind: 'none',
      preventDefault: false,
    }
  }

  const shortcutModifier = metaKey || ctrlKey

  if (shortcutModifier) {
    return {
      kind: 'commit',
      preventDefault: true,
      source: 'shortcut-enter',
    }
  }

  if (altKey && !altEnterInsertsLineBreak) {
    return {
      kind: 'none',
      preventDefault: false,
    }
  }

  if (commitOnEnter && !shiftKey) {
    return {
      kind: 'commit',
      preventDefault: true,
      source: 'enter',
    }
  }

  if (multiline) {
    return {
      inputType: 'insertParagraph',
      kind: 'line-break',
      preventDefault: lineBreakMode === 'manual',
    }
  }

  return {
    kind: 'none',
    preventDefault: false,
  }
}

export function isInlineEditLineBreakInput(inputType: string): boolean {
  return inputType === 'insertLineBreak' || inputType === 'insertParagraph'
}

export function inlineEditSingleLineText(text: string): string {
  return text.replace(/\r\n?/g, '\n').replace(/\n+/g, ' ')
}

export function insertInlineEditText(
  element: HTMLElement,
  text: string,
): void {
  const selection = window.getSelection()
  const selectedRange = selection?.rangeCount ? selection.getRangeAt(0) : null

  if (!selection || !selectedRange || !element.contains(selectedRange.endContainer)) {
    collapseInlineEditSelection(element, element.textContent?.length ?? 0)
  }

  const range = window.getSelection()?.getRangeAt(0)
  if (!range) {
    return
  }

  range.deleteContents()
  range.insertNode(document.createTextNode(text))
  range.collapse(false)
  window.getSelection()?.removeAllRanges()
  window.getSelection()?.addRange(range)
}

export function restoreInlineEditFocus(
  resolveElement: () => HTMLElement | null,
  offset: number,
): void {
  const restore = (): void => {
    const element = resolveElement()
    if (!element) {
      return
    }

    element.focus({ preventScroll: true })
    collapseInlineEditSelection(element, offset)
  }

  restore()
  requestAnimationFrame(restore)
}

function collapseInlineEditSelection(
  element: HTMLElement,
  offset: number,
): void {
  const selection = window.getSelection()
  if (!selection) {
    return
  }

  const range = document.createRange()
  const position = inlineEditTextPositionAtOffset(element, offset)
  if (position) {
    range.setStart(position.node, position.offset)
  } else {
    range.selectNodeContents(element)
  }

  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
}

function inlineEditTextPositionAtOffset(
  element: HTMLElement,
  offset: number,
): InlineEditTextPosition | null {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  let remaining = Math.max(0, offset)
  let lastText: Text | null = null

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!(node instanceof Text)) {
      continue
    }

    lastText = node
    if (remaining <= node.data.length) {
      return { node, offset: remaining }
    }

    remaining -= node.data.length
  }

  return lastText ? { node: lastText, offset: lastText.data.length } : null
}
