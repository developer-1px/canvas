import type { ReactNode } from 'react'
import type {
  Bounds,
  CanvasItem,
} from '../../entities'
import type {
  CanvasAppCommitItemsChange,
} from '../document/CanvasAppDocumentContracts'

export type CanvasAppInspectorPanelCommitItemsChange =
  CanvasAppCommitItemsChange

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
