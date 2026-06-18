import { describe, expect, it } from 'vitest'
import {
  CANVAS_COMPONENT_DEFINITION_REGISTRY,
} from '../../../host'
import {
  transformCanvasAppItemsChange,
  type CanvasAppItemsChangeTransformer,
} from './CanvasAppItemsChangeTransformers'

describe('CanvasAppItemsChangeTransformers', () => {
  it('applies installed item change transformers in order', () => {
    const first = createTransformer('first', 'rect-2')
    const second = createTransformer('second', 'rect-3')

    expect(transformCanvasAppItemsChange({
      change: {
        items: [createRectItem('rect-1')],
        type: 'replace-changed',
      },
      componentDefinitionRegistry: CANVAS_COMPONENT_DEFINITION_REGISTRY,
      currentItems: [createRectItem('rect-1')],
      transformers: [first, second],
    })).toEqual({
      items: [createRectItem('rect-3')],
      type: 'replace-changed',
    })
  })
})

function createTransformer(
  id: string,
  nextId: string,
): CanvasAppItemsChangeTransformer {
  return {
    id,
    transform: ({ change }) =>
      change.type === 'replace-changed'
        ? {
            ...change,
            items: [createRectItem(nextId)],
          }
        : change,
  }
}

function createRectItem(id: string) {
  return {
    fill: '#ffffff',
    h: 40,
    id,
    stroke: '#111111',
    type: 'rect' as const,
    w: 80,
    x: 0,
    y: 0,
  }
}
