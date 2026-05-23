import { describe, expect, it } from 'vitest'
import {
  CANVAS_COMMAND_AFFORDANCES,
  CANVAS_GESTURE_STATUS_LABELS,
  CANVAS_TOOL_AFFORDANCE_ORDER,
  CANVAS_TOOL_AFFORDANCES,
} from './CanvasAffordances'
import { CANVAS_AFFORDANCE_CONFIG_DEFAULTS } from './CanvasAffordanceCatalog'

describe('CanvasAffordanceMetadata', () => {
  it('keeps built-in tool order in the Engine affordance metadata', () => {
    expect(CANVAS_TOOL_AFFORDANCE_ORDER).toEqual([
      'select',
      'pan',
      'rect',
      'text',
      'marker',
      'highlight',
      'arrow',
    ])
    expect(new Set(CANVAS_TOOL_AFFORDANCE_ORDER).size).toBe(
      CANVAS_TOOL_AFFORDANCE_ORDER.length,
    )

    for (const tool of CANVAS_TOOL_AFFORDANCE_ORDER) {
      expect(CANVAS_AFFORDANCE_CONFIG_DEFAULTS.tools).toHaveProperty(tool)
      expect(CANVAS_TOOL_AFFORDANCES).toHaveProperty(tool)
      expect(CANVAS_AFFORDANCE_CONFIG_DEFAULTS.shortcuts).toHaveProperty(
        CANVAS_TOOL_AFFORDANCES[tool].keyboardShortcut.shortcutId,
      )
    }

    expect(CANVAS_TOOL_AFFORDANCES.select.keyboardShortcut).toEqual({
      key: 'v',
      shiftInsensitive: true,
      shortcutId: 'selectTool',
    })
    expect(CANVAS_TOOL_AFFORDANCES.highlight.keyboardShortcut).toEqual({
      key: 'm',
      shiftKey: true,
      shortcutId: 'highlighterTool',
    })
  })

  it('snapshots public affordance metadata against runtime mutation', () => {
    expect(Object.isFrozen(CANVAS_TOOL_AFFORDANCE_ORDER)).toBe(true)
    expect(Object.isFrozen(CANVAS_TOOL_AFFORDANCES)).toBe(true)
    expect(Object.isFrozen(CANVAS_TOOL_AFFORDANCES.select)).toBe(true)
    expect(
      Object.isFrozen(CANVAS_TOOL_AFFORDANCES.select.keyboardShortcut),
    ).toBe(true)
    expect(Object.isFrozen(CANVAS_COMMAND_AFFORDANCES)).toBe(true)
    expect(Object.isFrozen(CANVAS_COMMAND_AFFORDANCES.delete)).toBe(true)
    expect(Object.isFrozen(CANVAS_GESTURE_STATUS_LABELS)).toBe(true)
  })
})
