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
    expect(markup).toContain('aria-label="Keyboard shortcuts"')
    expect(markup).toContain('Select Tool')
    expect(markup).toContain('Shift+/')
  })
})
