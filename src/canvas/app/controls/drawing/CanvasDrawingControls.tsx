export type CanvasDrawingControlStyle = Readonly<{
  opacity: number
  stroke: string
  strokeWidth: number
}>

export type CanvasDrawingControlsProps = {
  colorOptions: readonly string[]
  opacityMax: number
  opacityMin: number
  opacityStep: number
  style: CanvasDrawingControlStyle | null
  toolLabel: string
  widthOptions: readonly number[]
  onOpacityChange: (opacity: number) => void
  onStrokeChange: (stroke: string) => void
  onStrokeWidthChange: (strokeWidth: number) => void
}

export function CanvasDrawingControls({
  colorOptions,
  opacityMax,
  opacityMin,
  opacityStep,
  style,
  toolLabel,
  widthOptions,
  onOpacityChange,
  onStrokeChange,
  onStrokeWidthChange,
}: CanvasDrawingControlsProps) {
  if (!style) {
    return null
  }

  return (
    <div className="drawing-controls" aria-label={`${toolLabel} controls`}>
      <div className="drawing-swatches">
        {colorOptions.map((color) => (
          <button
            key={color}
            type="button"
            className="drawing-swatch"
            aria-label={`${toolLabel} color ${color}`}
            aria-pressed={style.stroke === color}
            title={color}
            style={{ background: color }}
            onClick={() => onStrokeChange(color)}
          />
        ))}
      </div>
      <div className="drawing-widths">
        {widthOptions.map((strokeWidth) => (
          <button
            key={strokeWidth}
            type="button"
            className="drawing-width-button"
            aria-label={`${toolLabel} width ${strokeWidth}`}
            aria-pressed={style.strokeWidth === strokeWidth}
            title={`${strokeWidth}px`}
            onClick={() => onStrokeWidthChange(strokeWidth)}
          >
            <span
              className="drawing-width-mark"
              style={{ height: Math.min(strokeWidth, 18) }}
            />
          </button>
        ))}
      </div>
      <input
        type="range"
        className="drawing-opacity"
        aria-label={`${toolLabel} opacity`}
        title="Opacity"
        min={opacityMin}
        max={opacityMax}
        step={opacityStep}
        value={style.opacity}
        onChange={(event) => onOpacityChange(event.currentTarget.valueAsNumber)}
      />
    </div>
  )
}
