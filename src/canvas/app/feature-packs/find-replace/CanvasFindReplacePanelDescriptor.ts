export const CANVAS_FIND_REPLACE_PANEL_MODEL = 'canvas-find-replace-panel'

export type CanvasFindReplacePanelRootAttributes = {
  'aria-label': 'Find and replace'
  role: 'search'
}

export type CanvasFindReplaceQueryInputAttributes = {
  'aria-describedby': string
  'aria-label': 'Find'
  type: 'search'
}

export type CanvasFindReplaceReplacementInputAttributes = {
  'aria-label': 'Replace'
}

export type CanvasFindReplaceCountStatusAttributes = {
  'aria-atomic': true
  'aria-label': string
  'aria-live': 'polite'
  id: string
  role: 'status'
}

export type CanvasFindReplacePanelDescriptor = {
  countStatusAttributes: CanvasFindReplaceCountStatusAttributes
  countStatusId: string
  matchCountLabel: string
  model: typeof CANVAS_FIND_REPLACE_PANEL_MODEL
  queryInputAttributes: CanvasFindReplaceQueryInputAttributes
  replacementInputAttributes: CanvasFindReplaceReplacementInputAttributes
  rootAttributes: CanvasFindReplacePanelRootAttributes
}

export type CanvasFindReplacePanelDescriptorInput = {
  controlId: string
  matchCount: number
  query: string
}

export type CanvasFindReplaceMatchCountLabelInput = {
  matchCount: number
  query: string
}

export function createCanvasFindReplacePanelDescriptor({
  controlId,
  matchCount,
  query,
}: CanvasFindReplacePanelDescriptorInput): CanvasFindReplacePanelDescriptor {
  const countStatusId = `${controlId}-count`
  const matchCountLabel = getCanvasFindReplaceMatchCountLabel({
    matchCount,
    query,
  })

  return {
    countStatusAttributes: {
      'aria-atomic': true,
      'aria-label': matchCountLabel,
      'aria-live': 'polite',
      id: countStatusId,
      role: 'status',
    },
    countStatusId,
    matchCountLabel,
    model: CANVAS_FIND_REPLACE_PANEL_MODEL,
    queryInputAttributes: {
      'aria-describedby': countStatusId,
      'aria-label': 'Find',
      type: 'search',
    },
    replacementInputAttributes: {
      'aria-label': 'Replace',
    },
    rootAttributes: {
      'aria-label': 'Find and replace',
      role: 'search',
    },
  }
}

export function getCanvasFindReplaceMatchCountLabel({
  matchCount,
  query,
}: CanvasFindReplaceMatchCountLabelInput) {
  const visibleMatchCount = query.length > 0 ? Math.max(0, matchCount) : 0

  return visibleMatchCount === 1
    ? '1 match'
    : `${visibleMatchCount} matches`
}
