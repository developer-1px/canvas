type CanvasStatusProps = {
  mode: string
  selectionLength: number
}

export function CanvasStatus({
  mode,
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
    </div>
  )
}
