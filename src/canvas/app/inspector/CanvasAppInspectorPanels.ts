import type { ReactNode } from 'react'
import type {
  Bounds,
  CanvasItem,
} from '../../entities'
import type {
  CanvasDocumentSelectionHistory,
  CanvasItemsChange,
} from '../../host'

export type CanvasAppInspectorPanelCommitItemsChange = (
  change: CanvasItemsChange,
  selection?: CanvasDocumentSelectionHistory,
) => boolean

export type CanvasAppInspectorPanelContext = {
  bounds: Bounds | null
  commitItemsChange: CanvasAppInspectorPanelCommitItemsChange
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
