import { describe, expect, it } from 'vitest'
import {
  CANVAS_LINK_PREVIEW_COMPONENT_KIND,
  CANVAS_LINK_PREVIEW_COMPONENT_PRESENTATION,
  createCanvasLinkPreviewComponentItem,
  createCanvasLinkPreviewSourceTextItem,
  getCanvasLinkPreviewDomain,
  isCanvasLinkPreviewComponentItem,
  isCanvasLinkPreviewUrl,
  normalizeCanvasLinkPreviewUrl,
  replaceCanvasLinkPreviewComponentsWithSourceText,
} from './CanvasLinkPreviewComponent'

describe('CanvasLinkPreviewComponent', () => {
  it('creates a persisted static link preview component', () => {
    expect(createCanvasLinkPreviewComponentItem({
      id: 'component-link-1',
      point: { x: 10, y: 20 },
      url: 'https://www.figma.com/figjam/',
    })).toEqual({
      accent: '#2563eb',
      body: 'https://www.figma.com/figjam/',
      component: CANVAS_LINK_PREVIEW_COMPONENT_KIND,
      fill: '#ffffff',
      h: 148,
      id: 'component-link-1',
      stroke: '#cbd5e1',
      title: 'figma.com',
      type: 'component',
      url: 'https://www.figma.com/figjam/',
      w: 320,
      x: 10,
      y: 20,
    })
  })

  it('normalizes only http and https URLs', () => {
    expect(normalizeCanvasLinkPreviewUrl(' https://example.com/a ')).toBe(
      'https://example.com/a',
    )
    expect(isCanvasLinkPreviewUrl('http://example.com')).toBe(true)
    expect(isCanvasLinkPreviewUrl('mailto:team@example.com')).toBe(false)
    expect(isCanvasLinkPreviewUrl('example.com')).toBe(false)
    expect(() =>
      createCanvasLinkPreviewComponentItem({
        id: 'component-link-1',
        point: { x: 0, y: 0 },
        url: 'example.com',
      }),
    ).toThrow('Canvas link preview requires an http or https URL')
  })

  it('identifies the built-in link preview kind and presentation', () => {
    const item = createCanvasLinkPreviewComponentItem({
      id: 'component-link-1',
      point: { x: 0, y: 0 },
      url: 'https://docs.example.com/path',
    })

    expect(CANVAS_LINK_PREVIEW_COMPONENT_PRESENTATION).toBe(
      'link-preview-card',
    )
    expect(isCanvasLinkPreviewComponentItem(item)).toBe(true)
    expect(getCanvasLinkPreviewDomain(item.url ?? '')).toBe('docs.example.com')
  })

  it('creates a source URL text item from a link preview', () => {
    const item = createCanvasLinkPreviewComponentItem({
      id: 'component-link-1',
      point: { x: 10, y: 20 },
      url: 'https://docs.example.com/reference',
    })

    expect(createCanvasLinkPreviewSourceTextItem(item)).toEqual({
      h: 42,
      id: 'component-link-1',
      text: 'https://docs.example.com/reference',
      type: 'text',
      w: 320,
      x: 10,
      y: 20,
    })
  })

  it('replaces selected link previews inside an item tree with source text', () => {
    const item = createCanvasLinkPreviewComponentItem({
      id: 'component-link-1',
      point: { x: 10, y: 20 },
      url: 'https://docs.example.com/reference',
    })
    const nextItems = replaceCanvasLinkPreviewComponentsWithSourceText([
      {
        children: [item],
        h: 148,
        id: 'group-1',
        type: 'group',
        w: 320,
        x: 10,
        y: 20,
      },
    ], ['component-link-1'])

    expect(nextItems).toMatchObject([
      {
        children: [
          {
            id: 'component-link-1',
            text: 'https://docs.example.com/reference',
            type: 'text',
          },
        ],
        id: 'group-1',
        type: 'group',
      },
    ])
  })
})
