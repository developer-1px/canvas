import { describe, expect, it } from 'vitest'
import {
  assertCanvasAppCustomCreationTools,
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
    expect(
      matchesCanvasAppCustomToolShortcut({
        event: { key: ' ', shiftKey: false } as KeyboardEvent,
        shortcut: { key: 'Space' },
      }),
    ).toBe(true)
  })

  it('normalizes custom tool shortcut keys', () => {
    expect(getCanvasAppCustomToolShortcutKey({ key: 'E', shiftKey: true }))
      .toBe('shift+e')
    expect(getCanvasAppCustomToolShortcutKey({ key: 'e' })).toBe('e')
    expect(getCanvasAppCustomToolShortcutKey({ key: ' ' })).toBe('space')
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

  it('rejects custom creation tool ids outside the app extension id contract', () => {
    expect(() =>
      assertCanvasAppCustomCreationTools([
        {
          ...tool,
          id: 'custom:risk',
        },
      ]),
    ).toThrow(
      'Invalid canvas app custom creation tool id: custom:risk',
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

  it('rejects shifted built-in shortcut conflicts consumed by the router', () => {
    expect(() =>
      assertCanvasAppCustomCreationToolShortcuts([
        {
          ...tool,
          shortcut: { key: 'v', shiftKey: true },
        },
      ]),
    ).toThrow(
      'Canvas app custom creation tool shortcut conflicts with select tool: risk uses Shift+V',
    )
  })

  it('rejects temporary pan and shifted nudge shortcut conflicts', () => {
    expect(() =>
      assertCanvasAppCustomCreationToolShortcuts([
        {
          ...tool,
          shortcut: { key: 'Space' },
        },
      ]),
    ).toThrow(
      'Canvas app custom creation tool shortcut conflicts with temporary pan: risk uses Space',
    )

    expect(() =>
      assertCanvasAppCustomCreationToolShortcuts([
        {
          ...tool,
          shortcut: { key: 'ArrowLeft', shiftKey: true },
        },
      ]),
    ).toThrow(
      'Canvas app custom creation tool shortcut conflicts with large nudge left: risk uses Shift+ArrowLeft',
    )
  })
})
