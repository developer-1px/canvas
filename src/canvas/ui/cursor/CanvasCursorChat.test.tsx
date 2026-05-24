import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CanvasCursorChat } from './CanvasCursorChat'

describe('CanvasCursorChat', () => {
  it('renders nothing when hidden', () => {
    const markup = renderToStaticMarkup(
      <CanvasCursorChat {...createCursorChatProps({ visible: false })} />,
    )

    expect(markup).toBe('')
  })

  it('renders a compact cursor-anchored textarea when visible', () => {
    const markup = renderToStaticMarkup(
      <CanvasCursorChat {...createCursorChatProps({ visible: true })} />,
    )

    expect(markup).toContain('class="cursor-chat"')
    expect(markup).toContain('aria-label="Cursor chat"')
    expect(markup).toContain('aria-label="Cursor chat message"')
    expect(markup).toContain('maxLength="52"')
    expect(markup).toContain('left:120px')
    expect(markup).toContain('top:90px')
    expect(markup).toContain('Need input')
  })
})

function createCursorChatProps({ visible }: { visible: boolean }) {
  return {
    maxLength: 52,
    point: { x: 120, y: 90 },
    value: 'Need input',
    visible,
    onCancel: vi.fn(),
    onChange: vi.fn(),
  }
}
