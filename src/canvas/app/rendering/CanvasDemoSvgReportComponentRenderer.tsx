import type { CanvasComponentItem } from '../../entities'
import {
  getCanvasChecklistItems,
  isCanvasChecklistItemChecked,
} from '../../host'
import { CanvasDemoSvgComponentHeader } from './CanvasDemoSvgComponentText'

type ScorecardMetric = {
  detail: string
  label: string
  value: string
}

type EvidenceRow = {
  signal: string
  source: string
  state: string
}

export function CanvasDemoSvgCommandCenterComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  const metrics = getCanvasScorecardMetrics(item)

  return (
    <>
      <rect
        className="command-center-card"
        data-item-id={item.id}
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="8"
        vectorEffect="non-scaling-stroke"
      />
      <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
        <div className="command-center" data-item-id={item.id}>
          <div className="command-center-header">
            <div className="command-center-title">{item.title}</div>
          </div>
          {item.body ? <div className="command-center-summary">{item.body}</div> : null}
          <div
            className="command-center-grid"
            style={{
              gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))`,
            }}
          >
            {metrics.map((metric) => (
              <div
                className="command-center-metric"
                data-tone={getReportMetricTone(metric)}
                key={metric.label}
              >
                <div className="command-center-value">{metric.value}</div>
                <div className="command-center-label">{metric.label}</div>
                <div className="command-center-detail">{metric.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </foreignObject>
    </>
  )
}

export function CanvasDemoSvgTraceMapComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  const rows = getCanvasEvidenceRows(item)

  return (
    <>
      <rect
        className="trace-map-card report-card"
        data-item-id={item.id}
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="7"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
        <div className="trace-map" data-item-id={item.id}>
          <div className="trace-map-header">
            <div className="trace-map-title">{item.title}</div>
          </div>
          <div className="trace-map-rows">
            {rows.map((row) => (
              <div
                className="trace-map-row"
                data-tone={getReportEvidenceTone(row.state)}
                key={`${row.source}-${row.signal}`}
              >
                <div className="trace-map-source">{row.source}</div>
                <div className="trace-map-signal">{row.signal}</div>
                <div className="trace-map-state">{row.state}</div>
              </div>
            ))}
          </div>
        </div>
      </foreignObject>
    </>
  )
}

export function CanvasDemoSvgReviewBoardComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  const rows = getCanvasChecklistItems(item)

  return (
    <>
      <rect
        className="review-board-card report-card"
        data-item-id={item.id}
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="7"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
        <div className="review-board" data-item-id={item.id}>
          <div className="review-board-header">
            <div className="review-board-title">{item.title}</div>
          </div>
          <div className="review-board-rows">
            {rows.map((row, index) => {
              const done = isCanvasChecklistItemChecked(item, index)

              return (
                <div
                  className="review-board-row"
                  data-done={done ? 'true' : undefined}
                  key={row}
                >
                  <span className="review-board-label">{row}</span>
                  <span className="review-board-state">
                    {done ? 'Closed' : 'Open'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </foreignObject>
    </>
  )
}

export function CanvasDemoSvgGateStripComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  const metrics = getCanvasScorecardMetrics(item)

  return (
    <>
      <rect
        className="gate-strip-card report-card"
        data-item-id={item.id}
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="7"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
        <div className="gate-strip" data-item-id={item.id}>
          <div className="gate-strip-header">
            <div className="gate-strip-title">{item.title}</div>
          </div>
          <div
            className="gate-strip-grid"
            style={{
              gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))`,
            }}
          >
            {metrics.map((metric) => (
              <div
                className="gate-strip-gate"
                data-tone={getReportMetricTone(metric)}
                key={metric.label}
              >
                <div className="gate-strip-value">{metric.value}</div>
                <div className="gate-strip-label">{metric.label}</div>
                <div className="gate-strip-detail">{metric.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </foreignObject>
    </>
  )
}

export function CanvasDemoSvgScorecardComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  const metrics = getCanvasScorecardMetrics(item)
  const tone = getReportScorecardTone(metrics)

  return (
    <>
      <ReportCardRect item={item} tone={tone} />
      <CanvasDemoSvgComponentHeader item={item} />
      <foreignObject
        x={item.x}
        y={item.y + 38}
        width={item.w}
        height={item.h - 38}
      >
        <div className="report-scorecard" data-item-id={item.id}>
          {item.body ? <div className="report-summary">{item.body}</div> : null}
          <div
            className="report-scorecard-grid"
            style={{
              gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))`,
            }}
          >
            {metrics.map((metric) => (
              <div
                className="report-metric"
                data-tone={getReportMetricTone(metric)}
                key={metric.label}
              >
                <div className="report-metric-value">{metric.value}</div>
                <div className="report-metric-label">{metric.label}</div>
                <div className="report-metric-detail">{metric.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </foreignObject>
    </>
  )
}

export function CanvasDemoSvgTimelineComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  const steps = getCanvasChecklistItems(item)
  const completed = item.checkedItems ?? []

  return (
    <>
      <ReportCardRect item={item} />
      <CanvasDemoSvgComponentHeader item={item} />
      <foreignObject
        x={item.x}
        y={item.y + 38}
        width={item.w}
        height={item.h - 38}
      >
        <div className="report-timeline" data-item-id={item.id}>
          <div className="report-timeline-track" />
          <div
            className="report-timeline-grid"
            style={{
              gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
            }}
          >
            {steps.map((step, index) => {
              const done = completed.includes(index)
              const active = !done && index === completed.length

              return (
                <div className="report-timeline-step" key={`${index}-${step}`}>
                  <div
                    className="report-timeline-dot"
                    data-active={active ? 'true' : undefined}
                    data-done={done ? 'true' : undefined}
                    style={{ borderColor: item.accent }}
                  >
                    {done ? '' : index + 1}
                  </div>
                  <div className="report-timeline-label">{step}</div>
                </div>
              )
            })}
          </div>
        </div>
      </foreignObject>
    </>
  )
}

export function CanvasDemoSvgQueueComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  const rows = getCanvasChecklistItems(item)

  return (
    <>
      <ReportCardRect item={item} />
      <CanvasDemoSvgComponentHeader item={item} />
      <foreignObject
        x={item.x}
        y={item.y + 38}
        width={item.w}
        height={item.h - 38}
      >
        <div className="report-queue" data-item-id={item.id}>
          {rows.map((row, index) => {
            const done = isCanvasChecklistItemChecked(item, index)

            return (
              <div
                className="report-queue-row"
                data-done={done ? 'true' : undefined}
                data-tone={done ? 'success' : 'open'}
                key={row}
              >
                <span className="report-queue-rank">{index + 1}</span>
                <span className="report-queue-label">{row}</span>
                <span className="report-queue-state">{done ? 'Done' : 'Open'}</span>
              </div>
            )
          })}
        </div>
      </foreignObject>
    </>
  )
}

export function CanvasDemoSvgEvidenceComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  const rows = getCanvasEvidenceRows(item)

  return (
    <>
      <ReportCardRect item={item} />
      <CanvasDemoSvgComponentHeader item={item} />
      <foreignObject
        x={item.x}
        y={item.y + 38}
        width={item.w}
        height={item.h - 38}
      >
        <div className="report-evidence" data-item-id={item.id}>
          {rows.map((row) => (
            <div
              className="report-evidence-row"
              data-tone={getReportEvidenceTone(row.state)}
              key={`${row.source}-${row.signal}`}
            >
              <div className="report-evidence-source">{row.source}</div>
              <div className="report-evidence-signal">{row.signal}</div>
              <div className="report-evidence-state">{row.state}</div>
            </div>
          ))}
        </div>
      </foreignObject>
    </>
  )
}

function ReportCardRect({
  item,
  tone = 'neutral',
}: {
  item: CanvasComponentItem
  tone?: string
}) {
  return (
    <rect
      className="component-card report-card"
      data-item-id={item.id}
      data-tone={tone}
      x={item.x}
      y={item.y}
      width={item.w}
      height={item.h}
      rx="5"
      fill={item.fill}
      stroke={item.stroke}
      vectorEffect="non-scaling-stroke"
    />
  )
}

function getCanvasScorecardMetrics(item: CanvasComponentItem): ScorecardMetric[] {
  const labels = item.columns ?? []
  const values = item.items ?? []

  return labels.map((label, index) => ({
    detail: values[index * 2 + 1] ?? '',
    label,
    value: values[index * 2] ?? '',
  }))
}

function getReportMetricTone(metric: ScorecardMetric) {
  const value = metric.value.toLowerCase()
  const detail = metric.detail.toLowerCase()
  const numericPercent = value.match(/^(\d+(?:\.\d+)?)%$/)

  if (
    value.includes('review') ||
    value.includes('warning') ||
    detail.includes('review') ||
    detail.includes('needs work') ||
    detail.includes('warning')
  ) {
    return 'warning'
  }

  if (numericPercent) {
    const percent = Number(numericPercent[1])

    if (percent < 70) {
      return 'danger'
    }

    if (percent < 85) {
      return 'warning'
    }

    return 'success'
  }

  if (value === 'pass' || value === '100%' || detail.includes('covered')) {
    return 'success'
  }

  return 'neutral'
}

function getReportScorecardTone(metrics: ScorecardMetric[]) {
  const tones = metrics.map(getReportMetricTone)

  if (tones.includes('danger')) {
    return 'danger'
  }

  if (tones.includes('warning')) {
    return 'warning'
  }

  if (tones.includes('success')) {
    return 'success'
  }

  return 'neutral'
}

function getReportEvidenceTone(state: string) {
  const normalizedState = state.toLowerCase()

  if (
    normalizedState.includes('verified') ||
    normalizedState.includes('linked') ||
    normalizedState.includes('logged') ||
    normalizedState.includes('ready')
  ) {
    return 'success'
  }

  if (
    normalizedState.includes('open') ||
    normalizedState.includes('new') ||
    normalizedState.includes('review')
  ) {
    return 'warning'
  }

  if (
    normalizedState.includes('blocked') ||
    normalizedState.includes('gap') ||
    normalizedState.includes('risk')
  ) {
    return 'danger'
  }

  return 'neutral'
}

function getCanvasEvidenceRows(item: CanvasComponentItem): EvidenceRow[] {
  const cells = item.items ?? []
  const rows: EvidenceRow[] = []

  for (let index = 0; index < cells.length; index += 3) {
    rows.push({
      signal: cells[index + 1] ?? '',
      source: cells[index] ?? '',
      state: cells[index + 2] ?? '',
    })
  }

  return rows
}
