type CanvasStatusProps = {
  mode: string
  scale: number
  selectionLength: number
}

export function CanvasStatus({
  mode,
  scale,
  selectionLength,
}: CanvasStatusProps) {
  const selection =
    selectionLength === 0
      ? 'No selection'
      : selectionLength === 1
        ? '1 selected'
        : `${selectionLength} selected`

  return (
    <div className="canvas-status" aria-live="polite">
      <span>{mode}</span>
      <span>{selection}</span>
      <span>{Math.round(scale * 100)}%</span>
    </div>
  )
}
