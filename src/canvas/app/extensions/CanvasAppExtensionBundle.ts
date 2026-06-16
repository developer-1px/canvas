import type { CanvasAppCustomCommand } from './custom-commands'
import type { CanvasAppInspectorPanel } from './inspector-panels'
import type {
  CanvasAppCustomItemValidators,
} from './custom-item-modules/CanvasAppCustomItemValidatorContracts'
import {
  appendUniqueCanvasAppFoundationExtensions,
  snapshotCanvasAppFoundationExtensions,
  type CanvasAppFoundationExtension,
} from './foundation-extensions'
import type { CanvasAppCustomItemRenderers } from '../rendering/CanvasAppRenderingContracts'
import type { CanvasAppCustomCreationTool } from './custom-tools/CanvasAppCustomCreationTools'
import type { CanvasMediaImporter } from '../feature-packs/media-import'
import type { CanvasTextPasteImporter } from '../feature-packs/text-paste-import'
import {
  snapshotCanvasAppDescriptorArray,
  snapshotCanvasAppRecord,
  snapshotCanvasAppShortcutDescriptorArray,
} from './CanvasAppDescriptorSnapshot'
import {
  appendUniqueCanvasAppExtensionEntries,
  type CanvasAppExtensionRegistryOwner,
  mergeUniqueCanvasAppExtensionRecord,
} from './CanvasAppExtensionRegistries'

export type CanvasAppExtensionBundle = {
  customCommands: readonly CanvasAppCustomCommand[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  customItemRenderers: CanvasAppCustomItemRenderers
  customItemValidators: CanvasAppCustomItemValidators
  foundationExtensions: readonly CanvasAppFoundationExtension[]
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  mediaImporters: readonly CanvasMediaImporter[]
  textPasteImporters: readonly CanvasTextPasteImporter[]
}

export type CanvasAppExtensionBundleInput = {
  customCommands?: readonly CanvasAppCustomCommand[]
  customCreationTools?: readonly CanvasAppCustomCreationTool[]
  customItemRenderers?: CanvasAppCustomItemRenderers
  customItemValidators?: CanvasAppCustomItemValidators
  foundationExtensions?: readonly CanvasAppFoundationExtension[]
  inspectorPanels?: readonly CanvasAppInspectorPanel[]
  mediaImporters?: readonly CanvasMediaImporter[]
  textPasteImporters?: readonly CanvasTextPasteImporter[]
}

export function createEmptyCanvasAppExtensionBundle(): CanvasAppExtensionBundle {
  return {
    customCommands: [],
    customCreationTools: [],
    customItemRenderers: {},
    customItemValidators: {},
    foundationExtensions: [],
    inspectorPanels: [],
    mediaImporters: [],
    textPasteImporters: [],
  }
}

export function createCanvasAppExtensionBundle({
  customCommands = [],
  customCreationTools = [],
  customItemRenderers = {},
  customItemValidators = {},
  foundationExtensions = [],
  inspectorPanels = [],
  mediaImporters = [],
  textPasteImporters = [],
}: CanvasAppExtensionBundleInput = {}): CanvasAppExtensionBundle {
  return {
    customCommands,
    customCreationTools,
    customItemRenderers,
    customItemValidators,
    foundationExtensions,
    inspectorPanels,
    mediaImporters,
    textPasteImporters,
  }
}

export function mergeCanvasAppExtensionBundle({
  current,
  entries,
  owner,
}: {
  current: CanvasAppExtensionBundle
  entries: CanvasAppExtensionBundle
  owner: CanvasAppExtensionRegistryOwner
}): CanvasAppExtensionBundle {
  return {
    customCommands: appendUniqueCanvasAppExtensionEntries({
      current: current.customCommands,
      entries: entries.customCommands,
      label: 'custom command',
      owner,
    }),
    customCreationTools: appendUniqueCanvasAppExtensionEntries({
      current: current.customCreationTools,
      entries: entries.customCreationTools,
      label: 'custom creation tool',
      owner,
    }),
    customItemRenderers: mergeUniqueCanvasAppExtensionRecord({
      current: current.customItemRenderers,
      entries: entries.customItemRenderers,
      label: 'custom item renderer',
      owner,
    }),
    customItemValidators: mergeUniqueCanvasAppExtensionRecord({
      current: current.customItemValidators,
      entries: entries.customItemValidators,
      label: 'custom item validator',
      owner,
    }),
    foundationExtensions: appendUniqueCanvasAppFoundationExtensions({
      current: current.foundationExtensions,
      entries: entries.foundationExtensions,
      owner,
    }),
    inspectorPanels: appendUniqueCanvasAppExtensionEntries({
      current: current.inspectorPanels,
      entries: entries.inspectorPanels,
      label: 'inspector panel',
      owner,
    }),
    mediaImporters: appendUniqueCanvasAppExtensionEntries({
      current: current.mediaImporters,
      entries: entries.mediaImporters,
      label: 'media importer',
      owner,
    }),
    textPasteImporters: appendUniqueCanvasAppExtensionEntries({
      current: current.textPasteImporters,
      entries: entries.textPasteImporters,
      label: 'text paste importer',
      owner,
    }),
  }
}

export function snapshotCanvasAppExtensionBundle(
  bundle: CanvasAppExtensionBundle,
): CanvasAppExtensionBundle {
  return Object.freeze({
    customCommands: snapshotCanvasAppDescriptorArray(bundle.customCommands),
    customCreationTools: snapshotCanvasAppShortcutDescriptorArray(
      bundle.customCreationTools,
    ),
    foundationExtensions: snapshotCanvasAppFoundationExtensions(
      bundle.foundationExtensions,
    ),
    customItemRenderers: snapshotCanvasAppRecord(bundle.customItemRenderers),
    customItemValidators: snapshotCanvasAppRecord(bundle.customItemValidators),
    inspectorPanels: snapshotCanvasAppDescriptorArray(bundle.inspectorPanels),
    mediaImporters: snapshotCanvasAppDescriptorArray(
      bundle.mediaImporters,
    ),
    textPasteImporters: snapshotCanvasAppDescriptorArray(
      bundle.textPasteImporters,
    ),
  })
}
