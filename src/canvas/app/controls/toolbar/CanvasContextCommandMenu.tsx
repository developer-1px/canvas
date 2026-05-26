import {
  useEffect,
  type CSSProperties,
} from 'react'
import {
  type CanvasAffordanceConfig,
  type CanvasCommandAvailability,
} from '../../../engine'
import { CanvasCommandSurface } from './CanvasCommandSurface'
import {
  getCanvasCommandSurfaceGroups,
  type CanvasToolbarCustomCommand,
} from './CanvasToolbarItems'
import type { CanvasToolbarItemRenderContext } from './CanvasToolbarItemRenderer'

export type CanvasContextCommandMenuState = {
  x: number
  y: number
}

type CanvasContextCommandMenuProps = {
  commandAvailability: CanvasCommandAvailability
  config: CanvasAffordanceConfig
  customCommands: readonly CanvasToolbarCustomCommand[]
  commandHandlers: CanvasToolbarItemRenderContext['commandHandlers']
  menu: CanvasContextCommandMenuState | null
  onClose: () => void
  onCustomCommand: CanvasToolbarItemRenderContext['onCustomCommand']
}

export function CanvasContextCommandMenu({
  commandAvailability,
  config,
  customCommands,
  commandHandlers,
  menu,
  onClose,
  onCustomCommand,
}: CanvasContextCommandMenuProps) {
  useEffect(() => {
    if (!menu) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Element &&
        event.target.closest('.context-command-menu')) {
        return
      }

      onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [menu, onClose])

  if (!menu) {
    return null
  }

  const groups = getCanvasCommandSurfaceGroups({
    commandAvailability,
    config,
    customCommands,
    surface: 'context-menu',
  })

  return (
    <CanvasCommandSurface
      ariaLabel="Canvas context commands"
      className="context-command-menu"
      context={{
        commandHandlers,
        onCustomCommand,
        onToolChange: noopToolChange,
      }}
      groups={groups}
      onClick={onClose}
      style={{
        '--canvas-context-menu-x': `${menu.x}px`,
        '--canvas-context-menu-y': `${menu.y}px`,
      } as CSSProperties}
    />
  )
}

function noopToolChange() {}
