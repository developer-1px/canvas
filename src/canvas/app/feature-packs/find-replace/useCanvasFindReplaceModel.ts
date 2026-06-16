import { useState } from 'react'
import type {
  CanvasAppDocumentTextSearch,
} from '../../workspace/document/CanvasAppDocumentContracts'
import { getCanvasFindReplaceModel } from './CanvasFindReplaceModel'

type UseCanvasFindReplaceModelArgs = CanvasAppDocumentTextSearch & {
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
