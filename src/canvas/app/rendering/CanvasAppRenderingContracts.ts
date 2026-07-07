import type {
  ReactNode,
  RefCallback,
} from 'react'
import type { CanvasOverlayState } from '../../engine'
import type {
  CanvasComponentItem,
  CanvasCustomItem,
  CanvasArrowEndpoint,
  CanvasInteractionKind,
  CanvasItem,
  ResizeHandle,
  Tool,
  Viewport,
} from '../../entities'
import type {
  CanvasAppEventInput,
  CanvasAppPointerInput,
} from '../affordances/interaction/pointer/CanvasAppPointerInput'

export type CanvasAppComponentRendererStrategy = (input: {
  item: CanvasComponentItem
}) => ReactNode

export type CanvasAppComponentPresentationRenderers = Readonly<
  Record<string, CanvasAppComponentRendererStrategy>
>

export type CanvasAppCustomItemRendererStrategy = (input: {
  item: CanvasCustomItem
}) => ReactNode

export type CanvasAppCustomItemRenderKey = boolean | number | string | null

export type CanvasAppCustomItemRenderKeyStrategy = (input: {
  item: CanvasCustomItem
}) => CanvasAppCustomItemRenderKey

export type CanvasAppCustomItemRendererDescriptor = {
  getRenderKey: CanvasAppCustomItemRenderKeyStrategy
  renderItem: CanvasAppCustomItemRendererStrategy
}

export type CanvasAppCustomItemRendererEntry =
  | CanvasAppCustomItemRendererDescriptor
  | CanvasAppCustomItemRendererStrategy

export type CanvasAppCustomItemRenderers = Readonly<
  Record<string, CanvasAppCustomItemRendererEntry>
>

export type CanvasAppStageMount = {
  ref: RefCallback<Element>
}

export type CanvasAppStageRenderInput = {
  activeMode: Tool
  children?: ReactNode
  gesture: CanvasInteractionKind
  overlays: CanvasOverlayState
  stageElement: CanvasAppStageMount
  viewport: Viewport
  onCanvasPointerDown: (event: CanvasAppPointerInput) => void
  onContextMenu: (event: CanvasAppEventInput) => void
  onPointerCancel: (event: CanvasAppPointerInput) => void
  onPointerMove: (event: CanvasAppPointerInput) => void
  onPointerUp: (event: CanvasAppPointerInput) => void
  onResizePointerDown: (
    event: CanvasAppPointerInput,
    handle: ResizeHandle,
  ) => void
}

export type CanvasAppStageAdapter = {
  renderStage: (input: CanvasAppStageRenderInput) => ReactNode
}

export type CanvasAppItemLayerRenderInput = {
  componentPresentationRenderers: CanvasAppComponentPresentationRenderers
  customItemRenderers: CanvasAppCustomItemRenderers
  getComponentPresentation: (component: string) => string
  items: CanvasItem[]
  outlineIds: Set<string>
  selected: Set<string>
  onItemPointerDown: (event: CanvasAppPointerInput, itemId: string) => void
  onArrowEndpointPointerDown: (
    event: CanvasAppPointerInput,
    itemId: string,
    endpoint: CanvasArrowEndpoint,
  ) => void
  canEditText: (item: CanvasItem) => boolean
  onTextDoubleClick: (item: CanvasItem) => void
}

export type CanvasAppItemLayerAdapter = {
  renderItems: (input: CanvasAppItemLayerRenderInput) => ReactNode
}
