import {
  CANVAS_COMMAND_AFFORDANCES,
  type CanvasAffordanceConfig,
} from '../../engine/affordance/CanvasAffordances'
import { FitIcon, MinusIcon, PlusIcon } from '../icons/CanvasIcons'

type ZoomControlsProps = {
  config: CanvasAffordanceConfig
  scale: number
  onFit: () => void
  onReset: () => void
  onZoomIn: () => void
  onZoomOut: () => void
}

export function ZoomControls({
  config,
  scale,
  onFit,
  onReset,
  onZoomIn,
  onZoomOut,
}: ZoomControlsProps) {
  const hasZoomCommand =
    config.commands.zoomOut ||
    config.commands.zoomReset ||
    config.commands.fitView ||
    config.commands.zoomIn

  if (!hasZoomCommand) {
    return null
  }

  return (
    <div className="zoom-controls" role="toolbar" aria-label="Zoom controls">
      {config.commands.zoomOut ? (
        <button
          type="button"
          className="tool-button"
          aria-label={CANVAS_COMMAND_AFFORDANCES.zoomOut.ariaLabel}
          title={CANVAS_COMMAND_AFFORDANCES.zoomOut.title}
          onClick={onZoomOut}
        >
          <MinusIcon />
        </button>
      ) : null}
      {config.commands.zoomReset ? (
        <button
          type="button"
          className="zoom-value"
          aria-label={CANVAS_COMMAND_AFFORDANCES.zoomReset.ariaLabel}
          title={CANVAS_COMMAND_AFFORDANCES.zoomReset.title}
          onClick={onReset}
        >
          {Math.round(scale * 100)}%
        </button>
      ) : null}
      {config.commands.fitView ? (
        <button
          type="button"
          className="tool-button"
          aria-label={CANVAS_COMMAND_AFFORDANCES.fitView.ariaLabel}
          title={CANVAS_COMMAND_AFFORDANCES.fitView.title}
          onClick={onFit}
        >
          <FitIcon />
        </button>
      ) : null}
      {config.commands.zoomIn ? (
        <button
          type="button"
          className="tool-button"
          aria-label={CANVAS_COMMAND_AFFORDANCES.zoomIn.ariaLabel}
          title={CANVAS_COMMAND_AFFORDANCES.zoomIn.title}
          onClick={onZoomIn}
        >
          <PlusIcon />
        </button>
      ) : null}
    </div>
  )
}
