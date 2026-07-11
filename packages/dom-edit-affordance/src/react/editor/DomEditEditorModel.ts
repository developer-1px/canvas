import type {
  EditorEngine,
  EditorEngineNodeEdit,
} from '@interactive-os/canvas/editor'
import { useSyncExternalStore } from 'react'

import { canDomEditFillParent } from '../../features/size-editing/DomEditSizeMode'
import type {
  DomEditAutoLayoutField,
  DomEditContentType,
  DomEditDisplay,
  DomEditField,
  DomEditLayoutContext,
  DomEditModelAdapter,
  DomEditNodeState,
  DomEditPosition,
  DomEditState,
} from '../../shared/model/DomEditTypes'

export type DomEditEditorModel = {
  readonly adapter: DomEditModelAdapter<string, DomEditState<string>>
  readonly selectedNodeId: string | null
  readonly state: DomEditState<string>
}

export function useDomEditEditorModel(
  editor: EditorEngine,
): DomEditEditorModel {
  const snapshot = useSyncExternalStore(
    editor.subscribe,
    editor.snapshot,
    editor.snapshot,
  )

  const state = createDomEditEditorState(editor)

  return {
    adapter: createDomEditEditorAdapter(editor, state),
    selectedNodeId: snapshot.selection.primaryNodeId,
    state,
  }
}

export function executeDomEditEditorField(
  editor: EditorEngine,
  nodeId: string,
  field: DomEditField,
  value: number,
) {
  return executeDomEditEditorNodeEdits(
    editor,
    nodeId,
    `Update ${field}`,
    [toEditorEngineNodeEdit({ field, value })],
  )
}

export function executeDomEditEditorAutoLayoutField(
  editor: EditorEngine,
  nodeId: string,
  field: DomEditAutoLayoutField,
  value: DomEditNodeState[DomEditAutoLayoutField],
) {
  return executeDomEditEditorNodeEdits(editor, nodeId, `Update ${field}`, [{
    field,
    target: 'layout',
    value,
  }])
}

export function executeDomEditEditorText(
  editor: EditorEngine,
  nodeId: string,
  value: string,
) {
  return executeDomEditEditorNodeEdits(editor, nodeId, 'Update text', [{
    target: 'text',
    value,
  }])
}

export function toEditorEngineNodeEdit(
  edit:
    | { readonly field: DomEditField; readonly value: number }
    | {
        readonly field: DomEditAutoLayoutField
        readonly value: DomEditNodeState[DomEditAutoLayoutField]
      },
): EditorEngineNodeEdit {
  if (isDomEditStyleField(edit.field)) {
    return {
      field: edit.field,
      target: 'style',
      value: edit.value as number,
    }
  }

  return {
    field: edit.field,
    target: 'layout',
    value: edit.value,
  }
}

function executeDomEditEditorNodeEdits(
  editor: EditorEngine,
  nodeId: string,
  label: string,
  edits: readonly EditorEngineNodeEdit[],
) {
  return editor.commands.execute({
    edits,
    label,
    nodeId,
    type: 'node.edit',
  })
}

function createDomEditEditorState(
  editor: EditorEngine,
): DomEditState<string> {
  const state: DomEditState<string> = {}

  for (const root of editor.read.roots()) {
    visit(root.id)
  }

  return state

  function visit(nodeId: string) {
    const node = editor.read.node(nodeId)

    if (!node || state[nodeId]) {
      return
    }

    state[nodeId] = readDomEditNodeState(editor, nodeId)

    for (const child of editor.read.children(nodeId)) {
      visit(child.id)
    }
  }
}

function createDomEditEditorAdapter(
  editor: EditorEngine,
  state: DomEditState<string>,
): DomEditModelAdapter<string, DomEditState<string>> {
  return {
    getElement: (nodeId) => editor.projection.element(nodeId),
    getLayoutContext: (nodeId) => readDomEditLayoutContext(editor, nodeId),
    getParentId: (nodeId) => readDomEditParentId(editor, nodeId),
    getStyle: (_state, nodeId) =>
      state[nodeId] ?? readDomEditNodeState(editor, nodeId),
    measure: (nodeId) => {
      const measurement = editor.projection.measure(nodeId)

      return measurement
        ? {
            h: measurement.worldBounds.h,
            w: measurement.worldBounds.w,
            x: measurement.worldBounds.x,
            y: measurement.worldBounds.y,
          }
        : null
    },
    readNodeId: (element) => editor.projection.hitPath(element)[0] ?? null,
  }
}

function readDomEditNodeState(
  editor: EditorEngine,
  nodeId: string,
): DomEditNodeState {
  const node = editor.read.node(nodeId)

  if (!node) {
    return EMPTY_NODE_STATE
  }

  const frame = node.frame

  return {
    align: readChoice(node.layout.align, DOM_EDIT_ALIGNMENTS, 'start'),
    alignSelf: readChoice(node.layout.alignSelf, DOM_EDIT_ALIGNMENTS, 'auto'),
    direction: readChoice(node.layout.direction, ['column', 'row'], 'row'),
    distribution: readChoice(
      node.layout.distribution,
      DOM_EDIT_DISTRIBUTIONS,
      'start',
    ),
    gap: readNumber(node.layout.gap, 0),
    h: readNumber(
      frame?.height ?? node.layout.h,
      editor.projection.measure(nodeId)?.worldBounds.h ?? 0,
    ),
    heightMode: frame
      ? frame.heightMode === 'content' ? 'hug' : 'fixed'
      : readChoice(
          node.layout.heightMode,
          DOM_EDIT_SIZE_MODES,
          'fixed',
        ),
    margin: readNumber(node.layout.margin, 0),
    opacity: readNumber(node.style.opacity, 100),
    order: readNumber(node.layout.order, 0),
    padding: readNumber(node.layout.padding, 0),
    paddingBottom: readNumber(
      node.layout.paddingBottom,
      readNumber(node.layout.padding, 0),
    ),
    paddingLeft: readNumber(
      node.layout.paddingLeft,
      readNumber(node.layout.padding, 0),
    ),
    paddingRight: readNumber(
      node.layout.paddingRight,
      readNumber(node.layout.padding, 0),
    ),
    paddingTop: readNumber(
      node.layout.paddingTop,
      readNumber(node.layout.padding, 0),
    ),
    radius: readNumber(node.style.radius, 0),
    rotation: frame?.rotation ?? readNumber(node.style.rotation, 0),
    w: readNumber(
      frame?.width ?? node.layout.w,
      editor.projection.measure(nodeId)?.worldBounds.w ?? 0,
    ),
    widthMode: frame
      ? frame.widthMode === 'content' ? 'hug' : 'fixed'
      : readChoice(
          node.layout.widthMode,
          DOM_EDIT_SIZE_MODES,
          'fixed',
        ),
    x: frame?.x ?? readNumber(node.layout.x, 0),
    y: frame?.y ?? readNumber(node.layout.y, 0),
  }
}

function readDomEditLayoutContext(
  editor: EditorEngine,
  nodeId: string,
): DomEditLayoutContext<string> {
  const node = editor.read.node(nodeId)

  if (!node) {
    throw new Error(`Unknown design node: ${nodeId}`)
  }

  const parentId = readDomEditParentId(editor, nodeId)
  const display = readDomEditDisplay(editor, nodeId)
  const parentDisplay = parentId
    ? readDomEditDisplay(editor, parentId)
    : null
  const hasChildren = node.children.length > 0
  const showFlexLayout = hasChildren && display === 'flex'
  const showGridLayout = hasChildren && display === 'grid'
  const contentType = readDomEditContentType(editor, nodeId)
  const position = readDomEditPosition(editor, nodeId)
  const hasEditableGeometry = node.frame !== null ||
    node.props.position === 'absolute'

  return {
    contentType,
    display,
    hasChildren,
    label: node.label,
    nodeId,
    parentDisplay,
    parentId,
    position,
    showBox: true,
    showContent: contentType !== 'container',
    showFlexLayout,
    showGeometry: position === 'absolute' && hasEditableGeometry,
    showGridLayout,
    showParentParticipation: canDomEditFillParent(parentDisplay),
    showSelfLayout: showFlexLayout,
  }
}

function readDomEditParentId(editor: EditorEngine, nodeId: string) {
  return editor.read.ancestry(nodeId).at(-2)?.id ?? null
}

function readDomEditDisplay(
  editor: EditorEngine,
  nodeId: string,
): DomEditDisplay {
  const node = editor.read.node(nodeId)
  const runtimeDisplay = readRuntimeStyle(editor, nodeId, 'display')
  const authoredDisplay = node?.props.display
  const display = authoredDisplay || runtimeDisplay

  if (typeof display === 'string') {
    if (display.includes('flex')) {
      return 'flex'
    }

    if (display.includes('grid')) {
      return 'grid'
    }

    if (display.includes('inline')) {
      return 'inline'
    }

    if (display === 'block') {
      return 'block'
    }
  }

  return node?.children.length &&
    (node.layout.direction === 'row' || node.layout.direction === 'column')
    ? 'flex'
    : 'block'
}

function readDomEditPosition(
  editor: EditorEngine,
  nodeId: string,
): DomEditPosition {
  const node = editor.read.node(nodeId)
  if (node?.frame) {
    // A document frame owns world placement, not CSS positioning inside its
    // rendered page. Treat its content layout as in-flow for affordances.
    return 'static'
  }
  const position = node?.props.position ||
    readRuntimeStyle(editor, nodeId, 'position')

  return position === 'absolute' ? 'absolute' : 'static'
}

function readDomEditContentType(
  editor: EditorEngine,
  nodeId: string,
): DomEditContentType {
  const node = editor.read.node(nodeId)
  const element = editor.projection.element(nodeId)
  const tagName = element?.tagName.toLowerCase() ??
    (node?.definition.kind === 'intrinsic' ? node.definition.id : '')

  if (DOM_EDIT_CONTROL_TAGS.has(tagName)) {
    return 'control'
  }

  return node?.text === null ? 'container' : 'text'
}

function readRuntimeStyle(
  editor: EditorEngine,
  nodeId: string,
  property: 'display' | 'position',
) {
  const element = editor.projection.element(nodeId)

  if (!element || typeof getComputedStyle !== 'function') {
    return ''
  }

  try {
    return getComputedStyle(element)[property]
  } catch {
    return ''
  }
}

function isDomEditStyleField(
  field: string,
): field is 'opacity' | 'radius' | 'rotation' {
  return field === 'opacity' || field === 'radius' || field === 'rotation'
}

function readNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : fallback
}

function readChoice<TChoice extends string>(
  value: unknown,
  choices: readonly TChoice[],
  fallback: TChoice,
): TChoice {
  return typeof value === 'string' && choices.includes(value as TChoice)
    ? value as TChoice
    : fallback
}

const DOM_EDIT_ALIGNMENTS = [
  'auto',
  'center',
  'end',
  'start',
  'stretch',
] as const

const DOM_EDIT_DISTRIBUTIONS = [
  'center',
  'end',
  'packed',
  'space-between',
  'start',
] as const

const DOM_EDIT_SIZE_MODES = ['fill', 'fixed', 'hug'] as const

const DOM_EDIT_CONTROL_TAGS = new Set([
  'button',
  'input',
  'option',
  'select',
  'textarea',
])

const EMPTY_NODE_STATE: DomEditNodeState = {
  align: 'start',
  alignSelf: 'auto',
  direction: 'row',
  distribution: 'start',
  gap: 0,
  h: 0,
  heightMode: 'fixed',
  margin: 0,
  opacity: 100,
  order: 0,
  padding: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  radius: 0,
  rotation: 0,
  w: 0,
  widthMode: 'fixed',
  x: 0,
  y: 0,
}
