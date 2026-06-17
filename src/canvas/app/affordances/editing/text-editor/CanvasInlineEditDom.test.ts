import { describe, expect, it } from 'vitest'
import {
  getCanvasInlineEditKeyboardIntent,
  inlineEditHistoryDirectionFromKeydown,
} from './CanvasInlineEditDom'

describe('CanvasInlineEditDom', () => {
  it('maps undo and redo shortcuts to history intents', () => {
    expect(getCanvasInlineEditKeyboardIntent({
      altKey: false,
      ctrlKey: false,
      key: 'z',
      metaKey: true,
      shiftKey: false,
    })).toEqual({
      historyDirection: 'undo',
      kind: 'history',
      preventDefault: false,
    })
    expect(getCanvasInlineEditKeyboardIntent({
      altKey: false,
      ctrlKey: false,
      key: 'z',
      metaKey: true,
      shiftKey: true,
    })).toEqual({
      historyDirection: 'redo',
      kind: 'history',
      preventDefault: false,
    })
    expect(inlineEditHistoryDirectionFromKeydown({
      altKey: false,
      ctrlKey: true,
      key: 'y',
      metaKey: false,
      shiftKey: false,
    })).toBe('redo')
  })

  it('maps Enter to native line-break by default', () => {
    expect(getCanvasInlineEditKeyboardIntent({
      altKey: false,
      ctrlKey: false,
      key: 'Enter',
      metaKey: false,
      shiftKey: false,
    })).toEqual({
      inputType: 'insertParagraph',
      kind: 'line-break',
      preventDefault: false,
    })
  })

  it('maps Enter to manual line-break when requested', () => {
    expect(getCanvasInlineEditKeyboardIntent({
      altKey: false,
      ctrlKey: false,
      key: 'Enter',
      lineBreakMode: 'manual',
      metaKey: false,
      shiftKey: false,
    })).toEqual({
      inputType: 'insertParagraph',
      kind: 'line-break',
      preventDefault: true,
    })
  })

  it('maps plain Enter to commit when commitOnEnter is enabled', () => {
    expect(getCanvasInlineEditKeyboardIntent({
      altKey: false,
      commitOnEnter: true,
      ctrlKey: false,
      key: 'Enter',
      metaKey: false,
      shiftKey: false,
    })).toEqual({
      kind: 'commit',
      preventDefault: true,
      source: 'enter',
    })
  })

  it('keeps Shift Enter available as a line break with commitOnEnter', () => {
    expect(getCanvasInlineEditKeyboardIntent({
      altKey: false,
      commitOnEnter: true,
      ctrlKey: false,
      key: 'Enter',
      metaKey: false,
      shiftKey: true,
    })).toEqual({
      inputType: 'insertParagraph',
      kind: 'line-break',
      preventDefault: false,
    })
  })

  it('maps shortcut Enter to commit', () => {
    expect(getCanvasInlineEditKeyboardIntent({
      altKey: false,
      ctrlKey: false,
      key: 'Enter',
      metaKey: true,
      shiftKey: false,
    })).toEqual({
      kind: 'commit',
      preventDefault: true,
      source: 'shortcut-enter',
    })
  })

  it('keeps Alt Enter inert unless the host opts in', () => {
    expect(getCanvasInlineEditKeyboardIntent({
      altKey: true,
      ctrlKey: false,
      key: 'Enter',
      metaKey: false,
      shiftKey: false,
    })).toEqual({
      kind: 'none',
      preventDefault: false,
    })
    expect(getCanvasInlineEditKeyboardIntent({
      altEnterInsertsLineBreak: true,
      altKey: true,
      ctrlKey: false,
      key: 'Enter',
      metaKey: false,
      shiftKey: false,
    })).toEqual({
      inputType: 'insertParagraph',
      kind: 'line-break',
      preventDefault: false,
    })
  })

  it('maps Escape to cancel', () => {
    expect(getCanvasInlineEditKeyboardIntent({
      altKey: false,
      ctrlKey: false,
      key: 'Escape',
      metaKey: false,
      shiftKey: false,
    })).toEqual({
      kind: 'cancel',
      preventDefault: true,
    })
  })
})
