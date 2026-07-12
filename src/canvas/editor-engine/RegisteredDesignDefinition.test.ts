import { describe, expect, it, vi } from 'vitest'

import type { DesignNode } from '../design-document'
import { defineRegisteredDesignDefinition } from './RegisteredDesignDefinition'

describe('RegisteredDesignDefinition', () => {
  it.each(['component', 'widget'] as const)(
    'validates and owns %s creation through the same headless contract',
    (kind) => {
      const id = `test.${kind}`
      const definition = defineRegisteredDesignDefinition({
        id,
        kind,
        props: {
          defaults: { tone: 'info' as const },
          safeParse: (value) =>
            value &&
            typeof value === 'object' &&
            'tone' in value &&
            value.tone === 'info'
              ? { ok: true as const, value: { tone: value.tone } }
              : { ok: false as const, reason: 'tone must be info' },
        },
        create: ({ nodeId, x, y }) => createNode({ id, kind, nodeId, x, y }),
        capabilities: {
          textEdit: false,
          transform: { move: true, resize: true },
        },
      })

      const node = definition.create({ nodeId: `${kind}-1`, x: 12, y: 24 })

      expect(node).toMatchObject({
        id: `${kind}-1`,
        definition: { id, kind },
        frame: { x: 12, y: 24 },
        props: { tone: 'info' },
      })
      expect(Object.isFrozen(node)).toBe(true)
      expect(Object.isFrozen(node.props)).toBe(true)
    },
  )

  it('rejects invalid component creator output at the headless definition seam', () => {
    const definition = defineRegisteredDesignDefinition({
      id: 'test.card',
      kind: 'component',
      props: {
        defaults: {},
        safeParse: () => ({ ok: true as const, value: {} }),
      },
      create: (input) => ({
        ...createNode({
          id: 'test.card',
          kind: 'component',
          nodeId: input.nodeId,
          x: input.x,
          y: input.y,
        }),
        id: 'changed-id',
      }),
      capabilities: {
        textEdit: false,
        transform: { move: true, resize: true },
      },
    })

    expect(() => definition.create({ nodeId: 'card-1', x: 0, y: 0 }))
      .toThrow(
        'Registered design definition test.card creator changed node id: card-1',
      )
  })

  it('validates creation input before invoking user creator code', () => {
    const create = vi.fn(({ nodeId, x, y }) => createNode({
      id: 'test.card',
      kind: 'component',
      nodeId,
      x,
      y,
    }))
    const definition = defineRegisteredDesignDefinition({
      id: 'test.card',
      kind: 'component',
      props: {
        defaults: { tone: 'info' as const },
        safeParse: () => ({
          ok: true as const,
          value: { tone: 'info' as const },
        }),
      },
      create,
      capabilities: {
        textEdit: false,
        transform: { move: true, resize: true },
      },
    })

    expect(() => definition.create({ nodeId: '', x: 0, y: 0 }))
      .toThrow('requires a node id')
    expect(create).not.toHaveBeenCalled()
  })

  it('rejects multiline creator text when the definition is single-line', () => {
    const definition = defineRegisteredDesignDefinition({
      id: 'test.label',
      kind: 'component',
      props: {
        defaults: { tone: 'info' as const },
        safeParse: () => ({
          ok: true as const,
          value: { tone: 'info' as const },
        }),
      },
      create: ({ nodeId, x, y }) => ({
        ...createNode({
          id: 'test.label',
          kind: 'component',
          nodeId,
          x,
          y,
        }),
        text: 'First\nSecond',
      }),
      capabilities: {
        textEdit: { source: 'node-text', multiline: false },
        transform: { move: true, resize: true },
      },
    })

    expect(() => definition.create({ nodeId: 'label-1', x: 0, y: 0 }))
      .toThrow('requires single-line text')
  })
})

function createNode({
  id,
  kind,
  nodeId,
  x,
  y,
}: {
  readonly id: string
  readonly kind: 'component' | 'widget'
  readonly nodeId: string
  readonly x: number
  readonly y: number
}): DesignNode {
  return {
    id: nodeId,
    label: nodeId,
    definition: { id, kind },
    children: [],
    props: { tone: 'info' },
    text: null,
    layout: {},
    style: {},
    frame: {
      x,
      y,
      width: 120,
      height: 80,
      rotation: 0,
      widthMode: 'fixed',
      heightMode: 'fixed',
      overflow: 'visible',
    },
    component: null,
  }
}
