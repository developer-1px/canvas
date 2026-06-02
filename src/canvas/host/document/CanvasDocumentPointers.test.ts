import { describe, expect, test } from 'vitest'

import { canvasItemPathToPointer } from './CanvasDocumentPointers'

describe('CanvasDocumentPointers', () => {
  test('maps canvas item tree paths to zod-crud JSON Pointers', () => {
    expect(canvasItemPathToPointer([])).toBe('')
    expect(canvasItemPathToPointer([0])).toBe('/0')
    expect(canvasItemPathToPointer([0, 2])).toBe('/0/children/2')
    expect(canvasItemPathToPointer([0, 2, 1]))
      .toBe('/0/children/2/children/1')
  })
})
