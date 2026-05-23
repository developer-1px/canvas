import { describe, expect, it } from 'vitest'
import {
  assertCanvasAppCustomCreationToolShortcuts,
  getCanvasAppCustomCreationTool,
  getCanvasAppCustomCreationToolStates,
  getCanvasAppCustomToolShortcutKey,
  getCanvasAppCustomToolId,
  matchesCanvasAppCustomToolShortcut,
  type CanvasAppCustomCreationTool,
} from './CanvasAppCustomCreationTools'

const tool: CanvasAppCustomCreationTool = {
  id: 'risk',
  label: '!',
  title: 'Risk',
  shortcut: { key: 'e', shiftKey: true },
  createItem: ({ createId, startWorld }) => ({
    id: createId('risk'),
    type: 'rect',
    x: startWorld.x,
    y: startWorld.y,
    w: 120,
    h: 80,
    fill: '#fff7ed',
    stroke: '#fb923c',
  }),
}

describe('CanvasAppCustomCreationTools', () => {
  it('creates externally usable custom tool states', () => {
    expect(getCanvasAppCustomCreationToolStates([tool])).toEqual([
      {
        ariaLabel: 'Risk tool',
        id: 'custom:risk',
        label: '!',
        shortcut: { key: 'e', shiftKey: true },
        statusLabel: 'Risk',
        title: 'Risk (Shift+E)',
      },
    ])
  })

  it('looks up custom creation tools by prefixed tool id', () => {
    expect(
      getCanvasAppCustomCreationTool([tool], getCanvasAppCustomToolId('risk')),
    ).toBe(tool)
  })

  it('matches custom tool keyboard shortcuts exactly', () => {
    expect(
      matchesCanvasAppCustomToolShortcut({
        event: { key: 'E', shiftKey: true } as KeyboardEvent,
        shortcut: { key: 'e', shiftKey: true },
      }),
    ).toBe(true)
    expect(
      matchesCanvasAppCustomToolShortcut({
        event: { key: 'e', shiftKey: false } as KeyboardEvent,
        shortcut: { key: 'e', shiftKey: true },
      }),
    ).toBe(false)
  })

  it('normalizes custom tool shortcut keys', () => {
    expect(getCanvasAppCustomToolShortcutKey({ key: 'E', shiftKey: true }))
      .toBe('shift+e')
    expect(getCanvasAppCustomToolShortcutKey({ key: 'e' })).toBe('e')
  })

  it('rejects duplicate custom tool shortcuts', () => {
    expect(() =>
      assertCanvasAppCustomCreationToolShortcuts([
        tool,
        {
          ...tool,
          id: 'dependency',
        },
      ]),
    ).toThrow(
      'Duplicate canvas app custom creation tool shortcut: risk and dependency use Shift+E',
    )
  })

  it('rejects built-in canvas shortcut conflicts', () => {
    expect(() =>
      assertCanvasAppCustomCreationToolShortcuts([
        {
          ...tool,
          shortcut: { key: 'r' },
        },
      ]),
    ).toThrow(
      'Canvas app custom creation tool shortcut conflicts with rectangle tool: risk uses R',
    )
  })
})
