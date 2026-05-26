import type { CSSProperties } from 'react'

type CanvasStampControlItem = Readonly<{
  label: string
  stamp: string
  title: string
}>

type CanvasStampControlsAnchor = Readonly<{
  x: number
  y: number
}>

export type CanvasStampControlsProps = {
  anchor: CanvasStampControlsAnchor | null
  canInsertStamp: boolean
  stamps: readonly CanvasStampControlItem[]
  onInsertStamp: (stamp: CanvasStampControlItem) => void
}

export function CanvasStampControls({
  anchor,
  canInsertStamp,
  stamps,
  onInsertStamp,
}: CanvasStampControlsProps) {
  return (
    <div
      className="stamp-controls"
      data-anchored={anchor ? true : undefined}
      aria-label="Stamp controls"
      style={getCanvasStampControlsStyle(anchor)}
    >
      {stamps.map((stamp) => (
        <button
          key={stamp.stamp}
          type="button"
          className="stamp-button"
          disabled={!canInsertStamp}
          aria-label={stamp.title}
          title={stamp.title}
          onClick={() => onInsertStamp(stamp)}
        >
          <span className="stamp-button-label">{stamp.label}</span>
        </button>
      ))}
    </div>
  )
}

function getCanvasStampControlsStyle(
  anchor: CanvasStampControlsAnchor | null,
): CSSProperties | undefined {
  return anchor
    ? {
        left: anchor.x,
        top: anchor.y,
      }
    : undefined
}
