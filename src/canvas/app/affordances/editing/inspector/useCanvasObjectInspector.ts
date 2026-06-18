import { useMemo } from 'react'
import type { CanvasAffordanceConfig } from '../../../../engine'
import type {
  CanvasComponentDefinitionRegistry,
} from '../../../../host'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import type { CanvasAppItemReadModel } from '../../../workflow/CanvasAppItemReadModelContracts'
import type { CanvasAppCustomFocus } from '../../../extensions/custom-focus'
import type { CanvasAppInspectorPanel } from '../../../extensions/inspector-panels'
import { getCanvasObjectInspectorModel } from './CanvasObjectInspectorModel'

type UseCanvasObjectInspectorArgs = {
  config: CanvasAffordanceConfig
  componentDefinitionRegistry: CanvasComponentDefinitionRegistry
  itemReadModel: CanvasAppItemReadModel
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  selected: Set<string>
  selection: string[]
  commitItemsChange: CommitCanvasItemsChange
  customFocus: CanvasAppCustomFocus | null
}

export function useCanvasObjectInspector({
  commitItemsChange,
  componentDefinitionRegistry,
  config,
  customFocus,
  itemReadModel,
  inspectorPanels,
  selected,
  selection,
}: UseCanvasObjectInspectorArgs) {
  const bounds = useMemo(
    () => itemReadModel.getSelectionBounds(selected),
    [itemReadModel, selected],
  )
  const selectedItems = useMemo(
    () => itemReadModel.getSelectedItems(selection),
    [itemReadModel, selection],
  )
  const items = useMemo(
    () => itemReadModel.getAllItems(),
    [itemReadModel],
  )
  const inspectorModel = useMemo(
    () =>
      getCanvasObjectInspectorModel({
        bounds,
        commitItemsChange,
        componentDefinitionRegistry,
        config,
        customFocus,
        inspectorPanels,
        items,
        selectedItems,
        selection,
      }),
    [
      bounds,
      commitItemsChange,
      componentDefinitionRegistry,
      config,
      customFocus,
      inspectorPanels,
      items,
      selectedItems,
      selection,
    ],
  )

  return inspectorModel
}
