import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CanvasWhiteboardSvgRectTextItem } from './CanvasWhiteboardSvgRectTextItemRenderer'
import { renderCanvasWhiteboardSvgRectTextItem } from './CanvasWhiteboardSvgRectTextItemRenderer'
import {
  CanvasInlineTextEditingContext,
  type CanvasInlineTextEditingContextValue,
} from '../affordances/editing/text-editor/CanvasInlineTextEditingContext'

describe('CanvasWhiteboardSvgRectTextItemRenderer', () => {
  it('renders shape geometry and embedded text', () => {
    const markup = renderRectTextItems([
      {
        fill: '#f8fafc',
        h: 80,
        id: 'rect-1',
        shapeType: 'rect',
        stroke: '#334155',
        text: 'Frame',
        type: 'shape',
        w: 120,
        x: 20,
        y: 30,
      },
    ])

    expect(markup).toContain('class="shape-item"')
    expect(markup).toContain('x="20"')
    expect(markup).toContain('width="120"')
    expect(markup).toContain('class="canvas-text canvas-shape-text"')
    expect(markup).toContain('Frame')
  })

  it('renders text items as foreignObject text', () => {
    const markup = renderRectTextItems([
      {
        id: 'text-1',
        type: 'text',
        x: 44,
        y: 56,
        w: 140,
        h: 48,
        text: 'Label',
      },
    ])

    expect(markup).toContain('foreignObject')
    expect(markup).toContain('x="44"')
    expect(markup).toContain('height="48"')
    expect(markup).toContain('class="canvas-text"')
    expect(markup).toContain('data-text-item-id="text-1"')
    expect(markup).toContain('Label')
  })

  it('opens active text items as contenteditable text surfaces', () => {
    const markup = renderRectTextItems([{
      h: 48,
      id: 'text-1',
      text: 'Label',
      type: 'text',
      w: 140,
      x: 44,
      y: 56,
    }], {
      inlineTextEditor: createInlineTextEditor({
        editing: { id: 'text-1', value: 'Draft label' },
      }),
    })

    expect(markup).toContain('contentEditable="plaintext-only"')
    expect(markup).toContain('data-editing="true"')
    expect(markup).toContain('data-text-item-id="text-1"')
    expect(markup).toContain('role="textbox"')
    expect(markup).not.toContain('textarea')
    expect(markup).not.toContain('Label')
  })

  it('renders ellipse shapes with the same embedded text contract', () => {
    const markup = renderRectTextItems([
      {
        fill: '#fef3c7',
        h: 80,
        id: 'ellipse-1',
        shapeType: 'ellipse',
        stroke: '#d97706',
        text: 'Loop',
        type: 'shape',
        w: 120,
        x: 20,
        y: 30,
      },
    ])

    expect(markup).toContain('<ellipse')
    expect(markup).toContain('class="shape-item"')
    expect(markup).toContain('cx="80"')
    expect(markup).toContain('ry="40"')
    expect(markup).toContain('Loop')
  })

  it('renders diamond shapes with the same embedded text contract', () => {
    const markup = renderRectTextItems([
      {
        fill: '#ecfdf5',
        h: 80,
        id: 'diamond-1',
        shapeType: 'diamond',
        stroke: '#047857',
        text: 'Decision',
        type: 'shape',
        w: 120,
        x: 20,
        y: 30,
      },
    ])

    expect(markup).toContain('<path')
    expect(markup).toContain('class="shape-item"')
    expect(markup).toContain('M 80 30 L 140 70 L 80 110 L 20 70 Z')
    expect(markup).toContain('Decision')
  })
})

function renderRectTextItems(
  items: CanvasWhiteboardSvgRectTextItem[],
  options: {
    inlineTextEditor?: CanvasInlineTextEditingContextValue
  } = {},
) {
  const markup = (
    <svg>
      {items.map((item) => (
        <g key={item.id}>{renderCanvasWhiteboardSvgRectTextItem({ item })}</g>
      ))}
    </svg>
  )

  return renderToStaticMarkup(
    options.inlineTextEditor ? (
      <CanvasInlineTextEditingContext.Provider value={options.inlineTextEditor}>
        {markup}
      </CanvasInlineTextEditingContext.Provider>
    ) : markup,
  )
}

function createInlineTextEditor(
  overrides: Partial<CanvasInlineTextEditingContextValue> = {},
): CanvasInlineTextEditingContextValue {
  return {
    commitOnEnter: false,
    editing: null,
    enabled: true,
    setEditorElement: () => undefined,
    onBlur: () => undefined,
    onCancel: () => undefined,
    onChange: () => undefined,
    onCommit: () => undefined,
    ...overrides,
  }
}
