import { buildPointer, type Pointer } from 'zod-crud'

export function canvasItemPathToPointer(path: number[]): Pointer {
  return buildPointer(
    path.flatMap((index, depth) =>
      depth === 0 ? [index] : ['children', index]),
  )
}
