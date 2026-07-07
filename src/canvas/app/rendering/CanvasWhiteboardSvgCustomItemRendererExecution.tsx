import {
  createElement,
  memo,
} from 'react'
import type { CanvasCustomItem } from '../../entities'
import type {
  CanvasAppCustomItemRendererDescriptor,
  CanvasAppCustomItemRendererEntry,
  CanvasAppCustomItemRendererStrategy,
} from './CanvasAppRenderingContracts'
import { renderCanvasWhiteboardSvgCustomItemFallback } from './CanvasWhiteboardSvgCustomItemRenderFallback'
import {
  getCanvasWhiteboardSvgCustomItemRenderer,
  type CanvasWhiteboardSvgCustomItemRenderers,
} from './CanvasWhiteboardSvgCustomItemRendererRegistry'

export function renderCanvasWhiteboardSvgCustomItem({
  item,
  renderers,
}: {
  item: CanvasCustomItem
  renderers: CanvasWhiteboardSvgCustomItemRenderers
}) {
  const renderer = getCanvasWhiteboardSvgCustomItemRenderer({
    item,
    renderers,
  })

  if (typeof renderer !== 'function') {
    return createElement(memoizedCanvasWhiteboardSvgCustomItemRenderer, {
      item,
      renderer,
    })
  }

  return renderCanvasWhiteboardSvgCustomItemSafely({
    item,
    renderer,
  })
}

export function shouldReuseCanvasWhiteboardSvgCustomItemRender({
  next,
  previous,
}: {
  next: CanvasWhiteboardSvgCustomItemRendererProps
  previous: CanvasWhiteboardSvgCustomItemRendererProps
}) {
  if (previous.renderer !== next.renderer) {
    return false
  }

  try {
    return previous.renderer.getRenderKey({ item: previous.item }) ===
      next.renderer.getRenderKey({ item: next.item })
  } catch {
    return false
  }
}

type CanvasWhiteboardSvgCustomItemRendererProps = {
  item: CanvasCustomItem
  renderer: CanvasAppCustomItemRendererDescriptor
}

const memoizedCanvasWhiteboardSvgCustomItemRenderer = memo(
  function renderCanvasWhiteboardSvgCustomItemMemo({
    item,
    renderer,
  }: CanvasWhiteboardSvgCustomItemRendererProps) {
    return renderCanvasWhiteboardSvgCustomItemSafely({
      item,
      renderer: renderer.renderItem,
    })
  },
  (previous, next) =>
    shouldReuseCanvasWhiteboardSvgCustomItemRender({ next, previous }),
)

function renderCanvasWhiteboardSvgCustomItemSafely({
  item,
  renderer,
}: {
  item: CanvasCustomItem
  renderer: CanvasAppCustomItemRendererStrategy
}) {
  try {
    return renderer({ item })
  } catch {
    return renderCanvasWhiteboardSvgCustomItemFallback({ item })
  }
}

export function isCanvasAppCustomItemRendererDescriptor(
  renderer: CanvasAppCustomItemRendererEntry,
): renderer is CanvasAppCustomItemRendererDescriptor {
  return typeof renderer !== 'function'
}
