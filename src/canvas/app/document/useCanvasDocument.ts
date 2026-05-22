import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { JSONPatchOperation } from 'zod-crud'
import type { CanvasItem } from '../../host/model/CanvasModel'
import {
  copyCanvasDocumentSelectionToClipboard,
  readCanvasDocumentClipboardItems,
  writeCanvasDocumentClipboardItems,
} from '../../host/document/CanvasDocumentClipboard'
import {
  canvasItemsEqual,
  commitCanvasDocumentSelection,
  commitCanvasItemsDocument,
  commitCanvasItemsPatch,
  createCanvasItemsDocument,
  createReplaceCanvasDocumentTextPatch,
  findCanvasDocumentText,
  getCanvasDocumentSelectionIds,
  loadCanvasItemsDocument,
  replaceCanvasItems,
  restoreCanvasDocumentSelection,
  type CanvasTextSearchMatch,
  type CanvasTextSearchOptions,
} from '../../host/document/CanvasDocument'

type HistoryAvailability = {
  canRedo: boolean
  canUndo: boolean
}

export type SelectionHistory = {
  before: string[]
  after: string[]
}

export type CommitCanvasItems = (
  action: SetStateAction<CanvasItem[]>,
  selection?: SelectionHistory,
) => void

export type CommitCanvasItemsPatch = (
  patch: JSONPatchOperation[],
  selection?: SelectionHistory,
) => boolean

export type CommitCanvasSelection = (
  action: SetStateAction<string[]>,
) => boolean

export type CanvasDocumentClipboard = {
  copyItemsToClipboard: (selection: string[]) => boolean
  getClipboardItems: () => CanvasItem[]
  setClipboardItems: (items: CanvasItem[]) => boolean
}

export type CanvasDocumentTextSearch = {
  findDocumentText: (
    text: string,
    options?: CanvasTextSearchOptions,
  ) => CanvasTextSearchMatch[]
  replaceDocumentText: (
    searchText: string,
    replacement: string,
    options?: CanvasTextSearchOptions,
  ) => boolean
}

export function useCanvasDocument(
  initialItems: CanvasItem[],
  initialSelection: string[] = [],
) {
  const [document] = useState(() =>
    createCanvasItemsDocument(initialItems, { selection: initialSelection }),
  )
  const [items, setItemsState] = useState(() => document.value)
  const [selection, setSelectionState] = useState(() =>
    getCanvasDocumentSelectionIds(document),
  )
  const [historyAvailability, setHistoryAvailability] =
    useState<HistoryAvailability>({
      canRedo: false,
      canUndo: false,
    })
  const itemsRef = useRef(items)

  useEffect(() => {
    return document.selection?.subscribe(() => {
      setSelectionState(getCanvasDocumentSelectionIds(document))
    })
  }, [document])

  const syncHistoryAvailability = useCallback(() => {
    setHistoryAvailability({
      canRedo: document.canRedo().ok,
      canUndo: document.canUndo().ok,
    })
  }, [document])

  const setLiveItems: Dispatch<SetStateAction<CanvasItem[]>> = useCallback(
    (action) => {
      const next = replaceCanvasItems(
        itemsRef.current,
        resolve(action, itemsRef.current),
      )

      itemsRef.current = next
      setItemsState(next)
    },
    [],
  )

  const commitItems: CommitCanvasItems = useCallback(
    (action, selection) => {
      const current = itemsRef.current
      const next = replaceCanvasItems(current, resolve(action, current))

      const didCommit = commitCanvasItemsDocument({
        document,
        nextItems: next,
        selection,
      })

      if (!didCommit) {
        return false
      }

      itemsRef.current = document.value
      setItemsState(itemsRef.current)
      syncHistoryAvailability()
      return true
    },
    [document, syncHistoryAvailability],
  )

  const commitItemsPatch: CommitCanvasItemsPatch = useCallback(
    (patch, selection) => {
      const didCommit = commitCanvasItemsPatch({
        document,
        patch,
        selection,
      })

      if (!didCommit) {
        return false
      }

      itemsRef.current = document.value
      setItemsState(itemsRef.current)
      syncHistoryAvailability()
      return true
    },
    [document, syncHistoryAvailability],
  )

  const recordHistoryFrom = useCallback((
    before: CanvasItem[],
    selection?: SelectionHistory,
  ) => {
    const current = replaceCanvasItems(before, itemsRef.current)

    if (!canvasItemsEqual(before, current)) {
      loadCanvasItemsDocument(document, before)
      commitCanvasItemsDocument({
        document,
        nextItems: current,
        selection,
      })
      itemsRef.current = document.value
      setItemsState(document.value)
      syncHistoryAvailability()
    }
  }, [document, syncHistoryAvailability])

  const setSelection: Dispatch<SetStateAction<string[]>> = useCallback(
    (action) => {
      const current = getCanvasDocumentSelectionIds(document)
      const next =
        typeof action === 'function'
          ? (action as (current: string[]) => string[])(current)
          : action

      restoreCanvasDocumentSelection(
        document,
        next,
        itemsRef.current,
      )
    },
    [document],
  )

  const commitSelection: CommitCanvasSelection = useCallback((action) => {
    const current = getCanvasDocumentSelectionIds(document)
    const next =
      typeof action === 'function'
        ? (action as (current: string[]) => string[])(current)
        : action
    const didCommit = commitCanvasDocumentSelection(document, next)

    if (didCommit) {
      syncHistoryAvailability()
    }

    return didCommit
  }, [document, syncHistoryAvailability])

  const copyItemsToClipboard = useCallback(
    (selection: string[]) =>
      copyCanvasDocumentSelectionToClipboard(
        document,
        selection,
        itemsRef.current,
      ),
    [document],
  )

  const getClipboardItems = useCallback(
    () => readCanvasDocumentClipboardItems(document),
    [document],
  )

  const setClipboardItems = useCallback(
    (items: CanvasItem[]) =>
      writeCanvasDocumentClipboardItems(document, items),
    [document],
  )

  const findDocumentText: CanvasDocumentTextSearch['findDocumentText'] =
    useCallback((text, options) =>
      findCanvasDocumentText(document, text, options),
    [document])

  const replaceDocumentText: CanvasDocumentTextSearch['replaceDocumentText'] =
    useCallback((searchText, replacement, options) => {
      const currentSelection = getCanvasDocumentSelectionIds(document)
      const didCommit = commitCanvasItemsPatch({
        document,
        patch: createReplaceCanvasDocumentTextPatch(
          document,
          searchText,
          replacement,
          options,
        ),
        selection: {
          before: currentSelection,
          after: currentSelection,
        },
      })

      if (!didCommit) {
        return false
      }

      itemsRef.current = document.value
      setItemsState(itemsRef.current)
      syncHistoryAvailability()
      return true
    }, [document, syncHistoryAvailability])

  const undo = useCallback(() => {
    if (!document.history.undo()) {
      return undefined
    }

    const next = replaceCanvasItems(itemsRef.current, document.value)

    itemsRef.current = next
    setItemsState(next)
    syncHistoryAvailability()
    return getCanvasDocumentSelectionIds(document)
  }, [document, syncHistoryAvailability])

  const redo = useCallback(() => {
    if (!document.history.redo()) {
      return undefined
    }

    const next = replaceCanvasItems(itemsRef.current, document.value)

    itemsRef.current = next
    setItemsState(next)
    syncHistoryAvailability()
    return getCanvasDocumentSelectionIds(document)
  }, [document, syncHistoryAvailability])

  return {
    ...historyAvailability,
    commitSelection,
    commitItems,
    commitItemsPatch,
    copyItemsToClipboard,
    findDocumentText,
    getClipboardItems,
    items,
    redo,
    recordHistoryFrom,
    replaceDocumentText,
    selection,
    setClipboardItems,
    setSelection,
    setLiveItems,
    undo,
  }
}

function resolve(
  action: SetStateAction<CanvasItem[]>,
  current: CanvasItem[],
): CanvasItem[] {
  return typeof action === 'function'
    ? (action as (current: CanvasItem[]) => CanvasItem[])(current)
    : action
}
