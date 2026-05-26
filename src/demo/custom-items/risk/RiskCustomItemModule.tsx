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

  return (
    <>
      <rect
        className="component-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="7"
        fill="#fff4d6"
        stroke="#17202a"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={item.x + 24} cy={item.y + 24} r="11" fill="#d94b45" />
      <text
        x={item.x + 24}
        y={item.y + 29}
        fill="#fffef8"
        fontSize="16"
        fontWeight="700"
        textAnchor="middle"
      >
        !
      </text>
      <foreignObject
        x={item.x + 48}
        y={item.y + 14}
        width={item.w - 64}
        height="56"
      >
        <div className="demo-risk-text">
          <strong>{item.title}</strong>
          <span>{severity}</span>
        </div>
      </foreignObject>
    </>
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
        <dt>Kind</dt>
        <dd>{risk.kind}</dd>
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
