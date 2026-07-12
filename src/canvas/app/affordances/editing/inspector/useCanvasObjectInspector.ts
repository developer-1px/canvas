import { useMemo } from 'react'
import type { CanvasItem } from '../../../../entities'
import type { CanvasAffordanceConfig } from '../../../../engine'
import type { CanvasAppDocumentAuthority } from '../../../workspace/document/CanvasAppDocumentContracts'
import type { CanvasAppItemReadModel } from '../../../workflow/CanvasAppItemReadModelContracts'
import type { CanvasAppCustomFocus } from '../../../extensions/custom-focus'
import type { CanvasAppInspectorPanel } from '../../../extensions/inspector-panels'
import { getCanvasObjectInspectorModel } from './CanvasObjectInspectorModel'

type UseCanvasObjectInspectorArgs = {
  config: CanvasAffordanceConfig
  itemReadModel: CanvasAppItemReadModel
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  selected: Set<string>
  selection: string[]
  customFocus: CanvasAppCustomFocus | null
  document: CanvasAppDocumentAuthority
  items: CanvasItem[]
}

export function useCanvasObjectInspector({
  config,
  customFocus,
  document,
  items,
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
  const inspectorModel = useMemo(
    () =>
      getCanvasObjectInspectorModel({
        bounds,
        config,
        customFocus,
        document,
        inspectorPanels,
        items,
        selectedItems,
        selection,
      }),
    [
      bounds,
      config,
      customFocus,
      document,
      inspectorPanels,
      items,
      selectedItems,
      selection,
    ],
  )

  return inspectorModel
}
