import type {
  CanvasAppInspectorPanel,
  CanvasAppInspectorPanelContext,
  CanvasAppInspectorPanelView,
} from './CanvasAppInspectorPanels'

export function getCanvasAppInspectorPanelViews({
  context,
  panels,
}: {
  context: CanvasAppInspectorPanelContext
  panels: readonly CanvasAppInspectorPanel[]
}): CanvasAppInspectorPanelView[] {
  return panels.flatMap((panel) =>
    getCanvasAppInspectorPanelViewSafely({ context, panel }),
  )
}

function getCanvasAppInspectorPanelViewSafely({
  context,
  panel,
}: {
  context: CanvasAppInspectorPanelContext
  panel: CanvasAppInspectorPanel
}): CanvasAppInspectorPanelView[] {
  try {
    if (!context.document.can(panel.requiredCapability)) {
      return []
    }

    if (panel.isVisible && !panel.isVisible(context)) {
      return []
    }

    return [{
      content: panel.render(context),
      id: panel.id,
    }]
  } catch {
    return []
  }
}
