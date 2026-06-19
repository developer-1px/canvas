import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CanvasShortcutHelpOverlay } from './CanvasShortcutHelpOverlay'

describe('CanvasShortcutHelpOverlay', () => {
  it('renders nothing when closed', () => {
    const markup = renderToStaticMarkup(
      <CanvasShortcutHelpOverlay
        items={[]}
        open={false}
        onClose={vi.fn()}
      />,
    )

    expect(markup).toBe('')
  })

  it('renders grouped keyboard shortcut rows when open', () => {
    const markup = renderToStaticMarkup(
      <CanvasShortcutHelpOverlay
        items={[
          {
            id: 'tool:select',
            section: 'Tools',
            shortcut: 'V',
            title: 'Select Tool',
          },
          {
            id: 'system:shortcutHelp',
            section: 'System',
            shortcut: 'Shift+/',
            title: 'Keyboard shortcuts',
          },
        ]}
        open={true}
        onClose={vi.fn()}
      />,
    )

    expect(markup).toContain('class="shortcut-help"')
    const labelledByMatch = markup.match(/aria-labelledby="([^"]+)"/)

    expect(labelledByMatch?.[1]).toBeTruthy()
    expect(markup).toContain(`<h2 id="${labelledByMatch?.[1]}">`)
    expect(markup).toContain('aria-labelledby="')
    expect(markup).not.toContain('aria-label="Keyboard shortcuts"')
    expect(markup).toMatch(
      /<section[^>]+aria-labelledby="[^"]+section-tools-heading"[^>]+class="shortcut-help-section"/,
    )
    expect(markup).toContain('Select Tool')
    expect(markup).toContain('Shift+/')
  })
})
