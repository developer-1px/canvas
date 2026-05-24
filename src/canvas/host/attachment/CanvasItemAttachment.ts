import type { CanvasItem } from '../model'

export function isCanvasItemAttachedTo(
  item: CanvasItem,
  attachedIds: ReadonlySet<string>,
) {
  const attachedTo = getCanvasItemAttachmentId(item)

  return attachedTo !== null && attachedIds.has(attachedTo)
}

export function getCanvasItemAttachmentId(item: CanvasItem) {
  const attachedTo = (item as { attachedTo?: unknown }).attachedTo

  return typeof attachedTo === 'string' ? attachedTo : null
}
