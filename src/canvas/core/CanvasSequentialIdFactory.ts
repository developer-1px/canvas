export type CanvasSequentialIdFactoryFormatInput = {
  index: number
  prefix: string
}

export type CanvasSequentialIdFactoryInput = {
  existingIds?: Iterable<string>
  formatId?: (input: CanvasSequentialIdFactoryFormatInput) => string
  startIndex?: number
}

export function createCanvasSequentialIdFactory({
  existingIds = [],
  formatId = formatDefaultCanvasSequentialId,
  startIndex = 1,
}: CanvasSequentialIdFactoryInput = {}) {
  const ids = new Set(existingIds)
  let nextIndex = normalizeCanvasSequentialIdIndex(startIndex)

  return (prefix: string) => {
    let id = formatId({ index: nextIndex, prefix })

    while (ids.has(id)) {
      nextIndex += 1
      id = formatId({ index: nextIndex, prefix })
    }

    ids.add(id)
    nextIndex += 1

    return id
  }
}

function formatDefaultCanvasSequentialId({
  index,
  prefix,
}: CanvasSequentialIdFactoryFormatInput) {
  return `${prefix}-${index}`
}

function normalizeCanvasSequentialIdIndex(value: number) {
  return Number.isFinite(value)
    ? Math.max(1, Math.floor(value))
    : 1
}
