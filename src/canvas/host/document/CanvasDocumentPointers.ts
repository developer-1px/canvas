import type { Pointer } from 'zod-crud'

export function canvasItemPathToPointer(path: number[]): Pointer {
  return `/${path
    .flatMap((index, depth) =>
      depth === 0 ? [String(index)] : ['children', String(index)],
    )
    .join('/')}` as Pointer
}
