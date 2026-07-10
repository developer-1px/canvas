import { describe, expect, it } from 'vitest'
import {
  CANVAS_APP_LAUNCH_OPTIONS,
  resolveCanvasRootRoute,
} from './CanvasRootRoutes'

describe('CanvasRootRoutes', () => {
  it('opens the launcher on the root route', () => {
    expect(resolveCanvasRootRoute({ pathname: '/', search: '' }))
      .toBe('launcher')
  })

  it('resolves app routes from the first path segment', () => {
    expect(resolveCanvasRootRoute({ pathname: '/figjam', search: '' }))
      .toBe('figjam')
    expect(resolveCanvasRootRoute({ pathname: '/figma', search: '' }))
      .toBe('figma')
    expect(resolveCanvasRootRoute({ pathname: '/engine', search: '' }))
      .toBe('engine')
  })

  it('keeps Figma on one product route', () => {
    expect(resolveCanvasRootRoute({ pathname: '/figma-dom', search: '' }))
      .toBe('launcher')
    expect(resolveCanvasRootRoute({
      pathname: '/',
      search: '?demo=figma-dom',
    })).toBe('launcher')
    expect(CANVAS_APP_LAUNCH_OPTIONS.map((option) => option.href))
      .not.toContain('/figma-dom')
  })

  it('keeps legacy demo query routes working', () => {
    expect(resolveCanvasRootRoute({ pathname: '/', search: '?demo=figma' }))
      .toBe('figma')
    expect(resolveCanvasRootRoute({ pathname: '/', search: '?demo=figjam' }))
      .toBe('figjam')
    expect(resolveCanvasRootRoute({ pathname: '/', search: '?demo=engine' }))
      .toBe('engine')
  })

  it('keeps the launcher catalog aligned with the path routes', () => {
    expect(CANVAS_APP_LAUNCH_OPTIONS.map((option) => option.href)).toEqual([
      '/figjam',
      '/figma',
      '/engine',
    ])
  })
})
