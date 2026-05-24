import {
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER } from './CanvasAppItemLayerAdapter'

describe('CanvasAppItemLayerAdapter', () => {
  it('maps SVG item pointer events into the app pointer interface', () => {
    const onItemPointerDown = vi.fn()
    const onArrowEndpointPointerDown = vi.fn()
    const rendered = DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER.renderItems({
      componentPresentationRenderers: {},
      customItemRenderers: {},
      getComponentPresentation: () => 'note-card',
      items: [],
      onArrowEndpointPointerDown,
      onItemPointerDown,
      onTextDoubleClick: () => undefined,
      outlineIds: new Set(),
      selected: new Set(),
    })
    const element = assertElement(rendered)

    element.props.onItemPointerDown(createPointerEventSource(), 'rect-1')

    expect(onItemPointerDown).toHaveBeenCalledWith(
      expect.objectContaining({
        button: 0,
        clientX: 12,
        clientY: 34,
        pointerId: 7,
      }),
      'rect-1',
    )

    element.props.onArrowEndpointPointerDown(
      createPointerEventSource(),
      'arrow-1',
      'end',
    )

    expect(onArrowEndpointPointerDown).toHaveBeenCalledWith(
      expect.objectContaining({
        clientX: 12,
        clientY: 34,
      }),
      'arrow-1',
      'end',
    )
  })
})

function assertElement(rendered: ReactNode) {
  if (!isValidElement(rendered)) {
    throw new Error('Expected default canvas app item layer adapter to render')
  }

  return rendered as ReactElement<{
    onArrowEndpointPointerDown: (
      event: ReturnType<typeof createPointerEventSource>,
      itemId: string,
      endpoint: 'end',
    ) => void
    onItemPointerDown: (
      event: ReturnType<typeof createPointerEventSource>,
      itemId: string,
    ) => void
  }>
}

function createPointerEventSource() {
  return {
    altKey: false,
    button: 0,
    clientX: 12,
    clientY: 34,
    ctrlKey: false,
    metaKey: false,
    pointerId: 7,
    preventDefault: vi.fn(),
    shiftKey: false,
    stopPropagation: vi.fn(),
  }
}
