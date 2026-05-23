import {
  isCanvasStableId,
  type CanvasStableId,
} from '../../core'

export type CanvasAppExtensionId = CanvasStableId

export type CanvasAppExtensionEntry = {
  id: string
}

export function isCanvasAppExtensionId(
  id: string,
): id is CanvasAppExtensionId {
  return isCanvasStableId(id)
}

export function assertCanvasAppExtensionId({
  id,
  label,
}: {
  id: string
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
  entries: readonly CanvasAppExtensionEntry[]
  label: string
}) {
  for (const entry of entries) {
    assertCanvasAppExtensionId({
      id: entry.id,
      label,
    })
  }
}

export function assertCanvasAppExtensionRecordKeys<TValue>({
  entries,
  label,
}: {
  entries: Readonly<Record<string, TValue>>
  label: string
}) {
  for (const id of Object.keys(entries)) {
    assertCanvasAppExtensionId({
      id,
      label,
    })
  }
}
