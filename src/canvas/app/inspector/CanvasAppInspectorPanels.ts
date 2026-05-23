import type { ReactNode } from 'react'
import type {
  Bounds,
  CanvasItem,
} from '../../entities'
import {
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppOptionalDescriptorFunctionField,
} from '../extensions/CanvasAppDescriptorContracts'
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
    const owner = `inspector panel ${panel.id}`

    assertCanvasAppDescriptorFunctionField({
      field: 'render',
      owner,
      value: panel.render,
    })
    assertCanvasAppOptionalDescriptorFunctionField({
      field: 'isVisible',
      owner,
      value: panel.isVisible,
    })
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
