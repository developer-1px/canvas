type CanvasStampControlItem = Readonly<{
  label: string
  stamp: string
  title: string
}>

export type CanvasStampControlsProps = {
  canInsertStamp: boolean
  stamps: readonly CanvasStampControlItem[]
  onInsertStamp: (stamp: CanvasStampControlItem) => void
}

export function CanvasStampControls({
  canInsertStamp,
  stamps,
  onInsertStamp,
}: CanvasStampControlsProps) {
  return (
    <div className="stamp-controls" aria-label="Stamp controls">
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
