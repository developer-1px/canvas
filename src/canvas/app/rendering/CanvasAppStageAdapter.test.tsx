import {
  isValidElement,
  type ReactElement,
} from 'react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CANVAS_APP_STAGE_ADAPTER } from './CanvasAppStageAdapter'
import type {
  CanvasAppStageRenderInput,
} from './CanvasAppRenderingContracts'

describe('CanvasAppStageAdapter', () => {
  it('maps the app stage mount interface to the default SVG stage ref', () => {
    const ref = vi.fn()
    const onCanvasPointerDown = vi.fn()
    const onContextMenu = vi.fn()
    const output = renderDefaultStage({
      activeMode: 'select',
      gesture: 'none',
      overlays: {
        alignmentGuides: [],
        draftArrow: null,
        draftRect: null,
        draftStroke: null,
        grid: true,
        itemOutlineIds: new Set(),
        marquee: null,
        resizeHandles: [],
        selectionBounds: null,
        spacingGuides: [],
      },
      stageElement: { ref },
      viewport: { scale: 1, x: 0, y: 0 },
      onCanvasPointerDown,
      onContextMenu,
      onPointerCancel: () => undefined,
      onPointerMove: () => undefined,
      onPointerUp: () => undefined,
      onResizePointerDown: () => undefined,
    })

    expect(output.props.onStageElement).toBe(ref)
    expect(output.props.stageElement).toBeUndefined()

    output.props.onCanvasPointerDown(createPointerEventSource())
    output.props.onContextMenu(createEventSource())

    expect(onCanvasPointerDown).toHaveBeenCalledWith(
      expect.objectContaining({
        button: 0,
        clientX: 12,
        clientY: 34,
        pointerId: 7,
      }),
    )
    expect(onContextMenu).toHaveBeenCalledWith(
      expect.objectContaining({
        preventDefault: expect.any(Function),
      }),
    )
  })
})

function renderDefaultStage(input: CanvasAppStageRenderInput) {
  const renderStage = DEFAULT_CANVAS_APP_STAGE_ADAPTER.renderStage as (
    stageInput: CanvasAppStageRenderInput,
  ) => ReactElement<{
    onCanvasPointerDown: (event: ReturnType<typeof createPointerEventSource>) => void
    onContextMenu: (event: ReturnType<typeof createEventSource>) => void
    onStageElement?: unknown
    stageElement?: unknown
  }>
  const rendered = renderStage(input)

  if (!isValidElement(rendered)) {
    throw new Error('Expected default canvas app stage adapter to render')
  }

  return rendered
}

function createEventSource() {
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  }
}

function createPointerEventSource() {
  return {
    ...createEventSource(),
    altKey: false,
    button: 0,
    clientX: 12,
    clientY: 34,
    ctrlKey: false,
    metaKey: false,
    pointerId: 7,
    shiftKey: false,
  }
}
