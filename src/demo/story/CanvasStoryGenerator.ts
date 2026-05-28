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
const CANVAS_STORY_START_Y = 88
const CANVAS_STORY_SECTION_GAP = 24
const CANVAS_STORY_SECTION_ROW_GAP = 32
const CANVAS_STORY_LANE_GAP = 72
const CANVAS_STORY_SECTION_PADDING = 22
const CANVAS_STORY_SECTION_HEADER = 68
const CANVAS_STORY_CONTENT_GAP = 14
const CANVAS_STORY_LANE_MAX_WIDTH = 3300
const CANVAS_STORY_TABLE_WIDTH = 352
const CANVAS_STORY_MAX_COLUMNS = 2

const LANE_STYLE: Record<
  CanvasStoryLane,
  Pick<CanvasComponentItem, 'accent' | 'fill' | 'stroke'>
> = {
  delivery: {
    accent: '#7fb7ff',
    fill: 'rgba(255, 255, 255, 0.36)',
    stroke: 'rgba(127, 183, 255, 0.18)',
  },
  generation: {
    accent: '#0f8f63',
    fill: 'rgba(255, 255, 255, 0.36)',
    stroke: 'rgba(15, 143, 99, 0.18)',
  },
  governance: {
    accent: '#7c5c84',
    fill: 'rgba(255, 255, 255, 0.36)',
    stroke: 'rgba(124, 92, 132, 0.2)',
  },
  intake: {
    accent: '#ff8a4c',
    fill: 'rgba(255, 255, 255, 0.36)',
    stroke: 'rgba(255, 138, 76, 0.18)',
  },
  review: {
    accent: '#7fb7ff',
    fill: 'rgba(255, 255, 255, 0.36)',
    stroke: 'rgba(127, 183, 255, 0.2)',
  },
}

const ROLE_ACCENTS: Record<
  Extract<CanvasStoryContentEvent, { type: 'card' }>['role'],
  string
> = {
  contract: '#7fb7ff',
  control: '#0f8f63',
  guardrail: '#7c5c84',
  module: '#231729',
  principle: '#ff8a4c',
  workflow: '#b7d654',
}

const RELATION_STROKES: Record<CanvasStoryEdgeEvent['relation'], string> = {
  extends: '#7c5c84',
  feeds: '#7fb7ff',
  generates: '#0f8f63',
  guards: '#231729',
  owns: '#0f8f63',
  renders: '#7fb7ff',
  validates: '#ff8a4c',
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

    let laneOffsetY = 0
    let rowHeight = 0
    let sectionX = CANVAS_STORY_START_X

    for (const draft of laneDrafts) {
      if (
        sectionX > CANVAS_STORY_START_X &&
        sectionX + draft.w > CANVAS_STORY_START_X + CANVAS_STORY_LANE_MAX_WIDTH
      ) {
        sectionX = CANVAS_STORY_START_X
        laneOffsetY += rowHeight + CANVAS_STORY_SECTION_ROW_GAP
        rowHeight = 0
      }

      const sectionY = laneY + laneOffsetY

      layouts.push({
        ...draft,
        content: draft.content.map((placement) => ({
          ...placement,
          bounds: {
            ...placement.bounds,
            x: sectionX + placement.bounds.x,
            y: sectionY + placement.bounds.y,
          },
        })),
        x: sectionX,
        y: sectionY,
      })
      sectionX += draft.w + CANVAS_STORY_SECTION_GAP
      rowHeight = Math.max(rowHeight, draft.h)
    }

    laneY += laneOffsetY + rowHeight + CANVAS_STORY_LANE_GAP
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
    CANVAS_STORY_SECTION_PADDING +
    getCanvasStoryContentWidth(placements)
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
  const columnWidths = Array.from({ length: columns }, () => 0)

  content.forEach((event, index) => {
    const rowIndex = Math.floor(index / columns)
    const columnIndex = index % columns
    const size = getCanvasStoryContentSize(event)
    columnWidths[columnIndex] = Math.max(columnWidths[columnIndex], size.w)
    const placement: CanvasStoryContentPlacement = {
      bounds: {
        h: size.h,
        w: size.w,
        x: 0,
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
      const columnIndex = row.indexOf(placement)

      placements.push({
        ...placement,
        bounds: {
          ...placement.bounds,
          x:
            CANVAS_STORY_SECTION_PADDING +
            getCanvasStoryColumnOffset(columnWidths, columnIndex),
          y: rowY,
        },
      })
    }

    rowY += rowHeight + CANVAS_STORY_CONTENT_GAP
  }

  return placements
}

function getCanvasStoryColumnOffset(columnWidths: number[], columnIndex: number) {
  return columnWidths.slice(0, columnIndex).reduce(
    (offset, width) => offset + width + CANVAS_STORY_CONTENT_GAP,
    0,
  )
}

function getCanvasStoryContentWidth(placements: CanvasStoryContentPlacement[]) {
  if (placements.length === 0) {
    return 0
  }

  return Math.max(
    ...placements.map((placement) => placement.bounds.x + placement.bounds.w),
  )
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
      h: Math.max(108, 34 * (event.rows.length + 1)),
      w: CANVAS_STORY_TABLE_WIDTH,
    }
  }

  if (event.type === 'scorecard') {
    if (event.id === 'operating-summary') {
      return {
        h: 210,
        w: 560,
      }
    }

    if (event.id === 'qa-results') {
      return {
        h: 150,
        w: 430,
      }
    }

    return {
      h: 164,
      w: 430,
    }
  }

  if (event.type === 'timeline') {
    return {
      h: 126,
      w: 430,
    }
  }

  if (event.type === 'queue') {
    if (event.id === 'review-status') {
      return {
        h: Math.max(152, 62 + event.items.length * 26),
        w: 430,
      }
    }

    return {
      h: Math.max(126, 58 + event.items.length * 28),
      w: 286,
    }
  }

  if (event.type === 'evidence') {
    if (event.id === 'claim-evidence') {
      return {
        h: Math.max(152, 60 + event.rows.length * 38),
        w: 430,
      }
    }

    return {
      h: Math.max(126, 50 + event.rows.length * 34),
      w: 430,
    }
  }

  if (event.type === 'checklist') {
    return {
      h: Math.max(112, 44 + event.items.length * 22),
      w: 286,
    }
  }

  if (event.type === 'decision') {
    return {
      h: 100,
      w: 286,
    }
  }

  if (event.type === 'risk') {
    return {
      h: 80,
      w: 250,
    }
  }

  if (event.type === 'note') {
    return {
      h: 108,
      w: 252,
    }
  }

  return {
    h: Math.max(92, 50 + event.points.length * 14),
    w: 286,
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

  if (event.type === 'scorecard') {
    return createCanvasStoryScorecardItem({ bounds, event })
  }

  if (event.type === 'timeline') {
    return createCanvasStoryTimelineItem({ bounds, event })
  }

  if (event.type === 'queue') {
    return createCanvasStoryQueueItem({ bounds, event })
  }

  if (event.type === 'evidence') {
    return createCanvasStoryEvidenceItem({ bounds, event })
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
    fill: 'rgba(255, 255, 255, 0.74)',
    id: event.id,
    stroke: '#e1e7ef',
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
    accent: '#ff8a4c',
    body: event.body,
    component: 'sticky',
    fill: 'rgba(255, 255, 255, 0.74)',
    id: event.id,
    stroke: 'rgba(255, 138, 76, 0.24)',
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
    accent: '#0f8f63',
    checkedItems: event.items.flatMap((item, index) =>
      event.checked.includes(item) ? [index] : [],
    ),
    component: 'checklist',
    fill: '#ffffff',
    id: event.id,
    items: event.items,
    stroke: '#dfe5ee',
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
    accent: '#0f8f63',
    columns: event.columns,
    component: 'table',
    fill: '#ffffff',
    id: event.id,
    items: event.rows.flatMap((row) => row),
    stroke: '#dfe5ee',
    title: event.title,
    type: 'component',
  }
}

function createCanvasStoryScorecardItem({
  bounds,
  event,
}: {
  bounds: CanvasStoryBounds
  event: Extract<CanvasStoryContentEvent, { type: 'scorecard' }>
}): CanvasComponentItem {
  if (event.id === 'operating-summary') {
    return {
      ...bounds,
      accent: '#ff8a4c',
      body: event.summary,
      columns: event.metrics.map((metric) => metric.label),
      component: 'command-center',
      fill: '#ffffff',
      id: event.id,
      items: event.metrics.flatMap((metric) => [metric.value, metric.detail]),
      stroke: '#dfe5ee',
      title: event.title,
      type: 'component',
    }
  }

  if (event.id === 'qa-results') {
    return {
      ...bounds,
      accent: '#ff8a4c',
      body: event.summary,
      columns: event.metrics.map((metric) => metric.label),
      component: 'gate-strip',
      fill: '#ffffff',
      id: event.id,
      items: event.metrics.flatMap((metric) => [metric.value, metric.detail]),
      stroke: '#dfe5ee',
      title: event.title,
      type: 'component',
    }
  }

  return {
    ...bounds,
    accent: '#7fb7ff',
    body: event.summary,
    columns: event.metrics.map((metric) => metric.label),
    component: 'scorecard',
    fill: '#ffffff',
    id: event.id,
    items: event.metrics.flatMap((metric) => [metric.value, metric.detail]),
    stroke: '#dfe5ee',
    title: event.title,
    type: 'component',
  }
}

function createCanvasStoryTimelineItem({
  bounds,
  event,
}: {
  bounds: CanvasStoryBounds
  event: Extract<CanvasStoryContentEvent, { type: 'timeline' }>
}): CanvasComponentItem {
  return {
    ...bounds,
    accent: '#0f8f63',
    checkedItems: Array.from(
      { length: Math.min(event.completed, event.steps.length) },
      (_, index) => index,
    ),
    component: 'timeline',
    fill: '#ffffff',
    id: event.id,
    items: event.steps,
    stroke: '#dfe5ee',
    title: event.title,
    type: 'component',
  }
}

function createCanvasStoryQueueItem({
  bounds,
  event,
}: {
  bounds: CanvasStoryBounds
  event: Extract<CanvasStoryContentEvent, { type: 'queue' }>
}): CanvasComponentItem {
  if (event.id === 'review-status') {
    return {
      ...bounds,
      accent: '#7fb7ff',
      checkedItems: event.items.flatMap((item, index) =>
        event.done.includes(item) ? [index] : [],
      ),
      component: 'review-board',
      fill: '#ffffff',
      id: event.id,
      items: event.items,
      stroke: '#dfe5ee',
      title: event.title,
      type: 'component',
    }
  }

  return {
    ...bounds,
    accent: '#7fb7ff',
    checkedItems: event.items.flatMap((item, index) =>
      event.done.includes(item) ? [index] : [],
    ),
    component: 'queue',
    fill: '#ffffff',
    id: event.id,
    items: event.items,
    stroke: '#dfe5ee',
    title: event.title,
    type: 'component',
  }
}

function createCanvasStoryEvidenceItem({
  bounds,
  event,
}: {
  bounds: CanvasStoryBounds
  event: Extract<CanvasStoryContentEvent, { type: 'evidence' }>
}): CanvasComponentItem {
  if (event.id === 'claim-evidence') {
    return {
      ...bounds,
      accent: '#0f8f63',
      columns: ['Source', 'Signal', 'State'],
      component: 'evidence-map',
      fill: '#ffffff',
      id: event.id,
      items: event.rows.flatMap((row) => [row.source, row.signal, row.state]),
      stroke: '#dfe5ee',
      title: event.title,
      type: 'component',
    }
  }

  return {
    ...bounds,
    accent: '#0f8f63',
    columns: ['Source', 'Signal', 'State'],
    component: 'evidence',
    fill: '#ffffff',
    id: event.id,
    items: event.rows.flatMap((row) => [row.source, row.signal, row.state]),
    stroke: '#dfe5ee',
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
    strokeWidth: 1.4,
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
