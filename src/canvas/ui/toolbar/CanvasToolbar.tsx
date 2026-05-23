import { Fragment } from 'react'
import {
  type CanvasAffordanceConfig,
  type CanvasCommandAvailability,
} from '../../engine'
import type { Tool } from '../../entities'
import { ToolbarDivider } from './CanvasToolbarButtons'
import {
  getCanvasToolbarGroups,
  type CanvasToolbarCustomCommand,
  type CanvasToolbarCustomTool,
} from './CanvasToolbarItems'
import {
  renderCanvasToolbarItem,
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
    onCustomCommand: props.onCustomCommand,
    onToolChange: props.onToolChange,
  }

  return (
    <div className="toolbar" role="toolbar" aria-label="Tools">
      {groups.map((group, index) => (
        <Fragment key={group.id}>
          {index > 0 ? <ToolbarDivider /> : null}
          {group.items.map((item) =>
            renderCanvasToolbarItem({ context: renderContext, item }),
          )}
        </Fragment>
      ))}
    </div>
  )
}
