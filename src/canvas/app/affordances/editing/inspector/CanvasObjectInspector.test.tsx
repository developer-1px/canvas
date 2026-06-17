import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  CANVAS_COMMENT_THREAD_MODEL,
  CanvasObjectInspector,
} from './CanvasObjectInspector'

describe('CanvasObjectInspector', () => {
  it('exposes a stable comment thread model metadata value', () => {
    expect(CANVAS_COMMENT_THREAD_MODEL).toBe('canvas-comment-thread')
  })

  it('renders style swatches for selected object colors', () => {
    const markup = renderToStaticMarkup(
      <CanvasObjectInspector
        bounds={{ h: 40, w: 80, x: 10, y: 20 }}
        commentThread={null}
        customPanels={[]}
        disabled={false}
        label="Rect"
        styleControls={[
          {
            disabled: false,
            id: 'fill',
            kind: 'swatches',
            label: 'Fill',
            mixed: false,
            swatches: [
              { color: '#FFFFFF', selected: true },
              { color: '#C2E5FF', selected: false },
            ],
            onSelect: vi.fn(),
          },
        ]}
        onChangeBounds={vi.fn()}
      />,
    )

    expect(markup).toContain('inspector-style-controls')
    expect(markup).toContain('role="radiogroup"')
    expect(markup).toContain('aria-label="Fill #FFFFFF"')
    expect(markup).toContain('role="radio"')
    expect(markup).toContain('aria-checked="true"')
    expect(markup).toContain('background-color:#FFFFFF')
  })

  it('renders number and segmented style controls', () => {
    const markup = renderToStaticMarkup(
      <CanvasObjectInspector
        bounds={{ h: 40, w: 80, x: 10, y: 20 }}
        commentThread={null}
        customPanels={[]}
        disabled={false}
        label="Rect"
        styleControls={[
          {
            disabled: false,
            id: 'strokeWidth',
            kind: 'number',
            label: 'Stroke width',
            max: 32,
            min: 0.5,
            mixed: false,
            step: 0.5,
            value: 2,
            onChange: vi.fn(),
          },
          {
            disabled: false,
            id: 'textAlign',
            kind: 'segmented',
            label: 'Text align',
            mixed: false,
            segments: [
              { label: 'Left', selected: false, value: 'left' },
              { label: 'Center', selected: true, value: 'center' },
            ],
            value: 'center',
            onSelect: vi.fn(),
          },
        ]}
        onChangeBounds={vi.fn()}
      />,
    )

    expect(markup).toContain('aria-label="Stroke width"')
    expect(markup).toContain('value="2"')
    expect(markup).toContain('role="radiogroup"')
    expect(markup).toContain('aria-label="Text align Center"')
    expect(markup).toContain('role="radio"')
    expect(markup).toContain('aria-checked="true"')
  })

  it('renders compact comment thread controls', () => {
    const markup = renderToStaticMarkup(
      <CanvasObjectInspector
        bounds={{ h: 36, w: 36, x: 10, y: 20 }}
        commentThread={{
          disabled: false,
          itemId: 'comment-1',
          messages: [{
            authorName: 'Ari',
            body: 'Needs follow-up',
            createdAt: '2026-06-02T00:00:00.000Z',
            id: 'message-1',
          }],
          resolved: false,
          onToggleResolved: vi.fn(),
        }}
        customPanels={[]}
        disabled={false}
        label="Comment"
        styleControls={[]}
        onChangeBounds={vi.fn()}
      />,
    )

    expect(markup).toContain('aria-label="Comment thread"')
    expect(markup).toContain(
      `data-canvas-comment-thread-model="${CANVAS_COMMENT_THREAD_MODEL}"`,
    )
    expect(markup).toContain('Needs follow-up')
    expect(markup).toContain('Resolve')
  })

  it('renders custom panels alongside standard inspector chrome', () => {
    const markup = renderToStaticMarkup(
      <CanvasObjectInspector
        bounds={{ h: 40, w: 80, x: 10, y: 20 }}
        commentThread={null}
        customPanels={[{
          content: <div>Styles</div>,
          id: 'custom-styles',
        }]}
        disabled={false}
        label="Custom item"
        styleControls={[
          {
            disabled: false,
            id: 'fill',
            kind: 'swatches',
            label: 'Fill',
            mixed: false,
            swatches: [{ color: '#FFFFFF', selected: true }],
            onSelect: vi.fn(),
          },
        ]}
        onChangeBounds={vi.fn()}
      />,
    )

    expect(markup).toContain('Styles')
    expect(markup).not.toContain('object-inspector-devtools')
    expect(markup).toContain('inspector-grid')
    expect(markup).toContain('inspector-style-controls')
  })
})
