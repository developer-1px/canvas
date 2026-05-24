import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'
import type {
  CanvasAppCustomItemValidators,
} from '../modules/CanvasAppCustomItemValidatorContracts'
import type { CanvasAppCustomItemRenderers } from '../rendering/CanvasAppRenderingContracts'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
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
  inspectorPanels: readonly CanvasAppInspectorPanel[]
}

export type CanvasAppExtensionBundleInput = {
  customCommands?: readonly CanvasAppCustomCommand[]
  customCreationTools?: readonly CanvasAppCustomCreationTool[]
  customItemRenderers?: CanvasAppCustomItemRenderers
  customItemValidators?: CanvasAppCustomItemValidators
  inspectorPanels?: readonly CanvasAppInspectorPanel[]
}

export function createEmptyCanvasAppExtensionBundle(): CanvasAppExtensionBundle {
  return {
    customCommands: [],
    customCreationTools: [],
    customItemRenderers: {},
    customItemValidators: {},
    inspectorPanels: [],
  }
}

export function createCanvasAppExtensionBundle({
  customCommands = [],
  customCreationTools = [],
  customItemRenderers = {},
  customItemValidators = {},
  inspectorPanels = [],
}: CanvasAppExtensionBundleInput = {}): CanvasAppExtensionBundle {
  return {
    customCommands,
    customCreationTools,
    customItemRenderers,
    customItemValidators,
    inspectorPanels,
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
    inspectorPanels: appendUniqueCanvasAppExtensionEntries({
      current: current.inspectorPanels,
      entries: entries.inspectorPanels,
      label: 'inspector panel',
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
    customItemRenderers: snapshotCanvasAppRecord(bundle.customItemRenderers),
    customItemValidators: snapshotCanvasAppRecord(bundle.customItemValidators),
    inspectorPanels: snapshotCanvasAppDescriptorArray(bundle.inspectorPanels),
  })
}
