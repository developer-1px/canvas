import { describe, expect, it } from 'vitest'
import {
  createCanvasAffordanceConfig,
  type CanvasCommandAvailability,
} from '../../engine'
import { getCanvasToolbarGroups } from './CanvasToolbarItems'

describe('CanvasToolbarItems', () => {
  it('composes tool groups from toolbar tool items', () => {
    const groups = getCanvasToolbarGroups(createInput({
      customTools: [
        {
          ariaLabel: 'Risk tool',
          id: 'custom:risk',
          label: '!',
          title: 'Risk',
        },
      ],
      tool: 'custom:risk',
    }))

    expect(groups[0]).toMatchObject({
      id: 'tools',
      items: expect.arrayContaining([
        { active: false, kind: 'builtin-tool', tool: 'select' },
        {
          active: true,
          ariaLabel: 'Risk tool',
          kind: 'custom-tool',
          label: '!',
          title: 'Risk',
          tool: 'custom:risk',
        },
      ]),
    })
  })

  it('omits disabled feature entries and carries availability as disabled state', () => {
    const groups = getCanvasToolbarGroups(createInput({
      commandAvailability: createCommandAvailability({
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
    const groups = getCanvasToolbarGroups(createInput({
      commandAvailability: createCommandAvailability({
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

  it('adds custom command items as their own group', () => {
    const groups = getCanvasToolbarGroups(createInput({
      customCommands: [
        {
          ariaLabel: 'Publish',
          disabled: true,
          id: 'publish',
          label: 'P',
          title: 'Publish',
        },
      ],
    }))

    expect(getGroup(groups, 'custom-commands')?.items).toEqual([
      {
        ariaLabel: 'Publish',
        disabled: true,
        id: 'publish',
        kind: 'custom-command',
        label: 'P',
        title: 'Publish',
      },
    ])
  })
})

function createInput(
  overrides: Partial<Parameters<typeof getCanvasToolbarGroups>[0]> = {},
): Parameters<typeof getCanvasToolbarGroups>[0] {
  return {
    commandAvailability: createCommandAvailability(),
    config: createCanvasAffordanceConfig(),
    customCommands: [],
    customTools: [],
    tool: 'select',
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
  groups: ReturnType<typeof getCanvasToolbarGroups>,
  id: ReturnType<typeof getCanvasToolbarGroups>[number]['id'],
) {
  return groups.find((group) => group.id === id)
}
