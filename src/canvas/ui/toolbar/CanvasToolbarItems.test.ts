import { describe, expect, it } from 'vitest'
import { createCanvasAffordanceConfig } from '../../engine'
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
    const groups = getCanvasToolbarGroups(createInput({
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
    customCommands: [],
    customTools: [],
    tool: 'select',
    ...overrides,
  }
}

function getGroup(
  groups: ReturnType<typeof getCanvasToolbarGroups>,
  id: ReturnType<typeof getCanvasToolbarGroups>[number]['id'],
) {
  return groups.find((group) => group.id === id)
}
