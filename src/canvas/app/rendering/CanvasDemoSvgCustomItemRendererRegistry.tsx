import type { ReactNode } from 'react'
import type { CanvasCustomItem } from '../../entities'
import { CanvasDemoSvgUnknownCustomItem } from './CanvasDemoSvgUnknownCustomItem'

export type CanvasDemoSvgCustomItemRendererStrategy = (input: {
  item: CanvasCustomItem
}) => ReactNode

export type CanvasDemoSvgCustomItemRenderers = Readonly<
  Record<string, CanvasDemoSvgCustomItemRendererStrategy>
>

export const DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS: CanvasDemoSvgCustomItemRenderers = {}

export function createCanvasDemoSvgCustomItemRenderers(
  extensions: CanvasDemoSvgCustomItemRenderers = {},
): CanvasDemoSvgCustomItemRenderers {
  return { ...extensions }
}

export function getCanvasDemoSvgCustomItemRenderer({
  item,
  renderers,
}: {
  item: CanvasCustomItem
  renderers: CanvasDemoSvgCustomItemRenderers
}) {
  return renderers[item.presentation] ?? CanvasDemoSvgUnknownCustomItem
}
