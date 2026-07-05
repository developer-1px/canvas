import {
  type CanvasCustomItem,
  type CanvasJsonObject,
} from '../../canvas'
import {
  defineCanvasAppReactWidgetModule,
} from '../../canvas/app/authoring'

export const METRIC_WIDGET_KIND = 'metric-widget'
export const METRIC_WIDGET_PRESENTATION = 'metric-widget-card'

export type MetricWidgetData = CanvasJsonObject & {
  label: string
  value: string
}

export function isMetricWidgetData(
  data: CanvasJsonObject,
): data is MetricWidgetData {
  return typeof data.label === 'string' && typeof data.value === 'string'
}

export function createMetricWidgetSeedItem(): CanvasCustomItem {
  return {
    data: { label: 'Active users', value: '1,284' },
    h: 96,
    id: 'engine-metric-widget',
    kind: METRIC_WIDGET_KIND,
    presentation: METRIC_WIDGET_PRESENTATION,
    title: 'Metric widget',
    type: 'custom',
    w: 188,
    x: 96,
    y: 470,
  }
}

export const METRIC_WIDGET_MODULE =
  defineCanvasAppReactWidgetModule<MetricWidgetData>({
    defaultData: { label: 'Active users', value: '1,284' },
    defaultSize: { h: 96, w: 188 },
    id: METRIC_WIDGET_KIND,
    label: 'Metric',
    presentation: METRIC_WIDGET_PRESENTATION,
    // Seeded directly in the demo; no extra toolbar creation tool.
    tool: false,
    render: ({ data, item }) => (
      <div
        data-metric-widget={item.id}
        style={{
          background: '#fff',
          border: '1px solid #d0d2cc',
          borderRadius: 6,
          boxSizing: 'border-box',
          color: '#1d2028',
          display: 'grid',
          fontFamily: 'Inter, system-ui, sans-serif',
          gridTemplateRows: '20px 1fr',
          height: '100%',
          padding: '14px 16px',
          width: '100%',
        }}
      >
        {/*
          Isolation self-probe: a widget's <style> must not escape its shadow
          root. If isolation regresses, this declaration would leak onto the
          document's .canvas-stage and the e2e would catch the leaked variable.
        */}
        <style>{':root,.canvas-stage{--metric-widget-leak:leaked}'}</style>
        <div style={{ color: '#39404c', fontSize: 12, fontWeight: 600 }}>
          {data.label}
        </div>
        <div style={{ alignSelf: 'center', fontSize: 28, fontWeight: 650, lineHeight: 1 }}>
          {data.value}
        </div>
      </div>
    ),
    title: 'Metric widget',
    validateData: isMetricWidgetData,
  })
