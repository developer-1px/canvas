import { describe, expect, it } from 'vitest'
import {
  assertCanvasAppCustomCreationTools,
  assertCanvasAppCustomCreationToolShortcuts,
  getCanvasAppCustomToolId,
  getCanvasAppCustomToolShortcutKey,
  matchesCanvasAppCustomToolShortcut,
} from './CanvasAppCustomCreationToolContracts'
import type { CanvasAppCustomCreationTool } from './CanvasAppCustomCreationTools'
import {
  getCanvasAppCustomCreationTool,
  getCanvasAppCustomCreationToolStates,
} from './CanvasAppCustomCreationToolRuntime'

const tool: CanvasAppCustomCreationTool = {
  id: 'risk',
  label: '!',
  title: 'Risk',
  shortcut: { key: 'k', shiftKey: true },
  createItem: ({ createId, startWorld }) => ({
    id: createId('risk'),
    type: 'custom',
    kind: 'risk',
    presentation: 'risk-node',
    title: 'Risk',
    x: startWorld.x,
    y: startWorld.y,
    w: 120,
    h: 80,
    data: { severity: 'high' },
  }),
}

describe('CanvasAppCustomCreationTools', () => {
  it('creates externally usable custom tool states', () => {
    expect(getCanvasAppCustomCreationToolStates([tool])).toEqual([
      {
        ariaLabel: 'Risk tool',
        id: 'custom:risk',
        label: '!',
        shortcut: { key: 'k', shiftKey: true },
        statusLabel: 'Risk',
        title: 'Risk (Shift+K)',
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
        event: { key: 'K', shiftKey: true } as KeyboardEvent,
        shortcut: { key: 'k', shiftKey: true },
      }),
    ).toBe(true)
    expect(
      matchesCanvasAppCustomToolShortcut({
        event: { key: 'k', shiftKey: false } as KeyboardEvent,
        shortcut: { key: 'k', shiftKey: true },
      }),
    ).toBe(false)
    expect(
      matchesCanvasAppCustomToolShortcut({
        event: { key: ' ', shiftKey: false } as KeyboardEvent,
        shortcut: { key: 'Space' },
      }),
    ).toBe(true)
    expect(
      matchesCanvasAppCustomToolShortcut({
        event: {
          altKey: true,
          key: 'K',
          shiftKey: true,
        } as KeyboardEvent,
        shortcut: { key: 'k', shiftKey: true },
      }),
    ).toBe(false)
    expect(
      matchesCanvasAppCustomToolShortcut({
        event: {
          key: 'K',
          metaKey: true,
          shiftKey: true,
        } as KeyboardEvent,
        shortcut: { key: 'k', shiftKey: true },
      }),
    ).toBe(false)
  })

  it('normalizes custom tool shortcut keys', () => {
    expect(getCanvasAppCustomToolShortcutKey({ key: 'K', shiftKey: true }))
      .toBe('shift+k')
    expect(getCanvasAppCustomToolShortcutKey({ key: 'k' })).toBe('k')
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
      'Duplicate canvas app custom creation tool shortcut: risk and dependency use Shift+K',
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

  it('rejects malformed custom creation tool descriptors before registration', () => {
    expect(() =>
      assertCanvasAppCustomCreationTools({} as unknown as CanvasAppCustomCreationTool[]),
    ).toThrow('Canvas app custom creation tool descriptors must be an array')

    expect(() =>
      assertCanvasAppCustomCreationTools([
        {
          ...tool,
          label: undefined,
        } as unknown as CanvasAppCustomCreationTool,
      ]),
    ).toThrow('Canvas app custom creation tool risk requires label')

    expect(() =>
      assertCanvasAppCustomCreationTools([
        {
          ...tool,
          title: undefined,
        } as unknown as CanvasAppCustomCreationTool,
      ]),
    ).toThrow('Canvas app custom creation tool risk requires title')

    expect(() =>
      assertCanvasAppCustomCreationTools([
        {
          ...tool,
          createItem: undefined,
        } as unknown as CanvasAppCustomCreationTool,
      ]),
    ).toThrow('Canvas app custom creation tool risk requires createItem')

    expect(() =>
      assertCanvasAppCustomCreationTools([
        {
          ...tool,
          ariaLabel: true,
        } as unknown as CanvasAppCustomCreationTool,
      ]),
    ).toThrow('Canvas app custom creation tool risk requires ariaLabel')

    expect(() =>
      assertCanvasAppCustomCreationTools([
        {
          ...tool,
          shortcut: { shiftKey: true },
        } as unknown as CanvasAppCustomCreationTool,
      ]),
    ).toThrow('Canvas app custom creation tool risk requires shortcut.key')

    expect(() =>
      assertCanvasAppCustomCreationTools([
        {
          ...tool,
          shortcut: { key: 'k', shiftKey: 'yes' },
        } as unknown as CanvasAppCustomCreationTool,
      ]),
    ).toThrow('Canvas app custom creation tool risk requires shortcut.shiftKey')
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

  it('rejects cursor chat shortcut conflicts', () => {
    expect(() =>
      assertCanvasAppCustomCreationToolShortcuts([
        {
          ...tool,
          shortcut: { key: '/' },
        },
      ]),
    ).toThrow(
      'Canvas app custom creation tool shortcut conflicts with cursor chat: risk uses /',
    )
  })
})
