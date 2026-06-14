type InlineEditHistoryDirection = 'undo' | 'redo'

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
