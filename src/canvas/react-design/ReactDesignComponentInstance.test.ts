import { describe, expect, it } from 'vitest'

import { createDesignDocument } from '../design-document'
import {
  createReactDesignComponentInstance,
  type ReactDesignComponentInstanceTreeNode,
} from './ReactDesignComponentInstance'

describe('createReactDesignComponentInstance', () => {
  it('creates one atomic command for an editable named-slot tree', () => {
    const document = createDesignDocument({
      schemaVersion: 1,
      roots: ['workspace'],
      nodes: [{
        ...createIntrinsicNode('workspace', 'main'),
        children: [],
        component: null,
      }],
    })
    const instance = createReactDesignComponentInstance({
      instanceId: 'stay-card-1',
      label: 'Insert stay card',
      parentId: 'workspace',
      index: 0,
      root: {
        node: createComponentNode('stay-card', 'travel.stay-card'),
        slotId: 'root',
        children: [
          {
            node: createIntrinsicNode('stay-image', 'img'),
            slotId: 'image',
          },
          {
            node: createIntrinsicNode('stay-title', 'h2', 'Hanok stay'),
            slotId: 'title',
          },
        ],
      },
    })

    expect(instance.rootId).toBe('stay-card')
    expect(document.execute(instance.command)).toEqual({
      changed: true,
      ok: true,
    })
    expect(document.read.node('workspace')?.children).toEqual(['stay-card'])
    expect(document.read.node('stay-card')?.children).toEqual([
      'stay-image',
      'stay-title',
    ])
    expect(document.read.node('stay-title')?.component).toEqual({
      definitionId: 'travel.stay-card',
      instanceId: 'stay-card-1',
      slotId: 'title',
    })

    expect(document.undo()).toBe(true)
    expect(document.read.node('stay-card')).toBeNull()
    expect(document.redo()).toBe(true)
    expect(document.read.node('stay-title')?.text).toBe('Hanok stay')
  })

  it('rejects duplicate slot ids before producing a command', () => {
    const duplicateSlotTree: ReactDesignComponentInstanceTreeNode = {
      node: createComponentNode('stay-card', 'travel.stay-card'),
      slotId: 'root',
      children: [
        {
          node: createIntrinsicNode('stay-title', 'h2'),
          slotId: 'title',
        },
        {
          node: createIntrinsicNode('stay-subtitle', 'p'),
          slotId: 'title',
        },
      ],
    }

    expect(() => createReactDesignComponentInstance({
      instanceId: 'stay-card-1',
      label: 'Insert stay card',
      parentId: null,
      index: 0,
      root: duplicateSlotTree,
    })).toThrow(
      'Duplicate React design component slot: travel.stay-card/stay-card-1/title',
    )
  })
})

function createComponentNode(id: string, definitionId: string) {
  return {
    id,
    label: id,
    definition: { kind: 'component' as const, id: definitionId },
    props: {},
    text: null,
    layout: {},
    style: {},
    frame: null,
  }
}

function createIntrinsicNode(
  id: string,
  definitionId: string,
  text: string | null = null,
) {
  return {
    id,
    label: id,
    definition: { kind: 'intrinsic' as const, id: definitionId },
    props: {},
    text,
    layout: {},
    style: {},
    frame: null,
  }
}
