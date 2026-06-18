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

  it('preserves host item types through transformer pipelines', () => {
    type HostItem = {
      id: string
      kind: 'ppt-shape'
      slideId: string
      x: number
    }
    const hostItem: HostItem = {
      id: 'shape-1',
      kind: 'ppt-shape',
      slideId: 'slide-1',
      x: 10,
    }
    const transformer: CanvasAppItemsChangeTransformer<HostItem> = {
      id: 'host-transformer',
      transform: ({ change }) =>
        change.type === 'replace-changed'
          ? {
              ...change,
              items: change.items.map((item) => ({
                ...item,
                x: item.x + 5,
              })),
            }
          : change,
    }

    const result = transformCanvasAppItemsChange<HostItem>({
      change: {
        items: [hostItem],
        type: 'replace-changed',
      },
      componentDefinitionRegistry: CANVAS_COMPONENT_DEFINITION_REGISTRY,
      currentItems: [hostItem],
      transformers: [transformer],
    })

    if (result.type !== 'replace-changed') {
      throw new Error('Expected host replace-changed result')
    }

    const transformedHostItem: HostItem = result.items[0]!

    expect(transformedHostItem.slideId).toBe('slide-1')
    expect(transformedHostItem.x).toBe(15)
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
