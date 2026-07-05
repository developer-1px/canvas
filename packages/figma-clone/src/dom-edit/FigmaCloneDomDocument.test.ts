import { describe, expect, it } from 'vitest'
import {
  createFigmaCloneDomDocument,
} from './FigmaCloneDomDocument'
import {
  updateFigmaCloneDomAutoLayoutField,
  updateFigmaCloneDomEditField,
  updateFigmaCloneDomText,
} from './FigmaCloneDomEditModel'

describe('FigmaCloneDomDocument', () => {
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
        nodeId: 'workspaceHeroActions',
        state: document.value.state,
        value: 'center',
      }),
    })).toMatchObject({ ok: true })
    expect(document.value.state.workspaceHeroActions.distribution).toBe('center')

    expect(document.history.undo()).toBe(true)
    expect(document.value.state.workspaceHeroActions.distribution).toBe('packed')

    expect(document.history.redo()).toBe(true)
    expect(document.value.state.workspaceHeroActions.distribution).toBe('center')
  })

  it('commits DOM text edits through json-document history', () => {
    const document = createFigmaCloneDomDocument()

    expect(document.replace('', {
      ...document.value,
      textState: updateFigmaCloneDomText({
        nodeId: 'workspaceHeroTitle',
        state: document.value.textState,
        value: 'Pipeline control',
      }),
    })).toMatchObject({ ok: true })
    expect(document.value.textState.workspaceHeroTitle).toBe('Pipeline control')

    expect(document.history.undo()).toBe(true)
    expect(document.value.textState.workspaceHeroTitle).toBe('Revenue operations')
  })
})
