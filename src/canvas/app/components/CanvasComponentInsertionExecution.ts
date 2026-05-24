import type {
  CanvasComponentKind,
  EditingText,
  Tool,
  Viewport,
} from '../../entities'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CanvasAppComponentLibrary } from '../workflow/CanvasAppComponentAssemblyContracts'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'

type InsertCanvasComponentArgs = {
  component: CanvasComponentKind
  componentLibrary: CanvasAppComponentLibrary
  commitItemsChange: CommitCanvasItemsChange
  createId: (prefix: string) => string
  selection: string[]
  setEditing: (nextEditing: EditingText | null) => void
  setTool: (nextTool: Tool) => void
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

const CANVAS_COMPONENT_INSERTION_FALLBACK_POINT = {
  x: 120,
  y: 120,
}

export function insertCanvasComponent({
  component,
  componentLibrary,
  commitItemsChange,
  createId,
  selection,
  setEditing,
  setTool,
  stageElement,
  viewport,
}: InsertCanvasComponentArgs) {
  const point =
    stageElement.getViewportCenter(viewport) ??
    CANVAS_COMPONENT_INSERTION_FALLBACK_POINT
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
}
