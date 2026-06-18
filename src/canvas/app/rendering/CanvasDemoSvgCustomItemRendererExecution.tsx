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
import { renderCanvasDemoSvgCustomItemFallback } from './CanvasDemoSvgCustomItemRenderFallback'
import {
  getCanvasDemoSvgCustomItemRenderer,
  type CanvasDemoSvgCustomItemRenderers,
} from './CanvasDemoSvgCustomItemRendererRegistry'

export function renderCanvasDemoSvgCustomItem({
  item,
  renderers,
}: {
  item: CanvasCustomItem
  renderers: CanvasDemoSvgCustomItemRenderers
}) {
  const renderer = getCanvasDemoSvgCustomItemRenderer({
    item,
    renderers,
  })

  if (typeof renderer !== 'function') {
    return createElement(memoizedCanvasDemoSvgCustomItemRenderer, {
      item,
      renderer,
    })
  }

  return renderCanvasDemoSvgCustomItemSafely({
    item,
    renderer,
  })
}

export function shouldReuseCanvasDemoSvgCustomItemRender({
  next,
  previous,
}: {
  next: CanvasDemoSvgCustomItemRendererProps
  previous: CanvasDemoSvgCustomItemRendererProps
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

type CanvasDemoSvgCustomItemRendererProps = {
  item: CanvasCustomItem
  renderer: CanvasAppCustomItemRendererDescriptor
}

const memoizedCanvasDemoSvgCustomItemRenderer = memo(
  function renderCanvasDemoSvgCustomItemMemo({
    item,
    renderer,
  }: CanvasDemoSvgCustomItemRendererProps) {
    return renderCanvasDemoSvgCustomItemSafely({
      item,
      renderer: renderer.renderItem,
    })
  },
  (previous, next) =>
    shouldReuseCanvasDemoSvgCustomItemRender({ next, previous }),
)

function renderCanvasDemoSvgCustomItemSafely({
  item,
  renderer,
}: {
  item: CanvasCustomItem
  renderer: CanvasAppCustomItemRendererStrategy
}) {
  try {
    return renderer({ item })
  } catch {
    return renderCanvasDemoSvgCustomItemFallback({ item })
  }
}

export function isCanvasAppCustomItemRendererDescriptor(
  renderer: CanvasAppCustomItemRendererEntry,
): renderer is CanvasAppCustomItemRendererDescriptor {
  return typeof renderer !== 'function'
}
