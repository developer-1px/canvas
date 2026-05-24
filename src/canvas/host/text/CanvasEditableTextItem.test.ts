import { describe, expect, it } from 'vitest'
import type {
  CanvasComponentItem,
  RectItem,
  TextItem,
} from '../model'
import {
  getCanvasEditableTextPatchOperation,
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
    expect(isCanvasEditableTextItem(createComponentItem('sticky'))).toBe(true)
    expect(isCanvasEditableTextItem(createComponentItem('status-card')))
      .toBe(false)
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
    expect(getCanvasEditableTextValue(createComponentItem('sticky'))).toBe(
      'Decision note',
    )
    expect(getCanvasEditableTextValue({
      ...createComponentItem('sticky'),
      body: undefined,
    })).toBe('')
  })

  it('keeps empty text items visible while allowing empty rect and sticky text', () => {
    expect(getCommittedCanvasEditableTextValue({
      item: textItem,
      value: '   ',
    })).toBe('Text')
    expect(getCommittedCanvasEditableTextValue({
      item: rectItem,
      value: '   ',
    })).toBe('   ')
    expect(getCommittedCanvasEditableTextValue({
      item: createComponentItem('sticky'),
      value: '',
    })).toBe('')
  })

  it('owns the patch operation for editable text storage', () => {
    expect(getCanvasEditableTextPatchOperation({
      ...rectItem,
      text: undefined,
    })).toBe('add')
    expect(getCanvasEditableTextPatchOperation({
      ...createComponentItem('sticky'),
      body: undefined,
    })).toBe('add')
    expect(getCanvasEditableTextPatchOperation(rectItem)).toBe('replace')
    expect(getCanvasEditableTextPatchOperation(textItem)).toBe('replace')
    expect(getCanvasEditableTextPatchOperation(createComponentItem('sticky')))
      .toBe('replace')
  })
})

function createComponentItem(component: string): CanvasComponentItem {
  return {
    accent: '#2563eb',
    body: 'Decision note',
    component,
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
