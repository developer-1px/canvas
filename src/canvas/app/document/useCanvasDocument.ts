import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { CanvasItem } from '../../host/model'
import {
  createCanvasDocumentController,
} from '../../host'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
  CanvasDocumentTextSearch,
} from '../workflow/CanvasWorkflowContract'

export function useCanvasDocument(
  initialItems: CanvasItem[],
  initialSelection: string[] = [],
) {
  const [document] = useState(() =>
    createCanvasDocumentController(initialItems, initialSelection),
  )
  const [items, setItemsState] = useState(() => document.readItems())
  const [selection, setSelectionState] = useState(() => document.readSelection())
  const [historyAvailability, setHistoryAvailability] =
    useState(() => document.readHistoryAvailability())
  const itemsRef = useRef(items)

  useEffect(() => {
    return document.subscribeSelection(() => {
      setSelectionState(document.readSelection())
    })
  }, [document])

  const syncHistoryAvailability = useCallback(() => {
    setHistoryAvailability(document.readHistoryAvailability())
  }, [document])

  const setLiveItems: Dispatch<SetStateAction<CanvasItem[]>> = useCallback(
    (action) => {
      const next = document.replaceItems(
        itemsRef.current,
        resolve(action, itemsRef.current),
      )

      itemsRef.current = next
      setItemsState(next)
    },
    [document],
  )

  const syncCommittedItems = useCallback(() => {
    itemsRef.current = document.readItems()
    setItemsState(itemsRef.current)
    syncHistoryAvailability()
  }, [document, syncHistoryAvailability])

  const commitItemsChange: CommitCanvasItemsChange = useCallback(
    (change, selection) => {
      const didCommit = document.commitItemsChange(
        change,
        itemsRef.current,
        selection,
      )

      if (!didCommit) {
        return false
      }

      syncCommittedItems()
      return true
    },
    [document, syncCommittedItems],
  )

  const setSelection: Dispatch<SetStateAction<string[]>> = useCallback(
    (action) => {
      const current = document.readSelection()
      const next =
        typeof action === 'function'
          ? (action as (current: string[]) => string[])(current)
          : action

      document.restoreSelection(next, itemsRef.current)
    },
    [document],
  )

  const commitSelection: CommitCanvasSelection = useCallback((action) => {
    const current = document.readSelection()
    const next =
      typeof action === 'function'
        ? (action as (current: string[]) => string[])(current)
        : action
    const didCommit = document.commitSelection(next)

    if (didCommit) {
      syncHistoryAvailability()
    }

    return didCommit
  }, [document, syncHistoryAvailability])

  const copyItemsToClipboard = useCallback(
    (selection: string[]) =>
      document.copySelectionToClipboard(selection, itemsRef.current),
    [document],
  )

  const getClipboardItems = useCallback(
    () => document.readClipboardItems(),
    [document],
  )

  const setClipboardItems = useCallback(
    (items: CanvasItem[]) =>
      document.writeClipboardItems(items),
    [document],
  )

  const findDocumentText: CanvasDocumentTextSearch['findDocumentText'] =
    useCallback((text, options) =>
      document.findText(text, options),
    [document])

  const replaceDocumentText: CanvasDocumentTextSearch['replaceDocumentText'] =
    useCallback((searchText, replacement, options) => {
      const didCommit = document.replaceText(
        searchText,
        replacement,
        document.readSelection(),
        options,
      )

      if (!didCommit) {
        return false
      }

      syncCommittedItems()
      return true
    }, [document, syncCommittedItems])

  const undo = useCallback(() => {
    const result = document.undo(itemsRef.current)

    if (!result) {
      return undefined
    }

    itemsRef.current = result.items
    setItemsState(result.items)
    syncHistoryAvailability()
    return result.selection
  }, [document, syncHistoryAvailability])

  const redo = useCallback(() => {
    const result = document.redo(itemsRef.current)

    if (!result) {
      return undefined
    }

    itemsRef.current = result.items
    setItemsState(result.items)
    syncHistoryAvailability()
    return result.selection
  }, [document, syncHistoryAvailability])

  return {
    ...historyAvailability,
    commitSelection,
    commitItemsChange,
    copyItemsToClipboard,
    findDocumentText,
    getClipboardItems,
    items,
    redo,
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
