export function isCanvasItemRotationStorageShape(
  value: Record<string, unknown>,
) {
  if (value.rotation === undefined) {
    return true
  }

  return (
    value.type === 'comment' ||
    value.type === 'image' ||
    value.type === 'rect' ||
    value.type === 'shape' ||
    value.type === 'text' ||
    (value.type === 'component' && value.component === 'sticky')
  )
}
