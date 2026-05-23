import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../../entities'
import { getCanvasObjectInspectorLabel } from './CanvasObjectInspectorLabel'

describe('CanvasObjectInspectorLabel', () => {
  it('uses the stable item title contract before falling back to item type', () => {
    expect(labelFor([createRectItem()], 1)).toBe('Rect')
    expect(labelFor([createComponentItem()], 1)).toBe('Decision Card')
    expect(labelFor([createCustomItem()], 1)).toBe('Risk')
  })

  it('labels empty and multi-selection states without item type branching', () => {
    expect(labelFor([], 0)).toBeNull()
    expect(labelFor([createRectItem(), createCustomItem()], 2)).toBe(
      '2 selected',
    )
    expect(labelFor([], 1)).toBeNull()
  })
})

function labelFor(selectedItems: CanvasItem[], selectionLength: number) {
  return getCanvasObjectInspectorLabel({
    selectedItems,
    selectionLength,
  })
}

function createRectItem(): CanvasItem {
  return {
    fill: '#ffffff',
    h: 40,
    id: 'rect-1',
    stroke: '#111111',
    type: 'rect',
    w: 80,
    x: 10,
    y: 20,
  }
}

function createComponentItem(): CanvasItem {
  return {
    accent: '#2563eb',
    component: 'decision-card',
    fill: '#ffffff',
    h: 90,
    id: 'component-1',
    stroke: '#111111',
    title: 'Decision Card',
    type: 'component',
    w: 140,
    x: 10,
    y: 20,
  }
}

function createCustomItem(): CanvasItem {
  return {
    data: { severity: 'High' },
    h: 92,
    id: 'risk-1',
    kind: 'risk',
    presentation: 'risk-node',
    title: 'Risk',
    type: 'custom',
    w: 180,
    x: 10,
    y: 20,
  }
}
