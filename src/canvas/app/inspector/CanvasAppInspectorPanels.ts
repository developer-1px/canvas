import type { ReactNode } from 'react'
import type {
  Bounds,
  CanvasItem,
} from '../../entities'
import { assertCanvasAppExtensionEntries } from '../extensions/CanvasAppExtensionIds'
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

export function assertCanvasAppInspectorPanels(
  panels: readonly CanvasAppInspectorPanel[],
) {
  assertCanvasAppExtensionEntries({
    entries: panels,
    label: 'inspector panel',
  })

  for (const panel of panels) {
    assertCanvasAppInspectorPanelFunction({
      fn: panel.render,
      label: 'render',
      panelId: panel.id,
    })

    if (panel.isVisible !== undefined) {
      assertCanvasAppInspectorPanelFunction({
        fn: panel.isVisible,
        label: 'isVisible',
        panelId: panel.id,
      })
    }
  }
}

export function getCanvasAppInspectorPanelViews({
  context,
  panels,
}: {
  context: CanvasAppInspectorPanelContext
  panels: readonly CanvasAppInspectorPanel[]
}): CanvasAppInspectorPanelView[] {
  return panels.flatMap((panel) => {
    try {
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
  })
}

function assertCanvasAppInspectorPanelFunction({
  fn,
  label,
  panelId,
}: {
  fn: unknown
  label: string
  panelId: string
}) {
  if (typeof fn !== 'function') {
    throw new Error(`Canvas app inspector panel ${panelId} requires ${label}`)
  }
}
