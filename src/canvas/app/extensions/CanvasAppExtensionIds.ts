import {
  isCanvasStableId,
  type CanvasStableId,
} from '../../core'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorObject,
  assertCanvasAppRegistryRecord,
} from './CanvasAppDescriptorContracts'

export type CanvasAppExtensionId = CanvasStableId

export type CanvasAppExtensionEntry = {
  id: string
}

export function isCanvasAppExtensionId(
  id: unknown,
): id is CanvasAppExtensionId {
  return isCanvasStableId(id)
}

export function assertCanvasAppExtensionId({
  id,
  label,
}: {
  id: unknown
  label: string
}) {
  if (!isCanvasAppExtensionId(id)) {
    throw new Error(`Invalid canvas app ${label} id: ${id}`)
  }
}

export function assertCanvasAppExtensionEntries({
  entries,
  label,
}: {
  entries: unknown
  label: string
}) {
  assertCanvasAppArray(entries, `${label} descriptors`)

  for (const entry of entries) {
    assertCanvasAppDescriptorObject(entry, label)
    assertCanvasAppExtensionId({
      id: entry.id,
      label,
    })
  }
}

export function assertCanvasAppExtensionRecordKeys({
  entries,
  label,
}: {
  entries: unknown
  label: string
}) {
  assertCanvasAppRegistryRecord(entries, label)

  for (const id of Object.keys(entries)) {
    assertCanvasAppExtensionId({
      id,
      label,
    })
  }
}
