import type { CanvasAffordanceConfig } from '../../engine'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import type { CanvasAppInspectorPanel } from '../extensions/inspector-panels'
import type { CanvasAppCustomFocus } from '../extensions/custom-focus'
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
