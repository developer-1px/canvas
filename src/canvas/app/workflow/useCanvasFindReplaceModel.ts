import {
  useCallback,
  useState,
} from 'react'
import type { CanvasDocumentTextSearch } from './CanvasWorkflowContract'

type UseCanvasFindReplaceModelArgs = CanvasDocumentTextSearch & {
  enabled: boolean
}

export function useCanvasFindReplaceModel({
  enabled,
  findDocumentText,
  replaceDocumentText,
}: UseCanvasFindReplaceModelArgs) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [replacement, setReplacement] = useState('')
  const matches = findDocumentText(query)
  const matchCount = matches.reduce(
    (total, match) => total + match.occurrences,
    0,
  )

  const openFindReplace = useCallback(() => {
    if (enabled) {
      setOpen(true)
    }
  }, [enabled])

  const replaceAllText = useCallback(() => {
    replaceDocumentText(query, replacement)
  }, [query, replacement, replaceDocumentText])

  return {
    findReplace: {
      matchCount,
      open: enabled && open,
      query,
      replacement,
      onClose: () => setOpen(false),
      onQueryChange: setQuery,
      onReplaceAll: replaceAllText,
      onReplacementChange: setReplacement,
    },
    openFindReplace,
  }
}
