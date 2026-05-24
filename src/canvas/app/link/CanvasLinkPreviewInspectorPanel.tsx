import {
  isCanvasLinkPreviewComponentItem,
  replaceCanvasLinkPreviewComponentsWithSourceText,
} from '../../host'
import type {
  CanvasAppInspectorPanel,
  CanvasAppInspectorPanelContext,
} from '../inspector/CanvasAppInspectorPanels'

export const CANVAS_LINK_PREVIEW_INSPECTOR_PANEL: CanvasAppInspectorPanel = {
  id: 'link-preview-actions',
  isVisible: (context) => getSelectedCanvasLinkPreviewUrl(context) !== null,
  render: (context) =>
    renderCanvasLinkPreviewInspectorPanelContent({
      disabled: context.disabled,
      onChangeBackToText: () => changeCanvasLinkPreviewBackToText(context),
      url: getSelectedCanvasLinkPreviewUrl(context) ?? '',
    }),
}

export function changeCanvasLinkPreviewBackToText(
  context: CanvasAppInspectorPanelContext,
) {
  if (context.disabled || getSelectedCanvasLinkPreviewUrl(context) === null) {
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

function renderCanvasLinkPreviewInspectorPanelContent({
  disabled,
  url,
  onChangeBackToText,
}: {
  disabled: boolean
  url: string
  onChangeBackToText: () => void
}) {
  return (
    <div className="link-preview-inspector-actions">
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

function getSelectedCanvasLinkPreviewUrl(
  context: CanvasAppInspectorPanelContext,
) {
  if (context.selection.length !== 1 || context.selectedItems.length !== 1) {
    return null
  }

  const [item] = context.selectedItems

  return item && isCanvasLinkPreviewComponentItem(item) ? item.url : null
}
