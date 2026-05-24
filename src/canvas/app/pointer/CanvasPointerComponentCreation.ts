import type {
  CanvasComponentKind,
  CanvasItem,
  Point,
} from '../../entities'
import {
  type CanvasAffordanceConfig,
  type CanvasPointerGesture,
} from '../../engine'
import type {
  CanvasAppComponentLibrary,
  CanvasAppComponentTemplate,
} from '../workflow/CanvasAppComponentAssemblyContracts'
import {
  CANVAS_POINTER_COMPONENT_CREATION_KINDS,
  type CanvasPointerComponentCreationKind,
} from './CanvasPointerCreationGrammar'

type CanvasPointerComponentCreationDescriptor = Readonly<{
  isEnabled: (config: CanvasAffordanceConfig) => boolean
  templateId: CanvasComponentKind
}>

export const CANVAS_POINTER_COMPONENT_CREATION_DESCRIPTORS = Object.freeze({
  'create-sticky': Object.freeze({
    isEnabled: (config: CanvasAffordanceConfig) =>
      config.gestures.createSticky,
    templateId: 'sticky',
  }),
} satisfies Readonly<
  Record<
    CanvasPointerComponentCreationKind,
    CanvasPointerComponentCreationDescriptor
  >
>)

export type CanvasPointerComponentCreationStartResult =
  | { kind: 'none' }
  | {
      capturePointer: false
      item: CanvasItem
      kind: 'created-item'
    }

export function isCanvasPointerComponentCreationGesture(
  gesture: CanvasPointerGesture,
): gesture is CanvasPointerComponentCreationKind {
  return CANVAS_POINTER_COMPONENT_CREATION_KINDS.includes(
    gesture as CanvasPointerComponentCreationKind,
  )
}

export function startCanvasPointerComponentCreation({
  componentLibrary,
  config,
  createId,
  pointerGesture,
  startWorld,
}: {
  componentLibrary: CanvasAppComponentLibrary
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  pointerGesture: CanvasPointerGesture
  startWorld: Point
}): CanvasPointerComponentCreationStartResult | null {
  const descriptor =
    getCanvasPointerComponentCreationDescriptor(pointerGesture)

  if (!descriptor) {
    return null
  }

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

  return {
    capturePointer: false,
    item: componentLibrary.createItem({
      id: createId('component'),
      point: centerCanvasComponentTemplateAtPoint(template, startWorld),
      templateId: descriptor.templateId,
    }),
    kind: 'created-item',
  }
}

function getCanvasPointerComponentCreationDescriptor(
  gesture: CanvasPointerGesture,
) {
  return isCanvasPointerComponentCreationGesture(gesture)
    ? CANVAS_POINTER_COMPONENT_CREATION_DESCRIPTORS[gesture]
    : null
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

function centerCanvasComponentTemplateAtPoint(
  template: CanvasAppComponentTemplate,
  point: Point,
): Point {
  return {
    x: point.x - template.w / 2,
    y: point.y - template.h / 2,
  }
}
