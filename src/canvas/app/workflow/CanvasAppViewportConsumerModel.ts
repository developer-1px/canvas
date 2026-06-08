import type {
  CanvasAppViewportConsumerModel,
  CanvasAppViewportRuntime,
} from './CanvasAppViewportConsumerContracts'

export function getCanvasAppViewportConsumerModel(
  viewportControls: CanvasAppViewportRuntime,
): CanvasAppViewportConsumerModel {
  return {
    control: {
      onFitItems: viewportControls.fitToItems,
      onViewportReset: viewportControls.resetViewport,
      onZoom: viewportControls.zoom,
    },
    keyboard: {
      fitToItems: viewportControls.fitToItems,
      resetViewport: viewportControls.resetViewport,
      zoom: viewportControls.zoom,
    },
  }
}
