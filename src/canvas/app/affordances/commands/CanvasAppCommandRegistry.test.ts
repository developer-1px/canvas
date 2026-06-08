import { describe, expect, it } from 'vitest'
import { createCanvasAffordanceConfig } from '../../../engine'
import {
  CANVAS_APP_COMMAND_DEFINITIONS,
} from './CanvasAppCommandDefinitions'
import {
  getCanvasAppCommandMapping,
  getCanvasAppCommandMappingShortcut,
} from './CanvasAppCommandRegistry'

describe('CanvasAppCommandRegistry', () => {
  it('keeps app-owned definitions declarative and JSON round-trippable', () => {
    const group = CANVAS_APP_COMMAND_DEFINITIONS.find(
      (definition) => definition.id === 'command:group',
    )

    expect(JSON.parse(JSON.stringify(CANVAS_APP_COMMAND_DEFINITIONS)))
      .toEqual(CANVAS_APP_COMMAND_DEFINITIONS)
    expect(group?.bindings[0]).toMatchObject({
      kind: 'keyboard',
      shortcut: { key: 'g', modifier: 'primary' },
      shortcutId: 'group',
    })
    expect(group?.bindings[0]).not.toHaveProperty('label')
  })

  it('projects app-owned commands to interaction actions and input bindings', () => {
    const undo = requireMapping('command:undo')
    const group = requireMapping('command:group')
    const duplicate = requireMapping('command:duplicate')

    expect(undo.action).toEqual({ type: 'canvas.command.undo' })
    expect(commandShortcut(undo.id)).toBe('Cmd+Z')

    expect(group.action).toEqual({ type: 'canvas.command.group' })
    expect(commandShortcut(group.id)).toBe('Cmd+G')

    expect(duplicate.action).toEqual({ type: 'canvas.command.duplicate' })
    expect(commandShortcut(duplicate.id)).toBe('Cmd+D / Alt+Drag')
  })

  it('keeps system and viewport mappings in the same inspectable shape', () => {
    expect(requireMapping('system:commandPalette')).toMatchObject({
      action: { type: 'canvas.system.commandPalette' },
      section: 'System',
      title: 'Command Palette',
    })
    expect(commandShortcut('system:commandPalette')).toBe('Cmd+K')
    expect(commandShortcut('viewport:zoom-in')).toBe('Cmd+=')
  })

  it('filters shortcut display through affordance config', () => {
    const config = createCanvasAffordanceConfig({
      gestures: { altDragDuplicate: false },
      shortcuts: {
        commandPalette: false,
        duplicate: false,
      },
    })

    expect(commandShortcut('command:duplicate', config)).toBeUndefined()
    expect(commandShortcut('system:commandPalette', config)).toBeUndefined()
  })
})

function commandShortcut(
  id: string,
  config = createCanvasAffordanceConfig(),
) {
  return getCanvasAppCommandMappingShortcut({
    config,
    mapping: getCanvasAppCommandMapping(id),
  })
}

function requireMapping(id: string) {
  const mapping = getCanvasAppCommandMapping(id)

  if (!mapping) {
    throw new Error(`Missing command mapping: ${id}`)
  }

  return mapping
}
