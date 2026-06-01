import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../model'
import {
  canSelectSameTypeCanvasSelection,
  selectSameTypeCanvasSelection,
} from './CanvasItemSelectionQuery'

const items: CanvasItem[] = [
  shape('shape-1'),
  shape('shape-2'),
  shape('shape-3'),
  text('text-1'),
  sticky('sticky-1'),
  sticky('sticky-2'),
  section('section-1'),
]

describe('CanvasItemSelectionQuery', () => {
  test('widens the selection to every item of the same type', () => {
    expect(selectSameTypeCanvasSelection(items, ['shape-1']).sort()).toEqual([
      'shape-1',
      'shape-2',
      'shape-3',
    ])
  })

  test('keys components by concrete component kind so sticky excludes section', () => {
    expect(selectSameTypeCanvasSelection(items, ['sticky-1']).sort()).toEqual([
      'sticky-1',
      'sticky-2',
    ])
  })

  test('unions kinds across a mixed selection', () => {
    expect(selectSameTypeCanvasSelection(items, ['text-1', 'sticky-1']).sort())
      .toEqual(['sticky-1', 'sticky-2', 'text-1'])
  })

  test('reports availability only when the selection can grow', () => {
    expect(canSelectSameTypeCanvasSelection(items, [])).toBe(false)
    expect(canSelectSameTypeCanvasSelection(items, ['text-1'])).toBe(false)
    expect(canSelectSameTypeCanvasSelection(items, ['shape-1'])).toBe(true)
  })
})

function shape(id: string): Extract<CanvasItem, { type: 'shape' }> {
  return {
    fill: '#ffffff',
    h: 40,
    id,
    shapeType: 'rect',
    stroke: '#111827',
    type: 'shape',
    w: 80,
    x: 0,
    y: 0,
  }
}

function text(id: string): Extract<CanvasItem, { type: 'text' }> {
  return { h: 24, id, text: 'Label', type: 'text', w: 80, x: 0, y: 0 }
}

function sticky(id: string): Extract<CanvasItem, { type: 'component' }> {
  return {
    accent: '#f59e0b',
    body: '',
    component: 'sticky',
    fill: '#fde68a',
    h: 80,
    id,
    stroke: '#f59e0b',
    title: '',
    type: 'component',
    w: 80,
    x: 0,
    y: 0,
  }
}

function section(id: string): Extract<CanvasItem, { type: 'component' }> {
  return {
    accent: '#64748b',
    body: '',
    component: 'section',
    fill: 'rgba(241,245,249,0.18)',
    h: 180,
    id,
    stroke: '#94a3b8',
    title: 'Section',
    type: 'component',
    w: 260,
    x: 0,
    y: 0,
  }
}
