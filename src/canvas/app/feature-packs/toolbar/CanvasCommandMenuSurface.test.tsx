import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { createCanvasAffordanceConfig } from '../../../engine'
import { CanvasCommandMenuSurface } from './CanvasCommandMenuSurface'
import type { CanvasToolbarItemRenderContext } from './CanvasToolbarItemRenderer'

describe('CanvasCommandMenuSurface', () => {
  it('renders menu surface and item semantics from the menu descriptor contract', () => {
    const markup = renderToStaticMarkup(
      <CanvasCommandMenuSurface
        ariaLabel="Canvas context commands"
        className="context-command-menu"
        context={createContext()}
        groups={[
          {
            id: 'alignment',
            items: [{
              action: { kind: 'align', mode: 'alignCenter' },
              command: 'alignCenter',
              disabled: false,
              kind: 'command',
            }],
          },
          {
            id: 'custom-commands',
            items: [{
              ariaLabel: 'Publish',
              disabled: true,
              id: 'publish',
              kind: 'custom-command',
              label: 'P',
              title: 'Publish',
            }],
          },
        ]}
        onClose={vi.fn()}
      />,
    )

    expect(markup).toContain('role="menu"')
    expect(markup).toContain('aria-label="Canvas context commands"')
    expect(markup).toContain('data-canvas-menu-item=""')
    expect(markup).toContain('role="menuitem"')
    expect(markup).toContain('aria-disabled="true"')
    expect(markup).toContain('role="separator"')
  })
})

function createContext(): CanvasToolbarItemRenderContext {
  return {
    commandHandlers: {
      onAlign: vi.fn(),
      onDelete: vi.fn(),
      onDistribute: vi.fn(),
      onDuplicate: vi.fn(),
      onGroup: vi.fn(),
      onLock: vi.fn(),
      onRedo: vi.fn(),
      onReorder: vi.fn(),
      onUndo: vi.fn(),
      onUngroup: vi.fn(),
      onUnlockAll: vi.fn(),
    },
    config: createCanvasAffordanceConfig(),
    onCustomCommand: vi.fn(),
    onToolChange: vi.fn(),
  }
}
