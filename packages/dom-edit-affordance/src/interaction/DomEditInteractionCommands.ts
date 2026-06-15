import {
  compileInteractionCommandDefinitions,
  compileInteractionCommandBindings,
  createInteractionActions,
  createInteractionRouter,
  detectInteractionPlatform,
  getInteractionCommandBindingSummary,
  getInteractionCommandMapping,
  interactionKeyInputFromKeyboardEvent,
  shellOwner,
  type InteractionCommandBindingDefinition,
  type InteractionCommandCompiledBinding,
  type InteractionCommandDefinition,
  type InteractionCommandKeyboardShortcutDefinition,
  type InteractionCommandMapping,
  type InteractionKeyboardEventLike,
  type InteractionKeyTargetKind,
  type InteractionPlatform,
  type InteractionShortcutBinding,
} from '@interactive-os/interaction/runtime'

export type DomEditInteractionCommandSection =
  | 'Commands'
  | 'Overlays'
  | 'Tools'

export type DomEditInteractionCommandId =
  | 'domEditDelete'
  | 'domEditDuplicate'
  | 'domEditEscape'
  | 'domEditNudgeDown'
  | 'domEditNudgeLeft'
  | 'domEditNudgeRight'
  | 'domEditNudgeUp'
  | 'domEditRedo'
  | 'domEditSelectTool'
  | 'domEditToggleMeasure'
  | 'domEditToggleXray'
  | 'domEditUndo'

export type DomEditInteractionAction =
  | { type: 'dom-edit.command.delete' }
  | { type: 'dom-edit.command.duplicate' }
  | { type: 'dom-edit.command.nudge'; params: { dx: number; dy: number } }
  | { type: 'dom-edit.command.redo' }
  | { type: 'dom-edit.command.undo' }
  | { type: 'dom-edit.overlay.escape' }
  | { type: 'dom-edit.overlay.toggle-measure' }
  | { type: 'dom-edit.overlay.toggle-xray' }
  | { type: 'dom-edit.tool.select' }

export type DomEditInteractionCommandBindingDefinition =
  Extract<InteractionCommandBindingDefinition, { kind: 'keyboard' }> & {
    readonly commandId: DomEditInteractionCommandId
    readonly kind: 'keyboard'
  }

export interface DomEditInteractionCommandDefinition
  extends InteractionCommandDefinition<
    DomEditInteractionCommandBindingDefinition,
    DomEditInteractionAction
  > {
  readonly commandId: DomEditInteractionCommandId
  readonly section: DomEditInteractionCommandSection
}

export type DomEditInteractionCommandMapping =
  InteractionCommandMapping<DomEditInteractionCommandDefinition>

export type DomEditKeyboardCommand = {
  action: DomEditInteractionAction
  binding: InteractionCommandCompiledBinding<
    DomEditInteractionCommandBindingDefinition
  >
  commandId: DomEditInteractionCommandId
  mapping: DomEditInteractionCommandMapping
}

export const DOM_EDIT_INTERACTION_COMMAND_DEFINITIONS = Object.freeze([
  commandDefinition({
    action: { type: 'dom-edit.tool.select' },
    commandId: 'domEditSelectTool',
    id: 'dom-edit:tool:select',
    section: 'Tools',
    shortcut: { key: 'v' },
    title: 'Select',
  }),
  commandDefinition({
    action: { type: 'dom-edit.overlay.toggle-measure' },
    commandId: 'domEditToggleMeasure',
    id: 'dom-edit:overlay:measure',
    section: 'Overlays',
    shortcut: { key: 'm' },
    title: 'Measure',
  }),
  commandDefinition({
    action: { type: 'dom-edit.overlay.toggle-xray' },
    commandId: 'domEditToggleXray',
    id: 'dom-edit:overlay:xray',
    section: 'Overlays',
    shortcut: { key: 'x' },
    title: 'X-ray',
  }),
  commandDefinition({
    action: { type: 'dom-edit.overlay.escape' },
    commandId: 'domEditEscape',
    id: 'dom-edit:overlay:escape',
    section: 'Tools',
    shortcut: { key: 'Escape' },
    title: 'Escape',
  }),
  commandDefinition({
    action: { type: 'dom-edit.command.duplicate' },
    commandId: 'domEditDuplicate',
    id: 'dom-edit:command:duplicate',
    section: 'Commands',
    shortcut: { key: 'd', modifier: 'primary' },
    title: 'Duplicate',
  }),
  commandDefinition({
    action: { type: 'dom-edit.command.undo' },
    commandId: 'domEditUndo',
    id: 'dom-edit:command:undo',
    section: 'Commands',
    shortcut: { key: 'z', modifier: 'primary' },
    title: 'Undo',
  }),
  commandDefinition({
    action: { type: 'dom-edit.command.redo' },
    commandId: 'domEditRedo',
    id: 'dom-edit:command:redo',
    section: 'Commands',
    shortcut: { key: 'z', modifier: 'primary', shiftKey: true },
    title: 'Redo',
  }),
  commandDefinition({
    action: { type: 'dom-edit.command.redo' },
    commandId: 'domEditRedo',
    id: 'dom-edit:command:redo-y',
    section: 'Commands',
    shortcut: { key: 'y', modifier: 'primary' },
    title: 'Redo',
  }),
  commandDefinition({
    action: { type: 'dom-edit.command.delete' },
    commandId: 'domEditDelete',
    id: 'dom-edit:command:delete',
    section: 'Commands',
    shortcut: { key: 'Delete' },
    title: 'Delete',
  }),
  commandDefinition({
    action: { type: 'dom-edit.command.delete' },
    commandId: 'domEditDelete',
    id: 'dom-edit:command:backspace',
    section: 'Commands',
    shortcut: { key: 'Backspace' },
    title: 'Delete',
  }),
  commandDefinition({
    action: { type: 'dom-edit.command.nudge', params: { dx: -1, dy: 0 } },
    commandId: 'domEditNudgeLeft',
    id: 'dom-edit:command:nudge-left',
    section: 'Commands',
    shortcut: { key: 'ArrowLeft' },
    title: 'Nudge left',
  }),
  commandDefinition({
    action: { type: 'dom-edit.command.nudge', params: { dx: 1, dy: 0 } },
    commandId: 'domEditNudgeRight',
    id: 'dom-edit:command:nudge-right',
    section: 'Commands',
    shortcut: { key: 'ArrowRight' },
    title: 'Nudge right',
  }),
  commandDefinition({
    action: { type: 'dom-edit.command.nudge', params: { dx: 0, dy: -1 } },
    commandId: 'domEditNudgeUp',
    id: 'dom-edit:command:nudge-up',
    section: 'Commands',
    shortcut: { key: 'ArrowUp' },
    title: 'Nudge up',
  }),
  commandDefinition({
    action: { type: 'dom-edit.command.nudge', params: { dx: 0, dy: 1 } },
    commandId: 'domEditNudgeDown',
    id: 'dom-edit:command:nudge-down',
    section: 'Commands',
    shortcut: { key: 'ArrowDown' },
    title: 'Nudge down',
  }),
] satisfies readonly DomEditInteractionCommandDefinition[])

export const DOM_EDIT_INTERACTION_COMMAND_MAPPINGS = Object.freeze(
  compileInteractionCommandDefinitions(DOM_EDIT_INTERACTION_COMMAND_DEFINITIONS),
)

const DOM_EDIT_INTERACTION_COMMAND_ROUTE_ACTION =
  'dom-edit.internal.resolve-command'

type DomEditInteractionCommandRouteActionMap = {
  'dom-edit.internal.resolve-command': { mappingId: string }
}

const DOM_EDIT_INTERACTION_COMMAND_ROUTE_ACTIONS =
  createInteractionActions<DomEditInteractionCommandRouteActionMap>()

const DOM_EDIT_DEFAULT_COMMAND_TARGET_KINDS = [
  'unknown',
  'pattern',
  'temporary-control',
  'scroll-container',
  'incidental',
] satisfies readonly InteractionKeyTargetKind[]

const DOM_EDIT_HISTORY_COMMAND_TARGET_KINDS = [
  ...DOM_EDIT_DEFAULT_COMMAND_TARGET_KINDS,
  'native-control',
] satisfies readonly InteractionKeyTargetKind[]

const DOM_EDIT_INTERACTION_COMMAND_ROUTER = createInteractionRouter({
  owners: [
    shellOwner({
      id: 'dom-edit-command-shell',
      keys: DOM_EDIT_INTERACTION_COMMAND_MAPPINGS.flatMap((mapping) =>
        mapping.bindings.map((binding) =>
          createDomEditInteractionShortcutBinding(mapping, binding))),
    }),
  ],
})

export function getDomEditInteractionCommand(
  id: string,
): DomEditInteractionCommandMapping | undefined {
  return getInteractionCommandMapping(DOM_EDIT_INTERACTION_COMMAND_MAPPINGS, id)
}

export function getDomEditInteractionCommandShortcut({
  commandId,
  platform,
}: {
  commandId: DomEditInteractionCommandId
  platform?: InteractionPlatform
}) {
  const definition = DOM_EDIT_INTERACTION_COMMAND_DEFINITIONS.find(
    (candidate) => candidate.commandId === commandId,
  )

  if (!definition) {
    return undefined
  }

  return getInteractionCommandBindingSummary({
    bindings: compileInteractionCommandBindings(definition.bindings, {
      platform,
    }),
  })
}

export function resolveDomEditKeyboardCommand(
  event: InteractionKeyboardEventLike,
  options: {
    readonly platform?: InteractionPlatform
    readonly resolvePlatform?: () => InteractionPlatform | undefined
  } = {},
): DomEditKeyboardCommand | null {
  const platform =
    options.platform ?? options.resolvePlatform?.() ?? detectInteractionPlatform()
  const input = interactionKeyInputFromKeyboardEvent(event, { platform })
  const route = DOM_EDIT_INTERACTION_COMMAND_ROUTER.route({
    ...input,
    key: normalizeDomEditKeyboardEventKey(input.key),
  })

  if (route.status !== 'owner') {
    return null
  }

  const action = DOM_EDIT_INTERACTION_COMMAND_ROUTE_ACTIONS.getRoute(
    route,
    DOM_EDIT_INTERACTION_COMMAND_ROUTE_ACTION,
  )
  const mapping = action
    ? getDomEditInteractionCommand(action.params.mappingId)
    : undefined
  const binding = mapping?.bindings.find((candidate) =>
    candidate.kind === 'keyboard')

  if (!mapping || !binding) {
    return null
  }

  return {
    action: mapping.action,
    binding,
    commandId: mapping.commandId,
    mapping,
  }
}

export function isDomEditInteractionAction(
  value: unknown,
): value is DomEditInteractionAction {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'type' in value &&
    typeof value.type === 'string' &&
    value.type.startsWith('dom-edit.'),
  )
}

function commandDefinition({
  action,
  commandId,
  id,
  section,
  shortcut,
  title,
}: {
  action: DomEditInteractionAction
  commandId: DomEditInteractionCommandId
  id: string
  section: DomEditInteractionCommandSection
  shortcut: InteractionCommandKeyboardShortcutDefinition
  title: string
}): DomEditInteractionCommandDefinition {
  return {
    action,
    bindings: [{
      commandId,
      kind: 'keyboard',
      shortcut,
    }],
    commandId,
    id,
    section,
    title,
  }
}

function createDomEditInteractionShortcutBinding(
  mapping: DomEditInteractionCommandMapping,
  binding: InteractionCommandCompiledBinding<
    DomEditInteractionCommandBindingDefinition
  >,
): InteractionShortcutBinding {
  return {
    action: {
      params: { mappingId: mapping.id },
      type: DOM_EDIT_INTERACTION_COMMAND_ROUTE_ACTION,
    },
    code: binding.shortcut.code,
    key: normalizeDomEditKeyboardEventKey(binding.shortcut.key),
    mod: getDomEditInteractionShortcutModifiers(binding.shortcut),
    targetKinds: isDomEditHistoryAction(mapping.action)
      ? DOM_EDIT_HISTORY_COMMAND_TARGET_KINDS
      : DOM_EDIT_DEFAULT_COMMAND_TARGET_KINDS,
  }
}

function getDomEditInteractionShortcutModifiers(
  shortcut: InteractionCommandKeyboardShortcutDefinition,
) {
  const modifiers = toArray(shortcut.modifiers ?? shortcut.modifier)

  return shortcut.shiftKey === true && !modifiers.includes('Shift')
    ? [...modifiers, 'Shift' as const]
    : modifiers
}

function isDomEditHistoryAction(action: DomEditInteractionAction) {
  return action.type === 'dom-edit.command.undo' ||
    action.type === 'dom-edit.command.redo'
}

function normalizeDomEditKeyboardEventKey(key: string) {
  return key.length === 1 ? key.toLowerCase() : key
}

function toArray<T>(value: T | readonly T[] | undefined): readonly T[] {
  if (value === undefined) {
    return []
  }

  return Array.isArray(value) ? value as readonly T[] : [value as T]
}
