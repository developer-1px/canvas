import { describe, expect, it } from 'vitest'
import { CANVAS_TOOLBAR_COMMAND_GROUPS } from './CanvasToolbarCommandCatalog'

describe('CanvasToolbarCommandCatalog', () => {
  it('owns built-in toolbar command group descriptors', () => {
    expect(CANVAS_TOOLBAR_COMMAND_GROUPS).toEqual([
      {
        id: 'history',
        commands: [
          { action: { kind: 'undo' }, command: 'undo' },
          { action: { kind: 'redo' }, command: 'redo' },
        ],
      },
      {
        id: 'selection',
        commands: [
          { action: { kind: 'duplicate' }, command: 'duplicate' },
          { action: { kind: 'delete' }, command: 'delete' },
        ],
      },
      {
        id: 'grouping',
        commands: [
          { action: { kind: 'group' }, command: 'group' },
          { action: { kind: 'ungroup' }, command: 'ungroup' },
        ],
      },
      {
        id: 'alignment',
        commands: [
          {
            action: { kind: 'align', mode: 'alignLeft' },
            command: 'alignLeft',
          },
          {
            action: { kind: 'align', mode: 'alignCenter' },
            command: 'alignCenter',
          },
          {
            action: { kind: 'align', mode: 'alignRight' },
            command: 'alignRight',
          },
          {
            action: { kind: 'align', mode: 'alignTop' },
            command: 'alignTop',
          },
          {
            action: { kind: 'align', mode: 'alignMiddle' },
            command: 'alignMiddle',
          },
          {
            action: { kind: 'align', mode: 'alignBottom' },
            command: 'alignBottom',
          },
          {
            action: { kind: 'distribute', mode: 'distributeHorizontal' },
            command: 'distributeHorizontal',
          },
          {
            action: { kind: 'distribute', mode: 'distributeVertical' },
            command: 'distributeVertical',
          },
        ],
      },
      {
        id: 'lock',
        commands: [
          { action: { kind: 'lock' }, command: 'lockSelection' },
          { action: { kind: 'unlock-all' }, command: 'unlockAll' },
        ],
      },
    ])
  })
})
