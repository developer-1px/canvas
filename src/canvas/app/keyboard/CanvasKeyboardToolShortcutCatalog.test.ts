import { describe, expect, it } from 'vitest'
import { CANVAS_KEYBOARD_TOOL_SHORTCUTS } from './CanvasKeyboardToolShortcutCatalog'

describe('CanvasKeyboardToolShortcutCatalog', () => {
  it('projects Engine tool affordance metadata into keyboard descriptors', () => {
    expect(CANVAS_KEYBOARD_TOOL_SHORTCUTS).toEqual([
      expect.objectContaining({
        label: 'select tool',
        shiftInsensitive: true,
        shortcut: { key: 'v' },
        shortcutId: 'selectTool',
        tool: 'select',
      }),
      expect.objectContaining({
        label: 'pan tool',
        shiftInsensitive: true,
        shortcut: { key: 'h' },
        shortcutId: 'panTool',
        tool: 'pan',
      }),
      expect.objectContaining({
        label: 'rectangle tool',
        shiftInsensitive: true,
        shortcut: { key: 'r' },
        shortcutId: 'rectTool',
        tool: 'rect',
      }),
      expect.objectContaining({
        label: 'text tool',
        shiftInsensitive: true,
        shortcut: { key: 't' },
        shortcutId: 'textTool',
        tool: 'text',
      }),
      expect.objectContaining({
        label: 'marker tool',
        shortcut: { key: 'm' },
        shortcutId: 'markerTool',
        tool: 'marker',
      }),
      expect.objectContaining({
        label: 'highlighter tool',
        shortcut: { key: 'm', shiftKey: true },
        shortcutId: 'highlighterTool',
        tool: 'highlight',
      }),
      expect.objectContaining({
        label: 'arrow tool',
        shiftInsensitive: true,
        shortcut: { key: 'l' },
        shortcutId: 'arrowTool',
        tool: 'arrow',
      }),
    ])
  })
})
