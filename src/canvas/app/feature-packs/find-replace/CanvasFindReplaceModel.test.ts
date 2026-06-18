import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { CanvasDocumentTextSearch } from '../../workflow/CanvasWorkflowContract'
import { getCanvasFindReplaceModel } from './CanvasFindReplaceModel'

describe('CanvasFindReplaceModel', () => {
  it('builds find replace view props from document search results', () => {
    const model = createModel({
      query: 'hello',
      replacement: 'world',
    })

    expect(model.findReplace.matchCount).toBe(5)
    expect(model.findReplace.open).toBe(true)
    expect(model.findReplace.query).toBe('hello')
    expect(model.findReplace.replacement).toBe('world')
  })

  it('routes panel state changes through owned setters', () => {
    const setOpen = vi.fn()
    const setQuery = vi.fn()
    const setReplacement = vi.fn()
    const model = createModel({
      setOpen,
      setQuery,
      setReplacement,
    })

    model.findReplace.onClose()
    model.findReplace.onQueryChange('next')
    model.findReplace.onReplacementChange('value')

    expect(setOpen).toHaveBeenCalledWith(false)
    expect(setQuery).toHaveBeenCalledWith('next')
    expect(setReplacement).toHaveBeenCalledWith('value')
  })

  it('opens and replaces only when find replace is enabled and has matches', () => {
    const setOpen = vi.fn()
    const replaceDocumentText = vi.fn()
    const model = createModel({
      query: 'hello',
      replacement: 'world',
      replaceDocumentText,
      setOpen,
    })

    model.openFindReplace()
    model.findReplace.onReplaceAll()

    expect(setOpen).toHaveBeenCalledWith(true)
    expect(replaceDocumentText).toHaveBeenCalledWith('hello', 'world')
  })

  it('contains disabled and empty-result replace requests', () => {
    const disabledFindDocumentText = vi.fn(() => createMatches(2))
    const disabledReplaceDocumentText = vi.fn()
    const disabledSetOpen = vi.fn()
    const emptyReplaceDocumentText = vi.fn()

    const disabledModel = createModel({
      enabled: false,
      findDocumentText: disabledFindDocumentText,
      query: 'hello',
      replaceDocumentText: disabledReplaceDocumentText,
      setOpen: disabledSetOpen,
    })
    const emptyModel = createModel({
      findDocumentText: vi.fn(() => []),
      query: 'hello',
      replaceDocumentText: emptyReplaceDocumentText,
    })

    disabledModel.openFindReplace()
    disabledModel.findReplace.onReplaceAll()
    emptyModel.findReplace.onReplaceAll()

    expect(disabledModel.findReplace.matchCount).toBe(0)
    expect(disabledModel.findReplace.open).toBe(false)
    expect(disabledFindDocumentText).not.toHaveBeenCalled()
    expect(disabledSetOpen).not.toHaveBeenCalled()
    expect(disabledReplaceDocumentText).not.toHaveBeenCalled()
    expect(emptyReplaceDocumentText).not.toHaveBeenCalled()
  })
})

function createModel({
  enabled = true,
  findDocumentText = vi.fn(() => createMatches(2, 3)),
  open = true,
  query = '',
  replacement = '',
  replaceDocumentText = vi.fn(),
  setOpen = vi.fn(),
  setQuery = vi.fn(),
  setReplacement = vi.fn(),
}: Partial<Parameters<typeof getCanvasFindReplaceModel>[0]> = {}) {
  return getCanvasFindReplaceModel({
    enabled,
    findDocumentText,
    open,
    query,
    replacement,
    replaceDocumentText,
    setOpen,
    setQuery,
    setReplacement,
  })
}

function createMatches(
  ...occurrences: number[]
): ReturnType<CanvasDocumentTextSearch['findDocumentText']> {
  return occurrences.map((matchOccurrences, index) => ({
    field: 'text',
    itemId: `item-${index}`,
    occurrences: matchOccurrences,
    path: '/0/text' as never,
    value: 'hello',
  }))
}
