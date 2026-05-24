import { describe, expect, it, vi } from 'vitest'
import {
  getCanvasLinkPreviewInsertCenter,
  getCanvasLinkPreviewSourceFromDataTransfer,
  getCanvasLinkPreviewSourceFromText,
  insertCanvasLinkPreviewSource,
} from './CanvasLinkPreviewImport'

describe('CanvasLinkPreviewImport', () => {
  it('extracts URL sources from plain URLs and embed snippets', () => {
    expect(getCanvasLinkPreviewSourceFromText(
      'https://www.figma.com/figjam/',
    )).toEqual({
      url: 'https://www.figma.com/figjam/',
    })
    expect(getCanvasLinkPreviewSourceFromText(
      '<iframe src="https://www.youtube.com/embed/demo"></iframe>',
    )).toEqual({
      url: 'https://www.youtube.com/embed/demo',
    })
  })

  it('ignores non-http text', () => {
    expect(getCanvasLinkPreviewSourceFromText('hello world')).toBeNull()
    expect(getCanvasLinkPreviewSourceFromText('mailto:team@example.com'))
      .toBeNull()
  })

  it('reads text/uri-list before plain text from data transfer', () => {
    const dataTransfer = {
      getData: vi.fn((type: string) =>
        type === 'text/uri-list'
          ? 'https://docs.example.com/reference'
          : 'https://fallback.example.com',
      ),
    } as unknown as DataTransfer

    expect(getCanvasLinkPreviewSourceFromDataTransfer(dataTransfer)).toEqual({
      url: 'https://docs.example.com/reference',
    })
  })

  it('inserts link previews centered on the target point', () => {
    const commitItemsChange = vi.fn(() => true)
    const createId = vi.fn(() => 'component-link-1')

    expect(insertCanvasLinkPreviewSource({
      center: { x: 300, y: 200 },
      context: {
        commitItemsChange,
        createId,
        selection: ['component-card'],
      },
      source: {
        url: 'https://www.figma.com/figjam/',
      },
    })).toBe(true)

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'add',
        items: [
          expect.objectContaining({
            component: 'link-preview',
            id: 'component-link-1',
            title: 'figma.com',
            url: 'https://www.figma.com/figjam/',
            x: 140,
            y: 126,
          }),
        ],
      },
      {
        before: ['component-card'],
        after: ['component-link-1'],
      },
    )
  })

  it('derives insert center from dropped screen coordinates or viewport center', () => {
    const stageElement = {
      getScreenPoint: vi.fn(() => ({ x: 410, y: 260 })),
      getViewportCenter: vi.fn(() => ({ x: 100, y: 120 })),
    }
    const viewport = { scale: 2, x: 10, y: 20 }

    expect(getCanvasLinkPreviewInsertCenter({
      event: { clientX: 410, clientY: 260 },
      stageElement: stageElement as never,
      viewport,
    })).toEqual({ x: 200, y: 120 })
    expect(getCanvasLinkPreviewInsertCenter({
      stageElement: stageElement as never,
      viewport,
    })).toEqual({ x: 100, y: 120 })
  })
})
