// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'

import { createReactDesignTextSelection } from './ReactDesignTextSelection'

describe('ReactDesignTextSelection', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('restores a stable text selection into a remounted node element', () => {
    const selection = createReactDesignTextSelection({ document })
    let element = document.createElement('textarea')

    element.value = 'Canonical text'
    document.body.append(element)
    const ownership = selection.claim({
      nodeId: 'note',
      readElement: () => element,
    })

    element.focus()
    element.setSelectionRange(2, 9, 'backward')
    const bookmark = ownership.capture()

    expect(bookmark).toEqual({
      anchorOffset: 9,
      direction: 'backward',
      focusOffset: 2,
      kind: 'text-control',
      nodeId: 'note',
    })

    const replacement = document.createElement('textarea')

    replacement.value = 'Canonical text after render'
    element.replaceWith(replacement)
    element = replacement

    expect(ownership.restore(bookmark!)).toBe(true)
    expect(document.activeElement).toBe(replacement)
    expect(replacement.selectionStart).toBe(2)
    expect(replacement.selectionEnd).toBe(9)
    expect(replacement.selectionDirection).toBe('backward')

    ownership.release()
    selection.dispose()
  })

  it('keeps a capture made after overlapping remount focus as the baseline', () => {
    const selection = createReactDesignTextSelection({ document })
    const previous = document.createElement('textarea')
    const replacement = document.createElement('textarea')
    let element = previous

    previous.value = 'Previous'
    replacement.value = 'Replacement'
    document.body.append(previous, replacement)
    const ownership = selection.claim({
      nodeId: 'note',
      readElement: () => element,
    })

    previous.focus()
    element = replacement
    replacement.focus()
    replacement.setSelectionRange(2, 7)
    const bookmark = ownership.capture()

    previous.remove()

    expect(bookmark).not.toBeNull()
    expect(ownership.restore(bookmark!)).toBe(true)
    expect(document.activeElement).toBe(replacement)
    expect(replacement.selectionStart).toBe(2)
    expect(replacement.selectionEnd).toBe(7)

    ownership.release()
    selection.dispose()
  })

  it('rejects restore when focus redirects to another control', () => {
    const selection = createReactDesignTextSelection({ document })
    let editor = document.createElement('textarea')
    const inspector = document.createElement('input')

    editor.value = 'Draft'
    document.body.append(editor, inspector)
    const ownership = selection.claim({
      nodeId: 'note',
      readElement: () => editor,
    })

    editor.focus()
    editor.setSelectionRange(1, 4)
    const bookmark = ownership.capture()
    const replacement = document.createElement('textarea')

    replacement.value = 'Draft'
    replacement.addEventListener('focus', () => inspector.focus())
    editor.replaceWith(replacement)
    editor = replacement

    expect(bookmark).not.toBeNull()
    expect(ownership.restore(bookmark!)).toBe(false)
    expect(document.activeElement).toBe(inspector)

    ownership.release()
    selection.dispose()
  })

  it('clamps UTF-16 offsets when the remounted value becomes shorter', () => {
    const selection = createReactDesignTextSelection({ document })
    let editor = document.createElement('textarea')

    editor.value = 'A😀BC'
    document.body.append(editor)
    const ownership = selection.claim({
      nodeId: 'note',
      readElement: () => editor,
    })

    editor.focus()
    editor.setSelectionRange(1, 4, 'forward')
    const bookmark = ownership.capture()
    const replacement = document.createElement('textarea')

    replacement.value = '😀'
    editor.replaceWith(replacement)
    editor = replacement

    expect(bookmark).toMatchObject({
      anchorOffset: 1,
      focusOffset: 4,
    })
    expect(ownership.restore(bookmark!)).toBe(true)
    expect(replacement.selectionStart).toBe(1)
    expect(replacement.selectionEnd).toBe(2)

    ownership.release()
    selection.dispose()
  })

  it('rejects a remounted input type without a text selection API', () => {
    const selection = createReactDesignTextSelection({ document })
    let editor = document.createElement('input')

    editor.value = 'Draft'
    document.body.append(editor)
    const ownership = selection.claim({
      nodeId: 'note',
      readElement: () => editor,
    })

    editor.focus()
    editor.setSelectionRange(1, 4)
    const bookmark = ownership.capture()
    const replacement = document.createElement('input')

    replacement.type = 'number'
    replacement.value = '12'
    editor.replaceWith(replacement)
    editor = replacement

    expect(bookmark).not.toBeNull()
    expect(ownership.restore(bookmark!)).toBe(false)
    expect(document.activeElement).toBe(document.body)

    ownership.release()
    selection.dispose()
  })

  it('does not steal focus after the user moves to another control', () => {
    const selection = createReactDesignTextSelection({ document })
    const editor = document.createElement('textarea')
    const inspector = document.createElement('input')

    editor.value = 'Draft'
    document.body.append(editor, inspector)
    const ownership = selection.claim({
      nodeId: 'note',
      readElement: () => editor,
    })

    editor.focus()
    editor.setSelectionRange(5, 5)
    const bookmark = ownership.capture()

    inspector.focus()

    expect(bookmark).not.toBeNull()
    expect(ownership.restore(bookmark!)).toBe(false)
    expect(document.activeElement).toBe(inspector)

    ownership.release()
    selection.dispose()
  })

  it('does not steal focus after the user blurs a connected editor', () => {
    const selection = createReactDesignTextSelection({ document })
    const editor = document.createElement('textarea')

    editor.value = 'Draft'
    document.body.append(editor)
    const ownership = selection.claim({
      nodeId: 'note',
      readElement: () => editor,
    })

    editor.focus()
    editor.setSelectionRange(5, 5)
    const bookmark = ownership.capture()

    editor.blur()

    expect(bookmark).not.toBeNull()
    expect(document.activeElement).toBe(document.body)
    expect(ownership.restore(bookmark!)).toBe(false)
    expect(document.activeElement).toBe(document.body)

    ownership.release()
    selection.dispose()
  })

  it('does not steal focus after the user blurs a remounted editor', () => {
    const selection = createReactDesignTextSelection({ document })
    let editor = document.createElement('textarea')

    editor.value = 'Draft'
    document.body.append(editor)
    const ownership = selection.claim({
      nodeId: 'note',
      readElement: () => editor,
    })

    editor.focus()
    editor.setSelectionRange(5, 5)
    const bookmark = ownership.capture()
    const replacement = document.createElement('textarea')

    replacement.value = 'Draft'
    editor.replaceWith(replacement)
    editor = replacement
    replacement.focus()
    replacement.blur()

    expect(bookmark).not.toBeNull()
    expect(document.activeElement).toBe(document.body)
    expect(ownership.restore(bookmark!)).toBe(false)
    expect(document.activeElement).toBe(document.body)

    ownership.release()
    selection.dispose()
  })

  it('ignores a bookmark from an older input ownership generation', () => {
    const selection = createReactDesignTextSelection({ document })
    const first = document.createElement('textarea')
    const second = document.createElement('textarea')

    first.value = 'First'
    second.value = 'Second'
    document.body.append(first, second)
    const staleOwnership = selection.claim({
      nodeId: 'first-note',
      readElement: () => first,
    })

    first.focus()
    first.setSelectionRange(1, 3)
    const staleBookmark = staleOwnership.capture()

    const currentOwnership = selection.claim({
      nodeId: 'second-note',
      readElement: () => second,
    })

    expect(staleBookmark).not.toBeNull()
    expect(staleOwnership.restore(staleBookmark!)).toBe(false)
    expect(document.activeElement).toBe(first)

    currentOwnership.release()
    selection.dispose()
  })
})
