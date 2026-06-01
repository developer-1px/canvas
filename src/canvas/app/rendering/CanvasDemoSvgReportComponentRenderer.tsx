import type { CanvasComponentItem } from '../../entities'
import {
  getCanvasChecklistItems,
  isCanvasChecklistItemChecked,
} from '../../host'
import { CanvasDemoSvgComponentHeader } from './CanvasDemoSvgComponentText'
import {
  getCanvasEvidenceRows,
  getCanvasScorecardMetrics,
  getReportEvidenceTone,
  getReportMetricTone,
  getReportScorecardTone,
} from './CanvasDemoSvgReportComponentModel'

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
