import { useState } from 'react'
import type { CanvasDocumentTextSearch } from './CanvasWorkflowContract'
import { getCanvasFindReplaceModel } from './CanvasFindReplaceModel'

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
