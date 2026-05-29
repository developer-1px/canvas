import type { CanvasAffordanceConfig } from '../../engine'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import type { CanvasAppInspectorPanel } from '../affordances/editing/inspector/CanvasAppInspectorPanels'
import type { CanvasAppCustomFocus } from '../affordances/interaction/focus/CanvasAppCustomFocus'
import type { CommitCanvasItemsChange } from './CanvasWorkflowContract'

export type CanvasAppInspectorModelInput = {
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  customFocus: CanvasAppCustomFocus | null
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  itemReadModel: CanvasAppItemReadModel
  selected: Set<string>
  selection: string[]
}
