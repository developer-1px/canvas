import type {
  CanvasAppViewportConsumerModel,
  CanvasAppViewportRuntime,
} from './CanvasAppConsumerContracts'

export function getCanvasAppViewportConsumerModel(
  viewportControls: CanvasAppViewportRuntime,
): CanvasAppViewportConsumerModel {
  return {
    control: {
      onFitItems: viewportControls.fitToItems,
      onViewportReset: viewportControls.resetViewport,
      onZoomBy: viewportControls.zoomBy,
    },
    keyboard: {
      fitToItems: viewportControls.fitToItems,
      resetViewport: viewportControls.resetViewport,
      zoomBy: viewportControls.zoomBy,
    },
  }
}
