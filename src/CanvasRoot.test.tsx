import { describe, expect, it } from 'vitest'
import { getCanvasSurfaceRoute } from './CanvasRoute'

describe('CanvasRoot', () => {
  it('routes the default surface to the product board', () => {
    expect(getCanvasSurfaceRoute('/')).toBe('product')
    expect(getCanvasSurfaceRoute('/board')).toBe('product')
  })

  it('keeps the engine verification demo on /engine', () => {
    expect(getCanvasSurfaceRoute('/engine')).toBe('engine')
    expect(getCanvasSurfaceRoute('/engine/')).toBe('engine')
    expect(getCanvasSurfaceRoute('/engine/smoke')).toBe('engine')
  })
})
