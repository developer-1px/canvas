import { describe, expect, it } from 'vitest'
import type { DesignDocumentSnapshot } from '@interactive-os/canvas/react-design'

import {
  createFigJamDesignDocument,
  FIGJAM_BOARD_NODE_ID,
  FIGJAM_DESIGN_DOCUMENT_SNAPSHOT,
  restoreFigJamDesignDocument,
} from './FigJamDesignDocument'

describe('FigJam canonical design document', () => {
  it('seeds the complete visible board with stable connector references', () => {
    const document = createFigJamDesignDocument()

    expect(document.snapshot.roots).toEqual([FIGJAM_BOARD_NODE_ID])
    expect(document.snapshot.nodes).toHaveLength(16)
    expect(document.read.children(FIGJAM_BOARD_NODE_ID).map(({ id }) => id))
      .toEqual([
        'figjam-section',
        'figjam-shape',
        'figjam-sticky',
        'figjam-sticky-next',
        'figjam-sticky-note',
        'figjam-ellipse',
        'figjam-diamond',
        'figjam-text',
        'figjam-connector',
        'figjam-connector-note',
        'figjam-drawing',
        'figjam-highlight',
        'figjam-image',
        'figjam-stamp-yes',
        'figjam-stamp-question',
      ])
    expect(countDefinitionIds(document.snapshot)).toEqual({
      'figjam.board': 1,
      'figjam.connector': 2,
      'figjam.drawing': 2,
      'figjam.image': 1,
      'figjam.section': 1,
      'figjam.shape': 3,
      'figjam.stamp': 2,
      'figjam.sticky-note': 3,
      'figjam.text': 1,
    })
    expect(document.read.node('figjam-connector')?.props).toMatchObject({
      end: { attachedNodeId: 'figjam-sticky-next' },
      start: { attachedNodeId: 'figjam-sticky' },
    })
    expect(document.read.node('figjam-connector-note')?.props).toMatchObject({
      end: { attachedNodeId: 'figjam-sticky-note' },
      start: { attachedNodeId: 'figjam-sticky-next' },
    })
    expect(Object.isFrozen(FIGJAM_DESIGN_DOCUMENT_SNAPSHOT)).toBe(true)
  })

  it('round-trips localStorage data without losing identity or references', () => {
    const source = createFigJamDesignDocument()

    expect(source.execute({
      label: 'Edit sticky note',
      changes: [{
        type: 'update',
        nodeId: 'figjam-sticky',
        values: { text: 'Persisted note' },
      }],
    })).toEqual({ ok: true, changed: true })

    const restored = restoreFigJamDesignDocument(source.serialize())

    expect(restored.snapshot).toEqual(source.snapshot)
    expect(restored.read.node('figjam-sticky')?.text).toBe('Persisted note')
    expect(restored.read.node('figjam-connector')?.props).toMatchObject({
      end: { attachedNodeId: 'figjam-sticky-next' },
      start: { attachedNodeId: 'figjam-sticky' },
    })
  })

  it('falls back to the canonical seed for missing or corrupt storage', () => {
    expect(restoreFigJamDesignDocument(null).snapshot)
      .toEqual(FIGJAM_DESIGN_DOCUMENT_SNAPSHOT)
    expect(restoreFigJamDesignDocument('{bad json').snapshot)
      .toEqual(FIGJAM_DESIGN_DOCUMENT_SNAPSHOT)
  })
})

function countDefinitionIds(snapshot: DesignDocumentSnapshot) {
  return Object.fromEntries(
    [...new Set(snapshot.nodes.map(({ definition }) => definition.id))]
      .map((definitionId) => [
        definitionId,
        snapshot.nodes.filter(({ definition }) =>
          definition.id === definitionId).length,
      ]),
  )
}
