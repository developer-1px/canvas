import type { CanvasAffordanceConfig } from '../../../../engine'
import type {
  CanvasAppCustomCreationToolState,
} from '../../../extensions/CanvasAppExtensionStateContracts'
import {
  CANVAS_APP_COMMAND_MAPPINGS,
  getCanvasAppCommandMappingShortcut,
  type CanvasAppCommandMapping,
} from '../../commands/CanvasAppCommandRegistry'
import {
  formatCanvasKeyboardShortcutChord,
} from '../../interaction/keyboard/CanvasKeyboardShortcutChords'
import {
  CANVAS_KEYBOARD_TOOL_SHORTCUTS,
} from '../../interaction/keyboard/CanvasKeyboardToolShortcutCatalog'

export type CanvasShortcutHelpSection =
  | 'Commands'
  | 'System'
  | 'Tools'
  | 'View'

export type CanvasShortcutHelpItem = {
  id: string
  section: CanvasShortcutHelpSection
  shortcut: string
  title: string
}

export type CanvasShortcutHelpSectionGroup = {
  items: readonly CanvasShortcutHelpItem[]
  section: CanvasShortcutHelpSection
}

export type CanvasShortcutHelpItemsInput = {
  config: CanvasAffordanceConfig
  customTools: readonly CanvasAppCustomCreationToolState[]
}

const CANVAS_SHORTCUT_HELP_SECTION_ORDER: readonly CanvasShortcutHelpSection[] =
  ['Tools', 'Commands', 'View', 'System']

export function getCanvasShortcutHelpItems({
  config,
  customTools,
}: CanvasShortcutHelpItemsInput): CanvasShortcutHelpItem[] {
  return [
    ...getCanvasShortcutHelpToolItems({ config, customTools }),
    ...getCanvasShortcutHelpCommandItems({ config }),
  ]
}

export function groupCanvasShortcutHelpItems(
  items: readonly CanvasShortcutHelpItem[],
): CanvasShortcutHelpSectionGroup[] {
  return CANVAS_SHORTCUT_HELP_SECTION_ORDER.flatMap((section) => {
    const sectionItems = items.filter((item) => item.section === section)

    return sectionItems.length > 0
      ? [{ items: sectionItems, section }]
      : []
  })
}

function getCanvasShortcutHelpCommandItems({
  config,
}: Pick<CanvasShortcutHelpItemsInput, 'config'>): CanvasShortcutHelpItem[] {
  return CANVAS_APP_COMMAND_MAPPINGS.flatMap((mapping) => {
    if (!isCanvasShortcutHelpCommandMappingEnabled(mapping, config)) {
      return []
    }

    const shortcut = getCanvasAppCommandMappingShortcut({ config, mapping })

    return shortcut
      ? [{
          id: mapping.id,
          section: mapping.section,
          shortcut,
          title: mapping.title,
        }]
      : []
  })
}

function getCanvasShortcutHelpToolItems({
  config,
  customTools,
}: CanvasShortcutHelpItemsInput): CanvasShortcutHelpItem[] {
  return [
    ...CANVAS_KEYBOARD_TOOL_SHORTCUTS.flatMap((shortcut) => {
      if (
        !config.shortcuts[shortcut.shortcutId] ||
        !config.tools[shortcut.tool]
      ) {
        return []
      }

      return [{
        id: `tool:${shortcut.tool}`,
        section: 'Tools' as const,
        shortcut: formatCanvasKeyboardShortcutChord(shortcut.shortcut),
        title: toCanvasShortcutHelpTitle(shortcut.label),
      }]
    }),
    ...customTools.flatMap((tool) =>
      tool.shortcut
        ? [{
            id: `tool:${tool.id}`,
            section: 'Tools' as const,
            shortcut: formatCanvasKeyboardShortcutChord(tool.shortcut),
            title: tool.title,
          }]
        : []
    ),
  ]
}

function isCanvasShortcutHelpCommandMappingEnabled(
  mapping: CanvasAppCommandMapping,
  config: CanvasAffordanceConfig,
) {
  if (mapping.commandId && !config.commands[mapping.commandId]) {
    return false
  }

  if (mapping.id === 'system:temporaryPan') {
    return config.gestures.temporaryPan
  }

  return true
}

function toCanvasShortcutHelpTitle(label: string) {
  return label.replace(/\b\w/g, (character) => character.toUpperCase())
}
