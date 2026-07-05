import type { CSSProperties } from 'react'
import {
  type CanvasCustomItem,
  type CanvasJsonObject,
} from '../../../../src/canvas'
import {
  defineCanvasAppReactWidgetModule,
} from '../../../../src/canvas/app/authoring'

export const FIGMA_CLONE_WIDGET_KIND = 'figma-clone-react-widget'
export const FIGMA_CLONE_WIDGET_PRESENTATION = 'figma-clone-widget-card'

export type FigmaCloneWidgetData = CanvasJsonObject & {
  delta: string
  label: string
  value: string
}

export function createFigmaCloneWidgetItem(): CanvasCustomItem {
  return {
    data: {
      delta: '+12.4%',
      label: 'Activation',
      value: '84.2',
    },
    h: 176,
    id: 'figma-widget-frame',
    kind: FIGMA_CLONE_WIDGET_KIND,
    presentation: FIGMA_CLONE_WIDGET_PRESENTATION,
    title: 'React widget',
    type: 'custom',
    w: 280,
    x: -360,
    y: 128,
  }
}

export const FIGMA_CLONE_WIDGET_MODULE =
  defineCanvasAppReactWidgetModule<FigmaCloneWidgetData>({
    defaultData: {
      delta: '+12.4%',
      label: 'Activation',
      value: '84.2',
    },
    defaultSize: { h: 176, w: 280 },
    id: FIGMA_CLONE_WIDGET_KIND,
    label: 'Widget',
    presentation: FIGMA_CLONE_WIDGET_PRESENTATION,
    tool: false,
    render: ({ data }) => (
      <div style={WIDGET_CARD_STYLE}>
        <div style={WIDGET_TOP_STYLE}>
          <span>{data.label}</span>
          <em style={WIDGET_DELTA_STYLE}>{data.delta}</em>
        </div>
        <strong style={WIDGET_VALUE_STYLE}>{data.value}</strong>
        <div style={WIDGET_CHART_STYLE} aria-hidden="true">
          <i style={createWidgetBarStyle('34%')} />
          <i style={createWidgetBarStyle('56%')} />
          <i style={createWidgetBarStyle('42%')} />
          <i style={createWidgetBarStyle('78%')} />
          <i style={createWidgetBarStyle('64%')} />
          <i style={createWidgetBarStyle('88%')} />
        </div>
      </div>
    ),
    title: 'React widget',
    validateData: (data): data is FigmaCloneWidgetData =>
      typeof data.label === 'string' &&
      typeof data.value === 'string' &&
      typeof data.delta === 'string',
  })

const WIDGET_CARD_STYLE = {
  background: '#ffffff',
  border: '1px solid #d3d8df',
  borderRadius: 12,
  boxSizing: 'border-box',
  color: '#172033',
  display: 'grid',
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  gap: 14,
  gridTemplateRows: 'auto auto 1fr',
  height: '100%',
  padding: 18,
  width: '100%',
} satisfies CSSProperties

const WIDGET_TOP_STYLE = {
  alignItems: 'center',
  color: '#5f6773',
  display: 'flex',
  fontSize: 12,
  fontWeight: 650,
  gap: 8,
  justifyContent: 'space-between',
} satisfies CSSProperties

const WIDGET_DELTA_STYLE = {
  color: '#15803d',
  fontStyle: 'normal',
} satisfies CSSProperties

const WIDGET_VALUE_STYLE = {
  fontSize: 44,
  lineHeight: 0.95,
} satisfies CSSProperties

const WIDGET_CHART_STYLE = {
  alignItems: 'end',
  display: 'flex',
  gap: 8,
} satisfies CSSProperties

function createWidgetBarStyle(height: string): CSSProperties {
  return {
    background: '#2563eb',
    borderRadius: '4px 4px 0 0',
    flex: '1 1 0',
    height,
  }
}
