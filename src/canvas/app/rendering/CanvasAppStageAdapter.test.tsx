import {
  isValidElement,
  type ReactElement,
} from 'react'
import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_CANVAS_APP_STAGE_ADAPTER,
  type CanvasAppStageRenderInput,
} from './CanvasAppStageAdapter'

describe('CanvasAppStageAdapter', () => {
  it('maps the app stage mount interface to the default SVG stage ref', () => {
    const ref = vi.fn()
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
      onCanvasPointerDown: () => undefined,
      onContextMenu: () => undefined,
      onPointerCancel: () => undefined,
      onPointerMove: () => undefined,
      onPointerUp: () => undefined,
      onResizePointerDown: () => undefined,
    })

    expect(output.props.onStageElement).toBe(ref)
    expect(output.props.stageElement).toBeUndefined()
  })
})

function renderDefaultStage(input: CanvasAppStageRenderInput) {
  const Stage = DEFAULT_CANVAS_APP_STAGE_ADAPTER.Stage as (
    stageInput: CanvasAppStageRenderInput,
  ) => ReactElement<{
    onStageElement?: unknown
    stageElement?: unknown
  }>
  const rendered = Stage(input)

  if (!isValidElement(rendered)) {
    throw new Error('Expected default canvas app stage adapter to render')
  }

  return rendered
}
