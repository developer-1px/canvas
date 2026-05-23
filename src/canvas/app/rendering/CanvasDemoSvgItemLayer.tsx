import type { PointerEvent } from 'react'
import type {
  CanvasItem,
  RectItem,
  TextItem,
} from '../../entities'
import {
  DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
  type CanvasDemoSvgComponentPresentationRenderers,
} from './CanvasDemoSvgComponentPresentationRegistry'
import {
  DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS,
  type CanvasDemoSvgCustomItemRenderers,
} from './CanvasDemoSvgCustomItemRendererRegistry'
import { renderCanvasDemoSvgItem } from './CanvasDemoSvgItemRenderer'

type CanvasDemoSvgItemLayerProps = {
  getComponentPresentation: (component: string) => string
  items: CanvasItem[]
  outlineIds: Set<string>
  componentPresentationRenderers?: CanvasDemoSvgComponentPresentationRenderers
  customItemRenderers?: CanvasDemoSvgCustomItemRenderers
  selected: Set<string>
  onItemPointerDown: (
    event: PointerEvent<SVGGElement>,
    itemId: string,
  ) => void
  onTextDoubleClick: (item: RectItem | TextItem) => void
}

export function CanvasDemoSvgItemLayer({
  componentPresentationRenderers =
    DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
  customItemRenderers = DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS,
  getComponentPresentation,
  items,
  onItemPointerDown,
  onTextDoubleClick,
  outlineIds,
  selected,
}: CanvasDemoSvgItemLayerProps) {
  return (
    <>
      {items.map((item) =>
        renderCanvasDemoSvgItem({
          componentPresentationRenderers,
          customItemRenderers,
          getComponentPresentation,
          item,
          locked: false,
          onItemPointerDown,
          onTextDoubleClick,
          outlineIds,
          selected,
        }),
      )}
    </>
  )
}
