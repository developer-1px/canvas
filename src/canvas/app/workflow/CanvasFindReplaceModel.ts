import type { CanvasDocumentTextSearch } from './CanvasWorkflowContract'

type CanvasFindReplaceModelArgs = CanvasDocumentTextSearch & {
  enabled: boolean
  open: boolean
  query: string
  replacement: string
  setOpen: (open: boolean) => void
  setQuery: (query: string) => void
  setReplacement: (replacement: string) => void
}

export function getCanvasFindReplaceModel({
  enabled,
  findDocumentText,
  open,
  query,
  replacement,
  replaceDocumentText,
  setOpen,
  setQuery,
  setReplacement,
}: CanvasFindReplaceModelArgs) {
  const matches = enabled ? findDocumentText(query) : []
  const matchCount = matches.reduce(
    (total, match) => total + match.occurrences,
    0,
  )
  const canReplace = enabled && query.length > 0 && matchCount > 0

  return {
    findReplace: {
      matchCount,
      open: enabled && open,
      query,
      replacement,
      onClose: () => setOpen(false),
      onQueryChange: setQuery,
      onReplaceAll: () => {
        if (canReplace) {
          replaceDocumentText(query, replacement)
        }
      },
      onReplacementChange: setReplacement,
    },
    openFindReplace: () => {
      if (enabled) {
        setOpen(true)
      }
    },
  }
}
