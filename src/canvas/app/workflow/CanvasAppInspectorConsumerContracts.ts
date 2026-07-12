import type { CanvasAffordanceConfig } from '../../engine'
import type { CanvasItem } from '../../entities'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import type { CanvasAppInspectorPanel } from '../extensions/inspector-panels'
import type { CanvasAppCustomFocus } from '../extensions/custom-focus'
import type { CanvasAppDocumentAuthority } from '../workspace/document/CanvasAppDocumentContracts'

export type CanvasAppInspectorModelInput = {
  config: CanvasAffordanceConfig
  customFocus: CanvasAppCustomFocus | null
  document: CanvasAppDocumentAuthority
  items: CanvasItem[]
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  itemReadModel: CanvasAppItemReadModel
  selected: Set<string>
  selection: string[]
}
