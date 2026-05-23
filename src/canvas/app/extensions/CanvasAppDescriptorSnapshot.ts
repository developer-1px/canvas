export function snapshotCanvasAppDescriptor<TDescriptor extends object>(
  descriptor: TDescriptor,
): TDescriptor {
  return Object.freeze({ ...descriptor })
}

export function snapshotCanvasAppShortcutDescriptor<
  TDescriptor extends {
    shortcut?: object
  },
>(descriptor: TDescriptor): TDescriptor {
  const snapshot: TDescriptor = { ...descriptor }

  if (descriptor.shortcut) {
    snapshot.shortcut = Object.freeze({
      ...descriptor.shortcut,
    }) as TDescriptor['shortcut']
  }

  return Object.freeze(snapshot)
}

export function snapshotCanvasAppDescriptorArray<
  TDescriptor extends object,
>(descriptors: readonly TDescriptor[]) {
  return snapshotCanvasAppArray(
    descriptors.map(snapshotCanvasAppDescriptor),
  ) as readonly TDescriptor[]
}

export function snapshotCanvasAppShortcutDescriptorArray<
  TDescriptor extends {
    shortcut?: object
  },
>(descriptors: readonly TDescriptor[]) {
  return snapshotCanvasAppArray(
    descriptors.map(snapshotCanvasAppShortcutDescriptor),
  ) as readonly TDescriptor[]
}

export function snapshotCanvasAppRecord<TValue>(
  record: Readonly<Record<string, TValue>>,
) {
  return Object.freeze({ ...record })
}

export function snapshotCanvasAppArray<TValue>(items: readonly TValue[]) {
  return Object.freeze([...items]) as readonly TValue[]
}
