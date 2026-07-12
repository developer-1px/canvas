import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type {
  CanvasCustomItem,
  CanvasJsonObject,
} from '../../../entities'
import { createCanvasAppTestDocumentAuthority } from '../../workflow/CanvasAppDocumentAuthorityTestFixtures'
import {
  createCanvasDomEditStyleInspectorPanel,
  getCanvasDomEditStyle,
  getCanvasDomEditStyleProperties,
  setCanvasDomEditStyleValue,
} from './CanvasDomEditStyle'

describe('CanvasDomEditStyle', () => {
  it('reads DOM node style defaults separately from widget data', () => {
    const style = getCanvasDomEditStyle({}, 'card', {
      defaultValue: {
        gap: 6,
        padding: 12,
        radius: 4,
      },
    })

    expect(style).toEqual({
      gap: 6,
      margin: 0,
      padding: 12,
      radius: 4,
    })
    expect(getCanvasDomEditStyleProperties(style)).toEqual({
      borderRadius: 4,
      gap: 6,
      margin: 0,
      padding: 12,
    })
  })

  it('stores edits under the DOM edit target id', () => {
    type Data = CanvasJsonObject & { title: string }
    const data: Data = { title: 'Todo' }
    const next = setCanvasDomEditStyleValue(data, 'card', 'padding', 24)

    expect(next).toMatchObject({
      title: 'Todo',
      domEdit: {
        styles: {
          card: {
            padding: 24,
          },
        },
      },
    })
    expect(data.domEdit).toBeUndefined()
  })

  it('renders an inspector panel owned by DOM editing, not widgets', () => {
    const panel = createCanvasDomEditStyleInspectorPanel({
      itemKind: 'todo-widget',
      options: {
        defaultValue: {
          gap: 6,
          padding: 12,
          radius: 6,
        },
      },
      targetId: 'card',
      targetLabel: 'Card',
    })
    const item = {
      data: { title: 'Todo' },
      h: 120,
      id: 'todo-1',
      kind: 'todo-widget',
      presentation: 'todo-widget-card',
      title: 'Todo widget',
      type: 'custom',
      w: 220,
      x: 0,
      y: 0,
    } satisfies CanvasCustomItem
    const context = {
      bounds: item,
      customFocus: null,
      disabled: false,
      document: createCanvasAppTestDocumentAuthority(),
      items: [item],
      label: 'Todo widget',
      selectedItems: [item],
      selection: [item.id],
    }
    const markup = renderToStaticMarkup(<>{panel.render(context)}</>)

    expect(panel.id).toBe('todo-widget-dom-card-style')
    expect(panel.isVisible?.(context)).toBe(true)
    expect(markup).toContain('Card DOM layout')
    expect(markup).toContain('DOM Margin')
    expect(markup).toContain('DOM Padding')
    expect(markup).toContain('DOM Gap')
    expect(markup).toContain('DOM Radius')
  })
})
