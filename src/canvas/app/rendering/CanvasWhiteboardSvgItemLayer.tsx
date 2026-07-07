import type { PointerEvent } from 'react'
import type {
  CanvasArrowEndpoint,
  CanvasItem,
} from '../../entities'
import {
  DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS,
  type CanvasWhiteboardSvgComponentPresentationRenderers,
} from './CanvasWhiteboardSvgComponentPresentationRegistry'
import {
  DEFAULT_CANVAS_WHITEBOARD_SVG_CUSTOM_ITEM_RENDERERS,
  type CanvasWhiteboardSvgCustomItemRenderers,
} from './CanvasWhiteboardSvgCustomItemRendererRegistry'
import { renderCanvasWhiteboardSvgItem } from './CanvasWhiteboardSvgItemRenderer'

type CanvasWhiteboardSvgItemLayerProps = {
  getComponentPresentation: (component: string) => string
  items: CanvasItem[]
  outlineIds: Set<string>
  componentPresentationRenderers?: CanvasWhiteboardSvgComponentPresentationRenderers
  customItemRenderers?: CanvasWhiteboardSvgCustomItemRenderers
  selected: Set<string>
  onItemPointerDown: (
    event: PointerEvent<SVGGElement>,
    itemId: string,
  ) => void
  onArrowEndpointPointerDown: (
    event: PointerEvent<SVGCircleElement>,
    itemId: string,
    endpoint: CanvasArrowEndpoint,
  ) => void
  canEditText: (item: CanvasItem) => boolean
  onTextDoubleClick: (item: CanvasItem) => void
}

export function CanvasWhiteboardSvgItemLayer({
  componentPresentationRenderers =
    DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS,
  customItemRenderers = DEFAULT_CANVAS_WHITEBOARD_SVG_CUSTOM_ITEM_RENDERERS,
  getComponentPresentation,
  items,
  onArrowEndpointPointerDown,
  onItemPointerDown,
  canEditText,
  onTextDoubleClick,
  outlineIds,
  selected,
}: CanvasWhiteboardSvgItemLayerProps) {
  return (
    <>
      {items.map((item) =>
        renderCanvasWhiteboardSvgItem({
          componentPresentationRenderers,
          customItemRenderers,
          getComponentPresentation,
          item,
          locked: false,
          onArrowEndpointPointerDown,
          onItemPointerDown,
          canEditText,
          onTextDoubleClick,
          outlineIds,
          selected,
        }),
      )}
    </>
  )
}
