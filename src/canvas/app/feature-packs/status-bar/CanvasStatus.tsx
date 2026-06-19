export type CanvasStatusProps = {
  mode: string
  scalePercent?: number
  selectionLength: number
}

export function CanvasStatus({
  mode,
  scalePercent = 100,
  selectionLength,
}: CanvasStatusProps) {
  const selection =
    selectionLength === 0
      ? 'No selection'
      : selectionLength === 1
        ? '1 selected'
        : `${selectionLength} selected`
  const scale = `${scalePercent}%`

  return (
    <div
      className="canvas-status"
      aria-label={`${mode}, ${selection}, Zoom ${scale}`}
      aria-live="polite"
    >
      <span>{mode}</span>
      <span>{selection}</span>
      <span>{scale}</span>
    </div>
  )
}
