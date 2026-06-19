import type { CSSProperties } from 'react'
import {
  type CanvasAffordanceConfig,
  type CanvasCommandAvailability,
} from '../../../engine'
import type { Point } from '../../../entities'
import { CanvasCommandSurface } from './CanvasCommandSurface'
import {
  getCanvasCommandSurfaceGroups,
  type CanvasToolbarCustomCommand,
} from './CanvasToolbarItems'
import type { CanvasToolbarItemRenderContext } from './CanvasToolbarItemRenderer'
import {
  getCanvasFloatingAnchorSurfaceCoordinateStyle,
  getCanvasFloatingAnchorSurfaceDescriptor,
} from '../../affordances/controls/floating-anchor/CanvasFloatingAnchor'

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

  const anchorSurface = getCanvasFloatingAnchorSurfaceDescriptor({
    anchor,
    xProperty: '--canvas-selection-command-x',
    yProperty: '--canvas-selection-command-y',
  })
  const anchorStyle = getCanvasFloatingAnchorSurfaceCoordinateStyle({
    anchor,
    xProperty: '--canvas-selection-command-x',
    yProperty: '--canvas-selection-command-y',
  })
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
        config,
        onCustomCommand,
        onToolChange: noopToolChange,
      }}
      groups={groups}
      dataPlacement={anchorSurface?.attributes['data-placement']}
      orientation="horizontal"
      style={anchorStyle as CSSProperties}
    />
  )
}

function noopToolChange() {}
