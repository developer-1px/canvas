import { describe, expect, it } from 'vitest'
import type { CanvasComponentItem } from '../model'
import {
  CANVAS_STICKY_COMPONENT_KIND,
  applyCanvasStickyComponentCreationDefaults,
  isCanvasStickyComponentItem,
} from './CanvasStickyComponent'

describe('CanvasStickyComponent', () => {
  it('identifies the built-in sticky component kind', () => {
    expect(isCanvasStickyComponentItem(createComponentItem('sticky'))).toBe(true)
    expect(isCanvasStickyComponentItem(createComponentItem('card'))).toBe(false)
  })

  it('creates blank sticky body defaults for immediate authoring flows', () => {
    expect(
      applyCanvasStickyComponentCreationDefaults({
        ...createComponentItem(CANVAS_STICKY_COMPONENT_KIND),
        body: 'Template body',
      }),
    ).toMatchObject({
      body: '',
      component: CANVAS_STICKY_COMPONENT_KIND,
    })
  })
})

function createComponentItem(component: string): CanvasComponentItem {
  return {
    accent: '#111111',
    component,
    fill: '#ffffff',
    h: 80,
    id: 'component-1',
    stroke: '#222222',
    title: 'Component',
    type: 'component',
    w: 120,
    x: 10,
    y: 20,
  }
}
