import type {
  Bounds,
  CanvasComponentKind,
  Point,
} from '../../../../entities'
import {
  normalizeBounds,
} from '../../../../core'
import type {
  CanvasAppComponentLibrary,
  CanvasAppComponentTemplate,
} from '../../../workflow/CanvasAppComponentAssemblyContracts'
import type { CanvasPointerComponentCreationDescriptor } from './CanvasPointerComponentCreationDescriptors'

export function getCanvasComponentCreationDefaultSize({
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

export function getCanvasComponentCreationBounds({
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

export function getCanvasPointerComponentCreationTemplate({
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

export function centerCanvasComponentTemplateAtPoint(
  template: CanvasAppComponentTemplate,
  point: Point,
): Point {
  return {
    x: point.x - template.w / 2,
    y: point.y - template.h / 2,
  }
}
