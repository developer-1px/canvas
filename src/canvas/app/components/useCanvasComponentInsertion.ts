import {
  useCallback,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type {
  CanvasComponentKind,
  EditingText,
  Tool,
  Viewport,
} from '../../entities'
import type { CanvasComponentLibrary } from '../../host'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import { insertCanvasComponent } from './CanvasComponentInsertionExecution'

type UseCanvasComponentInsertionArgs = {
  componentLibrary: CanvasComponentLibrary
  commitItemsChange: CommitCanvasItemsChange
  createId: (prefix: string) => string
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
