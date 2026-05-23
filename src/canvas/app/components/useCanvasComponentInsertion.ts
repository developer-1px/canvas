import {
  useCallback,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import type {
  CanvasComponentKind,
  EditingText,
  Tool,
  Viewport,
} from '../../entities'
import { CANVAS_COMPONENT_LIBRARY } from '../../host'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'

type UseCanvasComponentInsertionArgs = {
  commitItemsChange: CommitCanvasItemsChange
  createId: (prefix: string) => string
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setTool: Dispatch<SetStateAction<Tool>>
  svgRef: RefObject<SVGSVGElement | null>
  viewport: Viewport
}

export function useCanvasComponentInsertion({
  commitItemsChange,
  createId,
  selection,
  setEditing,
  setTool,
  svgRef,
  viewport,
}: UseCanvasComponentInsertionArgs) {
  return useCallback(
    (component: CanvasComponentKind) => {
      const rect = svgRef.current?.getBoundingClientRect()
      const point = rect
        ? {
            x: (rect.width / 2 - viewport.x) / viewport.scale,
            y: (rect.height / 2 - viewport.y) / viewport.scale,
          }
        : { x: 120, y: 120 }
      const nextItem = CANVAS_COMPONENT_LIBRARY.createItem({
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
      commitItemsChange,
      createId,
      selection,
      setEditing,
      setTool,
      svgRef,
      viewport,
    ],
  )
}
