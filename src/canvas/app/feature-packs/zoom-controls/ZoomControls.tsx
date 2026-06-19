import {
  CANVAS_COMMAND_AFFORDANCES,
  type CanvasAffordanceConfig,
} from '../../../engine'
import {
  getCanvasViewportScale,
  MAX_SCALE,
  MIN_SCALE,
} from '../../../core'
import { FitIcon, MinusIcon, PlusIcon } from '../../../ui/icons/CanvasIcons'
import {
  CANVAS_TOOLBAR_ITEM_PROPS,
  useCanvasToolbarRovingFocus,
} from '../toolbar'
import {
  getCanvasAppCommandAriaKeyshortcuts,
} from '../../affordances/commands/CanvasAppCommandRegistry'

export type ZoomControlsProps = {
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
  const toolbarRovingFocus = useCanvasToolbarRovingFocus<HTMLDivElement>()
  const viewportScale = getCanvasViewportScale({ scale })
  const canZoomOut = viewportScale > MIN_SCALE
  const canZoomIn = viewportScale < MAX_SCALE
  const hasZoomCommand =
    config.commands.zoomOut ||
    config.commands.zoomReset ||
    config.commands.fitView ||
    config.commands.zoomIn

  if (!hasZoomCommand) {
    return null
  }

  return (
    <div
      {...toolbarRovingFocus}
      className="zoom-controls"
      role="toolbar"
      aria-label="Zoom controls"
    >
      {config.commands.zoomOut ? (
        <button
          {...CANVAS_TOOLBAR_ITEM_PROPS}
          type="button"
          className="tool-button"
          aria-label={CANVAS_COMMAND_AFFORDANCES.zoomOut.ariaLabel}
          aria-keyshortcuts={getZoomControlAriaKeyshortcuts({
            config,
            id: 'viewport:zoom-out',
          })}
          aria-disabled={canZoomOut ? undefined : true}
          disabled={!canZoomOut}
          title={CANVAS_COMMAND_AFFORDANCES.zoomOut.title}
          onClick={onZoomOut}
        >
          <MinusIcon />
        </button>
      ) : null}
      {config.commands.zoomReset ? (
        <button
          {...CANVAS_TOOLBAR_ITEM_PROPS}
          type="button"
          className="zoom-value"
          aria-label={CANVAS_COMMAND_AFFORDANCES.zoomReset.ariaLabel}
          aria-keyshortcuts={getZoomControlAriaKeyshortcuts({
            config,
            id: 'viewport:reset-zoom',
          })}
          title={CANVAS_COMMAND_AFFORDANCES.zoomReset.title}
          onClick={onReset}
        >
          {Math.round(viewportScale * 100)}%
        </button>
      ) : null}
      {config.commands.fitView ? (
        <button
          {...CANVAS_TOOLBAR_ITEM_PROPS}
          type="button"
          className="tool-button"
          aria-label={CANVAS_COMMAND_AFFORDANCES.fitView.ariaLabel}
          aria-keyshortcuts={getZoomControlAriaKeyshortcuts({
            config,
            id: 'viewport:fit',
          })}
          title={CANVAS_COMMAND_AFFORDANCES.fitView.title}
          onClick={onFit}
        >
          <FitIcon />
        </button>
      ) : null}
      {config.commands.zoomIn ? (
        <button
          {...CANVAS_TOOLBAR_ITEM_PROPS}
          type="button"
          className="tool-button"
          aria-label={CANVAS_COMMAND_AFFORDANCES.zoomIn.ariaLabel}
          aria-keyshortcuts={getZoomControlAriaKeyshortcuts({
            config,
            id: 'viewport:zoom-in',
          })}
          aria-disabled={canZoomIn ? undefined : true}
          disabled={!canZoomIn}
          title={CANVAS_COMMAND_AFFORDANCES.zoomIn.title}
          onClick={onZoomIn}
        >
          <PlusIcon />
        </button>
      ) : null}
    </div>
  )
}

function getZoomControlAriaKeyshortcuts({
  config,
  id,
}: {
  config: CanvasAffordanceConfig
  id: string
}) {
  return getCanvasAppCommandAriaKeyshortcuts({ config, id })
}
