import { describe, expect, it } from 'vitest'
import {
  createReactDesignDefinitionRegistry,
} from '@interactive-os/canvas/react-design'
import {
  FIGJAM_PRODUCT_PACK,
  createFigJamStickyNoteNode,
} from '@interactive-os/figjam-pack'

import {
  ownFigJamCreatedNode,
  ownFigJamDocumentPlanCreatedNodes,
} from './FigJamCreationOwnership'

const registry = createReactDesignDefinitionRegistry({
  definitions: FIGJAM_PRODUCT_PACK.definitions,
  intrinsics: [],
})

describe('FigJamCreationOwnership', () => {
  it('owns every registered add in a document plan before execution', () => {
    const sticky = createFigJamStickyNoteNode({
      nodeId: 'sticky-1',
      x: 24,
      y: 48,
    })
    const plan = ownFigJamDocumentPlanCreatedNodes({
      changes: [{
        index: 0,
        node: sticky,
        parentId: null,
        type: 'add',
      }],
      selection: [sticky.id],
    }, registry)
    const change = plan.changes[0]

    expect(change?.type).toBe('add')
    expect(change?.type === 'add' && Object.isFrozen(change.node)).toBe(true)
  })

  it('rejects a node whose registered definition cannot own it', () => {
    const sticky = createFigJamStickyNoteNode({
      nodeId: 'sticky-1',
      x: 24,
      y: 48,
    })

    expect(() => ownFigJamCreatedNode({
      ...sticky,
      definition: { ...sticky.definition, id: 'figjam.missing' },
    }, registry)).toThrow('Unknown FigJam design definition')
  })
})
