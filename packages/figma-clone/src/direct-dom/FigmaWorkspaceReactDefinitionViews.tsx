import type { CSSProperties } from 'react'
import type {
  ReactDesignDefinitionRenderProps,
} from '../../../../src/canvas/react-design-renderer'

export function FigmaWorkspaceStatCard({
  children,
  rootProps,
}: ReactDesignDefinitionRenderProps) {
  return <div {...rootProps}>{children}</div>
}

export function FigmaWorkspaceDealRow({
  children,
  rootProps,
}: ReactDesignDefinitionRenderProps) {
  return <article {...rootProps}>{children}</article>
}

export function FigmaHomeMetaCard({
  children,
  rootProps,
}: ReactDesignDefinitionRenderProps) {
  return <article {...rootProps}>{children}</article>
}

export function FigmaReactWidget({
  node,
  rootProps,
}: ReactDesignDefinitionRenderProps) {
  const label = readWidgetText(node.props.label, 'Activation')
  const value = readWidgetText(node.props.value, '84.2')
  const delta = readWidgetText(node.props.delta, '+12.4%')

  return (
    <div
      {...rootProps}
      style={{ ...WIDGET_CARD_STYLE, ...rootProps.style }}
    >
      <div style={WIDGET_TOP_STYLE}>
        <span>{label}</span>
        <em style={WIDGET_DELTA_STYLE}>{delta}</em>
      </div>
      <strong style={WIDGET_VALUE_STYLE}>{value}</strong>
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

function readWidgetText(value: unknown, fallback: string) {
  return typeof value === 'string' ? value : fallback
}
