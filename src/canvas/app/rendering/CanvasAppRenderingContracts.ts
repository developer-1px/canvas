import type { ReactNode } from 'react'
import type {
  CanvasComponentItem,
  CanvasCustomItem,
} from '../../entities'

export type CanvasAppComponentRendererStrategy = (input: {
  item: CanvasComponentItem
}) => ReactNode

export type CanvasAppComponentPresentationRenderers = Readonly<
  Record<string, CanvasAppComponentRendererStrategy>
>

export type CanvasAppCustomItemRendererStrategy = (input: {
  item: CanvasCustomItem
}) => ReactNode

export type CanvasAppCustomItemRenderers = Readonly<
  Record<string, CanvasAppCustomItemRendererStrategy>
>
