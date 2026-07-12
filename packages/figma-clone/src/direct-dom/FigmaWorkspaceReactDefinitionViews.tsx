import type { CSSProperties } from 'react'
import type {
  DesignJSONObject,
  ReactRegisteredDesignRenderProps,
} from '@interactive-os/canvas/react-design'

type FigmaWidgetProps = {
  readonly delta: string
  readonly label: string
  readonly value: string
}

export function FigmaWorkspaceStatCard({
  children,
  rootProps,
}: ReactRegisteredDesignRenderProps<DesignJSONObject>) {
  return <div {...rootProps}>{children}</div>
}

export function FigmaWorkspaceDealRow({
  children,
  rootProps,
}: ReactRegisteredDesignRenderProps<DesignJSONObject>) {
  return <article {...rootProps}>{children}</article>
}

export function FigmaHomeMetaCard({
  children,
  rootProps,
}: ReactRegisteredDesignRenderProps<DesignJSONObject>) {
  return <article {...rootProps}>{children}</article>
}

export function FigmaReactWidget({
  props,
  rootProps,
}: ReactRegisteredDesignRenderProps<FigmaWidgetProps>) {
  return (
    <div
      {...rootProps}
      style={{ ...WIDGET_CARD_STYLE, ...rootProps.style }}
    >
      <div style={WIDGET_TOP_STYLE}>
        <span>{props.label}</span>
        <em style={WIDGET_DELTA_STYLE}>{props.delta}</em>
      </div>
      <strong style={WIDGET_VALUE_STYLE}>{props.value}</strong>
      <div aria-hidden="true" style={WIDGET_CHART_STYLE}>
        <i style={createWidgetBarStyle('34%')} />
        <i style={createWidgetBarStyle('56%')} />
        <i style={createWidgetBarStyle('42%')} />
        <i style={createWidgetBarStyle('78%')} />
        <i style={createWidgetBarStyle('64%')} />
        <i style={createWidgetBarStyle('88%')} />
      </div>
    </div>
  )
}

export function FigmaWorkspaceFailingDefinition(): never {
  throw new Error('Intentional Figma workspace definition failure')
}

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
