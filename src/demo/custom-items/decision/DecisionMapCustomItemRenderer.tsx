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
  const style = DECISION_STATUS_STYLES[status]
  const option = getDecisionText(item.data.option, 'Option A')

  return (
    <g className="demo-decision-node" data-decision-status={status}>
      <rect
        className="component-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="7"
        fill={style.fill}
        stroke={style.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x={item.x}
        y={item.y}
        width="8"
        height={item.h}
        rx="3"
        fill={style.accent}
      />
      <foreignObject
        x={item.x + 10}
        y={item.y}
        width={Math.max(0, item.w - 10)}
        height={item.h}
      >
        <div className="demo-decision-node-text">
          <strong>{item.title}</strong>
          <span style={{ backgroundColor: style.accent }}>
            {style.label}
          </span>
          <small>{option}</small>
        </div>
      </foreignObject>
    </g>
  )
}
