import { describe, expect, it } from 'vitest'
import { CANVAS_TOOLBAR_COMMAND_GROUPS } from './CanvasToolbarCommandCatalog'

describe('CanvasToolbarCommandCatalog', () => {
  it('owns built-in command descriptors and their UI surfaces', () => {
    expect(CANVAS_TOOLBAR_COMMAND_GROUPS.map((group) => group.id)).toEqual([
      'history',
      'selection',
      'grouping',
      'alignment',
      'layer-order',
      'lock',
    ])
    expect(getCommand('undo')).toMatchObject({
      action: { kind: 'undo' },
      surfaces: ['context-menu'],
    })
    expect(getCommand('duplicate')).toMatchObject({
      action: { kind: 'duplicate' },
      surfaces: ['selection-floating-bar', 'context-menu'],
    })
    expect(getCommand('alignLeft')).toMatchObject({
      action: { kind: 'align', mode: 'alignLeft' },
      surfaces: ['selection-floating-bar', 'context-menu'],
    })
    expect(getCommand('bringToFront')).toMatchObject({
      action: { kind: 'reorder', mode: 'bringToFront' },
      surfaces: ['selection-floating-bar', 'context-menu'],
    })
    expect(getCommand('unlockAll')).toMatchObject({
      action: { kind: 'unlock-all' },
      surfaces: ['context-menu'],
    })
  })
})

function getCommand(command: string) {
  for (const group of CANVAS_TOOLBAR_COMMAND_GROUPS) {
    for (const descriptor of group.commands) {
      if (descriptor.command === command) {
        return descriptor
      }
    }
  }

  return undefined
}
