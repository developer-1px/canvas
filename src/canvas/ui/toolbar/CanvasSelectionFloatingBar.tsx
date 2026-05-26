import type { CSSProperties } from 'react'
import {
  type CanvasAffordanceConfig,
  type CanvasCommandAvailability,
} from '../../engine'
import type { Point } from '../../entities'
import { ToolbarDivider } from './CanvasToolbarButtons'
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
  commandsVisible: boolean
  config: CanvasAffordanceConfig
  customCommands: readonly CanvasToolbarCustomCommand[]
  commandHandlers: CanvasToolbarItemRenderContext['commandHandlers']
  onCustomCommand: CanvasToolbarItemRenderContext['onCustomCommand']
  stampControls: CanvasSelectionStampControls
  visible: boolean
}

type CanvasSelectionStampControls = {
  canInsertStamp: boolean
  stamps: readonly CanvasSelectionStampItem[]
  visible: boolean
  onInsertStamp: (stamp: CanvasSelectionStampItem) => void
}

type CanvasSelectionStampItem = Readonly<{
  label: string
  stamp: string
  title: string
}>

export function CanvasSelectionFloatingBar({
  anchor,
  commandAvailability,
  commandsVisible,
  config,
  customCommands,
  commandHandlers,
  onCustomCommand,
  stampControls,
  visible,
}: CanvasSelectionFloatingBarProps) {
  if (!visible || !anchor) {
    return null
  }

  const groups = commandsVisible
    ? getCanvasCommandSurfaceGroups({
        commandAvailability,
        config,
        customCommands,
        surface: 'selection-floating-bar',
      })
    : []

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
    >
      {stampControls.visible ? (
        <>
          {groups.length > 0 ? <ToolbarDivider /> : null}
          <CanvasSelectionStampGroup {...stampControls} />
        </>
      ) : null}
    </CanvasCommandSurface>
  )
}

function CanvasSelectionStampGroup({
  canInsertStamp,
  stamps,
  onInsertStamp,
}: CanvasSelectionStampControls) {
  return (
    <span className="selection-stamp-group" role="group" aria-label="Stamps">
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
    </span>
  )
}

function noopToolChange() {}
