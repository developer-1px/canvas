import {
  useEffect,
  type CSSProperties,
} from 'react'
import {
  type CanvasAffordanceConfig,
  type CanvasCommandAvailability,
} from '../../../engine'
import { isCanvasTargetWithinSelector } from '../../affordances/interaction/dom/CanvasInteractionTarget'
import {
  CANVAS_CONTEXT_MENU_DEFAULT_SIZE,
  DEFAULT_CANVAS_CONTEXT_MENU_MARGIN,
} from '../../affordances/controls/context-menu/CanvasContextMenuPosition'
import { CanvasCommandMenuSurface } from './CanvasCommandMenuSurface'
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
      if (isCanvasTargetWithinSelector({
        selectors: '.context-command-menu',
        target: event.target,
      })) {
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
    <CanvasCommandMenuSurface
      ariaLabel="Canvas context commands"
      className="context-command-menu"
      context={{
        commandHandlers,
        config,
        onCustomCommand,
        onToolChange: noopToolChange,
      }}
      groups={groups}
      onClose={onClose}
      style={{
        '--canvas-context-menu-height':
          `${CANVAS_CONTEXT_MENU_DEFAULT_SIZE.height}px`,
        '--canvas-context-menu-margin':
          `${DEFAULT_CANVAS_CONTEXT_MENU_MARGIN}px`,
        '--canvas-context-menu-width':
          `${CANVAS_CONTEXT_MENU_DEFAULT_SIZE.width}px`,
        '--canvas-context-menu-x': `${menu.x}px`,
        '--canvas-context-menu-y': `${menu.y}px`,
      } as CSSProperties}
    />
  )
}

function noopToolChange() {}
