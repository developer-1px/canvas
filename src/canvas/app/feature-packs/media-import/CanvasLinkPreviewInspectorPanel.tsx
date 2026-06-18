import {
  isCanvasLinkPreviewComponentItem,
  normalizeCanvasLinkPreviewOrientation,
  replaceCanvasLinkPreviewComponentsOrientation,
  replaceCanvasLinkPreviewComponentsWithSourceText,
  type CanvasLinkPreviewOrientation,
} from '../../../host'
import type {
  CanvasAppInspectorPanel,
  CanvasAppInspectorPanelContext,
} from '../../extensions/inspector-panels'
import {
  getCanvasRadioTabIndex,
  handleCanvasRadioGroupKeyDown,
} from '../../affordances/controls/radio/CanvasRadioGroup'

export const CANVAS_LINK_PREVIEW_INSPECTOR_PANEL: CanvasAppInspectorPanel = {
  id: 'link-preview-actions',
  isVisible: (context) => getSelectedCanvasLinkPreviewItem(context) !== null,
  render: (context) => {
    const item = getSelectedCanvasLinkPreviewItem(context)

    return renderCanvasLinkPreviewInspectorPanelContent({
      currentOrientation: normalizeCanvasLinkPreviewOrientation(
        item?.orientation,
      ),
      disabled: context.disabled,
      onChangeOrientation: (orientation) =>
        changeCanvasLinkPreviewOrientation(context, orientation),
      onChangeBackToText: () => changeCanvasLinkPreviewBackToText(context),
      url: item?.url ?? '',
    })
  },
}

export function changeCanvasLinkPreviewBackToText(
  context: CanvasAppInspectorPanelContext,
) {
  if (context.disabled || getSelectedCanvasLinkPreviewItem(context) === null) {
    return false
  }

  const items = context.items ?? context.selectedItems
  const nextItems = replaceCanvasLinkPreviewComponentsWithSourceText(
    items,
    context.selection,
  )

  return context.commitItemsChange({
    type: 'replace-changed',
    items: nextItems,
  }, {
    before: context.selection,
    after: context.selection,
  })
}

export function changeCanvasLinkPreviewOrientation(
  context: CanvasAppInspectorPanelContext,
  orientation: CanvasLinkPreviewOrientation,
) {
  if (context.disabled || getSelectedCanvasLinkPreviewItem(context) === null) {
    return false
  }

  const items = context.items ?? context.selectedItems
  const nextItems = replaceCanvasLinkPreviewComponentsOrientation(
    items,
    context.selection,
    orientation,
  )

  return context.commitItemsChange({
    type: 'replace-changed',
    items: nextItems,
  }, {
    before: context.selection,
    after: context.selection,
  })
}

function renderCanvasLinkPreviewInspectorPanelContent({
  currentOrientation,
  disabled,
  url,
  onChangeOrientation,
  onChangeBackToText,
}: {
  currentOrientation: CanvasLinkPreviewOrientation
  disabled: boolean
  url: string
  onChangeOrientation: (orientation: CanvasLinkPreviewOrientation) => void
  onChangeBackToText: () => void
}) {
  return (
    <div className="link-preview-inspector-actions">
      <div
        className="inspector-action-grid"
        role="radiogroup"
        aria-label="Link preview orientation"
        onKeyDown={handleCanvasRadioGroupKeyDown}
      >
        <button
          type="button"
          className="inspector-action-button"
          aria-label="Display horizontal"
          aria-checked={currentOrientation === 'horizontal'}
          role="radio"
          tabIndex={getCanvasRadioTabIndex({
            checked: currentOrientation === 'horizontal',
            disabled,
          })}
          title="Display horizontal"
          disabled={disabled}
          onClick={() => onChangeOrientation('horizontal')}
        >
          H
        </button>
        <button
          type="button"
          className="inspector-action-button"
          aria-label="Display vertical"
          aria-checked={currentOrientation === 'vertical'}
          role="radio"
          tabIndex={getCanvasRadioTabIndex({
            checked: currentOrientation === 'vertical',
            disabled,
          })}
          title="Display vertical"
          disabled={disabled}
          onClick={() => onChangeOrientation('vertical')}
        >
          V
        </button>
      </div>
      <a
        className="inspector-action-button"
        href={url}
        target="_blank"
        rel="noreferrer"
      >
        Open
      </a>
      <button
        type="button"
        className="inspector-action-button"
        disabled={disabled}
        onClick={onChangeBackToText}
      >
        Text
      </button>
    </div>
  )
}

function getSelectedCanvasLinkPreviewItem(
  context: CanvasAppInspectorPanelContext,
) {
  if (context.selection.length !== 1 || context.selectedItems.length !== 1) {
    return null
  }

  const [item] = context.selectedItems

  return item && isCanvasLinkPreviewComponentItem(item) ? item : null
}
