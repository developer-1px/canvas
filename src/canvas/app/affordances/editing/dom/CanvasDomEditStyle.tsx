import type {
  CSSProperties,
  KeyboardEvent,
} from 'react'
import type {
  CanvasCustomItem,
  CanvasItem,
  CanvasJsonObject,
} from '../../../../entities'
import type {
  CanvasAppInspectorPanel,
  CanvasAppInspectorPanelContext,
} from '../inspector/CanvasAppInspectorPanels'

export type CanvasDomEditStyleChannel =
  | 'gap'
  | 'margin'
  | 'padding'
  | 'radius'

export type CanvasDomEditStyle = CanvasJsonObject & {
  gap: number
  margin: number
  padding: number
  radius: number
}

export type CanvasDomEditStyleLimit = {
  max: number
  min: number
  step: number
}

export type CanvasDomEditStyleOptions = {
  channels?: readonly CanvasDomEditStyleChannel[]
  defaultValue?: Partial<Record<CanvasDomEditStyleChannel, number>>
  limits?: Partial<Record<CanvasDomEditStyleChannel, Partial<CanvasDomEditStyleLimit>>>
}

const CANVAS_DOM_EDIT_STYLE_CHANNELS: readonly CanvasDomEditStyleChannel[] = [
  'margin',
  'padding',
  'gap',
  'radius',
]

const CANVAS_DOM_EDIT_STYLE_DEFAULTS: CanvasDomEditStyle = {
  gap: 0,
  margin: 0,
  padding: 0,
  radius: 0,
}

const CANVAS_DOM_EDIT_STYLE_LIMITS: Record<
  CanvasDomEditStyleChannel,
  CanvasDomEditStyleLimit
> = {
  gap: { max: 80, min: 0, step: 1 },
  margin: { max: 80, min: 0, step: 1 },
  padding: { max: 80, min: 0, step: 1 },
  radius: { max: 80, min: 0, step: 1 },
}

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

export function getCanvasDomEditStyle(
  data: CanvasJsonObject,
  targetId: string,
  options: CanvasDomEditStyleOptions = {},
): CanvasDomEditStyle {
  const dataStyle = getCanvasDomEditStyleRecord(data, targetId)

  return CANVAS_DOM_EDIT_STYLE_CHANNELS.reduce<CanvasDomEditStyle>(
    (style, channel) => ({
      ...style,
      [channel]: readCanvasDomEditStyleValue({
        channel,
        dataStyle,
        options,
      }),
    }),
    CANVAS_DOM_EDIT_STYLE_DEFAULTS,
  )
}

export function getCanvasDomEditStyleProperties(
  style: CanvasDomEditStyle,
): CSSProperties {
  return {
    borderRadius: style.radius,
    gap: style.gap,
    margin: style.margin,
    padding: style.padding,
  }
}

export function setCanvasDomEditStyleValue<
  TData extends CanvasJsonObject,
>(
  data: TData,
  targetId: string,
  channel: CanvasDomEditStyleChannel,
  value: number,
  options: CanvasDomEditStyleOptions = {},
): TData {
  const style = getCanvasDomEditStyle(data, targetId, options)
  const limit = getCanvasDomEditStyleLimit(channel, options)
  const domEdit = isCanvasJsonObject(data.domEdit) ? data.domEdit : {}
  const styles = isCanvasJsonObject(domEdit.styles) ? domEdit.styles : {}

  return {
    ...data,
    domEdit: {
      ...domEdit,
      styles: {
        ...styles,
        [targetId]: {
          ...style,
          [channel]: clampCanvasDomEditStyleValue(value, limit),
        },
      },
    },
  } as TData
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
    render: (context) => (
      <CanvasDomEditStyleInspectorPanel
        context={context}
        itemKind={itemKind}
        options={options}
        targetId={targetId}
        targetLabel={targetLabel}
      />
    ),
  }
}

function CanvasDomEditStyleInspectorPanel({
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
        {channels.map((channel) => (
          <CanvasDomEditStyleField
            channel={channel}
            context={context}
            item={item}
            itemKind={itemKind}
            key={channel}
            options={options}
            targetId={targetId}
            value={style[channel]}
          />
        ))}
      </div>
    </section>
  )
}

function CanvasDomEditStyleField({
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
    if (event.key === 'Enter') {
      event.currentTarget.blur()
      return
    }

    if (event.key === 'Escape') {
      event.currentTarget.value = String(value)
      event.currentTarget.blur()
    }
  }

  return (
    <label className="inspector-field">
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

function getCanvasDomEditStyleRecord(
  data: CanvasJsonObject,
  targetId: string,
): Partial<Record<CanvasDomEditStyleChannel, unknown>> {
  const domEdit = isCanvasJsonObject(data.domEdit) ? data.domEdit : {}
  const styles = isCanvasJsonObject(domEdit.styles) ? domEdit.styles : {}
  const targetStyle = styles[targetId]

  return isCanvasJsonObject(targetStyle) ? targetStyle : {}
}

function readCanvasDomEditStyleValue({
  channel,
  dataStyle,
  options,
}: {
  channel: CanvasDomEditStyleChannel
  dataStyle: Partial<Record<CanvasDomEditStyleChannel, unknown>>
  options: CanvasDomEditStyleOptions
}) {
  const rawValue = dataStyle[channel]
  const defaultValue =
    options.defaultValue?.[channel] ?? CANVAS_DOM_EDIT_STYLE_DEFAULTS[channel]
  const limit = getCanvasDomEditStyleLimit(channel, options)

  return clampCanvasDomEditStyleValue(
    typeof rawValue === 'number' && Number.isFinite(rawValue)
      ? rawValue
      : defaultValue,
    limit,
  )
}

function getCanvasDomEditStyleLimit(
  channel: CanvasDomEditStyleChannel,
  options: CanvasDomEditStyleOptions,
) {
  return {
    ...CANVAS_DOM_EDIT_STYLE_LIMITS[channel],
    ...options.limits?.[channel],
  }
}

function clampCanvasDomEditStyleValue(
  value: number,
  limit: CanvasDomEditStyleLimit,
) {
  return Math.min(limit.max, Math.max(limit.min, value))
}

function isCanvasJsonObject(value: CanvasJsonObject[string]): value is CanvasJsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
