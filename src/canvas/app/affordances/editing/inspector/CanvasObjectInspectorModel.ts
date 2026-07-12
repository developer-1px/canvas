import type {
  Bounds,
  CanvasItem,
} from '../../../../entities'
import type { CanvasAffordanceConfig } from '../../../../engine'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import type { CanvasAppDocumentAuthority } from '../../../workspace/document/CanvasAppDocumentContracts'
import type { CanvasAppCustomFocus } from '../../../extensions/custom-focus'
import { getCanvasAppInspectorPanelViews } from '../../../extensions/inspector-panels'
import type { CanvasAppInspectorPanel } from '../../../extensions/inspector-panels'
import { getCanvasObjectInspectorCommentThread } from './CanvasObjectInspectorCommentThread'
import { getCanvasObjectInspectorLabel } from './CanvasObjectInspectorLabel'
import { getCanvasObjectStyleControls } from './CanvasObjectStyleInspector'

type GetCanvasObjectInspectorModelArgs = {
  bounds: Bounds | null
  config: CanvasAffordanceConfig
  customFocus: CanvasAppCustomFocus | null
  document: CanvasAppDocumentAuthority
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  items?: CanvasItem[]
  selectedItems: CanvasItem[]
  selection: string[]
}

export function getCanvasObjectInspectorModel({
  bounds,
  config,
  customFocus,
  document,
  inspectorPanels,
  items,
  selectedItems,
  selection,
}: GetCanvasObjectInspectorModelArgs) {
  const commitItemsChange: CommitCanvasItemsChange = (change, selection) =>
    document.commit({ change, selection }).ok
  const label = getCanvasObjectInspectorLabel({
    selectedItems,
    selectionLength: selection.length,
  })
  const selectionLocked = selectedItems.some((item) => item.locked === true)
  const disabled = selectionLocked || !document.can('editDocument')

  return {
    bounds,
    commentThread: getCanvasObjectInspectorCommentThread({
      commitItemsChange,
      disabled: selectionLocked || !document.can('comment'),
      items,
      selectedItems,
      selection,
    }),
    customPanels: getCanvasAppInspectorPanelViews({
      context: {
        bounds,
        customFocus,
        disabled,
        document,
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
      enabled:
        config.overlays.objectStyleControls && document.can('editDocument'),
      items,
      selectedItems,
      selection,
    }),
    onChangeBounds: (nextBounds: Bounds) => {
      if (
        selection.length === 0 ||
        !bounds ||
        !document.can('editDocument')
      ) {
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
