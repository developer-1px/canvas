import type {
  KeyboardEvent,
} from 'react'
import type {
  CanvasCustomItem,
  CanvasItem,
} from '../../../entities'
import type {
  CanvasAppInspectorPanel,
  CanvasAppInspectorPanelContext,
} from '../../extensions/inspector-panels'
import {
  runCanvasEditableFieldKeyboardIntent,
} from '../../affordances/controls/editable-field/CanvasEditableFieldKeyboard'
import {
  CANVAS_DOM_EDIT_STYLE_CHANNELS,
  type CanvasDomEditStyleChannel,
  type CanvasDomEditStyleOptions,
} from './CanvasDomEditStyleContracts'
import {
  clampCanvasDomEditStyleValue,
  getCanvasDomEditStyle,
  getCanvasDomEditStyleLimit,
  setCanvasDomEditStyleValue,
} from './CanvasDomEditStyleModel'

const CANVAS_DOM_EDIT_STYLE_LABELS: Record<
  CanvasDomEditStyleChannel,
  string
> = {
  gap: 'Gap',
  margin: 'Mar',
  padding: 'Pad',
  radius: 'Rad',
}

const CANVAS_DOM_EDIT_STYLE_ARIA_LABELS: Record<
  CanvasDomEditStyleChannel,
  string
> = {
  gap: 'Gap',
  margin: 'Margin',
  padding: 'Padding',
  radius: 'Radius',
}

export function createCanvasDomEditStyleInspectorPanel({
  itemKind,
  options = {},
  targetId,
  targetLabel = targetId,
}: {
  itemKind: string
  options?: CanvasDomEditStyleOptions
  targetId: string
  targetLabel?: string
}): CanvasAppInspectorPanel {
  return {
    id: `${itemKind}-dom-${targetId}-style`,
    isVisible: (context) =>
      context.selectedItems.some((item) =>
        item.type === 'custom' && item.kind === itemKind,
      ),
    render: (context) =>
      renderCanvasDomEditStyleInspectorPanel({
        context,
        itemKind,
        options,
        targetId,
        targetLabel,
      }),
  }
}

function renderCanvasDomEditStyleInspectorPanel({
  context,
  itemKind,
  options,
  targetId,
  targetLabel,
}: {
  context: CanvasAppInspectorPanelContext
  itemKind: string
  options: CanvasDomEditStyleOptions
  targetId: string
  targetLabel: string
}) {
  const item = context.selectedItems.find(
    (selected): selected is CanvasCustomItem =>
      selected.type === 'custom' && selected.kind === itemKind,
  )

  if (!item) {
    return null
  }

  const style = getCanvasDomEditStyle(item.data, targetId, options)
  const channels = options.channels ?? CANVAS_DOM_EDIT_STYLE_CHANNELS

  return (
    <section className="inspector-dom-style" aria-label={`${targetLabel} DOM layout`}>
      <div className="inspector-style-label">{targetLabel}</div>
      <div className="inspector-grid">
        {channels.map((channel) =>
          renderCanvasDomEditStyleField({
            channel,
            context,
            item,
            itemKind,
            options,
            targetId,
            value: style[channel],
          })
        )}
      </div>
    </section>
  )
}

function renderCanvasDomEditStyleField({
  channel,
  context,
  item,
  itemKind,
  options,
  targetId,
  value,
}: {
  channel: CanvasDomEditStyleChannel
  context: CanvasAppInspectorPanelContext
  item: CanvasCustomItem
  itemKind: string
  options: CanvasDomEditStyleOptions
  targetId: string
  value: number
}) {
  const limit = getCanvasDomEditStyleLimit(channel, options)
  const commitInputValue = (inputValue: string) => {
    const nextValue = Number(inputValue)

    if (!Number.isFinite(nextValue)) {
      return
    }

    commitCanvasDomEditStyleValue({
      channel,
      context,
      item,
      itemKind,
      options,
      targetId,
      value: nextValue,
    })
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    runCanvasEditableFieldKeyboardIntent({
      event,
      onCancel: () => {
        event.currentTarget.value = String(value)
        event.currentTarget.blur()
      },
      onCommit: () => {
        event.currentTarget.blur()
      },
    })
  }

  return (
    <label className="inspector-field" key={channel}>
      <span>{CANVAS_DOM_EDIT_STYLE_LABELS[channel]}</span>
      <input
        aria-label={`DOM ${CANVAS_DOM_EDIT_STYLE_ARIA_LABELS[channel]}`}
        defaultValue={value}
        disabled={context.disabled}
        inputMode="numeric"
        key={`${targetId}:${channel}:${value}`}
        max={limit.max}
        min={limit.min}
        step={limit.step}
        type="number"
        onBlur={(event) => commitInputValue(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
      />
    </label>
  )
}

function commitCanvasDomEditStyleValue({
  channel,
  context,
  item,
  itemKind,
  options,
  targetId,
  value,
}: {
  channel: CanvasDomEditStyleChannel
  context: CanvasAppInspectorPanelContext
  item: CanvasCustomItem
  itemKind: string
  options: CanvasDomEditStyleOptions
  targetId: string
  value: number
}) {
  if (context.disabled) {
    return
  }

  const nextValue = clampCanvasDomEditStyleValue(
    value,
    getCanvasDomEditStyleLimit(channel, options),
  )

  if (
    getCanvasDomEditStyle(item.data, targetId, options)[channel] === nextValue
  ) {
    return
  }

  const sourceItems = context.items ?? context.selectedItems
  const selectedIds = new Set(context.selection)
  const items = replaceCanvasDomEditStyleItems({
    channel,
    itemId: item.id,
    itemKind,
    items: sourceItems,
    options,
    selectedIds,
    targetId,
    value: nextValue,
  })

  context.commitItemsChange({
    items,
    type: 'replace-changed',
  }, {
    after: context.selection,
    before: context.selection,
  })
}

function replaceCanvasDomEditStyleItems({
  channel,
  itemId,
  itemKind,
  items,
  options,
  selectedIds,
  targetId,
  value,
}: {
  channel: CanvasDomEditStyleChannel
  itemId: string
  itemKind: string
  items: readonly CanvasItem[]
  options: CanvasDomEditStyleOptions
  selectedIds: Set<string>
  targetId: string
  value: number
}): CanvasItem[] {
  return items.map((candidate) => {
    if (
      candidate.type === 'custom' &&
      candidate.kind === itemKind &&
      candidate.id === itemId &&
      selectedIds.has(candidate.id)
    ) {
      return {
        ...candidate,
        data: setCanvasDomEditStyleValue(
          candidate.data,
          targetId,
          channel,
          value,
          options,
        ),
      }
    }

    return candidate.type === 'group'
      ? {
          ...candidate,
          children: replaceCanvasDomEditStyleItems({
            channel,
            itemId,
            itemKind,
            items: candidate.children,
            options,
            selectedIds,
            targetId,
            value,
          }),
        }
      : candidate
  })
}
