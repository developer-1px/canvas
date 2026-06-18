import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { CanvasItem } from '../../../entities'
import {
  CANVAS_COMPONENT_DEFINITION_REGISTRY,
  type CanvasComponentDefinitionRegistry,
  createCanvasDocumentController,
  type CanvasDocumentController,
  type CanvasItemValidationOptions,
} from '../../../host'
import type {
  CanvasAppItemsChangeTransformer,
} from '../../extensions/items-change-transformers'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
  CanvasDocumentTextSearch,
} from '../../workflow/CanvasWorkflowContract'
import {
  commitCanvasDocumentItemsChange,
  commitCanvasDocumentSelection,
  redoCanvasDocumentHistory,
  replaceCanvasDocumentLiveItems,
  replaceCanvasDocumentText,
  restoreCanvasDocumentSelection,
  undoCanvasDocumentHistory,
} from './CanvasDocumentRuntime'

export type CanvasDocumentTransformOptions = {
  componentDefinitionRegistry?: CanvasComponentDefinitionRegistry
  itemsChangeTransformers?: readonly CanvasAppItemsChangeTransformer[]
}

const EMPTY_CANVAS_APP_ITEMS_CHANGE_TRANSFORMERS =
  Object.freeze([]) satisfies readonly CanvasAppItemsChangeTransformer[]

export function useCanvasDocument(
  initialItems: CanvasItem[],
  initialSelection: string[] = [],
  validation: CanvasItemValidationOptions = {},
  transformOptions: CanvasDocumentTransformOptions = {},
) {
  const [document] = useState<CanvasDocumentController>(() =>
    createCanvasDocumentController(initialItems, initialSelection, validation),
  )
  const [items, setItemsState] = useState(() => document.readItems())
  const [selection, setSelectionState] = useState(() => document.readSelection())
  const [historyAvailability, setHistoryAvailability] =
    useState(() => document.readHistoryAvailability())
  const itemsRef = useRef(items)
  const componentDefinitionRegistry =
    transformOptions.componentDefinitionRegistry ??
    CANVAS_COMPONENT_DEFINITION_REGISTRY
  const itemsChangeTransformers =
    transformOptions.itemsChangeTransformers ??
    EMPTY_CANVAS_APP_ITEMS_CHANGE_TRANSFORMERS

  useEffect(() => {
    return document.subscribeSelection(() => {
      setSelectionState(document.readSelection())
    })
  }, [document])

  const syncCommittedState = useCallback((state: {
    historyAvailability: typeof historyAvailability
    items: CanvasItem[]
  }) => {
    itemsRef.current = state.items
    setItemsState(state.items)
    setHistoryAvailability(state.historyAvailability)
  }, [])

  const setLiveItems: Dispatch<SetStateAction<CanvasItem[]>> = useCallback(
    (action) => {
      const next = replaceCanvasDocumentLiveItems({
        action,
        currentItems: itemsRef.current,
        document,
      })

      itemsRef.current = next
      setItemsState(next)
    },
    [document],
  )

  const commitItemsChange: CommitCanvasItemsChange = useCallback(
    (change, selection) => {
      const committedState = commitCanvasDocumentItemsChange({
        change,
        componentDefinitionRegistry,
        currentItems: itemsRef.current,
        document,
        itemsChangeTransformers,
        selection,
      })

      if (!committedState) {
        return false
      }

      syncCommittedState(committedState)
      if (selection) {
        restoreCanvasDocumentSelection({
          action: selection.after,
          currentItems: committedState.items,
          document,
        })
        setSelectionState(document.readSelection())
      }

      return true
    },
    [
      componentDefinitionRegistry,
      document,
      itemsChangeTransformers,
      syncCommittedState,
    ],
  )

  const setSelection: Dispatch<SetStateAction<string[]>> = useCallback(
    (action) => {
      restoreCanvasDocumentSelection({
        action,
        currentItems: itemsRef.current,
        document,
      })
    },
    [document],
  )

  const commitSelection: CommitCanvasSelection = useCallback((action) => {
    const nextHistoryAvailability = commitCanvasDocumentSelection({
      action,
      document,
    })

    if (nextHistoryAvailability) {
      setHistoryAvailability(nextHistoryAvailability)
    }

    return nextHistoryAvailability !== null
  }, [document])

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
      const committedState = replaceCanvasDocumentText({
        document,
        options,
        searchText,
        replacement,
      })

      if (!committedState) {
        return false
      }

      syncCommittedState(committedState)
      return true
    }, [document, syncCommittedState])

  const undo = useCallback(() => {
    const result = undoCanvasDocumentHistory({
      currentItems: itemsRef.current,
      document,
    })

    if (!result) {
      return undefined
    }

    syncCommittedState(result)
    return result.selection
  }, [document, syncCommittedState])

  const redo = useCallback(() => {
    const result = redoCanvasDocumentHistory({
      currentItems: itemsRef.current,
      document,
    })

    if (!result) {
      return undefined
    }

    syncCommittedState(result)
    return result.selection
  }, [document, syncCommittedState])

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
