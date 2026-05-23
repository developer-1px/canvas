import {
  assertCanvasAppExtensionEntries,
  assertCanvasAppExtensionRecordKeys,
} from './CanvasAppExtensionIds'

export type CanvasAppExtensionRegistryOwner =
  | 'app assembly'
  | 'custom item module'

export function appendUniqueCanvasAppExtensionEntries<
  TEntry extends { id: string },
>({
  current,
  entries,
  label,
  owner,
}: {
  current: readonly TEntry[]
  entries: readonly TEntry[]
  label: string
  owner: CanvasAppExtensionRegistryOwner
}) {
  assertCanvasAppExtensionEntries({
    entries: current,
    label,
  })
  assertCanvasAppExtensionEntries({
    entries,
    label,
  })

  const ids = new Set(current.map((entry) => entry.id))

  for (const entry of entries) {
    if (ids.has(entry.id)) {
      throw new Error(`Duplicate canvas ${owner} ${label}: ${entry.id}`)
    }

    ids.add(entry.id)
  }

  return [...current, ...entries]
}

export function mergeUniqueCanvasAppExtensionRecord<TValue>({
  current,
  entries,
  label,
  owner,
}: {
  current: Readonly<Record<string, TValue>>
  entries: Readonly<Record<string, TValue>>
  label: string
  owner: CanvasAppExtensionRegistryOwner
}) {
  assertCanvasAppExtensionRecordKeys({
    entries: current,
    label,
  })
  assertCanvasAppExtensionRecordKeys({
    entries,
    label,
  })

  for (const key of Object.keys(entries)) {
    if (Object.hasOwn(current, key)) {
      throw new Error(`Duplicate canvas ${owner} ${label}: ${key}`)
    }
  }

  return {
    ...current,
    ...entries,
  }
}
