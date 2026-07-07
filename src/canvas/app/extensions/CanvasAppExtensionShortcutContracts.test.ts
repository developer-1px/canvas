import { describe, expect, it } from 'vitest'
import { assertCanvasAppExtensionShortcuts } from './CanvasAppExtensionShortcutContracts'

describe('CanvasAppExtensionShortcutContracts', () => {
  it('accepts distinct extension shortcuts across slots', () => {
    expect(() =>
      assertCanvasAppExtensionShortcuts([
        { owner: 'custom creation tool risk', shortcut: { key: 'q' } },
        { owner: 'custom command log-selection', shortcut: { key: 'j' } },
        { owner: 'custom command without shortcut' },
      ]),
    ).not.toThrow()
  })

  it('rejects shortcuts that conflict with reserved built-ins', () => {
    expect(() =>
      assertCanvasAppExtensionShortcuts([
        { owner: 'custom command log-selection', shortcut: { key: 'v' } },
      ]),
    ).toThrow(/conflicts with/)
  })

  it('rejects duplicate shortcuts across tools and commands', () => {
    expect(() =>
      assertCanvasAppExtensionShortcuts([
        { owner: 'custom creation tool risk', shortcut: { key: 'q' } },
        { owner: 'custom command log-selection', shortcut: { key: 'q' } },
      ]),
    ).toThrow(/Duplicate/)
  })
})
