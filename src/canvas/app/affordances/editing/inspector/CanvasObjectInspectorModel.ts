import type {
  Bounds,
  CanvasItem,
} from '../../../../entities'
import type { CanvasAffordanceConfig } from '../../../../engine'
import type {
  CanvasComponentDefinitionRegistry,
} from '../../../../host'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import type { CanvasAppCustomFocus } from '../../../extensions/custom-focus'
import { getCanvasAppInspectorPanelViews } from '../../../extensions/inspector-panels'
import type { CanvasAppInspectorPanel } from '../../../extensions/inspector-panels'
import { getCanvasObjectInspectorCommentThread } from './CanvasObjectInspectorCommentThread'
import { getCanvasObjectInspectorLabel } from './CanvasObjectInspectorLabel'
import { getCanvasObjectStyleControls } from './CanvasObjectStyleInspector'

type GetCanvasObjectInspectorModelArgs = {
  bounds: Bounds | null
  commitItemsChange: CommitCanvasItemsChange
  componentDefinitionRegistry: CanvasComponentDefinitionRegistry
  config: CanvasAffordanceConfig
  customFocus: CanvasAppCustomFocus | null
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  items?: CanvasItem[]
  selectedItems: CanvasItem[]
  selection: string[]
}

export function getCanvasObjectInspectorModel({
  bounds,
  commitItemsChange,
  componentDefinitionRegistry,
  config,
  customFocus,
  inspectorPanels,
  items,
  selectedItems,
  selection,
}: GetCanvasObjectInspectorModelArgs) {
  const label = getCanvasObjectInspectorLabel({
    selectedItems,
    selectionLength: selection.length,
  })
  const disabled = selectedItems.some((item) => item.locked === true)

  return {
    bounds,
    commentThread: getCanvasObjectInspectorCommentThread({
      commitItemsChange,
      disabled,
      items,
      selectedItems,
      selection,
    }),
    customPanels: getCanvasAppInspectorPanelViews({
      context: {
        bounds,
        commitItemsChange,
        componentDefinitionRegistry,
        customFocus,
        disabled,
        items: items ?? selectedItems,
        label,
        selectedItems,
        selection,
      },
      panels: inspectorPanels,
    }),
    disabled,
    label,
    styleControls: getCanvasObjectStyleControls({
      commitItemsChange,
      disabled,
      enabled: config.overlays.objectStyleControls,
      items,
      selectedItems,
      selection,
    }),
    onChangeBounds: (nextBounds: Bounds) => {
      if (selection.length === 0 || !bounds) {
        return
      }

      commitItemsChange(
        {
          type: 'resize-selection',
          from: bounds,
          selection,
          to: nextBounds,
        },
        {
          before: selection,
          after: selection,
        },
      )
    },
  }
}
