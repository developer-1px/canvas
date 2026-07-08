import {
  Fragment,
  type CSSProperties,
  type ReactNode,
} from 'react'
import type {
  Bounds,
  CanvasItem,
  Viewport,
} from '@interactive-os/canvas'
import {
  getCanvasViewportScreenBounds,
  getCanvasViewportScreenPoint,
} from '@interactive-os/canvas/core'
import {
  createCanvasDevtoolsMeasureSnapshot,
  type CanvasDevtoolsDistance,
  type CanvasDevtoolsMeasureSnapshot,
  type CanvasDevtoolsMeasuredItem,
} from './CanvasDevtoolsMeasureModel'
import {
  createCanvasDevtoolsInspectSnapshot,
  type CanvasDevtoolsInspectSnapshot,
  type CanvasDevtoolsItemSummary,
  type CanvasDevtoolsNoteSummary,
} from './CanvasDevtoolsInspectionModel'
import './style.css'

export type CanvasDevtoolsMode = 'inspect' | 'measure' | 'notes' | 'off'

const CANVAS_DEVTOOLS_MODES = ['measure', 'inspect', 'notes'] as const

export type CanvasDevtoolsContextField = Readonly<{
  name: string
  value: string
}>

export type CanvasDevtoolsContextSummary = Readonly<{
  fields?: readonly CanvasDevtoolsContextField[]
  subtitle?: string
  title: string
}>

export type CanvasDevtoolsOverlayProps = Readonly<{
  activeMode: CanvasDevtoolsMode
  context?: CanvasDevtoolsContextSummary
  items: readonly CanvasItem[]
  notes?: readonly CanvasDevtoolsNoteSummary[]
  onModeChange?: (mode: CanvasDevtoolsMode) => void
  selectedItemIds: readonly string[]
  viewport: Viewport
}>

type CanvasDevtoolsRectStyle = CSSProperties & {
  '--canvas-devtools-rect-h': string
  '--canvas-devtools-rect-w': string
  '--canvas-devtools-rect-x': string
  '--canvas-devtools-rect-y': string
}

type CanvasDevtoolsPointStyle = CSSProperties & {
  '--canvas-devtools-point-x': string
  '--canvas-devtools-point-y': string
}

type CanvasDevtoolsDistanceStyle = CSSProperties & {
  '--canvas-devtools-distance-h': string
  '--canvas-devtools-distance-w': string
  '--canvas-devtools-distance-x': string
  '--canvas-devtools-distance-y': string
}

export function CanvasDevtoolsOverlay({
  activeMode,
  context,
  items,
  notes,
  onModeChange,
  selectedItemIds,
  viewport,
}: CanvasDevtoolsOverlayProps): ReactNode {
  const snapshot = createCanvasDevtoolsMeasureSnapshot({
    items,
    selectedItemIds,
    viewport,
  })
  const inspectSnapshot = createCanvasDevtoolsInspectSnapshot({
    items,
    selectedItemIds,
    viewport,
  })
  const noteSummaries = notes ?? inspectSnapshot.comments
  const selectedCount = snapshot.selectedItems.length
  const activeModeLabel = getCanvasDevtoolsModeLabel(activeMode)

  return (
    <div className="canvas-devtools" data-mode={activeMode}>
      {activeMode === 'measure' ? (
        <CanvasDevtoolsMeasureLayer snapshot={snapshot} />
      ) : null}
      {activeMode === 'inspect' ? (
        <CanvasDevtoolsInspectLayer snapshot={inspectSnapshot} />
      ) : null}
      {activeMode === 'notes' ? (
        <CanvasDevtoolsNotesLayer
          notes={noteSummaries}
          viewport={inspectSnapshot.viewport}
        />
      ) : null}
      <div className="canvas-devtools__panel" role="region" aria-label="Canvas devtools">
        <div className="canvas-devtools__panel-row">
          <span className="canvas-devtools__title">Devtools</span>
          <div className="canvas-devtools__modes" role="group" aria-label="Devtools mode">
            {CANVAS_DEVTOOLS_MODES.map((mode) => (
              <button
                aria-pressed={activeMode === mode}
                className="canvas-devtools__toggle"
                key={mode}
                type="button"
                onClick={() => onModeChange?.(activeMode === mode ? 'off' : mode)}
              >
                {getCanvasDevtoolsModeLabel(mode)}
              </button>
            ))}
          </div>
        </div>
        <div className="canvas-devtools__meta">
          {activeModeLabel} · {selectedCount > 0 ? `${selectedCount} selected` : 'No selection'} · {formatScale(viewport.scale)}
        </div>
        {activeMode === 'inspect' && context ? (
          <CanvasDevtoolsContextPanel context={context} />
        ) : null}
        {activeMode === 'inspect' ? (
          <CanvasDevtoolsInspectPanel snapshot={inspectSnapshot} />
        ) : null}
        {activeMode === 'notes' ? (
          <CanvasDevtoolsNotesPanel notes={noteSummaries} />
        ) : null}
      </div>
    </div>
  )
}

function CanvasDevtoolsContextPanel({
  context,
}: {
  context: CanvasDevtoolsContextSummary
}) {
  return (
    <section className="canvas-devtools__context">
      <strong>{context.title}</strong>
      {context.subtitle ? (
        <small>{context.subtitle}</small>
      ) : null}
      {context.fields && context.fields.length > 0 ? (
        <dl className="canvas-devtools__context-fields">
          {context.fields.map((field) => (
            <div
              className="canvas-devtools__context-field"
              key={`${field.name}:${field.value}`}
            >
              <dt>{field.name}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  )
}

function CanvasDevtoolsMeasureLayer({
  snapshot,
}: {
  snapshot: CanvasDevtoolsMeasureSnapshot
}) {
  const selectedBounds = snapshot.selectedBounds

  return (
    <div className="canvas-devtools__measure-layer" aria-hidden="true">
      {snapshot.selectedItems.map((item) => (
        <CanvasDevtoolsItemOutline
          item={item}
          key={item.id}
          viewport={snapshot.viewport}
        />
      ))}
      {selectedBounds ? (
        <>
          <span
            className="canvas-devtools__selection-outline"
            style={rectStyleForBounds(snapshot.viewport, selectedBounds)}
          />
          <span
            className="canvas-devtools__label"
            style={labelStyleForBounds(snapshot.viewport, selectedBounds)}
          >
            {formatSize(selectedBounds)}
          </span>
        </>
      ) : null}
      {snapshot.distances.map((distance) => (
        <CanvasDevtoolsDistanceMarker
          distance={distance}
          key={`${distance.axis}:${distance.fromItemId}:${distance.toItemId}`}
          viewport={snapshot.viewport}
        />
      ))}
    </div>
  )
}

function CanvasDevtoolsInspectLayer({
  snapshot,
}: {
  snapshot: CanvasDevtoolsInspectSnapshot
}) {
  return (
    <div className="canvas-devtools__inspect-layer" aria-hidden="true">
      {snapshot.items.map((item) => (
        <Fragment key={item.id}>
          <span
            className={item.selected
              ? 'canvas-devtools__inspect-outline--selected'
              : 'canvas-devtools__inspect-outline'}
            data-item-type={item.type}
            style={rectStyleForBounds(snapshot.viewport, item.bounds)}
          />
          <span
            className="canvas-devtools__inspect-tag"
            style={pointStyleForBoundsOrigin(snapshot.viewport, item.bounds)}
          >
            {item.layerIndex}
          </span>
        </Fragment>
      ))}
    </div>
  )
}

function CanvasDevtoolsNotesLayer({
  notes,
  viewport,
}: {
  notes: readonly CanvasDevtoolsNoteSummary[]
  viewport: Viewport
}) {
  return (
    <div className="canvas-devtools__notes-layer" aria-hidden="true">
      {notes.map((comment) => (
        <CanvasDevtoolsCommentPin
          comment={comment}
          key={comment.id}
          viewport={viewport}
        />
      ))}
    </div>
  )
}

function CanvasDevtoolsCommentPin({
  comment,
  viewport,
}: {
  comment: CanvasDevtoolsNoteSummary
  viewport: Viewport
}) {
  const point = getCanvasViewportScreenPoint(viewport, {
    x: comment.bounds.x + comment.bounds.w,
    y: comment.bounds.y,
  })

  return (
    <span
      className={comment.resolved
        ? 'canvas-devtools__comment-pin--resolved'
        : 'canvas-devtools__comment-pin'}
      style={pointStyle(point)}
    >
      {comment.messageCount || 1}
    </span>
  )
}

function CanvasDevtoolsInspectPanel({
  snapshot,
}: {
  snapshot: CanvasDevtoolsInspectSnapshot
}) {
  const activeItems = snapshot.selectedItems.length > 0
    ? snapshot.selectedItems
    : snapshot.items.slice(0, 4)

  return (
    <div className="canvas-devtools__panel-body">
      <div className="canvas-devtools__chips" aria-label="Item type counts">
        {snapshot.typeCounts.map((typeCount) => (
          <span className="canvas-devtools__chip" key={typeCount.type}>
            {typeCount.type} {typeCount.count}
          </span>
        ))}
      </div>
      <div className="canvas-devtools__item-list">
        {activeItems.map((item) => (
          <CanvasDevtoolsItemSummaryRow item={item} key={item.id} />
        ))}
      </div>
    </div>
  )
}

function CanvasDevtoolsItemSummaryRow({
  item,
}: {
  item: CanvasDevtoolsItemSummary
}) {
  return (
    <section className="canvas-devtools__item-summary">
      <div className="canvas-devtools__item-summary-head">
        <span className="canvas-devtools__item-summary-index">
          {item.layerIndex}
        </span>
        <strong>{item.label}</strong>
        <span>{item.type}</span>
      </div>
      <dl className="canvas-devtools__fields">
        {item.fields.slice(0, 6).map((field) => (
          <div className="canvas-devtools__field" key={`${item.id}:${field.name}`}>
            <dt>{field.name}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function CanvasDevtoolsNotesPanel({
  notes,
}: {
  notes: readonly CanvasDevtoolsNoteSummary[]
}) {
  return (
    <div className="canvas-devtools__panel-body">
      {notes.length === 0 ? (
        <p className="canvas-devtools__empty">No notes</p>
      ) : (
        <div className="canvas-devtools__note-list">
          {notes.map((comment) => (
            <section className="canvas-devtools__note" key={comment.id}>
              <div className="canvas-devtools__note-head">
                <strong>{comment.resolved ? 'Resolved' : 'Open'}</strong>
                <span>{comment.messageCount || 1} replies</span>
              </div>
              <p>{comment.body}</p>
              {comment.attachedTo ? (
                <span className="canvas-devtools__note-target">
                  attached {comment.attachedTo}
                </span>
              ) : null}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function CanvasDevtoolsItemOutline({
  item,
  viewport,
}: {
  item: CanvasDevtoolsMeasuredItem
  viewport: Viewport
}) {
  return (
    <span
      className="canvas-devtools__item-outline"
      data-item-type={item.type}
      style={rectStyleForBounds(viewport, item.bounds)}
    />
  )
}

function CanvasDevtoolsDistanceMarker({
  distance,
  viewport,
}: {
  distance: CanvasDevtoolsDistance
  viewport: Viewport
}) {
  const start = getCanvasViewportScreenPoint(viewport, distance.start)
  const end = getCanvasViewportScreenPoint(viewport, distance.end)
  const left = Math.min(start.x, end.x)
  const top = Math.min(start.y, end.y)
  const width = Math.max(1, Math.abs(end.x - start.x))
  const height = Math.max(1, Math.abs(end.y - start.y))
  const labelPoint = {
    x: left + width / 2,
    y: top + height / 2,
  }

  return (
    <>
      <span
        className={`canvas-devtools__distance canvas-devtools__distance--${distance.axis}`}
        style={distanceStyle({ h: height, w: width, x: left, y: top })}
      />
      <span
        className="canvas-devtools__distance-label"
        style={pointStyle(labelPoint)}
      >
        {formatNumber(distance.gap)}
      </span>
    </>
  )
}

function rectStyleForBounds(
  viewport: Viewport,
  bounds: Bounds,
): CanvasDevtoolsRectStyle {
  const screenBounds = getCanvasViewportScreenBounds(viewport, bounds)

  return {
    '--canvas-devtools-rect-h': `${screenBounds.h}px`,
    '--canvas-devtools-rect-w': `${screenBounds.w}px`,
    '--canvas-devtools-rect-x': `${screenBounds.x}px`,
    '--canvas-devtools-rect-y': `${screenBounds.y}px`,
  }
}

function labelStyleForBounds(
  viewport: Viewport,
  bounds: Bounds,
): CanvasDevtoolsPointStyle {
  const screenBounds = getCanvasViewportScreenBounds(viewport, bounds)

  return pointStyle({
    x: screenBounds.x + screenBounds.w,
    y: screenBounds.y,
  })
}

function pointStyleForBoundsOrigin(
  viewport: Viewport,
  bounds: Bounds,
): CanvasDevtoolsPointStyle {
  const screenBounds = getCanvasViewportScreenBounds(viewport, bounds)

  return pointStyle({
    x: screenBounds.x,
    y: screenBounds.y,
  })
}

function distanceStyle(bounds: Bounds): CanvasDevtoolsDistanceStyle {
  return {
    '--canvas-devtools-distance-h': `${bounds.h}px`,
    '--canvas-devtools-distance-w': `${bounds.w}px`,
    '--canvas-devtools-distance-x': `${bounds.x}px`,
    '--canvas-devtools-distance-y': `${bounds.y}px`,
  }
}

function pointStyle(point: { x: number; y: number }): CanvasDevtoolsPointStyle {
  return {
    '--canvas-devtools-point-x': `${point.x}px`,
    '--canvas-devtools-point-y': `${point.y}px`,
  }
}

function formatScale(scale: number) {
  return `${Math.round(scale * 100)}%`
}

function formatSize(bounds: Bounds) {
  return `${formatNumber(bounds.w)} x ${formatNumber(bounds.h)}`
}

function getCanvasDevtoolsModeLabel(mode: CanvasDevtoolsMode) {
  if (mode === 'inspect') {
    return 'Inspect'
  }

  if (mode === 'measure') {
    return 'Measure'
  }

  if (mode === 'notes') {
    return 'Notes'
  }

  return 'Off'
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}
