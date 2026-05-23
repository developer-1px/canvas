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
      const point = stageElement.getViewportCenter(viewport) ?? {
        x: 120,
        y: 120,
      }
      const nextItem = componentLibrary.createItem({
        id: createId('component'),
        point,
        templateId: component,
      })

      commitItemsChange({ type: 'add', items: [nextItem] }, {
        before: selection,
        after: [nextItem.id],
      })
      setEditing(null)
      setTool('select')
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
