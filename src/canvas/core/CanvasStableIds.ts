const CANVAS_STABLE_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/

declare const canvasStableIdBrand: unique symbol

export type CanvasStableId = string & {
  readonly [canvasStableIdBrand]: true
}

export function isCanvasStableId(id: string): id is CanvasStableId {
  return CANVAS_STABLE_ID_PATTERN.test(id)
}

export function assertCanvasStableId({
  id,
  label,
}: {
  id: string
  label: string
}) {
  if (!isCanvasStableId(id)) {
    throw new Error(`Invalid canvas ${label} id: ${id}`)
  }
}

export function assertCanvasStableIdRecordKeys<TValue>({
  entries,
  label,
}: {
  entries: Readonly<Record<string, TValue>>
  label: string
}) {
  for (const id of Object.keys(entries)) {
    assertCanvasStableId({ id, label })
  }
}
