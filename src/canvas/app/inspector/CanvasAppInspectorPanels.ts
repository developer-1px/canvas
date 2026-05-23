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

export { assertCanvasAppInspectorPanels } from './CanvasAppInspectorPanelContracts'

export { getCanvasAppInspectorPanelViews } from './CanvasAppInspectorPanelExecution'
