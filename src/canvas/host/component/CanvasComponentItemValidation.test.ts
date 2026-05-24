import { describe, expect, it } from 'vitest'
import type { CanvasComponentItem } from '../model'
import { isCanvasComponentItemStorageShape } from './CanvasComponentItemValidation'

const componentItem: CanvasComponentItem = {
  accent: '#2563eb',
  body: 'Track the release',
  columns: ['Owner', 'Status'],
  component: 'status-card',
  fill: '#eff6ff',
  h: 96,
  id: 'component-1',
  items: ['Design', 'Build'],
  stroke: '#93c5fd',
  title: 'Status',
  type: 'component',
  w: 180,
  x: 80,
  y: 120,
}

describe('CanvasComponentItemValidation', () => {
  it('accepts component item storage shapes', () => {
    expect(isCanvasComponentItemStorageShape(componentItem)).toBe(true)
    expect(isCanvasComponentItemStorageShape({
      ...componentItem,
      body: undefined,
      columns: undefined,
      items: undefined,
    })).toBe(true)
    expect(isCanvasComponentItemStorageShape({
      ...componentItem,
      url: 'https://example.com/reference',
    })).toBe(true)
  })

  it('rejects component ids outside the stable id contract', () => {
    expect(isCanvasComponentItemStorageShape({
      ...componentItem,
      component: 'Status Card',
    })).toBe(false)
  })

  it('rejects component fields that cannot render predictably', () => {
    expect(isCanvasComponentItemStorageShape({
      ...componentItem,
      title: 1,
    })).toBe(false)
    expect(isCanvasComponentItemStorageShape({
      ...componentItem,
      fill: null,
    })).toBe(false)
    expect(isCanvasComponentItemStorageShape({
      ...componentItem,
      items: ['Design', 1],
    })).toBe(false)
    expect(isCanvasComponentItemStorageShape({
      ...componentItem,
      columns: 'Owner',
    })).toBe(false)
    expect(isCanvasComponentItemStorageShape({
      ...componentItem,
      url: 'mailto:team@example.com',
    })).toBe(false)
  })
})
