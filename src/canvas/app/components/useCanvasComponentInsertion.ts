import {
  useCallback,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type {
  CanvasItem,
  CanvasComponentKind,
  EditingText,
  Tool,
  Viewport,
} from '../../entities'
import type { CanvasCreationAdapter } from '../../engine'
import type { CanvasAppComponentLibrary } from '../workflow/CanvasAppComponentAssemblyContracts'
import type { CanvasAppItemReadModel } from '../workflow/CanvasAppItemReadModelContracts'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import {
  getCanvasStickyQuickCreateControlPoint,
  insertCanvasComponent,
  quickCreateCanvasSticky,
} from './CanvasComponentInsertionExecution'

type UseCanvasComponentInsertionArgs = {
  componentLibrary: CanvasAppComponentLibrary
  commitItemsChange: CommitCanvasItemsChange
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  itemReadModel: CanvasAppItemReadModel
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setTool: Dispatch<SetStateAction<Tool>>
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

export function useCanvasComponentInsertion({
  componentLibrary,
  commitItemsChange,
  createId,
  selection,
  setEditing,
  setTool,
  stageElement,
  viewport,
}: UseCanvasComponentInsertionArgs) {
  return useCallback(
    (component: CanvasComponentKind) => {
      insertCanvasComponent({
        commitItemsChange,
        component,
        componentLibrary,
        createId,
        selection,
        setEditing,
        setTool,
        stageElement,
        viewport,
      })
    },
    [
      componentLibrary,
      commitItemsChange,
      createId,
      selection,
      setEditing,
      setTool,
      stageElement,
      viewport,
    ],
  )
}

export function useCanvasStickyQuickCreate({
  componentLibrary,
  commitItemsChange,
  creationAdapter,
  createId,
  itemReadModel,
  selection,
  setEditing,
  setTool,
}: UseCanvasComponentInsertionArgs) {
  return useCallback(
    () =>
      quickCreateCanvasSticky({
        commitItemsChange,
        componentLibrary,
        creationAdapter,
        createId,
        itemReadModel,
        selection,
        setEditing,
        setTool,
      }),
    [
      componentLibrary,
      commitItemsChange,
      creationAdapter,
      createId,
      itemReadModel,
      selection,
      setEditing,
      setTool,
    ],
  )
}

export function useCanvasStickyQuickCreateControlPoint({
  itemReadModel,
  selection,
  viewport,
}: Pick<
  UseCanvasComponentInsertionArgs,
  'itemReadModel' | 'selection' | 'viewport'
>) {
  return getCanvasStickyQuickCreateControlPoint({
    itemReadModel,
    selection,
    viewport,
  })
}
