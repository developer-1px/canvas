import type {
  CanvasAppInspectorPanelContext,
  CanvasCustomItem,
} from '../../../canvas'
import {
  type HtmlSpecimenData,
  type HtmlSpecimenTextChange,
} from './HtmlSpecimenCustomItemModel'
import {
  serializeHtmlSpecimenOutline,
  type HtmlSpecimenOutline,
} from './HtmlSpecimenOutline'
import {
  dispatchHtmlSpecimenPreviewFocusRequest,
} from './HtmlSpecimenPreviewFocusRequest'

export function commitHtmlSpecimenOutline({
  change,
  context,
  nextFocusId,
  outline,
  specimen,
  targetItem,
}: {
  change?: HtmlSpecimenTextChange
  context: CanvasAppInspectorPanelContext
  nextFocusId: string | null
  outline: HtmlSpecimenOutline
  specimen: HtmlSpecimenData
  targetItem: CanvasCustomItem
}) {
  const nextSpecimen = {
    ...specimen,
    html: serializeHtmlSpecimenOutline(outline),
    ...(change
      ? {
          textChanges: [
            ...(specimen.textChanges ?? []),
            change,
          ].slice(-8),
        }
      : {}),
  }
  const nextItems = (context.items ?? context.selectedItems).map((item) =>
    item.id === targetItem.id
      ? {
          ...targetItem,
          data: nextSpecimen,
        }
      : item)
  const committed = context.commitItemsChange({
    items: nextItems,
    type: 'replace-changed',
  }, {
    after: context.selection,
    before: context.selection,
  })

  if (committed && nextFocusId) {
    requestHtmlSpecimenPreviewFocus(targetItem.id, nextFocusId)
  }

  return committed
}

function requestHtmlSpecimenPreviewFocus(itemId: string, nodeId: string) {
  window.setTimeout(() => {
    dispatchHtmlSpecimenPreviewFocusRequest(window, {
      itemId,
      nodeId,
    })
  }, 0)
}
