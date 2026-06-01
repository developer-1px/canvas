import type { CanvasComponentItem } from '../../entities'
import {
  getCanvasChecklistItems,
  isCanvasChecklistItemChecked,
} from '../../host'
import {
  getCanvasEvidenceRows,
  getCanvasScorecardMetrics,
  getReportEvidenceTone,
  getReportMetricTone,
} from './CanvasDemoSvgReportComponentModel'

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
