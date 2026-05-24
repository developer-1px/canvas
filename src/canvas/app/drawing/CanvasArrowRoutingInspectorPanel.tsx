import {
  isCanvasArrowDrawingItem,
  normalizeCanvasArrowRouting,
  replaceCanvasArrowRoutings,
  type CanvasArrowRouting,
} from '../../host'
import type {
  CanvasAppInspectorPanel,
  CanvasAppInspectorPanelContext,
} from '../inspector/CanvasAppInspectorPanels'

export const CANVAS_ARROW_ROUTING_INSPECTOR_PANEL: CanvasAppInspectorPanel = {
  id: 'arrow-routing-actions',
  isVisible: (context) => getSelectedCanvasArrowItem(context) !== null,
  render: (context) => {
    const item = getSelectedCanvasArrowItem(context)

    return renderCanvasArrowRoutingInspectorPanelContent({
      currentRouting: normalizeCanvasArrowRouting(item?.routing),
      disabled: context.disabled,
      onChangeRouting: (routing) => changeCanvasArrowRouting(context, routing),
    })
  },
}

export function changeCanvasArrowRouting(
  context: CanvasAppInspectorPanelContext,
  routing: CanvasArrowRouting,
) {
  if (context.disabled || getSelectedCanvasArrowItem(context) === null) {
    return false
  }

  const items = context.items ?? context.selectedItems
  const nextItems = replaceCanvasArrowRoutings(
    items,
    context.selection,
    routing,
  )

  return context.commitItemsChange({
    type: 'replace-changed',
    items: nextItems,
  }, {
    before: context.selection,
    after: context.selection,
  })
}

function renderCanvasArrowRoutingInspectorPanelContent({
  currentRouting,
  disabled,
  onChangeRouting,
}: {
  currentRouting: CanvasArrowRouting
  disabled: boolean
  onChangeRouting: (routing: CanvasArrowRouting) => void
}) {
  return (
    <div className="inspector-action-grid">
      <button
        type="button"
        className="inspector-action-button"
        aria-label="Elbow connector"
        title="Elbow connector"
        disabled={disabled || currentRouting === 'elbow'}
        onClick={() => onChangeRouting('elbow')}
      >
        Elbow
      </button>
      <button
        type="button"
        className="inspector-action-button"
        aria-label="Straight connector"
        title="Straight connector"
        disabled={disabled || currentRouting === 'straight'}
        onClick={() => onChangeRouting('straight')}
      >
        Straight
      </button>
    </div>
  )
}

function getSelectedCanvasArrowItem(
  context: CanvasAppInspectorPanelContext,
) {
  if (context.selection.length !== 1 || context.selectedItems.length !== 1) {
    return null
  }

  const [item] = context.selectedItems

  return item && isCanvasArrowDrawingItem(item) ? item : null
}
