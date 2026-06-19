import { describe, expect, it } from 'vitest'
import { MAX_SCALE, MIN_SCALE } from '../../../core'
import { getCanvasStatusModel } from './CanvasStatusModel'

describe('CanvasStatusModel', () => {
  it('reports viewport scale through the shared viewport scale contract', () => {
    expect(createStatus({ scale: 1.25 }).scalePercent).toBe(125)
    expect(createStatus({ scale: Number.NaN }).scalePercent).toBe(
      Math.round(MIN_SCALE * 100),
    )
    expect(createStatus({ scale: MAX_SCALE * 2 }).scalePercent).toBe(
      Math.round(MAX_SCALE * 100),
    )
  })
})

function createStatus({
  scale,
}: {
  scale: number
}) {
  return getCanvasStatusModel({
    customTools: [],
    gesture: 'none',
    selectionLength: 0,
    tool: 'select',
    viewport: { scale },
  })
}
