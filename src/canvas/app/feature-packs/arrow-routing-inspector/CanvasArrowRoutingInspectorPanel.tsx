import {
  isCanvasArrowDrawingItem,
  normalizeCanvasArrowRouting,
  replaceCanvasArrowRoutings,
  type CanvasArrowRouting,
} from '../../../host'
import type {
  CanvasAppInspectorPanel,
  CanvasAppInspectorPanelContext,
} from '../../extensions/inspector-panels'
import {
  createCanvasRadioGroupDescriptor,
  handleCanvasRadioGroupKeyDown,
} from '../../affordances/controls/radio/CanvasRadioGroup'

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
  const routingDescriptor = createCanvasRadioGroupDescriptor({
    ariaLabel: 'Connector routing',
    checkedId: currentRouting,
    groupId: 'canvas-arrow-routing',
    items: [
      {
        ariaLabel: 'Elbow connector',
        disabled,
        id: 'elbow',
        label: 'Elbow',
      },
      {
        ariaLabel: 'Straight connector',
        disabled,
        id: 'straight',
        label: 'Straight',
      },
    ] as const,
  })

  return (
    <div
      className="inspector-action-grid"
      {...routingDescriptor.rootAttributes}
      onKeyDown={handleCanvasRadioGroupKeyDown}
    >
      {routingDescriptor.items.map((option) => (
        <button
          {...option.attributes}
          type="button"
          className="inspector-action-button"
          aria-label={option.ariaLabel}
          title={option.ariaLabel}
          disabled={option.isDisabled}
          key={option.id}
          onClick={() => onChangeRouting(option.id)}
        >
          {option.label}
        </button>
      ))}
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
