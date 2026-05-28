import {
  defineCanvasAppCustomItemModule,
  type CanvasAppCustomItemModuleCreationTool,
  type CanvasAppCustomItemRendererStrategy,
  type CanvasAppInspectorPanel,
  type CanvasCustomItem,
} from '../../../canvas'
import './RiskCustomItemModule.css'

const riskItemRenderer: CanvasAppCustomItemRendererStrategy = ({ item }) => {
  const severity = String(item.data.severity ?? 'Risk')
  const tone = getRiskTone(severity)

  return (
    <g className="demo-risk-node" data-risk-severity={tone}>
      <rect
        className="component-card demo-risk-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="5"
        fill="#ffffff"
        stroke="#e3e8ef"
        vectorEffect="non-scaling-stroke"
      />
      <foreignObject
        x={item.x + 16}
        y={item.y + 14}
        width={item.w - 32}
        height="56"
      >
        <div className="demo-risk-text">
          <strong>{item.title}</strong>
          <span>{severity}</span>
        </div>
      </foreignObject>
    </g>
  )
}

const riskTool: CanvasAppCustomItemModuleCreationTool = {
  id: 'risk',
  label: '!',
  title: 'Risk',
  shortcut: { key: 'k', shiftKey: true },
  createItem: ({ currentWorld, moved, startWorld }) => {
    const bounds = moved
      ? {
          x: Math.min(startWorld.x, currentWorld.x),
          y: Math.min(startWorld.y, currentWorld.y),
          w: Math.max(128, Math.abs(currentWorld.x - startWorld.x)),
          h: Math.max(72, Math.abs(currentWorld.y - startWorld.y)),
        }
      : {
          x: startWorld.x,
          y: startWorld.y,
          w: 180,
          h: 92,
        }

    return {
      title: 'Risk',
      data: { severity: 'High' },
      ...bounds,
    }
  },
}

const riskInspectorPanel: CanvasAppInspectorPanel = {
  id: 'risk-meta',
  isVisible: ({ selectedItems }) =>
    selectedItems.some((item) => isRiskItem(item)),
  render: ({ selectedItems }) => {
    const risk = selectedItems.find(isRiskItem)

    return risk ? (
      <>
        <dt>Severity</dt>
        <dd>{String(risk.data.severity ?? '')}</dd>
      </>
    ) : null
  },
}

const RISK_CUSTOM_ITEM_MODULE = defineCanvasAppCustomItemModule({
  id: 'risk',
  presentation: 'risk-node',
  renderItem: riskItemRenderer,
  validateItem: (item) =>
    typeof item.data.severity === 'string',
  customCreationTools: [riskTool],
  inspectorPanels: [riskInspectorPanel],
})

export default RISK_CUSTOM_ITEM_MODULE

function isRiskItem(item: unknown): item is CanvasCustomItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'type' in item &&
    item.type === 'custom' &&
    'kind' in item &&
    item.kind === 'risk'
  )
}

function getRiskTone(severity: string) {
  const normalizedSeverity = severity.toLowerCase()

  if (normalizedSeverity.includes('high')) {
    return 'high'
  }

  if (normalizedSeverity.includes('medium')) {
    return 'medium'
  }

  return 'low'
}
