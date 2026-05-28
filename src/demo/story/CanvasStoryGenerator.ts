import type {
  ArrowItem,
  CanvasComponentItem,
  CanvasCustomItem,
  CanvasItem,
  Point,
} from '../../canvas'
import {
  CANVAS_STORY_LANES,
  parseCanvasStoryEvents,
  type CanvasStoryEvent,
  type CanvasStorySectionEvent,
} from './CanvasStoryEvents'

type CanvasStoryContentEvent = Exclude<
  CanvasStoryEvent,
  CanvasStorySectionEvent | Extract<CanvasStoryEvent, { type: 'edge' }>
>
type CanvasStoryEdgeEvent = Extract<CanvasStoryEvent, { type: 'edge' }>
type CanvasStoryBounds = {
  h: number
  w: number
  x: number
  y: number
}
type CanvasStoryContentPlacement = {
  bounds: CanvasStoryBounds
  event: CanvasStoryContentEvent
}
type CanvasStorySectionLayout = {
  content: CanvasStoryContentPlacement[]
  h: number
  section: CanvasStorySectionEvent
  w: number
  x: number
  y: number
}
type CanvasStoryLane = (typeof CANVAS_STORY_LANES)[number]

const CANVAS_STORY_START_X = 72
const CANVAS_STORY_START_Y = 96
const CANVAS_STORY_SECTION_GAP = 56
const CANVAS_STORY_LANE_GAP = 104
const CANVAS_STORY_SECTION_PADDING = 28
const CANVAS_STORY_SECTION_HEADER = 82
const CANVAS_STORY_CONTENT_GAP = 18
const CANVAS_STORY_COLUMN_WIDTH = 288
const CANVAS_STORY_TABLE_WIDTH = 384
const CANVAS_STORY_MAX_COLUMNS = 3

const LANE_STYLE: Record<
  CanvasStoryLane,
  Pick<CanvasComponentItem, 'accent' | 'fill' | 'stroke'>
> = {
  architecture: {
    accent: '#2563eb',
    fill: 'rgba(239, 246, 255, 0.42)',
    stroke: '#93c5fd',
  },
  extension: {
    accent: '#7c3aed',
    fill: 'rgba(245, 243, 255, 0.42)',
    stroke: '#c4b5fd',
  },
  generation: {
    accent: '#0891b2',
    fill: 'rgba(236, 254, 255, 0.42)',
    stroke: '#67e8f9',
  },
  quality: {
    accent: '#475569',
    fill: 'rgba(248, 250, 252, 0.62)',
    stroke: '#94a3b8',
  },
  workflow: {
    accent: '#16a34a',
    fill: 'rgba(240, 253, 244, 0.42)',
    stroke: '#86efac',
  },
}

const ROLE_ACCENTS: Record<
  Extract<CanvasStoryContentEvent, { type: 'card' }>['role'],
  string
> = {
  contract: '#2563eb',
  control: '#0f766e',
  guardrail: '#475569',
  module: '#7c3aed',
  principle: '#ca8a04',
  workflow: '#16a34a',
}

const RELATION_STROKES: Record<CanvasStoryEdgeEvent['relation'], string> = {
  extends: '#7c3aed',
  feeds: '#2563eb',
  generates: '#0891b2',
  guards: '#475569',
  owns: '#16a34a',
  renders: '#0f766e',
  validates: '#ca8a04',
}

export function createCanvasStoryItems(
  rawEvents: readonly CanvasStoryEvent[],
): CanvasItem[] {
  const events = parseCanvasStoryEvents(rawEvents)

  assertUniqueCanvasStoryEventIds(events)

  const sections = events.filter(isCanvasStorySectionEvent)
  const edges = events.filter(isCanvasStoryEdgeEvent)
  const content = events.filter(isCanvasStoryContentEvent)
  const layouts = createCanvasStoryLayouts({ content, sections })
  const boundsById = new Map<string, CanvasStoryBounds>()
  const sectionItems = layouts.map((layout) => {
    const sectionItem = createCanvasStorySectionItem(layout)

    boundsById.set(layout.section.id, sectionItem)

    return sectionItem
  })
  const contentItems = layouts.flatMap((layout) =>
    layout.content.map((placement) => {
      const item = createCanvasStoryContentItem(placement)

      boundsById.set(placement.event.id, item)

      return item
    }),
  )
  const edgeItems = edges.map((edge) =>
    createCanvasStoryEdgeItem({
      boundsById,
      edge,
    }),
  )

  return [
    ...sectionItems,
    ...edgeItems,
    ...contentItems,
  ]
}

function createCanvasStoryLayouts({
  content,
  sections,
}: {
  content: CanvasStoryContentEvent[]
  sections: CanvasStorySectionEvent[]
}): CanvasStorySectionLayout[] {
  const contentBySection = groupCanvasStoryContentBySection({
    content,
    sections,
  })
  const layoutDrafts = sections.map((section) =>
    createCanvasStorySectionLayoutDraft({
      content: contentBySection.get(section.id) ?? [],
      section,
    }),
  )
  const layouts: CanvasStorySectionLayout[] = []
  let laneY = CANVAS_STORY_START_Y

  for (const lane of CANVAS_STORY_LANES) {
    const laneDrafts = layoutDrafts.filter(
      (layout) => layout.section.lane === lane,
    )

    if (laneDrafts.length === 0) {
      continue
    }

    let sectionX = CANVAS_STORY_START_X
    let maxLaneHeight = 0

    for (const draft of laneDrafts) {
      layouts.push({
        ...draft,
        content: draft.content.map((placement) => ({
          ...placement,
          bounds: {
            ...placement.bounds,
            x: sectionX + placement.bounds.x,
            y: laneY + placement.bounds.y,
          },
        })),
        x: sectionX,
        y: laneY,
      })
      sectionX += draft.w + CANVAS_STORY_SECTION_GAP
      maxLaneHeight = Math.max(maxLaneHeight, draft.h)
    }

    laneY += maxLaneHeight + CANVAS_STORY_LANE_GAP
  }

  return layouts
}

function groupCanvasStoryContentBySection({
  content,
  sections,
}: {
  content: CanvasStoryContentEvent[]
  sections: CanvasStorySectionEvent[]
}) {
  const sectionIds = new Set(sections.map((section) => section.id))
  const contentBySection = new Map<string, CanvasStoryContentEvent[]>()

  for (const event of content) {
    if (!sectionIds.has(event.sectionId)) {
      throw new Error(
        `Canvas story event ${event.id} references unknown section ${event.sectionId}`,
      )
    }

    contentBySection.set(event.sectionId, [
      ...(contentBySection.get(event.sectionId) ?? []),
      event,
    ])
  }

  return contentBySection
}

function createCanvasStorySectionLayoutDraft({
  content,
  section,
}: {
  content: CanvasStoryContentEvent[]
  section: CanvasStorySectionEvent
}): Omit<CanvasStorySectionLayout, 'x' | 'y'> {
  const columns = Math.min(
    CANVAS_STORY_MAX_COLUMNS,
    Math.max(1, Math.ceil(Math.sqrt(content.length))),
  )
  const placements = createCanvasStoryContentPlacements({
    columns,
    content,
  })
  const sectionWidth =
    CANVAS_STORY_SECTION_PADDING * 2 +
    columns * CANVAS_STORY_COLUMN_WIDTH +
    (columns - 1) * CANVAS_STORY_CONTENT_GAP
  const sectionHeight =
    CANVAS_STORY_SECTION_HEADER +
    CANVAS_STORY_SECTION_PADDING +
    getCanvasStoryContentRowsHeight(placements)

  return {
    content: placements,
    h: Math.max(220, sectionHeight),
    section,
    w: Math.max(340, sectionWidth),
  }
}

function createCanvasStoryContentPlacements({
  columns,
  content,
}: {
  columns: number
  content: CanvasStoryContentEvent[]
}) {
  const rows: CanvasStoryContentPlacement[][] = []

  content.forEach((event, index) => {
    const rowIndex = Math.floor(index / columns)
    const columnIndex = index % columns
    const size = getCanvasStoryContentSize(event)
    const placement: CanvasStoryContentPlacement = {
      bounds: {
        h: size.h,
        w: size.w,
        x:
          CANVAS_STORY_SECTION_PADDING +
          columnIndex * (CANVAS_STORY_COLUMN_WIDTH + CANVAS_STORY_CONTENT_GAP),
        y: 0,
      },
      event,
    }

    rows[rowIndex] = [...(rows[rowIndex] ?? []), placement]
  })

  let rowY = CANVAS_STORY_SECTION_HEADER
  const placements: CanvasStoryContentPlacement[] = []

  for (const row of rows) {
    const rowHeight = Math.max(...row.map((placement) => placement.bounds.h))

    for (const placement of row) {
      placements.push({
        ...placement,
        bounds: {
          ...placement.bounds,
          y: rowY,
        },
      })
    }

    rowY += rowHeight + CANVAS_STORY_CONTENT_GAP
  }

  return placements
}

function getCanvasStoryContentRowsHeight(
  placements: CanvasStoryContentPlacement[],
) {
  if (placements.length === 0) {
    return 0
  }

  return Math.max(
    ...placements.map((placement) => placement.bounds.y + placement.bounds.h),
  ) - CANVAS_STORY_SECTION_HEADER
}

function getCanvasStoryContentSize(
  event: CanvasStoryContentEvent,
): Pick<CanvasStoryBounds, 'h' | 'w'> {
  if (event.type === 'table') {
    return {
      h: Math.max(132, 42 * (event.rows.length + 1)),
      w: CANVAS_STORY_TABLE_WIDTH,
    }
  }

  if (event.type === 'checklist') {
    return {
      h: Math.max(144, 50 + event.items.length * 28),
      w: 268,
    }
  }

  if (event.type === 'decision') {
    return {
      h: 122,
      w: 260,
    }
  }

  if (event.type === 'risk') {
    return {
      h: 96,
      w: 220,
    }
  }

  if (event.type === 'note') {
    return {
      h: 132,
      w: 220,
    }
  }

  return {
    h: Math.max(126, 82 + event.points.length * 22),
    w: 268,
  }
}

function createCanvasStorySectionItem(
  layout: CanvasStorySectionLayout,
): CanvasComponentItem {
  const style = LANE_STYLE[layout.section.lane]

  return {
    ...style,
    body: layout.section.purpose,
    component: 'section',
    h: layout.h,
    id: layout.section.id,
    title: layout.section.title,
    type: 'component',
    w: layout.w,
    x: layout.x,
    y: layout.y,
  }
}

function createCanvasStoryContentItem(
  placement: CanvasStoryContentPlacement,
): CanvasComponentItem | CanvasCustomItem {
  const { bounds, event } = placement

  if (event.type === 'card') {
    return createCanvasStoryCardItem({ bounds, event })
  }

  if (event.type === 'note') {
    return createCanvasStoryNoteItem({ bounds, event })
  }

  if (event.type === 'checklist') {
    return createCanvasStoryChecklistItem({ bounds, event })
  }

  if (event.type === 'table') {
    return createCanvasStoryTableItem({ bounds, event })
  }

  if (event.type === 'decision') {
    return {
      ...bounds,
      data: {
        option: event.option,
        status: event.status,
      },
      id: event.id,
      kind: 'decision',
      presentation: 'decision-node',
      title: event.title,
      type: 'custom',
    }
  }

  return {
    ...bounds,
    data: {
      severity: event.severity,
    },
    id: event.id,
    kind: 'risk',
    presentation: 'risk-node',
    title: event.title,
    type: 'custom',
  }
}

function createCanvasStoryCardItem({
  bounds,
  event,
}: {
  bounds: CanvasStoryBounds
  event: Extract<CanvasStoryContentEvent, { type: 'card' }>
}): CanvasComponentItem {
  const accent = ROLE_ACCENTS[event.role]

  return {
    ...bounds,
    accent,
    body: event.points.join(' · '),
    component: 'card',
    fill: '#ffffff',
    id: event.id,
    stroke: '#cbd5e1',
    title: event.title,
    type: 'component',
  }
}

function createCanvasStoryNoteItem({
  bounds,
  event,
}: {
  bounds: CanvasStoryBounds
  event: Extract<CanvasStoryContentEvent, { type: 'note' }>
}): CanvasComponentItem {
  return {
    ...bounds,
    accent: '#ca8a04',
    body: `${event.title}\n${event.body}`,
    component: 'sticky',
    fill: '#fef3c7',
    id: event.id,
    stroke: '#eab308',
    title: event.title,
    type: 'component',
  }
}

function createCanvasStoryChecklistItem({
  bounds,
  event,
}: {
  bounds: CanvasStoryBounds
  event: Extract<CanvasStoryContentEvent, { type: 'checklist' }>
}): CanvasComponentItem {
  return {
    ...bounds,
    accent: '#16a34a',
    checkedItems: event.items.flatMap((item, index) =>
      event.checked.includes(item) ? [index] : [],
    ),
    component: 'checklist',
    fill: '#ffffff',
    id: event.id,
    items: event.items,
    stroke: '#cbd5e1',
    title: event.title,
    type: 'component',
  }
}

function createCanvasStoryTableItem({
  bounds,
  event,
}: {
  bounds: CanvasStoryBounds
  event: Extract<CanvasStoryContentEvent, { type: 'table' }>
}): CanvasComponentItem {
  return {
    ...bounds,
    accent: '#0891b2',
    columns: event.columns,
    component: 'table',
    fill: '#ffffff',
    id: event.id,
    items: event.rows.flatMap((row) => row),
    stroke: '#cbd5e1',
    title: event.title,
    type: 'component',
  }
}

function createCanvasStoryEdgeItem({
  boundsById,
  edge,
}: {
  boundsById: ReadonlyMap<string, CanvasStoryBounds>
  edge: CanvasStoryEdgeEvent
}): ArrowItem {
  const from = boundsById.get(edge.from)
  const to = boundsById.get(edge.to)

  if (!from || !to) {
    throw new Error(`Canvas story edge ${edge.id} has unknown endpoints`)
  }

  const start = getCanvasStoryEdgePoint({ from, to })
  const end = getCanvasStoryEdgePoint({
    from: to,
    to: from,
  })
  const x = Math.min(start.x, end.x)
  const y = Math.min(start.y, end.y)

  return {
    end,
    endAttachedTo: edge.to,
    h: Math.max(24, Math.abs(end.y - start.y)),
    id: edge.id,
    routing: 'elbow',
    start,
    startAttachedTo: edge.from,
    stroke: RELATION_STROKES[edge.relation],
    strokeWidth: 3,
    text: edge.label,
    type: 'arrow',
    w: Math.max(24, Math.abs(end.x - start.x)),
    x,
    y,
  }
}

function getCanvasStoryEdgePoint({
  from,
  to,
}: {
  from: CanvasStoryBounds
  to: CanvasStoryBounds
}): Point {
  const fromCenter = getCanvasStoryBoundsCenter(from)
  const toCenter = getCanvasStoryBoundsCenter(to)
  const dx = toCenter.x - fromCenter.x
  const dy = toCenter.y - fromCenter.y

  if (Math.abs(dx) >= Math.abs(dy)) {
    return {
      x: dx >= 0 ? from.x + from.w : from.x,
      y: fromCenter.y,
    }
  }

  return {
    x: fromCenter.x,
    y: dy >= 0 ? from.y + from.h : from.y,
  }
}

function getCanvasStoryBoundsCenter(bounds: CanvasStoryBounds): Point {
  return {
    x: bounds.x + bounds.w / 2,
    y: bounds.y + bounds.h / 2,
  }
}

function assertUniqueCanvasStoryEventIds(events: CanvasStoryEvent[]) {
  const eventIds = new Set<string>()

  for (const event of events) {
    if (eventIds.has(event.id)) {
      throw new Error(`Duplicate canvas story event id: ${event.id}`)
    }

    eventIds.add(event.id)
  }
}

function isCanvasStorySectionEvent(
  event: CanvasStoryEvent,
): event is CanvasStorySectionEvent {
  return event.type === 'section'
}

function isCanvasStoryEdgeEvent(
  event: CanvasStoryEvent,
): event is CanvasStoryEdgeEvent {
  return event.type === 'edge'
}

function isCanvasStoryContentEvent(
  event: CanvasStoryEvent,
): event is CanvasStoryContentEvent {
  return event.type !== 'section' && event.type !== 'edge'
}
