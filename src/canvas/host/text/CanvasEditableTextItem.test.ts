import { describe, expect, it } from 'vitest'
import type {
  CanvasItem,
  RectItem,
  TextItem,
} from '../model'
import {
  getCanvasEditableTextValue,
  getCommittedCanvasEditableTextValue,
  isCanvasEditableTextItem,
  isCanvasEditableTextItemStorageShape,
  isCanvasTextItem,
} from './CanvasEditableTextItem'

const rectItem: RectItem = {
  fill: '#ffffff',
  h: 60,
  id: 'rect-1',
  stroke: '#111827',
  text: 'Frame',
  type: 'rect',
  w: 80,
  x: 0,
  y: 0,
}

const textItem: TextItem = {
  h: 40,
  id: 'text-1',
  text: 'Label',
  type: 'text',
  w: 120,
  x: 0,
  y: 0,
}

describe('CanvasEditableTextItem', () => {
  it('recognizes items editable by the text editor', () => {
    expect(isCanvasEditableTextItem(rectItem)).toBe(true)
    expect(isCanvasEditableTextItem(textItem)).toBe(true)
    expect(isCanvasTextItem(textItem)).toBe(true)
    expect(isCanvasTextItem(rectItem)).toBe(false)
    expect(isCanvasEditableTextItem(createComponentItem())).toBe(false)
  })

  it('owns rect and text item storage shapes', () => {
    expect(isCanvasEditableTextItemStorageShape(rectItem)).toBe(true)
    expect(isCanvasEditableTextItemStorageShape({
      ...rectItem,
      text: undefined,
    })).toBe(true)
    expect(isCanvasEditableTextItemStorageShape(textItem)).toBe(true)
    expect(isCanvasEditableTextItemStorageShape({
      ...rectItem,
      fill: 1,
    })).toBe(false)
    expect(isCanvasEditableTextItemStorageShape({
      ...textItem,
      text: undefined,
    })).toBe(false)
  })

  it('normalizes editable text values by item kind', () => {
    expect(getCanvasEditableTextValue(rectItem)).toBe('Frame')
    expect(getCanvasEditableTextValue({ ...rectItem, text: undefined }))
      .toBe('')
    expect(getCanvasEditableTextValue(textItem)).toBe('Label')
  })

  it('keeps empty text items visible while allowing empty rect text', () => {
    expect(getCommittedCanvasEditableTextValue({
      item: textItem,
      value: '   ',
    })).toBe('Text')
    expect(getCommittedCanvasEditableTextValue({
      item: rectItem,
      value: '   ',
    })).toBe('   ')
  })
})

function createComponentItem(): CanvasItem {
  return {
    accent: '#2563eb',
    component: 'status-card',
    fill: '#eff6ff',
    h: 96,
    id: 'component-1',
    stroke: '#93c5fd',
    title: 'Status',
    type: 'component',
    w: 180,
    x: 80,
    y: 120,
  }
}
