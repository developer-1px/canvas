import type { CanvasComponentItem } from '../../entities'
import {
  getCanvasChecklistItems,
  getCanvasKanbanCards,
  getCanvasTableGrid,
  isCanvasChecklistItemChecked,
} from '../../host'
import {
  CanvasWhiteboardSvgComponentHeader,
  CanvasWhiteboardSvgText,
} from './CanvasWhiteboardSvgComponentText'

export function CanvasWhiteboardSvgChecklistComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  const rows = getCanvasChecklistItems(item)

  return (
    <>
      <rect
        className="component-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="5"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <CanvasWhiteboardSvgComponentHeader item={item} />
      {rows.map((row, index) => {
        const y = item.y + 48 + index * 24
        const checked = isCanvasChecklistItemChecked(item, index)

        return (
          <g key={`${index}-${row}`}>
            <rect
              x={item.x + 18}
              y={y}
              width="13"
              height="13"
              rx="3"
              fill="none"
              stroke={item.accent}
              vectorEffect="non-scaling-stroke"
            />
            {checked ? (
              <path
                d={`M ${item.x + 21} ${y + 7} L ${item.x + 25} ${y + 11} L ${
                  item.x + 30
                } ${y + 3}`}
                fill="none"
                stroke={item.accent}
                strokeWidth="1.8"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
            <CanvasWhiteboardSvgText x={item.x + 40} y={y + 11} text={row} />
          </g>
        )
      })}
    </>
  )
}

export function CanvasWhiteboardSvgKanbanComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  const rows = getCanvasKanbanCards(item)

  return (
    <>
      <rect
        className="component-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="5"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <CanvasWhiteboardSvgComponentHeader item={item} />
      {rows.map((row, index) => (
        <g key={`${index}-${row}`}>
          <rect
            x={item.x + 14}
            y={item.y + 48 + index * 40}
            width={item.w - 28}
            height="28"
            rx="5"
            fill="#fcfdff"
            stroke="#e7ecf3"
            vectorEffect="non-scaling-stroke"
          />
          <CanvasWhiteboardSvgText
            x={item.x + 26}
            y={item.y + 66 + index * 40}
            text={row}
          />
        </g>
      ))}
    </>
  )
}

export function CanvasWhiteboardSvgTableComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  const table = getCanvasTableGrid(item)
  const cols = table.columns.length
  const rows = 1 + table.bodyRows.length
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
        rx="5"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <rect x={item.x} y={item.y} width={item.w} height={cellH} fill="#fcfdff" />
      {Array.from({ length: rows - 1 }, (_, index) => index + 1).map((index) => (
        <line
          key={`row-${index}`}
          x1={item.x}
          y1={item.y + cellH * index}
          x2={item.x + item.w}
          y2={item.y + cellH * index}
          stroke="#eef3f8"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {table.columns.map((column, index) => (
        <CanvasWhiteboardSvgText
          key={column}
          x={item.x + cellW * index + 12}
          y={item.y + 26}
          text={column}
          strong
        />
      ))}
      {table.bodyRows.map((row, rowIndex) =>
        row.map((cell, columnIndex) => (
          <CanvasWhiteboardSvgText
            key={`${rowIndex}-${columnIndex}-${cell}`}
            x={item.x + cellW * columnIndex + 12}
            y={item.y + cellH * (rowIndex + 1) + 26}
            text={cell}
          />
        )),
      )}
    </>
  )
}
