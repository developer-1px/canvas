import {
  useCallback,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import type { Tool, Viewport } from '../../engine/primitives/CanvasPrimitives'
import { createCanvasComponentItem } from '../../host/component/CanvasComponentFactory'
import type {
  CanvasComponentKind,
  CanvasItem,
  EditingText,
} from '../../host/model/CanvasModel'
import type { CommitCanvasItems } from '../document/useCanvasHistory'

type UseCanvasComponentInsertionArgs = {
  createId: (prefix: string) => string
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setItems: CommitCanvasItems
  setSelection: Dispatch<SetStateAction<string[]>>
  setTool: Dispatch<SetStateAction<Tool>>
  svgRef: RefObject<SVGSVGElement | null>
  viewport: Viewport
}

export function useCanvasComponentInsertion({
  createId,
  selection,
  setEditing,
  setItems,
  setSelection,
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
      const nextItem = createCanvasComponentItem({
        id: createId('component'),
        point,
        templateId: component,
      })

      setItems((current: CanvasItem[]) => [...current, nextItem], {
        before: selection,
        after: [nextItem.id],
      })
      setSelection([nextItem.id])
      setEditing(null)
      setTool('select')
    },
    [
      createId,
      selection,
      setEditing,
      setItems,
      setSelection,
      setTool,
      svgRef,
      viewport,
    ],
  )
}
