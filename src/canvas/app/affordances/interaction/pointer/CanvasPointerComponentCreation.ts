import type {
  Bounds,
  CanvasComponentKind,
  Point,
} from '../../../../entities'
import {
  normalizeBounds,
} from '../../../../core'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  type CanvasAffordanceConfig,
  type CanvasSnapGuides,
  type CanvasPointerGesture,
  snapCanvasPointToGrid,
} from '../../../../engine'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import type {
  CanvasAppComponentLibrary,
  CanvasAppComponentTemplate,
} from '../../../workflow/CanvasAppComponentAssemblyContracts'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import {
  CANVAS_POINTER_COMPONENT_CREATION_KINDS,
  type CanvasPointerComponentCreationKind,
} from './CanvasPointerCreationGrammar'
import {
  getCanvasPointerComponentCreationDescriptor,
  type CanvasPointerComponentCreationDescriptor,
} from './CanvasPointerComponentCreationDescriptors'
import { hasCanvasInteractionMoved } from './CanvasPointerInteractionMovement'

export type CanvasPointerComponentCreationInteraction = Extract<
  Interaction,
  { kind: 'create-section' }
>

export type CanvasPointerComponentCreationStartResult =
  | { kind: 'none' }
  | {
      capturePointer: true
      draftRect: Bounds
      gesture: CanvasPointerComponentCreationInteraction['kind']
      interaction: CanvasPointerComponentCreationInteraction
      kind: 'interaction'
    }

export type CanvasPointerComponentCreationPreviewResult =
  | { kind: 'none' }
  | {
      draftRect: Bounds
      interaction: CanvasPointerComponentCreationInteraction
      kind: 'preview'
      snapGuides: CanvasSnapGuides
    }

export function isCanvasPointerComponentCreationGesture(
  gesture: CanvasPointerGesture,
): gesture is CanvasPointerComponentCreationKind {
  return CANVAS_POINTER_COMPONENT_CREATION_KINDS.includes(
    gesture as CanvasPointerComponentCreationKind,
  )
}

export function isCanvasPointerComponentCreationInteraction(
  interaction: Interaction,
): interaction is CanvasPointerComponentCreationInteraction {
  return interaction.kind === 'create-section'
}

export function startCanvasPointerComponentCreation({
  componentLibrary,
  config,
  input,
  pointerGesture,
  startScreen,
  startWorld,
}: {
  componentLibrary: CanvasAppComponentLibrary
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  input: CanvasAppPointerInput
  pointerGesture: CanvasPointerGesture
  startScreen: Point
  startWorld: Point
}): CanvasPointerComponentCreationStartResult | null {
  if (!isCanvasPointerComponentCreationGesture(pointerGesture)) {
    return null
  }

  const descriptor =
    getCanvasPointerComponentCreationDescriptor(pointerGesture)

  if (!descriptor.isEnabled(config)) {
    return { kind: 'none' }
  }

  const template = getCanvasPointerComponentCreationTemplate({
    componentLibrary,
    templateId: descriptor.templateId,
  })

  if (!template) {
    return { kind: 'none' }
  }

  if (pointerGesture !== 'create-section') {
    return { kind: 'none' }
  }

  const snappedStartWorld = snapCanvasPointToGrid({
    config,
    point: startWorld,
  })
  const interaction = {
    currentWorld: snappedStartWorld,
    kind: pointerGesture,
    moved: false,
    pointerId: input.pointerId,
    startScreen,
    startWorld: snappedStartWorld,
  } satisfies CanvasPointerComponentCreationInteraction

  return {
    capturePointer: true,
    draftRect: getCanvasComponentCreationBounds({
      currentWorld: interaction.currentWorld,
      defaultSize: getCanvasComponentCreationDefaultSize({
        descriptor,
        template,
      }),
      moved: interaction.moved,
      startWorld: interaction.startWorld,
    }),
    gesture: interaction.kind,
    interaction,
    kind: 'interaction',
  }
}

export function previewCanvasPointerComponentCreation({
  config,
  currentScreen,
  currentWorld,
  interaction,
}: {
  config: CanvasAffordanceConfig
  currentScreen: Point
  currentWorld: Point
  interaction: Interaction
}): CanvasPointerComponentCreationPreviewResult | null {
  if (!isCanvasPointerComponentCreationInteraction(interaction)) {
    return null
  }

  const descriptor = getCanvasPointerComponentCreationDescriptor(
    interaction.kind,
  )

  if (!descriptor.isEnabled(config)) {
    return { kind: 'none' }
  }

  const moved = hasCanvasInteractionMoved({
    currentScreen,
    interaction,
  })
  const snappedCurrentWorld = snapCanvasPointToGrid({
    config,
    point: currentWorld,
  })
  const nextInteraction = {
    ...interaction,
    currentWorld: snappedCurrentWorld,
    moved,
  }

  return {
    draftRect: getCanvasComponentCreationBounds({
      currentWorld: nextInteraction.currentWorld,
      defaultSize: getCanvasComponentCreationDefaultSize({ descriptor }),
      moved: nextInteraction.moved,
      startWorld: nextInteraction.startWorld,
    }),
    interaction: nextInteraction,
    kind: 'preview',
    snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
  }
}

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
    return false
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

  const committed = commitItemsChange({ type: 'add', items: [resizedItem] }, {
    before: selection,
    after: [resizedItem.id],
  })

  if (committed) {
    setTool('select')
  }

  return committed
}

function getCanvasComponentCreationDefaultSize({
  descriptor,
  template,
}: {
  descriptor: CanvasPointerComponentCreationDescriptor
  template?: CanvasAppComponentTemplate
}): Pick<Bounds, 'h' | 'w'> {
  return descriptor.defaultSize ?? {
    h: template?.h ?? 0,
    w: template?.w ?? 0,
  }
}

function getCanvasComponentCreationBounds({
  currentWorld,
  defaultSize,
  moved,
  startWorld,
}: {
  currentWorld: Point
  defaultSize: Pick<Bounds, 'h' | 'w'>
  moved: boolean
  startWorld: Point
}): Bounds {
  const rawBounds = normalizeBounds(startWorld, currentWorld)

  if (moved && rawBounds.w > 6 && rawBounds.h > 6) {
    return rawBounds
  }

  return {
    ...defaultSize,
    x: startWorld.x - defaultSize.w / 2,
    y: startWorld.y - defaultSize.h / 2,
  }
}

function getCanvasPointerComponentCreationTemplate({
  componentLibrary,
  templateId,
}: {
  componentLibrary: CanvasAppComponentLibrary
  templateId: CanvasComponentKind
}) {
  return componentLibrary.templates.find(
    (template) => template.id === templateId,
  )
}
