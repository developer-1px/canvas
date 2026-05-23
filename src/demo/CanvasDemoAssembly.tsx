import {
  createCanvasAppAssembly,
  createCanvasDemoSvgCustomItemRenderers,
  defineCanvasAppCustomItemModule,
  type CanvasAppCustomCreationTool,
  type CanvasAppInspectorPanel,
  type CanvasDemoSvgCustomItemRendererStrategy,
} from '../canvas/app/workflow'
import type { CanvasCustomItem } from '../canvas/entities'

const riskItemRenderer: CanvasDemoSvgCustomItemRendererStrategy = ({ item }) => {
  const severity = String(item.data.severity ?? 'Risk')

  return (
    <>
      <rect
        className="component-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="8"
        fill="#fff7ed"
        stroke="#fb923c"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={item.x + 24} cy={item.y + 24} r="11" fill="#ea580c" />
      <text
        x={item.x + 24}
        y={item.y + 29}
        fill="#ffffff"
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
        <div className="canvas-text canvas-risk-text">
          <strong>{item.title}</strong>
          <span>{severity}</span>
        </div>
      </foreignObject>
    </>
  )
}

const riskTool: CanvasAppCustomCreationTool = {
  id: 'risk',
  label: '!',
  title: 'Risk',
  shortcut: { key: 'e', shiftKey: true },
  createItem: ({ createId, currentWorld, moved, startWorld }) => {
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
      id: createId('risk'),
      type: 'custom',
      kind: 'risk',
      presentation: 'risk-node',
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

const riskModule = defineCanvasAppCustomItemModule({
  id: 'risk',
  customCreationTools: [riskTool],
  customItemRenderers: createCanvasDemoSvgCustomItemRenderers({
    'risk-node': riskItemRenderer,
  }),
  customItemValidators: {
    risk: (item) =>
      item.presentation === 'risk-node' &&
      typeof item.data.severity === 'string',
  },
  inspectorPanels: [riskInspectorPanel],
})

export const DEMO_CANVAS_APP_ASSEMBLY = createCanvasAppAssembly({
  customItemModules: [riskModule],
})

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
