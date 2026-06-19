import { describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CanvasFindReplacePanel } from './CanvasFindReplacePanel'
import {
  runCanvasFindReplacePanelKeyboardIntent,
} from './CanvasFindReplacePanelKeyboard'

describe('CanvasFindReplacePanel', () => {
  it('renders search surface semantics with a connected result status', () => {
    const markup = renderToStaticMarkup(
      createElement(CanvasFindReplacePanel, {
        matchCount: 2,
        open: true,
        query: 'card',
        replacement: 'tile',
        onClose: vi.fn(),
        onQueryChange: vi.fn(),
        onReplaceAll: vi.fn(),
        onReplacementChange: vi.fn(),
      }),
    )

    expect(markup).toContain('role="search"')
    expect(markup).toContain('aria-label="Find and replace"')
    expect(markup).toContain('type="search"')
    expect(markup).toContain('aria-describedby="')
    expect(markup).toContain('role="status"')
    expect(markup).toContain('aria-atomic="true"')
    expect(markup).toContain('aria-label="2 matches"')
  })

  it('closes and consumes Escape inside the find replace panel', () => {
    const event = createKeyboardEvent({ key: 'Escape' })
    const onClose = vi.fn()

    const handled = runCanvasFindReplacePanelKeyboardIntent({
      event,
      onClose,
    })

    expect(handled).toBe(true)
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(event.stopPropagation).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('leaves Enter for the form submit flow', () => {
    const event = createKeyboardEvent({ key: 'Enter' })
    const onClose = vi.fn()

    const handled = runCanvasFindReplacePanelKeyboardIntent({
      event,
      onClose,
    })

    expect(handled).toBe(false)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(event.stopPropagation).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})

function createKeyboardEvent({
  key,
  shiftKey,
}: {
  key: string
  shiftKey?: boolean
}) {
  return {
    key,
    preventDefault: vi.fn(),
    shiftKey,
    stopPropagation: vi.fn(),
  }
}
