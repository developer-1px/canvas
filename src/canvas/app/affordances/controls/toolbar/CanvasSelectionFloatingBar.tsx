import type { CSSProperties } from 'react'
import {
  type CanvasAffordanceConfig,
  type CanvasCommandAvailability,
} from '../../../../engine'
import type { Point } from '../../../../entities'
import { CanvasCommandSurface } from './CanvasCommandSurface'
import {
  getCanvasCommandSurfaceGroups,
  type CanvasToolbarCustomCommand,
} from './CanvasToolbarItems'
import type { CanvasToolbarItemRenderContext } from './CanvasToolbarItemRenderer'

export type CanvasSelectionCommandAnchor = Point & {
  placement: 'above' | 'below'
}

type CanvasSelectionFloatingBarProps = {
  anchor: CanvasSelectionCommandAnchor | null
  commandAvailability: CanvasCommandAvailability
  config: CanvasAffordanceConfig
  customCommands: readonly CanvasToolbarCustomCommand[]
  commandHandlers: CanvasToolbarItemRenderContext['commandHandlers']
  onCustomCommand: CanvasToolbarItemRenderContext['onCustomCommand']
  visible: boolean
}

export function CanvasSelectionFloatingBar({
  anchor,
  commandAvailability,
  config,
  customCommands,
  commandHandlers,
  onCustomCommand,
  visible,
}: CanvasSelectionFloatingBarProps) {
  if (!visible || !anchor) {
    return null
  }

  const groups = getCanvasCommandSurfaceGroups({
    commandAvailability,
    config,
    customCommands,
    surface: 'selection-floating-bar',
  })

  return (
    <CanvasCommandSurface
      ariaLabel="Selection actions"
      className="selection-floating-bar"
      context={{
        commandHandlers,
        onCustomCommand,
        onToolChange: noopToolChange,
      }}
      groups={groups}
      dataPlacement={anchor.placement}
      style={{
        '--canvas-selection-command-x': `${anchor.x}px`,
        '--canvas-selection-command-y': `${anchor.y}px`,
      } as CSSProperties}
    />
  )
}

function noopToolChange() {}
