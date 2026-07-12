import { describe, expect, it } from 'vitest'
import { createFigJamStickyNoteNode } from '@interactive-os/figjam-pack'

import { resolveFigJamStickyQuickCreateContribution } from './FigJamStickyQuickCreateContribution'

describe('FigJam sticky quick-create contribution', () => {
  it('uses the registered definition parser and hides invalid restored props', () => {
    const sticky = createFigJamStickyNoteNode({
      nodeId: 'sticky-1',
      tone: 'pink',
      x: 0,
      y: 0,
    })

    expect(resolveFigJamStickyQuickCreateContribution(sticky)).toEqual({
      tone: 'pink',
    })
    expect(resolveFigJamStickyQuickCreateContribution({
      ...sticky,
      props: { position: 'absolute', tone: 'neon' },
    })).toBeNull()
    expect(resolveFigJamStickyQuickCreateContribution({
      ...sticky,
      definition: { id: 'figjam.other', kind: 'widget' },
    })).toBeNull()
  })
})
