import type {
  CanvasAppViewportConsumerModel,
  CanvasAppViewportRuntime,
} from './CanvasAppViewportConsumerContracts'

export function getCanvasAppViewportConsumerModel(
  viewportControls: CanvasAppViewportRuntime,
): CanvasAppViewportConsumerModel {
  return {
    control: {
      onCenterViewportAtWorldPoint: viewportControls.centerAtWorldPoint,
      onFitItems: viewportControls.fitToItems,
      onViewportReset: viewportControls.resetViewport,
      onZoom: viewportControls.zoom,
      viewportRect: viewportControls.viewportRect,
    },
    keyboard: {
      fitToItems: viewportControls.fitToItems,
      resetViewport: viewportControls.resetViewport,
      zoom: viewportControls.zoom,
    },
  }
}
