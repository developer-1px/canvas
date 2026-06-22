import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import type {
  CanvasAppComponentLibrary,
} from '../../../workflow/CanvasAppComponentAssemblyContracts'
import type {
  CanvasPointerComponentCreationInteraction,
} from './CanvasPointerComponentCreationContracts'
import {
  getCanvasComponentCreationBounds,
  getCanvasComponentCreationDefaultSize,
  getCanvasPointerComponentCreationTemplate,
} from './CanvasPointerComponentCreationGeometry'
import {
  getCanvasPointerComponentCreationDescriptor,
} from './CanvasPointerComponentCreationDescriptors'

export function commitCanvasPointerComponentCreation({
  commitItemsChange,
  componentLibrary,
  createId,
  interaction,
  selection,
  setTool,
}: {
  commitItemsChange: CommitCanvasItemsChange
  componentLibrary: CanvasAppComponentLibrary
  createId: (prefix: string) => string
  interaction: CanvasPointerComponentCreationInteraction
  selection: string[]
  setTool: (tool: 'select') => void
}) {
  const descriptor = getCanvasPointerComponentCreationDescriptor(
    interaction.kind,
  )
  const template = getCanvasPointerComponentCreationTemplate({
    componentLibrary,
    templateId: descriptor.templateId,
  })

  if (!template) {
    return
  }

  const bounds = getCanvasComponentCreationBounds({
    currentWorld: interaction.currentWorld,
    defaultSize: getCanvasComponentCreationDefaultSize({
      descriptor,
      template,
    }),
    moved: interaction.moved,
    startWorld: interaction.startWorld,
  })
  const item = componentLibrary.createItem({
    id: createId('component'),
    point: { x: bounds.x, y: bounds.y },
    templateId: descriptor.templateId,
  })
  const resizedItem = {
    ...item,
    ...bounds,
  }

  commitItemsChange({ type: 'add', items: [resizedItem] }, {
    before: selection,
    after: [resizedItem.id],
  })
  setTool('select')
}
