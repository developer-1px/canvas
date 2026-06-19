import {
  type CanvasAffordanceConfig,
  type CanvasCommandAvailability,
} from '../../../engine'
import type { Tool } from '../../../entities'
import { CanvasCommandSurface } from './CanvasCommandSurface'
import {
  getCanvasToolbarGroups,
  type CanvasToolbarCustomCommand,
  type CanvasToolbarCustomTool,
} from './CanvasToolbarItems'
import {
  type CanvasToolbarItemRenderContext,
} from './CanvasToolbarItemRenderer'

type CanvasToolbarProps = {
  commandAvailability: CanvasCommandAvailability
  config: CanvasAffordanceConfig
  customCommands: readonly CanvasToolbarCustomCommand[]
  customTools: readonly CanvasToolbarCustomTool[]
  tool: Tool
  commandHandlers: CanvasToolbarItemRenderContext['commandHandlers']
  onCustomCommand: CanvasToolbarItemRenderContext['onCustomCommand']
  onToolChange: CanvasToolbarItemRenderContext['onToolChange']
}

export function CanvasToolbar(props: CanvasToolbarProps) {
  const groups = getCanvasToolbarGroups(props)
  const renderContext: CanvasToolbarItemRenderContext = {
    commandHandlers: props.commandHandlers,
    config: props.config,
    onCustomCommand: props.onCustomCommand,
    onToolChange: props.onToolChange,
  }

  return (
    <CanvasCommandSurface
      ariaLabel="Tools"
      className="toolbar"
      context={renderContext}
      groups={groups}
      orientation="vertical"
    />
  )
}
