import type { CanvasAffordanceConfig } from '../../engine'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import type { CanvasAppInspectorPanel } from '../extensions/inspector-panels'
import type { CanvasAppCustomFocus } from '../extensions/custom-focus'
import type { CommitCanvasItemsChange } from './CanvasWorkflowContract'
import type {
  CanvasAppComponentDefinitionRegistry,
} from './CanvasAppComponentAssemblyContracts'

export type CanvasAppInspectorModelInput = {
  commitItemsChange: CommitCanvasItemsChange
  componentDefinitionRegistry: CanvasAppComponentDefinitionRegistry
  config: CanvasAffordanceConfig
  customFocus: CanvasAppCustomFocus | null
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  itemReadModel: CanvasAppItemReadModel
  selected: Set<string>
  selection: string[]
}
