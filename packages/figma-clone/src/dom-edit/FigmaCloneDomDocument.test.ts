import { describe, expect, it } from 'vitest'
import {
  createFigmaCloneDomDocument,
  createFigmaCloneDomDocumentValue,
} from './FigmaCloneDomDocument'
import {
  updateFigmaCloneDomAutoLayoutField,
  updateFigmaCloneDomEditField,
  updateFigmaCloneDomText,
} from './FigmaCloneDomEditModel'

describe('FigmaCloneDomDocument', () => {
  it('keeps workspace-owned nodes out of the legacy document value', () => {
    const value = createFigmaCloneDomDocumentValue()

    expect(Object.keys(value.state).filter(isWorkspaceKey)).toEqual([])
    expect(Object.keys(value.textState).filter(isWorkspaceKey)).toEqual([])
  })

  it('rejects attempts to dual-write workspace nodes', () => {
    const document = createFigmaCloneDomDocument()

    expect(document.replace('', {
      ...document.value,
      state: {
        ...document.value.state,
        workspaceHeroTitle: document.value.state.homeHeroTitle,
      },
    })).toMatchObject({ ok: false })
    expect(document.value.state).not.toHaveProperty('workspaceHeroTitle')
  })

  it('commits DOM style edits through json-document history', () => {
    const document = createFigmaCloneDomDocument()

    expect(document.replace('', {
      ...document.value,
      state: updateFigmaCloneDomEditField({
        field: 'paddingLeft',
        nodeId: 'card',
        state: document.value.state,
        value: 40,
      }),
    })).toMatchObject({ ok: true })
    expect(document.value.state.card.paddingLeft).toBe(40)
    expect(document.history.canUndo).toBe(true)

    expect(document.history.undo()).toBe(true)
    expect(document.value.state.card.paddingLeft).toBe(24)

    expect(document.history.redo()).toBe(true)
    expect(document.value.state.card.paddingLeft).toBe(40)
  })

  it('commits DOM auto layout edits through json-document history', () => {
    const document = createFigmaCloneDomDocument()

    expect(document.replace('', {
      ...document.value,
      state: updateFigmaCloneDomAutoLayoutField({
        field: 'distribution',
        nodeId: 'homeHeroActions',
        state: document.value.state,
        value: 'center',
      }),
    })).toMatchObject({ ok: true })
    expect(document.value.state.homeHeroActions.distribution).toBe('center')

    expect(document.history.undo()).toBe(true)
    expect(document.value.state.homeHeroActions.distribution).toBe('packed')

    expect(document.history.redo()).toBe(true)
    expect(document.value.state.homeHeroActions.distribution).toBe('center')
  })

  it('commits DOM text edits through json-document history', () => {
    const document = createFigmaCloneDomDocument()

    expect(document.replace('', {
      ...document.value,
      textState: updateFigmaCloneDomText({
        nodeId: 'homeHeroTitle',
        state: document.value.textState,
        value: 'Layout is editorial rhythm',
      }),
    })).toMatchObject({ ok: true })
    expect(document.value.textState.homeHeroTitle).toBe(
      'Layout is editorial rhythm',
    )

    expect(document.history.undo()).toBe(true)
    expect(document.value.textState.homeHeroTitle).toBe(
      'The homepage is an article before it is an interface',
    )
  })
})

function isWorkspaceKey(key: string) {
  return key.startsWith('workspace')
}
