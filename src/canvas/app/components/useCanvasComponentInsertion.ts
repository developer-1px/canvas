import {
  useCallback,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import type { Tool, Viewport } from '../../entities'
import { createCanvasComponentItem } from '../../host/component/CanvasComponentFactory'
import type {
  CanvasComponentKind,
  EditingText,
} from '../../entities'
import type { CommitCanvasItemsPatch } from '../document/useCanvasDocument'

type UseCanvasComponentInsertionArgs = {
  commitItemsPatch: CommitCanvasItemsPatch
  createId: (prefix: string) => string
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setTool: Dispatch<SetStateAction<Tool>>
  svgRef: RefObject<SVGSVGElement | null>
  viewport: Viewport
}

export function useCanvasComponentInsertion({
  commitItemsPatch,
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
      const nextItem = createCanvasComponentItem({
        id: createId('component'),
        point,
        templateId: component,
      })

      commitItemsPatch([{ op: 'add', path: '/-', value: nextItem }], {
        before: selection,
        after: [nextItem.id],
      })
      setEditing(null)
      setTool('select')
    },
    [
      commitItemsPatch,
      createId,
      selection,
      setEditing,
      setTool,
      svgRef,
      viewport,
    ],
  )
}
