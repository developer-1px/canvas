import {
  useCallback,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type {
  CanvasItem,
  CanvasComponentKind,
  CanvasSide,
  EditingText,
  Tool,
  Viewport,
} from '../../../entities'
import type { CanvasCreationAdapter } from '../../../engine'
import type { CanvasAppComponentLibrary } from '../../workflow/CanvasAppComponentAssemblyContracts'
import type { CanvasAppItemReadModel } from '../../workflow/CanvasAppItemReadModelContracts'
import type { CommitCanvasItemsChange } from '../../workflow/CanvasWorkflowContract'
import type { CanvasAppStageElement } from '../../rendering/stage/CanvasAppStageElement'
import { insertCanvasComponent } from './CanvasComponentInsertionExecution'
import {
  getCanvasStickyQuickCreateControlPoints,
  quickCreateCanvasSticky,
} from './CanvasStickyQuickCreateExecution'
import type {
  CanvasAppFoundationExtensionRuntime,
} from '../../extensions/foundation-extensions'

type UseCanvasComponentInsertionArgs = {
  componentLibrary: CanvasAppComponentLibrary
  commitItemsChange: CommitCanvasItemsChange
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  foundationExtensionRuntime: CanvasAppFoundationExtensionRuntime
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
  foundationExtensionRuntime,
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
        runtime: foundationExtensionRuntime,
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
      foundationExtensionRuntime,
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
  foundationExtensionRuntime,
  itemReadModel,
  selection,
  setEditing,
  setTool,
}: UseCanvasComponentInsertionArgs) {
  return useCallback(
    (direction: CanvasSide = 'right') =>
      quickCreateCanvasSticky({
        commitItemsChange,
        componentLibrary,
        creationAdapter,
        createId,
        direction,
        itemReadModel,
        runtime: foundationExtensionRuntime,
        selection,
        setEditing,
        setTool,
      }),
    [
      componentLibrary,
      commitItemsChange,
      creationAdapter,
      createId,
      foundationExtensionRuntime,
      itemReadModel,
      selection,
      setEditing,
      setTool,
    ],
  )
}

export function useCanvasStickyQuickCreateControlPoints({
  itemReadModel,
  selection,
  viewport,
}: Pick<
  UseCanvasComponentInsertionArgs,
  'itemReadModel' | 'selection' | 'viewport'
>) {
  return getCanvasStickyQuickCreateControlPoints({
    itemReadModel,
    selection,
    viewport,
  })
}
