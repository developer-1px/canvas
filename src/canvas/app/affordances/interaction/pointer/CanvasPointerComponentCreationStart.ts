import type { Point } from '../../../../entities'
import {
  type CanvasAffordanceConfig,
  type CanvasPointerGesture,
  snapCanvasPointToGrid,
} from '../../../../engine'
import {
  getCanvasEditableTextValue,
} from '../../../../host'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { CanvasAppComponentLibrary } from '../../../workflow/CanvasAppComponentAssemblyContracts'
import {
  CANVAS_POINTER_COMPONENT_CREATION_KINDS,
  type CanvasPointerComponentCreationKind,
} from './CanvasPointerCreationGrammar'
import {
  centerCanvasComponentTemplateAtPoint,
  getCanvasComponentCreationBounds,
  getCanvasComponentCreationDefaultSize,
  getCanvasPointerComponentCreationTemplate,
} from './CanvasPointerComponentCreationGeometry'
import {
  getCanvasPointerComponentCreationDescriptor,
} from './CanvasPointerComponentCreationDescriptors'
import type {
  CanvasPointerComponentCreationInteraction,
  CanvasPointerComponentCreationStartResult,
} from './CanvasPointerComponentCreationContracts'

export function isCanvasPointerComponentCreationGesture(
  gesture: CanvasPointerGesture,
): gesture is CanvasPointerComponentCreationKind {
  return CANVAS_POINTER_COMPONENT_CREATION_KINDS.includes(
    gesture as CanvasPointerComponentCreationKind,
  )
}

export function isCanvasPointerComponentCreationInteraction(
  interaction: {
    kind: string
  },
): interaction is CanvasPointerComponentCreationInteraction {
  return interaction.kind === 'create-section'
}

export function startCanvasPointerComponentCreation({
  componentLibrary,
  config,
  createId,
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

  if (descriptor.mode === 'drag') {
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

  const createdItem = componentLibrary.createItem({
    id: createId('component'),
    point: centerCanvasComponentTemplateAtPoint(template, startWorld),
    templateId: descriptor.templateId,
  })
  const item = descriptor.applyDefaults?.(createdItem) ?? createdItem

  return {
    capturePointer: false,
    edit: descriptor.enterTextEdit
      ? { id: item.id, value: getCanvasEditableTextValue(item) }
      : undefined,
    item,
    kind: 'created-item',
  }
}

export { getCanvasPointerComponentCreationTemplate } from './CanvasPointerComponentCreationGeometry'
