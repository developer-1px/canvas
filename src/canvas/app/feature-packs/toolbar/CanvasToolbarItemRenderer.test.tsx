import { isValidElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { createCanvasAffordanceConfig } from '../../../engine'
import {
  renderCanvasToolbarItem,
  type CanvasToolbarItemRenderContext,
} from './CanvasToolbarItemRenderer'

describe('CanvasToolbarItemRenderer', () => {
  it('renders built-in and custom tool items through toolbar buttons', () => {
    const context = createContext()
    const builtin = renderCanvasToolbarItem({
      context,
      item: {
        active: true,
        kind: 'builtin-tool',
        tool: 'rect',
      },
    })
    const custom = renderCanvasToolbarItem({
      context,
      item: {
        active: false,
        ariaLabel: 'Risk tool',
        kind: 'custom-tool',
        label: '!',
        shortcut: { key: 'k', shiftKey: true },
        title: 'Risk',
        tool: 'custom:risk',
      },
    })
    const builtinMarkup = renderToStaticMarkup(<>{builtin}</>)
    const customMarkup = renderToStaticMarkup(<>{custom}</>)

    expect(builtinMarkup).toContain('Rectangle')
    expect(builtinMarkup).toContain('aria-keyshortcuts="r"')
    expect(customMarkup).toContain('Risk tool')
    expect(customMarkup).toContain('aria-keyshortcuts="Shift+K"')
    clickRenderedItem(builtin)
    clickRenderedItem(custom)

    expect(context.onToolChange).toHaveBeenCalledWith('rect')
    expect(context.onToolChange).toHaveBeenCalledWith('custom:risk')
  })

  it('renders built-in and custom command items through command runners', () => {
    const context = createContext()
    const command = renderCanvasToolbarItem({
      context,
      item: {
        action: { kind: 'duplicate' },
        command: 'duplicate',
        disabled: false,
        kind: 'command',
      },
    })
    const customCommand = renderCanvasToolbarItem({
      context,
      item: {
        ariaLabel: 'Publish',
        disabled: true,
        id: 'publish',
        kind: 'custom-command',
        label: 'P',
        title: 'Publish',
      },
    })

    expect(renderToStaticMarkup(<>{command}</>)).toContain('Duplicate')
    expect(renderToStaticMarkup(<>{command}</>))
      .toContain('aria-keyshortcuts="Meta+d"')
    expect(renderToStaticMarkup(<>{customCommand}</>)).toContain('Publish')
    clickRenderedItem(command)
    clickRenderedItem(customCommand)

    expect(context.commandHandlers.onDuplicate).toHaveBeenCalledTimes(1)
    expect(context.onCustomCommand).toHaveBeenCalledWith('publish')
  })
})

function clickRenderedItem(item: unknown) {
  if (!isValidElement<{ onClick: () => void }>(item)) {
    throw new Error('Expected toolbar item element')
  }

  item.props.onClick()
}

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
