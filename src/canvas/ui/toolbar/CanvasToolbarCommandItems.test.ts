import { describe, expect, it } from 'vitest'
import { createCanvasAffordanceConfig } from '../../engine'
import { getCanvasToolbarCommandGroups } from './CanvasToolbarCommandItems'

describe('CanvasToolbarCommandItems', () => {
  it('omits disabled feature entries and carries availability as disabled state', () => {
    const groups = getCanvasToolbarCommandGroups(createInput({
      canDuplicate: false,
      canRedo: false,
      config: createCanvasAffordanceConfig({
        commands: {
          delete: false,
          undo: false,
        },
      }),
    }))

    expect(getGroup(groups, 'history')?.items).toEqual([
      {
        action: { kind: 'redo' },
        command: 'redo',
        disabled: true,
        kind: 'command',
      },
    ])
    expect(getGroup(groups, 'selection')?.items).toEqual([
      {
        action: { kind: 'duplicate' },
        command: 'duplicate',
        disabled: true,
        kind: 'command',
      },
    ])
  })

  it('models alignment and distribution commands as action payloads', () => {
    const groups = getCanvasToolbarCommandGroups(createInput({
      canAlign: false,
      canDistribute: true,
      config: createCanvasAffordanceConfig({
        commands: {
          alignCenter: false,
          distributeVertical: false,
        },
      }),
    }))

    expect(getGroup(groups, 'alignment')?.items).toEqual([
      {
        action: { kind: 'align', mode: 'alignLeft' },
        command: 'alignLeft',
        disabled: true,
        kind: 'command',
      },
      {
        action: { kind: 'align', mode: 'alignRight' },
        command: 'alignRight',
        disabled: true,
        kind: 'command',
      },
      {
        action: { kind: 'align', mode: 'alignTop' },
        command: 'alignTop',
        disabled: true,
        kind: 'command',
      },
      {
        action: { kind: 'align', mode: 'alignMiddle' },
        command: 'alignMiddle',
        disabled: true,
        kind: 'command',
      },
      {
        action: { kind: 'align', mode: 'alignBottom' },
        command: 'alignBottom',
        disabled: true,
        kind: 'command',
      },
      {
        action: { kind: 'distribute', mode: 'distributeHorizontal' },
        command: 'distributeHorizontal',
        disabled: false,
        kind: 'command',
      },
    ])
  })
})

function createInput(
  overrides: Partial<Parameters<typeof getCanvasToolbarCommandGroups>[0]> = {},
): Parameters<typeof getCanvasToolbarCommandGroups>[0] {
  return {
    canAlign: true,
    canDelete: true,
    canDistribute: true,
    canDuplicate: true,
    canGroup: true,
    canLock: true,
    canRedo: true,
    canUndo: true,
    canUngroup: true,
    config: createCanvasAffordanceConfig(),
    ...overrides,
  }
}

function getGroup(
  groups: ReturnType<typeof getCanvasToolbarCommandGroups>,
  id: ReturnType<typeof getCanvasToolbarCommandGroups>[number]['id'],
) {
  return groups.find((group) => group.id === id)
}
