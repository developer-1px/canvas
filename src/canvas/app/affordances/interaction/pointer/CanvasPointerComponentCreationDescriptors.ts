import type {
  Bounds,
  CanvasComponentKind,
} from '../../../../entities'
import type {
  CanvasAffordanceConfig,
} from '../../../../engine'
import {
  CANVAS_SECTION_COMPONENT_KIND,
  CANVAS_SECTION_DEFAULT_SIZE,
} from '../../../../host'
import type {
  CanvasPointerComponentCreationKind,
} from './CanvasPointerCreationGrammar'

export type CanvasPointerComponentCreationDescriptor = Readonly<{
  defaultSize?: Pick<Bounds, 'h' | 'w'>
  isEnabled: (config: CanvasAffordanceConfig) => boolean
  mode: 'drag'
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
