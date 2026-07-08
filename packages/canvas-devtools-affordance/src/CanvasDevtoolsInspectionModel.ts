import type {
  Bounds,
  CanvasItem,
  Viewport,
} from '@interactive-os/canvas'

export type CanvasDevtoolsInspectField = Readonly<{
  name: string
  value: string
}>

export type CanvasDevtoolsItemSummary = Readonly<{
  bounds: Bounds
  fields: readonly CanvasDevtoolsInspectField[]
  hidden: boolean
  id: string
  label: string
  layerIndex: number
  locked: boolean
  selected: boolean
  type: CanvasItem['type']
}>

export type CanvasDevtoolsCommentSummary = Readonly<{
  attachedTo: string | null
  body: string
  bounds: Bounds
  id: string
  messageCount: number
  resolved: boolean
  selected: boolean
}>

export type CanvasDevtoolsNoteSummary = Readonly<{
  attachedTo: string | null
  body: string
  bounds: Bounds
  id: string
  messageCount: number
  resolved: boolean
  selected: boolean
}>

export type CanvasDevtoolsTypeCount = Readonly<{
  count: number
  type: CanvasItem['type']
}>

export type CanvasDevtoolsInspectSnapshot = Readonly<{
  comments: readonly CanvasDevtoolsCommentSummary[]
  itemCount: number
  items: readonly CanvasDevtoolsItemSummary[]
  selectedItems: readonly CanvasDevtoolsItemSummary[]
  typeCounts: readonly CanvasDevtoolsTypeCount[]
  viewport: Viewport
}>

export type CreateCanvasDevtoolsInspectSnapshotInput = Readonly<{
  items: readonly CanvasItem[]
  selectedItemIds: readonly string[]
  viewport: Viewport
}>

export function createCanvasDevtoolsInspectSnapshot({
  items,
  selectedItemIds,
  viewport,
}: CreateCanvasDevtoolsInspectSnapshotInput): CanvasDevtoolsInspectSnapshot {
  const selectedIds = new Set(selectedItemIds)
  const summaries = items.map((item, index) =>
    createCanvasDevtoolsItemSummary({
      item,
      layerIndex: index + 1,
      selected: selectedIds.has(item.id),
    }),
  )
  const typeCounts = createCanvasDevtoolsTypeCounts(items)

  return {
    comments: items
      .filter((item): item is Extract<CanvasItem, { type: 'comment' }> =>
        item.type === 'comment',
      )
      .map((item) => ({
        attachedTo: item.attachedTo ?? null,
        body: item.body,
        bounds: getCanvasDevtoolsBounds(item),
        id: item.id,
        messageCount: item.thread?.length ?? 0,
        resolved: item.resolved === true,
        selected: selectedIds.has(item.id),
      })),
    itemCount: items.length,
    items: summaries,
    selectedItems: summaries.filter((item) => item.selected),
    typeCounts,
    viewport,
  }
}

function createCanvasDevtoolsItemSummary({
  item,
  layerIndex,
  selected,
}: {
  item: CanvasItem
  layerIndex: number
  selected: boolean
}): CanvasDevtoolsItemSummary {
  return {
    bounds: getCanvasDevtoolsBounds(item),
    fields: createCanvasDevtoolsFields(item),
    hidden: item.hidden === true,
    id: item.id,
    label: getCanvasDevtoolsItemLabel(item),
    layerIndex,
    locked: item.locked === true,
    selected,
    type: item.type,
  }
}

function createCanvasDevtoolsTypeCounts(
  items: readonly CanvasItem[],
): readonly CanvasDevtoolsTypeCount[] {
  const counts = new Map<CanvasItem['type'], number>()

  for (const item of items) {
    counts.set(item.type, (counts.get(item.type) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([type, count]) => ({ count, type }))
    .sort((a, b) => a.type.localeCompare(b.type))
}

function createCanvasDevtoolsFields(
  item: CanvasItem,
): readonly CanvasDevtoolsInspectField[] {
  return [
    { name: 'id', value: item.id },
    { name: 'type', value: item.type },
    { name: 'bounds', value: formatBounds(getCanvasDevtoolsBounds(item)) },
    ...createCanvasDevtoolsOptionalField('label', getCanvasDevtoolsItemLabel(item)),
    ...createCanvasDevtoolsOptionalField('component', readStringField(item, 'component')),
    ...createCanvasDevtoolsOptionalField('attached', readStringField(item, 'attachedTo')),
    ...createCanvasDevtoolsOptionalField('routing', readStringField(item, 'routing')),
    ...createCanvasDevtoolsOptionalField('fill', readStringField(item, 'fill')),
    ...createCanvasDevtoolsOptionalField('stroke', readStringField(item, 'stroke')),
    ...createCanvasDevtoolsOptionalField('rotation', readNumberField(item, 'rotation')),
  ]
}

function createCanvasDevtoolsOptionalField(
  name: string,
  value: number | string | undefined,
): readonly CanvasDevtoolsInspectField[] {
  if (value === undefined || value === '') {
    return []
  }

  return [{ name, value: String(value) }]
}

function getCanvasDevtoolsItemLabel(item: CanvasItem): string {
  return (
    readStringField(item, 'title') ||
    readStringField(item, 'body') ||
    readStringField(item, 'text') ||
    readStringField(item, 'name') ||
    readStringField(item, 'alt') ||
    readStringField(item, 'label') ||
    readStringField(item, 'component') ||
    readStringField(item, 'kind') ||
    item.type
  )
}

function readStringField(
  item: CanvasItem,
  key: string,
): string | undefined {
  const value = (item as Record<string, unknown>)[key]

  return typeof value === 'string' ? value.trim() : undefined
}

function readNumberField(
  item: CanvasItem,
  key: string,
): number | undefined {
  const value = (item as Record<string, unknown>)[key]

  return typeof value === 'number' ? value : undefined
}

function getCanvasDevtoolsBounds(item: CanvasItem): Bounds {
  return {
    h: item.h,
    w: item.w,
    x: item.x,
    y: item.y,
  }
}

function formatBounds(bounds: Bounds) {
  return `${formatNumber(bounds.x)}, ${formatNumber(bounds.y)}, ${formatNumber(bounds.w)} x ${formatNumber(bounds.h)}`
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}
