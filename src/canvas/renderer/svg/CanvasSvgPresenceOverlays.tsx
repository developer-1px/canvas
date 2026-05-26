import type { CanvasOverlayState } from '../../engine'
import type { Bounds } from '../../core'

type CanvasSvgPresenceOverlay = NonNullable<CanvasOverlayState['presence']>[number]

export function CanvasSvgPresenceOverlays({
  presence,
  scale,
}: {
  presence: readonly CanvasSvgPresenceOverlay[]
  scale: number
}) {
  return (
    <g className="presence-overlays">
      {presence.map((entry) =>
        entry.selectionBounds ? (
          <CanvasSvgPresenceSelection
            key={`${entry.id}-selection`}
            bounds={entry.selectionBounds}
            color={entry.color}
            label={entry.label}
            scale={scale}
          />
        ) : null,
      )}
      {presence.map((entry) => (
        <CanvasSvgPresenceCursor
          key={entry.id}
          color={entry.color}
          label={entry.label}
          scale={scale}
          x={entry.point.x}
          y={entry.point.y}
        />
      ))}
    </g>
  )
}

function CanvasSvgPresenceSelection({
  bounds,
  color,
  label,
  scale,
}: {
  bounds: Bounds
  color: string
  label: string
  scale: number
}) {
  const labelWidth = Math.max(36, label.length * 7 + 18)

  return (
    <g className="presence-selection">
      <rect
        className="presence-selection-rect"
        x={bounds.x}
        y={bounds.y}
        width={bounds.w}
        height={bounds.h}
        stroke={color}
        vectorEffect="non-scaling-stroke"
      />
      <g
        className="presence-selection-label"
        transform={`translate(${bounds.x} ${bounds.y}) scale(${scale})`}
      >
        <rect width={labelWidth} height="22" rx="5" fill={color} />
        <text className="presence-label-text" x="9" y="15">
          {label}
        </text>
      </g>
    </g>
  )
}

function CanvasSvgPresenceCursor({
  color,
  label,
  scale,
  x,
  y,
}: {
  color: string
  label: string
  scale: number
  x: number
  y: number
}) {
  const labelWidth = Math.max(36, label.length * 7 + 18)

  return (
    <g
      className="presence-cursor"
      transform={`translate(${x} ${y}) scale(${scale})`}
    >
      <path
        className="presence-cursor-pointer"
        d="M 0 0 L 0 22 L 6 16 L 10 26 L 15 24 L 10 14 L 19 14 Z"
        fill={color}
      />
      <g transform="translate(12 18)">
        <rect
          className="presence-label-bg"
          width={labelWidth}
          height="22"
          rx="5"
          fill={color}
        />
        <text className="presence-label-text" x="9" y="15">
          {label}
        </text>
      </g>
    </g>
  )
}
