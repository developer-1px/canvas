import type { CanvasComponentItem } from '../../entities'
import {
  CanvasDemoSvgComponentHeader,
  CanvasDemoSvgText,
} from './CanvasDemoSvgComponentText'

export function CanvasDemoSvgChecklistComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  const rows = item.items ?? []

  return (
    <>
      <rect
        className="component-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="8"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <CanvasDemoSvgComponentHeader item={item} />
      {rows.map((row, index) => {
        const y = item.y + 50 + index * 28

        return (
          <g key={row}>
            <rect
              x={item.x + 18}
              y={y}
              width="14"
              height="14"
              rx="3"
              fill="none"
              stroke={item.accent}
              vectorEffect="non-scaling-stroke"
            />
            {index === 0 ? (
              <path
                d={`M ${item.x + 21} ${y + 7} L ${item.x + 25} ${y + 11} L ${
                  item.x + 31
                } ${y + 3}`}
                fill="none"
                stroke={item.accent}
                strokeWidth="1.8"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
            <CanvasDemoSvgText x={item.x + 42} y={y + 12} text={row} />
          </g>
        )
      })}
    </>
  )
}

export function CanvasDemoSvgKanbanComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  const rows = item.items ?? []

  return (
    <>
      <rect
        className="component-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="8"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <CanvasDemoSvgComponentHeader item={item} />
      {rows.map((row, index) => (
        <g key={row}>
          <rect
            x={item.x + 14}
            y={item.y + 48 + index * 40}
            width={item.w - 28}
            height="28"
            rx="5"
            fill="#ffffff"
            stroke="#e2e8f0"
            vectorEffect="non-scaling-stroke"
          />
          <CanvasDemoSvgText x={item.x + 26} y={item.y + 66 + index * 40} text={row} />
        </g>
      ))}
    </>
  )
}

export function CanvasDemoSvgTableComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  const cols = 3
  const rows = 3
  const cellW = item.w / cols
  const cellH = item.h / rows

  return (
    <>
      <rect
        className="component-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="6"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <rect x={item.x} y={item.y} width={item.w} height={cellH} fill="#ecfeff" />
      {[1, 2].map((index) => (
        <line
          key={`col-${index}`}
          x1={item.x + cellW * index}
          y1={item.y}
          x2={item.x + cellW * index}
          y2={item.y + item.h}
          stroke="#cbd5e1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {[1, 2].map((index) => (
        <line
          key={`row-${index}`}
          x1={item.x}
          y1={item.y + cellH * index}
          x2={item.x + item.w}
          y2={item.y + cellH * index}
          stroke="#cbd5e1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {(item.columns ?? []).map((column, index) => (
        <CanvasDemoSvgText
          key={column}
          x={item.x + cellW * index + 12}
          y={item.y + 26}
          text={column}
          strong
        />
      ))}
      {(item.items ?? []).map((cell, index) => (
        <CanvasDemoSvgText
          key={`${cell}-${index}`}
          x={item.x + cellW * (index % 3) + 12}
          y={item.y + cellH * (Math.floor(index / 3) + 1) + 26}
          text={cell}
        />
      ))}
    </>
  )
}
