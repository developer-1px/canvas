import {
  CANVAS_STICKY_NOTE_EXTENSION_ID,
  CANVAS_STICKY_NOTE_RENDERER_SLOT_ID,
  CANVAS_STICKY_NOTE_TEXT_TARGET_SLOT_ID,
  CANVAS_STICKY_NOTE_TOOL_ID,
} from '../../../foundation'
import type {
  CanvasExtensionTextTargetContract,
} from '../../../foundation'
import type {
  CanvasItem,
  Point,
} from '../../../entities'
import {
  applyCanvasStickyComponentCreationDefaults,
  CANVAS_WHITEBOARD_TEXT_TARGET,
  isCanvasStickyComponentItem,
} from '../../../host'
import {
  createCanvasStickyQuickCreatePlan,
  type CanvasStickyQuickCreatePlanInput,
} from '../../feature-packs/component-authoring/CanvasStickyQuickCreateExecution'
import {
  CanvasWhiteboardSvgStickyComponent,
} from '../../rendering/CanvasWhiteboardSvgTextComponentRenderer'
import type {
  CanvasAppComponentLibrary,
} from '../../workflow/CanvasAppComponentAssemblyContracts'
import type {
  CanvasAppFoundationExtensionCapabilityAdapter,
  CanvasAppFoundationExtensionEffect,
} from './CanvasAppFoundationExtensionRuntime'

export type CanvasAppStickyNotePlannerInput =
  | Readonly<{
      componentLibrary: CanvasAppComponentLibrary
      createId: (prefix: string) => string
      point: Point
      selection: string[]
      surface: 'component-insertion' | 'pointer'
    }>
  | Readonly<CanvasStickyQuickCreatePlanInput & {
      surface: 'quick-create'
    }>

const CANVAS_APP_STICKY_NOTE_TEXT_TARGET:
  CanvasExtensionTextTargetContract<CanvasItem> = Object.freeze({
    canEdit: (item) => isCanvasStickyComponentItem(item),
    commitsOnEnter: (item) => isCanvasStickyComponentItem(item) &&
      CANVAS_WHITEBOARD_TEXT_TARGET.commitsOnEnter(item),
    getCommittedValue: ({ item, value }) =>
      isCanvasStickyComponentItem(item)
        ? CANVAS_WHITEBOARD_TEXT_TARGET.getCommittedValue({ item, value })
        : value,
    getEditorBounds: (item) => isCanvasStickyComponentItem(item)
      ? CANVAS_WHITEBOARD_TEXT_TARGET.getEditorBounds(item)
      : null,
    getValue: (item) => isCanvasStickyComponentItem(item)
      ? CANVAS_WHITEBOARD_TEXT_TARGET.getValue(item)
      : '',
    planCommitUpdates: (item, text) => isCanvasStickyComponentItem(item)
      ? CANVAS_WHITEBOARD_TEXT_TARGET.planCommitUpdates(item, text)
      : [],
  })

export const CANVAS_APP_STICKY_NOTE_CAPABILITY_ADAPTER:
  CanvasAppFoundationExtensionCapabilityAdapter = Object.freeze({
    can: () => true,
    extensionId: CANVAS_STICKY_NOTE_EXTENSION_ID,
    providedAdapters: Object.freeze([
      'capability',
      'creation',
      'document',
      'renderer',
      'text-target',
    ] as const),
    rendererSlots: Object.freeze({
      [CANVAS_STICKY_NOTE_RENDERER_SLOT_ID]: Object.freeze({
        presentation: 'note-card',
        render: CanvasWhiteboardSvgStickyComponent,
      }),
    }),
    textTargetSlots: Object.freeze({
      [CANVAS_STICKY_NOTE_TEXT_TARGET_SLOT_ID]:
        CANVAS_APP_STICKY_NOTE_TEXT_TARGET,
    }),
    toolPlanners: Object.freeze({
      [CANVAS_STICKY_NOTE_TOOL_ID]: planCanvasAppStickyNote,
    }),
  })

function planCanvasAppStickyNote(
  input: unknown,
): readonly CanvasAppFoundationExtensionEffect[] {
  if (!isCanvasAppStickyNotePlannerInput(input)) {
    return []
  }

  if (input.surface === 'quick-create') {
    const plan = createCanvasStickyQuickCreatePlan(input)

    return plan
      ? createCanvasAppStickyNoteEffects({
          item: plan.item,
          items: plan.items,
          selection: input.selection,
        })
      : []
  }

  const template = input.componentLibrary.getTemplate('sticky')

  if (!template) {
    return []
  }

  const item = applyCanvasStickyComponentCreationDefaults(
    input.componentLibrary.createItem({
      id: input.createId('component'),
      point: {
        x: input.surface === 'pointer'
          ? input.point.x - template.w / 2
          : input.point.x,
        y: input.surface === 'pointer'
          ? input.point.y - template.h / 2
          : input.point.y,
      },
      templateId: 'sticky',
    }),
  )

  return isCanvasStickyComponentItem(item)
    ? createCanvasAppStickyNoteEffects({
        item,
        items: [item],
        selection: input.selection,
      })
    : []
}

function createCanvasAppStickyNoteEffects({
  item,
  items,
  selection,
}: {
  item: CanvasItem
  items: CanvasItem[]
  selection: string[]
}): readonly CanvasAppFoundationExtensionEffect[] {
  return [
    {
      patch: [{ items, type: 'add' }],
      selection: { after: [item.id], before: selection },
      type: 'document-patch',
    },
    {
      editing: {
        id: item.id,
        value: CANVAS_WHITEBOARD_TEXT_TARGET.getValue(item),
      },
      type: 'editing',
    },
  ]
}

function isCanvasAppStickyNotePlannerInput(
  input: unknown,
): input is CanvasAppStickyNotePlannerInput {
  return typeof input === 'object' &&
    input !== null &&
    'surface' in input &&
    (
      input.surface === 'component-insertion' ||
      input.surface === 'pointer' ||
      input.surface === 'quick-create'
    )
}
