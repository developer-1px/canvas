import { describe, expect, it } from 'vitest'
import {
  createFigmaCloneDomDocument,
} from './FigmaCloneDomDocument'
import {
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
    })).toEqual({ ok: true })
    expect(document.value.state.card.paddingLeft).toBe(40)
    expect(document.history.canUndo).toBe(true)

    expect(document.history.undo()).toBe(true)
    expect(document.value.state.card.paddingLeft).toBe(24)

    expect(document.history.redo()).toBe(true)
    expect(document.value.state.card.paddingLeft).toBe(40)
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
    })).toEqual({ ok: true })
    expect(document.value.textState.workspaceHeroTitle).toBe('Pipeline control')

    expect(document.history.undo()).toBe(true)
    expect(document.value.textState.workspaceHeroTitle).toBe('Revenue operations')
  })
})
