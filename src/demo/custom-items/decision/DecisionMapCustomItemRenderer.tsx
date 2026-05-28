import type { CanvasAppCustomItemRendererStrategy } from '../../../canvas'
import {
  getDecisionStatus,
  getDecisionText,
} from './DecisionMapCustomItemModel'
import { DECISION_STATUS_STYLES } from './DecisionMapCustomItemStyles'

export const decisionItemRenderer: CanvasAppCustomItemRendererStrategy = ({
  item,
}) => {
  const status = getDecisionStatus(item.data.status)
  const statusLabel = DECISION_STATUS_STYLES[status].label
  const option = getDecisionText(item.data.option, 'Option A')

  return (
    <g className="demo-decision-node" data-decision-status={status}>
      <rect
        className="component-card"
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
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
      >
        <div className="demo-decision-node-text">
          <strong>{item.title}</strong>
          <span>{statusLabel}</span>
          <small>{option}</small>
        </div>
      </foreignObject>
    </g>
  )
}
