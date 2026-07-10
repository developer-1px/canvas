import type {
  DesignDocument,
  DesignDocumentHistoryStatus,
  DesignDocumentRead,
  DesignJSONValue,
  DesignJSONObject,
  DesignNode,
  DesignNodeId,
  DesignNodeUpdateValues,
} from '../design-document'
import type { DomProjection } from '../dom-projection'

type EditorEngineNumericLayoutField =
  | 'gap'
  | 'h'
  | 'margin'
  | 'order'
  | 'padding'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'paddingRight'
  | 'paddingTop'
  | 'w'
  | 'x'
  | 'y'

type EditorEngineChoiceLayoutField =
  | 'align'
  | 'alignSelf'
  | 'direction'
  | 'distribution'
  | 'heightMode'
  | 'widthMode'

export type EditorEngineNodeEdit =
  | {
      readonly field:
        | EditorEngineChoiceLayoutField
        | EditorEngineNumericLayoutField
      readonly target: 'layout'
      readonly value: number | string
    }
  | {
      readonly field: 'opacity' | 'radius' | 'rotation'
      readonly target: 'style'
      readonly value: number
    }
  | {
      readonly target: 'text'
      readonly value: string
    }

export type EditorEngineCommand =
  | {
      readonly exactTarget?: boolean
      readonly target: EventTarget | null
      readonly type: 'selection.hit'
    }
  | {
      readonly nodeId: DesignNodeId | null
      readonly type: 'selection.replace'
    }
  | { readonly type: 'selection.parent' }
  | {
      readonly edits: readonly EditorEngineNodeEdit[]
      readonly label: string
      readonly nodeId: DesignNodeId
      readonly type: 'node.edit'
    }
  | { readonly type: 'history.redo' | 'history.undo' }

export type EditorEngineCommandResult =
  | { readonly changed: boolean; readonly ok: true }
  | {
      readonly code:
        | 'disposed'
        | 'invalid-command'
        | 'stale-preview'
        | 'unavailable'
      readonly ok: false
      readonly reason: string
    }

export type EditorEnginePreviewInput = {
  readonly label: string
  readonly nodeId: DesignNodeId
}

export type EditorEnginePreviewSession = {
  update(edits: readonly EditorEngineNodeEdit[]): EditorEngineCommandResult
  commit(): EditorEngineCommandResult
  cancel(): EditorEngineCommandResult
}

export type EditorEngineSnapshot = {
  readonly history: DesignDocumentHistoryStatus
  readonly preview: { readonly nodeId: DesignNodeId } | null
  readonly revision: number
  readonly selection: {
    readonly nodeIds: readonly DesignNodeId[]
    readonly primaryNodeId: DesignNodeId | null
  }
}

export type EditorEngine = {
  readonly commands: {
    can(command: EditorEngineCommand): boolean
    execute(command: EditorEngineCommand): EditorEngineCommandResult
    beginPreview(
      input: EditorEnginePreviewInput,
    ): EditorEnginePreviewSession | null
  }
  readonly projection: DomProjection
  readonly read: DesignDocumentRead
  dispose(): void
  snapshot(): EditorEngineSnapshot
  subscribe(listener: () => void): () => void
}

type EditorEngineActivePreview = {
  readonly documentSnapshot: DesignDocument['snapshot']
  readonly edits: readonly EditorEngineNodeEdit[]
  readonly generation: number
  readonly input: EditorEnginePreviewInput
  readonly nodes: ReadonlyMap<DesignNodeId, DesignNode>
}

export function createEditorEngine({
  document,
  projection,
}: {
  readonly document: DesignDocument
  readonly projection: DomProjection
}): EditorEngine {
  const listeners = new Set<() => void>()
  let disposed = false
  let selection: readonly DesignNodeId[] = []
  let revision = 0
  let previewGeneration = 0
  let activePreview: EditorEngineActivePreview | null = null
  let snapshot = createSnapshot()
  let unsubscribeDocument: (() => void) | null = null
  let unsubscribeProjection: (() => void) | null = null
  let observedDocumentSnapshot = document.snapshot
  let mutatingDocument = false
  let documentChangedDuringMutation = false

  const read: DesignDocumentRead = {
    ancestry: (nodeId) => readSynchronized(() =>
      mapEffectiveNodes(document.read.ancestry(nodeId))),
    children: (nodeId) => readSynchronized(() =>
      mapEffectiveNodes(document.read.children(nodeId))),
    componentPeers: (nodeId) => readSynchronized(() =>
      mapEffectiveNodes(document.read.componentPeers(nodeId))),
    node: (nodeId) => readSynchronized(() =>
      effectiveNode(document.read.node(nodeId))),
    roots: () => readSynchronized(() =>
      mapEffectiveNodes(document.read.roots())),
  }

  function readSynchronized<T>(reader: () => T): T {
    synchronizeUnobservedDocument()
    return reader()
  }

  function effectiveNode(node: DesignNode | null): DesignNode | null {
    if (!node) {
      return null
    }

    return activePreview?.nodes.get(node.id) ?? node
  }

  function mapEffectiveNodes(nodes: readonly DesignNode[]) {
    return nodes.map((node) => effectiveNode(node) as DesignNode)
  }

  function createSnapshot(): EditorEngineSnapshot {
    const primaryNodeId = selection.at(-1) ?? null

    return Object.freeze({
      history: Object.freeze({ ...document.historyStatus() }),
      preview: activePreview
        ? Object.freeze({ nodeId: activePreview.input.nodeId })
        : null,
      revision,
      selection: Object.freeze({
        nodeIds: Object.freeze([...selection]),
        primaryNodeId,
      }),
    })
  }

  function publish() {
    revision += 1
    snapshot = createSnapshot()

    for (const listener of listeners) {
      try {
        listener()
      } catch {
        // One editor view cannot starve the remaining runtime observers.
      }
    }
  }

  function reconcileDocument() {
    if (mutatingDocument) {
      documentChangedDuringMutation = true
      return
    }

    observedDocumentSnapshot = document.snapshot
    activePreview = null
    const nextSelection = selection.filter((nodeId) =>
      document.read.node(nodeId) !== null)

    if (!areNodeIdListsEqual(selection, nextSelection)) {
      selection = nextSelection
    }

    publish()
  }

  function ensureExternalSubscriptions() {
    if (disposed || unsubscribeDocument || unsubscribeProjection) {
      return
    }

    unsubscribeDocument = document.subscribe(reconcileDocument)
    unsubscribeProjection = projection.subscribe(publish)
  }

  function synchronizeUnobservedDocument() {
    if (disposed || observedDocumentSnapshot === document.snapshot) {
      return
    }

    observedDocumentSnapshot = document.snapshot
    activePreview = null
    selection = selection.filter((nodeId) =>
      document.read.node(nodeId) !== null)
    publish()
  }

  function replaceSelection(nodeId: DesignNodeId | null) {
    if (nodeId !== null && document.read.node(nodeId) === null) {
      return unavailable(`Unknown design node: ${nodeId}`)
    }

    const nextSelection = nodeId === null ? [] : [nodeId]

    if (areNodeIdListsEqual(selection, nextSelection)) {
      return changed(false)
    }

    selection = nextSelection
    publish()
    return changed(true)
  }

  function canExecute(command: EditorEngineCommand): boolean {
    if (disposed) {
      return false
    }

    synchronizeUnobservedDocument()

    switch (command.type) {
      case 'selection.hit':
        return projection.hitPath(command.target).some((nodeId) =>
          document.read.node(nodeId) !== null) || selection.length > 0
      case 'selection.replace':
        return command.nodeId === null ||
          document.read.node(command.nodeId) !== null
      case 'selection.parent':
        return selection.length > 0
      case 'history.undo':
        return document.historyStatus().canUndo
      case 'history.redo':
        return document.historyStatus().canRedo
      case 'node.edit':
        return planNodeEdit(command).ok
    }
  }

  function execute(command: EditorEngineCommand): EditorEngineCommandResult {
    if (disposed) {
      return failure('disposed', 'EditorEngine is disposed')
    }

    synchronizeUnobservedDocument()

    switch (command.type) {
      case 'selection.hit': {
        const hitPath = projection.hitPath(command.target).filter((nodeId) =>
          document.read.node(nodeId) !== null)

        if (hitPath.length === 0) {
          return replaceSelection(null)
        }

        const primaryNodeId = selection.at(-1) ?? null
        const selectedIndex = primaryNodeId
          ? hitPath.indexOf(primaryNodeId)
          : -1
        const nodeId = command.exactTarget
          ? hitPath[0]
          : primaryNodeId === null
            ? hitPath.at(-1) ?? null
            : selectedIndex > 0
              ? hitPath[selectedIndex - 1]
              : hitPath[0]

        return replaceSelection(nodeId ?? null)
      }
      case 'selection.replace':
        return replaceSelection(command.nodeId)
      case 'selection.parent': {
        const primaryNodeId = selection.at(-1)

        if (!primaryNodeId) {
          return unavailable('No design node is selected')
        }

        const ancestry = document.read.ancestry(primaryNodeId)
        return replaceSelection(ancestry.at(-2)?.id ?? null)
      }
      case 'history.undo':
        return restoreDocumentHistory('undo')
      case 'history.redo':
        return restoreDocumentHistory('redo')
      case 'node.edit': {
        const plan = planNodeEdit(command)

        if (!plan.ok) {
          return plan.result
        }

        return executeDocumentCommand({
          label: command.label,
          changes: plan.changes,
        })
      }
    }
  }

  function beginPreview(
    input: EditorEnginePreviewInput,
  ): EditorEnginePreviewSession | null {
    if (disposed) {
      return null
    }

    synchronizeUnobservedDocument()

    if (document.read.node(input.nodeId) === null) {
      return null
    }

    previewGeneration += 1
    const generation = previewGeneration

    activePreview = {
      documentSnapshot: document.snapshot,
      edits: [],
      generation,
      input,
      nodes: new Map(),
    }
    publish()

    return {
      cancel: () => cancelPreview(generation),
      commit: () => commitPreview(generation),
      update: (edits) => updatePreview(generation, edits),
    }
  }

  function updatePreview(
    generation: number,
    edits: readonly EditorEngineNodeEdit[],
  ): EditorEngineCommandResult {
    const preview = readActivePreview(generation)

    if (!preview.ok) {
      return preview.result
    }

    if (preview.preview.documentSnapshot !== document.snapshot) {
      activePreview = null
      publish()
      return failure(
        'stale-preview',
        'The design document changed during the preview',
      )
    }

    if (edits.length === 0) {
      return changed(false)
    }

    const nextEdits = mergeNodeEdits(preview.preview.edits, edits)
    const plan = planNodeEdit({
      type: 'node.edit',
      edits: nextEdits,
      label: preview.preview.input.label,
      nodeId: preview.preview.input.nodeId,
    })

    if (!plan.ok) {
      return plan.result
    }

    const nodes = new Map<DesignNodeId, DesignNode>()

    for (const change of plan.changes) {
      const node = document.read.node(change.nodeId)

      if (!node) {
        return unavailable(`Unknown design node: ${change.nodeId}`)
      }

      nodes.set(node.id, freezePreviewNode({ ...node, ...change.values }))
    }

    activePreview = {
      ...preview.preview,
      edits: nextEdits,
      nodes,
    }
    publish()
    return changed(true)
  }

  function cancelPreview(
    generation: number,
  ): EditorEngineCommandResult {
    const preview = readActivePreview(generation)

    if (!preview.ok) {
      return preview.result
    }

    activePreview = null
    publish()
    return changed(true)
  }

  function commitPreview(
    generation: number,
  ): EditorEngineCommandResult {
    const preview = readActivePreview(generation)

    if (!preview.ok) {
      return preview.result
    }

    if (preview.preview.documentSnapshot !== document.snapshot) {
      activePreview = null
      publish()
      return failure(
        'stale-preview',
        'The design document changed during the preview',
      )
    }

    if (preview.preview.edits.length === 0) {
      activePreview = null
      publish()
      return changed(false)
    }

    const command: Extract<EditorEngineCommand, { type: 'node.edit' }> = {
      type: 'node.edit',
      edits: preview.preview.edits,
      label: preview.preview.input.label,
      nodeId: preview.preview.input.nodeId,
    }
    const plan = planNodeEdit(command)

    if (!plan.ok) {
      return plan.result
    }

    activePreview = null
    const result = executeDocumentCommand({
      label: command.label,
      changes: plan.changes,
    })

    if (!result.ok) {
      activePreview = preview.preview
      return result
    }

    if (!result.changed) {
      publish()
    }

    return result
  }

  function restoreDocumentHistory(
    direction: 'redo' | 'undo',
  ): EditorEngineCommandResult {
    const status = document.historyStatus()
    const available = direction === 'undo'
      ? status.canUndo
      : status.canRedo

    if (!available) {
      return unavailable(`Design document cannot ${direction}`)
    }

    activePreview = null
    mutatingDocument = true
    documentChangedDuringMutation = false
    const restored = direction === 'undo' ? document.undo() : document.redo()
    mutatingDocument = false

    if (!restored) {
      documentChangedDuringMutation = false
      return unavailable(`Design document cannot ${direction}`)
    }

    documentChangedDuringMutation = false
    reconcileDocument()
    return changed(true)
  }

  function readActivePreview(generation: number):
    | { readonly ok: true; readonly preview: EditorEngineActivePreview }
    | { readonly ok: false; readonly result: EditorEngineCommandResult } {
    if (disposed) {
      return {
        ok: false,
        result: failure('disposed', 'EditorEngine is disposed'),
      }
    }

    if (!activePreview || activePreview.generation !== generation) {
      return {
        ok: false,
        result: failure('stale-preview', 'Editor preview is no longer active'),
      }
    }

    return { ok: true, preview: activePreview }
  }

  function planNodeEdit(
    command: Extract<EditorEngineCommand, { type: 'node.edit' }>,
  ):
    | {
        readonly ok: true
        readonly changes: readonly {
          readonly nodeId: DesignNodeId
          readonly type: 'update'
          readonly values: DesignNodeUpdateValues
        }[]
      }
    | { readonly ok: false; readonly result: EditorEngineCommandResult } {
    const node = document.read.node(command.nodeId)

    if (!node) {
      return {
        ok: false,
        result: unavailable(`Unknown design node: ${command.nodeId}`),
      }
    }

    if (command.edits.length === 0) {
      return {
        ok: false,
        result: unavailable('A node edit requires at least one value'),
      }
    }

    const sharedEdits = command.edits.filter((edit) =>
      edit.target === 'layout' || edit.target === 'style')
    const peers = sharedEdits.length > 0
      ? document.read.componentPeers(command.nodeId).filter((peer) =>
        peer.id !== node.id)
      : []
    const targets = [node, ...peers]
    const changes: {
      nodeId: DesignNodeId
      type: 'update'
      values: DesignNodeUpdateValues
    }[] = []

    for (const target of targets) {
      const targetEdits = target.id === node.id ? command.edits : sharedEdits
      const values = applyNodeEdits(target, targetEdits)

      if (!values.ok) {
        return { ok: false, result: values.result }
      }

      changes.push({
        type: 'update',
        nodeId: target.id,
        values: values.values,
      })
    }

    return { changes, ok: true }
  }

  function executeDocumentCommand(
    command: Parameters<DesignDocument['execute']>[0],
  ): EditorEngineCommandResult {
    mutatingDocument = true
    documentChangedDuringMutation = false
    const result = document.execute(command)
    mutatingDocument = false

    if (!result.ok) {
      documentChangedDuringMutation = false
      return failure('invalid-command', result.reason)
    }

    if (result.changed || documentChangedDuringMutation) {
      documentChangedDuringMutation = false
      reconcileDocument()
    }

    return result
  }

  return {
    commands: {
      beginPreview,
      can: canExecute,
      execute,
    },
    dispose() {
      if (disposed) {
        return
      }

      disposed = true
      activePreview = null
      revision += 1
      snapshot = createSnapshot()
      unsubscribeDocument?.()
      unsubscribeProjection?.()
      unsubscribeDocument = null
      unsubscribeProjection = null
      listeners.clear()
    },
    projection,
    read,
    snapshot() {
      synchronizeUnobservedDocument()

      return snapshot
    },
    subscribe(listener) {
      if (disposed) {
        return () => undefined
      }

      ensureExternalSubscriptions()
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
  }
}

function applyNodeEdits(
  node: DesignNode,
  edits: readonly EditorEngineNodeEdit[],
):
  | { readonly ok: true; readonly values: DesignNodeUpdateValues }
  | { readonly ok: false; readonly result: EditorEngineCommandResult } {
  let layout = node.layout
  let frame = node.frame
  let style = node.style
  let text = node.text
  let updatesLayout = false
  let updatesFrame = false
  let updatesStyle = false
  let updatesText = false

  for (const edit of edits) {
    const runtimeTarget = (edit as { readonly target?: unknown }).target

    if (
      runtimeTarget !== 'layout' &&
      runtimeTarget !== 'style' &&
      runtimeTarget !== 'text'
    ) {
      return {
        ok: false,
        result: unavailable(`Unsupported node edit target: ${runtimeTarget}`),
      }
    }

    if (edit.target === 'text') {
      if (typeof edit.value !== 'string') {
        return {
          ok: false,
          result: unavailable('A text edit requires a string value'),
        }
      }

      if (node.text === null) {
        return {
          ok: false,
          result: unavailable(`Design node is not text-editable: ${node.id}`),
        }
      }

      text = edit.value
      updatesText = true
      continue
    }

    if (typeof edit.field !== 'string' || !edit.field.trim()) {
      return {
        ok: false,
        result: unavailable('A node edit field must not be empty'),
      }
    }

    if (edit.target === 'layout') {
      const normalized = normalizeLayoutEdit(edit)

      if (!normalized.ok) {
        return normalized
      }

      if (
        (edit.field === 'x' || edit.field === 'y') &&
        frame === null &&
        node.props.position !== 'absolute'
      ) {
        return {
          ok: false,
          result: unavailable(
            `Design node does not own editable geometry: ${node.id}`,
          ),
        }
      }

      if (frame && isEditorFrameLayoutField(edit.field)) {
        const nextFrame = updateEditorFrameLayout(
          frame,
          edit.field,
          normalized.value,
        )

        if (!nextFrame.ok) {
          return nextFrame
        }

        frame = nextFrame.frame
        updatesFrame = true
        continue
      }

      layout = updateLayoutField(layout, edit.field, normalized.value)
      updatesLayout = true
    } else {
      const normalized = normalizeNumericEdit(edit.field, edit.value)

      if (!normalized.ok) {
        return normalized
      }

      if (frame && edit.field === 'rotation') {
        frame = { ...frame, rotation: normalized.value }
        updatesFrame = true
        continue
      }

      style = { ...style, [edit.field]: normalized.value }
      updatesStyle = true
    }
  }

  return {
    ok: true,
    values: {
      ...(updatesFrame ? { frame } : {}),
      ...(updatesLayout ? { layout } : {}),
      ...(updatesStyle ? { style } : {}),
      ...(updatesText ? { text } : {}),
    },
  }
}

function isEditorFrameLayoutField(
  field: EditorEngineChoiceLayoutField | EditorEngineNumericLayoutField,
): field is 'h' | 'heightMode' | 'w' | 'widthMode' | 'x' | 'y' {
  return field === 'h' ||
    field === 'heightMode' ||
    field === 'w' ||
    field === 'widthMode' ||
    field === 'x' ||
    field === 'y'
}

function updateEditorFrameLayout(
  frame: NonNullable<DesignNode['frame']>,
  field: 'h' | 'heightMode' | 'w' | 'widthMode' | 'x' | 'y',
  value: DesignJSONValue,
):
  | { readonly frame: NonNullable<DesignNode['frame']>; readonly ok: true }
  | { readonly ok: false; readonly result: EditorEngineCommandResult } {
  if (field === 'widthMode' || field === 'heightMode') {
    if (value === 'fill') {
      return {
        ok: false,
        result: unavailable('A document frame cannot use fill sizing'),
      }
    }

    return {
      frame: {
        ...frame,
        [field]: value === 'fixed' ? 'fixed' : 'content',
      },
      ok: true,
    }
  }

  const frameField = field === 'w'
    ? 'width'
    : field === 'h' ? 'height' : field

  return {
    frame: { ...frame, [frameField]: value as number },
    ok: true,
  }
}

function normalizeLayoutEdit(
  edit: Exclude<EditorEngineNodeEdit, { target: 'style' | 'text' }>,
):
  | { readonly ok: true; readonly value: DesignJSONValue }
  | { readonly ok: false; readonly result: EditorEngineCommandResult } {
  if (EDITOR_NUMERIC_LAYOUT_FIELDS.has(
    edit.field as EditorEngineNumericLayoutField,
  )) {
    return typeof edit.value === 'number'
      ? normalizeNumericEdit(
        edit.field as EditorEngineNumericLayoutField,
        edit.value,
      )
      : {
          ok: false,
          result: unavailable(`Invalid numeric ${edit.field} value`),
        }
  }

  const choices = EDITOR_LAYOUT_FIELD_CHOICES[
    edit.field as EditorEngineChoiceLayoutField
  ]

  if (
    typeof edit.value !== 'string' ||
    !(choices as readonly string[] | undefined)?.includes(edit.value)
  ) {
    return {
      ok: false,
      result: unavailable(
        `Invalid ${edit.field} value: ${edit.value}`,
      ),
    }
  }

  return { ok: true, value: edit.value }
}

function normalizeNumericEdit(
  field: EditorEngineNumericLayoutField | 'opacity' | 'radius' | 'rotation',
  value: number,
):
  | { readonly ok: true; readonly value: number }
  | { readonly ok: false; readonly result: EditorEngineCommandResult } {
  if (!Number.isFinite(value)) {
    return {
      ok: false,
      result: unavailable(`Invalid numeric ${field} value`),
    }
  }

  const limits = EDITOR_NUMERIC_FIELD_LIMITS[field]

  if (!limits) {
    return {
      ok: false,
      result: unavailable(`Unsupported numeric field: ${field}`),
    }
  }
  const clamped = Math.min(limits.max, Math.max(limits.min, value))

  return {
    ok: true,
    value: field === 'order' ? Math.round(clamped) : clamped,
  }
}

function freezePreviewNode(node: DesignNode): DesignNode {
  return deepFreezeEditorValue(
    JSON.parse(JSON.stringify(node)) as DesignNode,
  )
}

function deepFreezeEditorValue<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value
  }

  Object.freeze(value)

  for (const child of Object.values(value)) {
    deepFreezeEditorValue(child)
  }

  return value
}

const EDITOR_PADDING_SIDE_FIELDS = [
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
] as const

const EDITOR_NUMERIC_LAYOUT_FIELDS = new Set<EditorEngineNumericLayoutField>([
  'gap',
  'h',
  'margin',
  'order',
  'padding',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'w',
  'x',
  'y',
])

const EDITOR_NUMERIC_FIELD_LIMITS = {
  gap: { max: 80, min: 0 },
  h: { max: 2_400, min: 12 },
  margin: { max: 80, min: -40 },
  opacity: { max: 100, min: 0 },
  order: { max: 20, min: -20 },
  padding: { max: 96, min: 0 },
  paddingBottom: { max: 96, min: 0 },
  paddingLeft: { max: 96, min: 0 },
  paddingRight: { max: 96, min: 0 },
  paddingTop: { max: 96, min: 0 },
  radius: { max: 80, min: 0 },
  rotation: { max: 180, min: -180 },
  w: { max: 1_600, min: 12 },
  x: { max: 100_000, min: -100_000 },
  y: { max: 100_000, min: -100_000 },
} as const satisfies Record<
  EditorEngineNumericLayoutField | 'opacity' | 'radius' | 'rotation',
  { readonly max: number; readonly min: number }
>

const EDITOR_LAYOUT_FIELD_CHOICES = {
  align: ['auto', 'center', 'end', 'start', 'stretch'],
  alignSelf: ['auto', 'center', 'end', 'start', 'stretch'],
  direction: ['column', 'row'],
  distribution: ['center', 'end', 'packed', 'space-between', 'start'],
  heightMode: ['fill', 'fixed', 'hug'],
  widthMode: ['fill', 'fixed', 'hug'],
} as const satisfies Record<EditorEngineChoiceLayoutField, readonly string[]>

function updateLayoutField(
  layout: DesignJSONObject,
  field: string,
  value: DesignJSONValue,
): DesignJSONObject {
  if (field === 'padding') {
    return {
      ...layout,
      padding: value,
      paddingBottom: value,
      paddingLeft: value,
      paddingRight: value,
      paddingTop: value,
    }
  }

  const next = { ...layout, [field]: value }

  if (!EDITOR_PADDING_SIDE_FIELDS.some((side) => side === field)) {
    return next
  }

  const shorthand = readFiniteEditorNumber(layout.padding, 0)
  const materialized = EDITOR_PADDING_SIDE_FIELDS.reduce<DesignJSONObject>(
    (values, side) => ({
      ...values,
      [side]: side === field
        ? value
        : readFiniteEditorNumber(layout[side], shorthand),
    }),
    next,
  )
  const sides = EDITOR_PADDING_SIDE_FIELDS.map((side) => materialized[side])

  return sides.every((side) => side === sides[0])
    ? { ...materialized, padding: sides[0] }
    : materialized
}

function readFiniteEditorNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : fallback
}

function mergeNodeEdits(
  current: readonly EditorEngineNodeEdit[],
  updates: readonly EditorEngineNodeEdit[],
) {
  const next = [...current]

  for (const update of updates) {
    const index = next.findIndex((edit) =>
      edit.target === update.target &&
      (
        edit.target === 'text' ||
        update.target === 'text' ||
        edit.field === update.field
      ))

    if (index === -1) {
      next.push(update)
    } else {
      next[index] = update
    }
  }

  return next
}

function areNodeIdListsEqual(
  left: readonly DesignNodeId[],
  right: readonly DesignNodeId[],
) {
  return left.length === right.length &&
    left.every((nodeId, index) => nodeId === right[index])
}

function changed(changedValue: boolean): EditorEngineCommandResult {
  return { changed: changedValue, ok: true }
}

function unavailable(reason: string): EditorEngineCommandResult {
  return failure('unavailable', reason)
}

function failure(
  code: Extract<EditorEngineCommandResult, { ok: false }>['code'],
  reason: string,
): EditorEngineCommandResult {
  return { code, ok: false, reason }
}
