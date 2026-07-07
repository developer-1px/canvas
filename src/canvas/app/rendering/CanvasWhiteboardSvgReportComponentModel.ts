import type { CanvasComponentItem } from '../../entities'

export type ScorecardMetric = {
  detail: string
  label: string
  value: string
}

export type EvidenceRow = {
  signal: string
  source: string
  state: string
}

export function getCanvasScorecardMetrics(
  item: CanvasComponentItem,
): ScorecardMetric[] {
  const labels = item.columns ?? []
  const values = item.items ?? []

  return labels.map((label, index) => ({
    detail: values[index * 2 + 1] ?? '',
    label,
    value: values[index * 2] ?? '',
  }))
}

export function getReportMetricTone(metric: ScorecardMetric) {
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

export function getReportScorecardTone(metrics: ScorecardMetric[]) {
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

export function getReportEvidenceTone(state: string) {
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

export function getCanvasEvidenceRows(item: CanvasComponentItem): EvidenceRow[] {
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
