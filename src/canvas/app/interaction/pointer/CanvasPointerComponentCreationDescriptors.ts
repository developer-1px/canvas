import type {
  Bounds,
  CanvasComponentItem,
  CanvasComponentKind,
} from '../../../entities'
import type {
  CanvasAffordanceConfig,
} from '../../../engine'
import {
  CANVAS_SECTION_COMPONENT_KIND,
  CANVAS_SECTION_DEFAULT_SIZE,
  CANVAS_STICKY_COMPONENT_KIND,
  applyCanvasStickyComponentCreationDefaults,
} from '../../../host'
import type {
  CanvasPointerComponentCreationKind,
} from './CanvasPointerCreationGrammar'

export type CanvasPointerComponentCreationDescriptor = Readonly<{
  applyDefaults?: (item: CanvasComponentItem) => CanvasComponentItem
  defaultSize?: Pick<Bounds, 'h' | 'w'>
  enterTextEdit?: boolean
  isEnabled: (config: CanvasAffordanceConfig) => boolean
  mode: 'drag' | 'immediate'
  templateId: CanvasComponentKind
}>

const CANVAS_POINTER_COMPONENT_CREATION_DESCRIPTORS = Object.freeze({
  'create-section': Object.freeze({
    defaultSize: CANVAS_SECTION_DEFAULT_SIZE,
    isEnabled: (config: CanvasAffordanceConfig) =>
      config.gestures.createSection,
    mode: 'drag',
    templateId: CANVAS_SECTION_COMPONENT_KIND,
  }),
  'create-sticky': Object.freeze({
    applyDefaults: applyCanvasStickyComponentCreationDefaults,
    enterTextEdit: true,
    isEnabled: (config: CanvasAffordanceConfig) =>
      config.gestures.createSticky,
    mode: 'immediate',
    templateId: CANVAS_STICKY_COMPONENT_KIND,
  }),
} satisfies Readonly<
  Record<
    CanvasPointerComponentCreationKind,
    CanvasPointerComponentCreationDescriptor
  >
>)

export function getCanvasPointerComponentCreationDescriptor(
  kind: CanvasPointerComponentCreationKind,
) {
  return CANVAS_POINTER_COMPONENT_CREATION_DESCRIPTORS[kind]
}
