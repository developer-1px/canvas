import type {
  CanvasComponentKind,
  EditingText,
  Tool,
  Viewport,
} from '../../../entities'
import type { CanvasAppStageElement } from '../../rendering/stage/CanvasAppStageElement'
import type { CanvasAppComponentLibrary } from '../../workflow/CanvasAppComponentAssemblyContracts'
import type { CommitCanvasItemsChange } from '../../workflow/CanvasWorkflowContract'
import {
  executeCanvasAppFoundationExtensionEffects,
  type CanvasAppFoundationExtensionRuntime,
} from '../../extensions/foundation-extensions'

type InsertCanvasComponentArgs = {
  component: CanvasComponentKind
  componentLibrary: CanvasAppComponentLibrary
  commitItemsChange: CommitCanvasItemsChange
  createId: (prefix: string) => string
  runtime: CanvasAppFoundationExtensionRuntime
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
  runtime,
  selection,
  setEditing,
  setTool,
  stageElement,
  viewport,
}: InsertCanvasComponentArgs) {
  const point =
    stageElement.getViewportCenter(viewport) ??
    CANVAS_COMPONENT_INSERTION_FALLBACK_POINT

  if (runtime.hasTool(component)) {
    const effects = runtime.planTool(component, {
      componentLibrary,
      createId,
      point,
      selection,
      surface: 'component-insertion',
    })

    if (!effects || effects.length === 0) {
      return false
    }

    const executed = executeCanvasAppFoundationExtensionEffects({
      context: {
        commitDocumentPatch: (patch, history) => patch.length === 1 &&
          commitItemsChange(patch[0], history),
        setEditing,
      },
      effects,
    })

    if (executed) {
      setTool('select')
    }

    return executed
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
  return true
}
