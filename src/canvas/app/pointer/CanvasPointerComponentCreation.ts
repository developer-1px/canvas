import type {
  CanvasComponentKind,
  CanvasComponentItem,
  EditingText,
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
  CANVAS_STICKY_COMPONENT_KIND,
  applyCanvasStickyComponentCreationDefaults,
  getCanvasEditableTextValue,
} from '../../host'
import {
  CANVAS_POINTER_COMPONENT_CREATION_KINDS,
  type CanvasPointerComponentCreationKind,
} from './CanvasPointerCreationGrammar'

type CanvasPointerComponentCreationDescriptor = Readonly<{
  applyDefaults?: (item: CanvasComponentItem) => CanvasComponentItem
  enterTextEdit?: boolean
  isEnabled: (config: CanvasAffordanceConfig) => boolean
  templateId: CanvasComponentKind
}>

export const CANVAS_POINTER_COMPONENT_CREATION_DESCRIPTORS = Object.freeze({
  'create-sticky': Object.freeze({
    applyDefaults: applyCanvasStickyComponentCreationDefaults,
    enterTextEdit: true,
    isEnabled: (config: CanvasAffordanceConfig) =>
      config.gestures.createSticky,
    templateId: CANVAS_STICKY_COMPONENT_KIND,
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
      edit?: EditingText
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
