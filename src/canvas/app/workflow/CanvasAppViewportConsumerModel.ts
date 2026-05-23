type CanvasAppViewportRuntime = {
  fitToItems: (ids?: string[]) => void
  resetViewport: () => void
  zoomBy: (multiplier: number) => void
}

export function getCanvasAppViewportConsumerModel(
  viewportControls: CanvasAppViewportRuntime,
) {
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
