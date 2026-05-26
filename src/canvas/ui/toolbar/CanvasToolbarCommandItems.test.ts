import { describe, expect, it } from 'vitest'
import {
  createCanvasAffordanceConfig,
  type CanvasCommandAvailability,
} from '../../engine'
import { getCanvasToolbarCommandGroups } from './CanvasToolbarCommandItems'

describe('CanvasToolbarCommandItems', () => {
  it('omits disabled feature entries and carries availability as disabled state', () => {
    const groups = getCanvasToolbarCommandGroups(createInput({
      availability: createCommandAvailability({
        duplicate: false,
        redo: false,
      }),
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
      availability: createCommandAvailability({
        alignBottom: false,
        alignLeft: false,
        alignMiddle: false,
        alignRight: false,
        alignTop: false,
      }),
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
    availability: createCommandAvailability(),
    config: createCanvasAffordanceConfig(),
    surface: 'context-menu',
    ...overrides,
  }
}

function createCommandAvailability(
  overrides: Partial<CanvasCommandAvailability> = {},
): CanvasCommandAvailability {
  return {
    alignBottom: true,
    alignCenter: true,
    alignLeft: true,
    alignMiddle: true,
    alignRight: true,
    alignTop: true,
    bringForward: true,
    bringToFront: true,
    delete: true,
    duplicate: true,
    distributeHorizontal: true,
    distributeVertical: true,
    group: true,
    lockSelection: true,
    redo: true,
    selectAll: true,
    sendBackward: true,
    sendToBack: true,
    undo: true,
    ungroup: true,
    unlockAll: true,
    ...overrides,
  }
}

function getGroup(
  groups: ReturnType<typeof getCanvasToolbarCommandGroups>,
  id: ReturnType<typeof getCanvasToolbarCommandGroups>[number]['id'],
) {
  return groups.find((group) => group.id === id)
}
