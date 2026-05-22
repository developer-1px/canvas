import {
  useCallback,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { CanvasItem } from '../../host/CanvasModel'
import {
  canvasItemsEqual,
  commitCanvasItemsDocument,
  createCanvasItemsDocument,
  getCanvasDocumentSelectionIds,
  loadCanvasItemsDocument,
  replaceCanvasItems,
  restoreCanvasDocumentSelection,
} from '../../host/CanvasDocument'

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

export function useCanvasHistory(initialItems: CanvasItem[]) {
  const [document] = useState(() => createCanvasItemsDocument(initialItems))
  const [items, setItemsState] = useState(() => document.value)
  const [historyAvailability, setHistoryAvailability] =
    useState<HistoryAvailability>({
      canRedo: false,
      canUndo: false,
    })
  const itemsRef = useRef(items)

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
        return
      }

      itemsRef.current = document.value
      setItemsState(itemsRef.current)
      syncHistoryAvailability()
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

  const syncDocumentSelection = useCallback((selection: string[]) => {
    restoreCanvasDocumentSelection(
      document,
      selection,
      itemsRef.current,
    )
  }, [document])

  return {
    ...historyAvailability,
    commitItems,
    items,
    redo,
    recordHistoryFrom,
    syncDocumentSelection,
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
