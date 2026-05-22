import {
  useCallback,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { CanvasItem } from '../host/CanvasModel'
import { canvasItemsEqual, replaceCanvasItems } from '../host/CanvasDocument'

type HistoryEntry = {
  before: CanvasItem[]
  beforeSelection?: string[]
  after: CanvasItem[]
  afterSelection?: string[]
}

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
  const [items, setItemsState] = useState(initialItems)
  const [historyAvailability, setHistoryAvailability] =
    useState<HistoryAvailability>({
      canRedo: false,
      canUndo: false,
    })
  const itemsRef = useRef(initialItems)
  const undoStack = useRef<HistoryEntry[]>([])
  const redoStack = useRef<HistoryEntry[]>([])

  const syncHistoryAvailability = useCallback(() => {
    setHistoryAvailability({
      canRedo: redoStack.current.length > 0,
      canUndo: undoStack.current.length > 0,
    })
  }, [])

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

      if (canvasItemsEqual(current, next)) {
        return
      }

      undoStack.current.push({
        before: current,
        beforeSelection: selection?.before,
        after: next,
        afterSelection: selection?.after,
      })
      redoStack.current = []
      itemsRef.current = next
      setItemsState(next)
      syncHistoryAvailability()
    },
    [syncHistoryAvailability],
  )

  const recordHistoryFrom = useCallback((before: CanvasItem[]) => {
    const current = itemsRef.current

    if (!canvasItemsEqual(before, current)) {
      undoStack.current.push({ before, after: current })
      redoStack.current = []
      syncHistoryAvailability()
    }
  }, [syncHistoryAvailability])

  const undo = useCallback(() => {
    const entry = undoStack.current.pop()

    if (!entry) {
      return undefined
    }

    redoStack.current.push(entry)
    const next = replaceCanvasItems(itemsRef.current, entry.before)

    itemsRef.current = next
    setItemsState(next)
    syncHistoryAvailability()
    return entry.beforeSelection
  }, [syncHistoryAvailability])

  const redo = useCallback(() => {
    const entry = redoStack.current.pop()

    if (!entry) {
      return undefined
    }

    undoStack.current.push({ ...entry, before: itemsRef.current })
    const next = replaceCanvasItems(itemsRef.current, entry.after)

    itemsRef.current = next
    setItemsState(next)
    syncHistoryAvailability()
    return entry.afterSelection
  }, [syncHistoryAvailability])

  return {
    ...historyAvailability,
    commitItems,
    items,
    redo,
    recordHistoryFrom,
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
