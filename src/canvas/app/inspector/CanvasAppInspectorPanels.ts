import type { ReactNode } from 'react'
import type {
  Bounds,
  CanvasItem,
} from '../../entities'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'

export type CanvasAppInspectorPanelContext = {
  bounds: Bounds | null
  commitItemsChange: CommitCanvasItemsChange
  disabled: boolean
  label: string | null
  selectedItems: CanvasItem[]
  selection: string[]
}

export type CanvasAppInspectorPanel = {
  id: string
  isVisible?: (context: CanvasAppInspectorPanelContext) => boolean
  render: (context: CanvasAppInspectorPanelContext) => ReactNode
}

export type CanvasAppInspectorPanelView = {
  content: ReactNode
  id: string
}

export function getCanvasAppInspectorPanelViews({
  context,
  panels,
}: {
  context: CanvasAppInspectorPanelContext
  panels: readonly CanvasAppInspectorPanel[]
}): CanvasAppInspectorPanelView[] {
  return panels
    .filter((panel) => panel.isVisible ? panel.isVisible(context) : true)
    .map((panel) => ({
      content: panel.render(context),
      id: panel.id,
    }))
}
