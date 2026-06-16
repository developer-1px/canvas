import { describe, expect, it } from 'vitest'
import { createCanvasAffordanceConfig } from '../../../engine'
import {
  getCanvasShortcutHelpItems,
  groupCanvasShortcutHelpItems,
} from './CanvasShortcutHelpItems'

describe('CanvasShortcutHelpItems', () => {
  it('derives command, tool, viewport, and system shortcuts from config', () => {
    const items = getCanvasShortcutHelpItems({
      config: createCanvasAffordanceConfig({
        commands: {
          delete: false,
          zoomIn: false,
        },
        gestures: {
          temporaryPan: false,
        },
        overlays: {
          cursorChat: false,
        },
        shortcuts: {
          duplicate: false,
        },
        tools: {
          marker: false,
        },
      }),
      customTools: [{
        ariaLabel: 'Risk tool',
        id: 'custom:risk',
        label: '!',
        shortcut: { key: 'k', shiftKey: true },
        statusLabel: 'Risk',
        title: 'Risk',
      }],
    })
    const itemIds = items.map((item) => item.id)

    expect(itemIds).toEqual(expect.arrayContaining([
      'tool:select',
      'tool:custom:risk',
      'command:undo',
      'viewport:fit',
      'system:shortcutHelp',
    ]))
    expect(itemIds).not.toEqual(expect.arrayContaining([
      'tool:marker',
      'command:delete',
      'command:duplicate',
      'viewport:zoom-in',
      'system:cursorChat',
      'system:temporaryPan',
    ]))
    expect(items.find((item) => item.id === 'tool:custom:risk'))
      .toMatchObject({ shortcut: 'Shift+K', title: 'Risk' })
  })

  it('groups sections in a stable compact order', () => {
    const groups = groupCanvasShortcutHelpItems([
      {
        id: 'system:shortcutHelp',
        section: 'System',
        shortcut: 'Shift+/',
        title: 'Keyboard shortcuts',
      },
      {
        id: 'tool:select',
        section: 'Tools',
        shortcut: 'V',
        title: 'Select Tool',
      },
    ])

    expect(groups.map((group) => group.section)).toEqual(['Tools', 'System'])
  })
})
