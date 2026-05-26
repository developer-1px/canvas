import type { CanvasAffordanceConfig } from '../../engine'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import type { CanvasAppInspectorPanel } from '../editing/inspector/CanvasAppInspectorPanels'
import type { CommitCanvasItemsChange } from './CanvasWorkflowContract'

export type CanvasAppInspectorModelInput = {
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  itemReadModel: CanvasAppItemReadModel
  selected: Set<string>
  selection: string[]
}
