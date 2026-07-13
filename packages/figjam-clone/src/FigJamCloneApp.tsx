import {
  ArrowUpRight,
  Eraser,
  Frame,
  Highlighter,
  Maximize2,
  MessageSquareText,
  Move,
  MousePointer2,
  PencilLine,
  PenLine,
  Redo2,
  RotateCcw,
  Square,
  StickyNote,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent as ReactDragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import {
  ReactDesignEditorRenderer,
  createReactDesignDefinitionRegistry,
  useReactDesignEditorRuntime,
  type DesignJSONValue,
  type DesignNode,
  type DesignNodeId,
} from '@interactive-os/canvas/react-design'
import {
  DomEditEditorOverlay,
  type DomEditAffordanceState,
} from '@interactive-os/dom-edit-affordance/react'
import {
  FIGJAM_GROUP_DEFINITION_ID,
  FIGJAM_PRODUCT_PACK,
  FIGJAM_SECTION_DEFINITION_ID,
  FIGJAM_STICKY_NOTE_DEFINITION_ID,
  FIGJAM_STICKY_NOTE_TONES,
  FIGJAM_WIDGET_PACK,
  createFigJamCommentNode,
  createFigJamConnectorNode,
  createFigJamDrawingNode,
  createFigJamGroupNode,
  createFigJamInsertion,
  createFigJamLinkPreviewNode,
  createFigJamSectionNode,
  createFigJamStickyNoteNode,
  createFigJamTableNode,
  createFigJamTextNode,
  type FigJamInsertionId,
  type FigJamStickyNoteTone,
  type FigJamDrawingVariant,
} from '@interactive-os/figjam-pack'
import '@interactive-os/figjam-pack/style.css'

import {
  FIGJAM_BOARD_NODE_ID,
  restoreFigJamDesignDocument,
} from './FigJamDesignDocument'
import {
  captureFigJamClipboard,
  planFigJamClipboardInsert,
  planFigJamRemoveSelection,
  planFigJamUnwrapContainer,
  planFigJamWrapSelection,
  type FigJamClipboard,
  type FigJamDocumentPlan,
} from './FigJamDocumentOperations'
import {
  createFigJamMarqueeBounds,
  isFigJamErasableDrawing,
  localizeFigJamDrawing,
  planFigJamNudgeSelection,
  readFigJamMarqueeSelection,
  readFigJamSelectableHit,
  updateFigJamSelection,
  type FigJamWorldPoint,
} from './FigJamEditorInteractions'
import {
  readFigJamNodeWorldBounds,
  type FigJamDocumentBounds,
} from './FigJamDocumentGeometry'
import {
  FigJamCommandPalette,
  type FigJamCommandItem,
} from './FigJamCommandPalette'
import { parseFigJamClipboardTable } from './FigJamClipboardImport'
import {
  FigJamTextEditor,
  type FigJamTextEdit,
} from './FigJamTextEditor'
import './FigJamCloneApp.css'

export const FIGJAM_DOCUMENT_STORAGE_KEY =
  '@interactive-os/canvas/figjam-react-document/v1'

const FIGJAM_INITIAL_VIEWPORT = { scale: 0.82, x: 96, y: 52 }
const FIGJAM_EXCLUDED_SELECTION_IDS = new Set([FIGJAM_BOARD_NODE_ID])

type FigJamTool =
  | 'comment'
  | 'connector'
  | 'eraser'
  | 'highlight'
  | 'marker'
  | 'pan'
  | 'pen'
  | 'section'
  | 'select'
  | 'shape'
  | 'sticky'
  | 'text'

type FigJamInsertKind = FigJamInsertionId

type FigJamQuickCreateDirection = 'bottom' | 'left' | 'right' | 'top'

type FigJamPointerSession =
  | {
      readonly kind: 'pan'
      readonly client: FigJamWorldPoint
      readonly pointerId: number
      readonly viewport: typeof FIGJAM_INITIAL_VIEWPORT
    }
  | {
      readonly additive: boolean
      readonly current: FigJamWorldPoint
      readonly kind: 'marquee'
      readonly pointerId: number
      readonly start: FigJamWorldPoint
    }
  | {
      readonly kind: 'drawing'
      readonly pointerId: number
      readonly points: readonly FigJamWorldPoint[]
      readonly variant: FigJamDrawingVariant
    }
  | {
      readonly current: FigJamWorldPoint
      readonly kind: 'connector'
      readonly pointerId: number
      readonly start: FigJamWorldPoint
      readonly startNodeId: DesignNodeId | null
    }

const FIGJAM_TOOLS: readonly {
  readonly icon: LucideIcon
  readonly id: FigJamTool
  readonly label: string
}[] = [
  { icon: MousePointer2, id: 'select', label: 'Select tool' },
  { icon: Move, id: 'pan', label: 'Pan tool' },
  { icon: Square, id: 'shape', label: 'Shape tool' },
  { icon: Type, id: 'text', label: 'Text tool' },
  { icon: StickyNote, id: 'sticky', label: 'Sticky note tool' },
  { icon: MessageSquareText, id: 'comment', label: 'Comment tool' },
  { icon: Frame, id: 'section', label: 'Section tool' },
  { icon: PenLine, id: 'pen', label: 'Pen tool' },
  { icon: PencilLine, id: 'marker', label: 'Marker tool' },
  { icon: Highlighter, id: 'highlight', label: 'Highlighter tool' },
  { icon: Eraser, id: 'eraser', label: 'Eraser tool' },
  { icon: ArrowUpRight, id: 'connector', label: 'Arrow tool' },
]

export function FigJamCloneApp() {
  const stageRef = useRef<HTMLElement | null>(null)
  const pointerSessionRef = useRef<FigJamPointerSession | null>(null)
  const clipboardRef = useRef<FigJamClipboard | null>(null)
  const idCounterRef = useRef(0)
  const initialFitRef = useRef(false)
  const runtime = useReactDesignEditorRuntime({
    createDocument: createStoredFigJamDocument,
    createRegistry: createFigJamRegistry,
    viewport: {
      fitPadding: 48,
      initial: FIGJAM_INITIAL_VIEWPORT,
      maxScale: 3,
      minScale: 0.15,
    },
  })
  const {
    document: designDocument,
    editor,
    projection,
    snapshot,
    viewport: viewportRuntime,
  } = runtime
  const viewport = viewportRuntime.value
  const attachRuntimeStage = runtime.stage.attach
  const [tool, setTool] = useState<FigJamTool>('select')
  const [temporaryPan, setTemporaryPan] = useState(false)
  const [pointerSession, setPointerSession] =
    useState<FigJamPointerSession | null>(null)
  const [affordanceState, setAffordanceState] =
    useState<DomEditAffordanceState>({ mode: 'idle' })
  const [textEdit, setTextEdit] = useState<FigJamTextEdit | null>(null)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const selection = snapshot.selection.nodeIds
  const selectedNodeId = snapshot.selection.primaryNodeId
  const selectedNode = selectedNodeId ? editor.read.node(selectedNodeId) : null
  const selectedDefinition = getFigJamWidgetDefinition(selectedNode)
  const selectedWidgetProps = selectedNode && selectedDefinition
    ? FIGJAM_WIDGET_PACK.parseProps(selectedDefinition.id, selectedNode.props)
    : null
  const Inspector = selectedDefinition?.Inspector
  const transformableNodeId = selectedNodeId === FIGJAM_BOARD_NODE_ID
    ? null
    : selectedNodeId
  const transformCapabilities = selectedNode?.definition.kind === 'widget'
    ? selectedDefinition?.capabilities.transform ?? {
        move: false,
        resize: false,
      }
    : { move: true, resize: true }
  const canvasPanActive = temporaryPan || pointerSession?.kind === 'pan'

  const createId = useCallback((kind: string) => {
    idCounterRef.current += 1
    let nodeId = `figjam-${kind}-${idCounterRef.current}`

    while (editor.read.node(nodeId)) {
      idCounterRef.current += 1
      nodeId = `figjam-${kind}-${idCounterRef.current}`
    }

    return nodeId
  }, [editor])

  const executePlan = useCallback((
    plan: FigJamDocumentPlan | null,
    label: string,
  ) => {
    if (!plan || plan.changes.length === 0) {
      return false
    }

    const result = editor.commands.execute({
      changes: plan.changes,
      label,
      type: 'document.apply',
    })

    if (!result.ok) {
      setLastError(result.reason)
      return false
    }

    editor.commands.execute({ type: 'selection.set', nodeIds: plan.selection })
    setLastError(null)
    return true
  }, [editor])

  const insertNode = useCallback((node: DesignNode, label: string) => {
    const result = editor.commands.execute({
      index: editor.read.children(FIGJAM_BOARD_NODE_ID).length,
      label,
      node,
      parentId: FIGJAM_BOARD_NODE_ID,
      type: 'node.create',
    })

    if (!result.ok) {
      setLastError(result.reason)
      return false
    }

    editor.commands.execute({ type: 'selection.replace', nodeId: node.id })
    setLastError(null)
    return true
  }, [editor])

  const createAtPoint = useCallback((
    kind: FigJamInsertKind,
    point: FigJamWorldPoint,
  ) => {
    const nodeId = createId(kind)
    const x = Math.round(point.x)
    const y = Math.round(point.y)
    const node = createFigJamInsertion(kind, { nodeId, x, y })

    return insertNode(node, `Create ${kind}`) ? node.id : null
  }, [createId, insertNode])

  const applySelectionRemoval = useCallback(() => {
    if (selection.length === 0) {
      return false
    }

    return executePlan(
      planFigJamRemoveSelection(editor.read, selection),
      'Delete selection',
    )
  }, [editor.read, executePlan, selection])

  const copySelection = useCallback(() => {
    const clipboard = captureFigJamClipboard(editor.read, selection)

    if (!clipboard) {
      return false
    }

    clipboardRef.current = clipboard
    return true
  }, [editor.read, selection])

  const pasteClipboard = useCallback(() => {
    const clipboard = clipboardRef.current

    if (!clipboard) {
      return false
    }

    return executePlan(planFigJamClipboardInsert({
      clipboard,
      createId: (sourceId) => createId(`copy-${sanitizeIdPart(sourceId)}`),
      fallbackParentId: FIGJAM_BOARD_NODE_ID,
      read: editor.read,
    }), 'Paste selection')
  }, [createId, editor.read, executePlan])

  const duplicateSelection = useCallback(() => {
    if (!copySelection()) {
      return false
    }

    return pasteClipboard()
  }, [copySelection, pasteClipboard])

  const wrapSelection = useCallback((kind: 'group' | 'section') => {
    if (selection.length === 0) {
      return false
    }

    const nodeId = createId(kind)
    const container = kind === 'group'
      ? createFigJamGroupNode({ nodeId, x: 0, y: 0 })
      : createFigJamSectionNode({ nodeId, x: 0, y: 0 })

    return executePlan(planFigJamWrapSelection({
      container,
      nodeIds: selection,
      read: editor.read,
    }), kind === 'group' ? 'Group selection' : 'Section selection')
  }, [createId, editor.read, executePlan, selection])

  const unwrapSelection = useCallback(() => {
    if (
      !selectedNode ||
      selectedNode.definition.id !== FIGJAM_GROUP_DEFINITION_ID &&
      selectedNode.definition.id !== FIGJAM_SECTION_DEFINITION_ID
    ) {
      return false
    }

    return executePlan(
      planFigJamUnwrapContainer(editor.read, selectedNode.id),
      selectedNode.definition.id === FIGJAM_GROUP_DEFINITION_ID
        ? 'Ungroup selection'
        : 'Remove section',
    )
  }, [editor.read, executePlan, selectedNode])

  const addStampToSelection = useCallback(() => {
    if (!selectedNodeId) {
      return false
    }

    const bounds = readFigJamNodeWorldBounds(editor.read, selectedNodeId)

    return bounds ? createAtPoint('stamp', {
      x: bounds.x + bounds.w - 12,
      y: bounds.y - 16,
    }) : false
  }, [createAtPoint, editor.read, selectedNodeId])

  const quickCreateSticky = useCallback((
    direction: FigJamQuickCreateDirection,
  ) => {
    if (
      !selectedNode ||
      selectedNode.definition.id !== FIGJAM_STICKY_NOTE_DEFINITION_ID
    ) {
      return false
    }

    const sourceBounds = readFigJamNodeWorldBounds(editor.read, selectedNode.id)

    if (!sourceBounds) {
      return false
    }

    const gap = 72
    const target = readQuickCreatePlacement(sourceBounds, direction, gap)
    const nodeId = createId('sticky')
    const connectorId = createId('connector')
    const tone = readStickyTone(selectedNode.props.tone)
    const sticky = createFigJamStickyNoteNode({
      height: sourceBounds.h,
      nodeId,
      tone,
      width: sourceBounds.w,
      x: target.x,
      y: target.y,
    })
    const endpoints = readQuickCreateEndpoints(
      sourceBounds,
      target,
      direction,
    )
    const connectorBounds = readConnectorPlacement(
      endpoints.start,
      endpoints.end,
    )
    const connector = createFigJamConnectorNode({
      end: {
        anchor: endpoints.endAnchor,
        attachedNodeId: sticky.id,
        point: endpoints.end,
      },
      height: connectorBounds.h,
      nodeId: connectorId,
      start: {
        anchor: endpoints.startAnchor,
        attachedNodeId: selectedNode.id,
        point: endpoints.start,
      },
      width: connectorBounds.w,
      x: connectorBounds.x,
      y: connectorBounds.y,
    })
    const index = editor.read.children(FIGJAM_BOARD_NODE_ID).length

    return executePlan({
      changes: [
        { type: 'add', index, node: sticky, parentId: FIGJAM_BOARD_NODE_ID },
        {
          type: 'add',
          index: index + 1,
          node: connector,
          parentId: FIGJAM_BOARD_NODE_ID,
        },
      ],
      selection: [sticky.id],
    }, 'Quick create sticky note')
  }, [createId, editor.read, executePlan, selectedNode])

  const beginTextEditForNode = useCallback((nodeId: DesignNodeId) => {
    const node = editor.read.node(nodeId)
    const definition = getFigJamWidgetDefinition(node)

    if (
      !node ||
      !definition ||
      definition.capabilities.textEdit === false ||
      node.text === null
    ) {
      return false
    }

    textEdit?.session.cancel()
    editor.commands.execute({ type: 'selection.replace', nodeId })
    const session = editor.commands.beginPreview({
      label: `Edit ${node.label.toLowerCase()} text`,
      nodeId,
    })

    if (!session) {
      return false
    }

    setTextEdit({
      draft: node.text,
      label: node.definition.id === FIGJAM_STICKY_NOTE_DEFINITION_ID
        ? 'Edit sticky note text'
        : `Edit ${node.label.toLowerCase()} text`,
      nodeId,
      session,
    })
    return true
  }, [editor, textEdit])

  const finishTextEdit = useCallback((commit: boolean) => {
    if (!textEdit) {
      return
    }

    const result = commit
      ? textEdit.session.commit()
      : textEdit.session.cancel()

    if (!result.ok) {
      setLastError(result.reason)
    }

    setTextEdit(null)
  }, [textEdit])

  const updateTextEdit = useCallback((value: string) => {
    if (!textEdit) {
      return
    }

    const result = textEdit.session.update([{ target: 'text', value }])

    if (!result.ok) {
      setLastError(result.reason)
      return
    }

    setTextEdit({ ...textEdit, draft: value })
  }, [textEdit])

  const editWidgetProp = useCallback((
    field: string,
    value: DesignJSONValue,
    label: string,
  ) => {
    if (!selectedNode || !selectedDefinition) {
      return
    }

    const parsed = FIGJAM_WIDGET_PACK.parseProps(
      selectedDefinition.id,
      { ...selectedNode.props, [field]: value },
    )

    if (!parsed.ok || parsed.value[field] === undefined) {
      setLastError(parsed.ok
        ? `Widget props omitted edited field: ${field}`
        : parsed.reason)
      return
    }

    const result = editor.commands.execute({
      edits: [{ field, target: 'props', value: parsed.value[field] }],
      label,
      nodeId: selectedNode.id,
      type: 'node.edit',
    })

    setLastError(result.ok ? null : result.reason)
  }, [editor, selectedDefinition, selectedNode])

  const getViewportCenter = useCallback(() => {
    const stage = stageRef.current

    if (!stage) {
      return { x: 240, y: 180 }
    }

    const bounds = stage.getBoundingClientRect()

    return projection.clientToWorld({
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    }) ?? { x: 240, y: 180 }
  }, [projection])

  const createFromPalette = useCallback((kind: FigJamInsertKind) => {
    const nodeId = createAtPoint(kind, getViewportCenter())

    if (nodeId && isTextInsertion(kind)) {
      window.requestAnimationFrame(() => beginTextEditForNode(nodeId))
    }
  }, [beginTextEditForNode, createAtPoint, getViewportCenter])

  const insertTransferredContent = useCallback(({
    html,
    point,
    text,
  }: {
    readonly html?: string
    readonly point: FigJamWorldPoint
    readonly text: string
  }) => {
    const table = parseFigJamClipboardTable({ html, plainText: text })

    if (table) {
      return insertNode(createFigJamTableNode({
        columns: table.columns,
        nodeId: createId('table'),
        rows: table.rows,
        x: point.x,
        y: point.y,
      }), 'Import table')
    }

    if (/^https?:\/\//i.test(text)) {
      return insertNode(createFigJamLinkPreviewNode({
        nodeId: createId('link-preview'),
        title: text,
        url: text,
        x: point.x,
        y: point.y,
      }), 'Import link preview')
    }

    if (!text) {
      return false
    }

    return insertNode(createFigJamTextNode({
      nodeId: createId('text'),
      text,
      x: point.x,
      y: point.y,
    }), 'Import text')
  }, [createId, insertNode])

  const commandItems: readonly FigJamCommandItem[] = [
    {
      id: 'create:sticky',
      section: 'Create',
      title: 'Add sticky note',
      onSelect: () => createFromPalette('sticky'),
    },
    {
      id: 'create:shape',
      section: 'Create',
      title: 'Add shape',
      onSelect: () => createFromPalette('shape'),
    },
    {
      id: 'create:text',
      section: 'Create',
      title: 'Add text',
      onSelect: () => createFromPalette('text'),
    },
    {
      id: 'create:label',
      section: 'Create',
      title: 'Add label',
      onSelect: () => createFromPalette('label'),
    },
    {
      id: 'create:card',
      section: 'Create',
      title: 'Add card',
      onSelect: () => createFromPalette('card'),
    },
    {
      id: 'create:comment',
      section: 'Create',
      title: 'Add comment',
      onSelect: () => createFromPalette('comment'),
    },
    {
      id: 'create:checklist',
      section: 'Create',
      title: 'Add checklist',
      onSelect: () => createFromPalette('checklist'),
    },
    {
      id: 'create:kanban',
      section: 'Create',
      title: 'Add kanban',
      onSelect: () => createFromPalette('kanban'),
    },
    {
      id: 'create:table',
      section: 'Create',
      title: 'Add table',
      onSelect: () => createFromPalette('table'),
    },
    {
      id: 'create:stamp',
      section: 'Create',
      title: 'Add sticker or stamp',
      onSelect: () => createFromPalette('stamp'),
    },
    {
      id: 'create:vote',
      section: 'Create',
      title: 'Add vote',
      onSelect: () => createFromPalette('vote'),
    },
    {
      id: 'create:image',
      section: 'Create',
      title: 'Add image placeholder',
      onSelect: () => createFromPalette('image-placeholder'),
    },
    {
      id: 'create:connector',
      section: 'Create',
      title: 'Add connector',
      onSelect: () => createFromPalette('legacy-connector'),
    },
    {
      id: 'create:todo',
      section: 'Create',
      title: 'Add todo',
      onSelect: () => createFromPalette('todo'),
    },
    {
      id: 'create:link',
      section: 'Create',
      title: 'Add link preview',
      onSelect: () => createFromPalette('link-preview'),
    },
    {
      id: 'create:section',
      section: 'Create',
      title: 'Add section',
      onSelect: () => createFromPalette('section'),
    },
    {
      id: 'edit:duplicate',
      section: 'Edit',
      title: 'Duplicate selection',
      onSelect: duplicateSelection,
    },
    {
      id: 'edit:group',
      section: 'Edit',
      title: 'Group selection',
      onSelect: () => wrapSelection('group'),
    },
    {
      id: 'edit:ungroup',
      section: 'Edit',
      title: 'Ungroup selection',
      onSelect: unwrapSelection,
    },
    {
      id: 'history:undo',
      section: 'History',
      title: 'Undo',
      onSelect: () => editor.commands.execute({ type: 'history.undo' }),
    },
    {
      id: 'history:redo',
      section: 'History',
      title: 'Redo',
      onSelect: () => editor.commands.execute({ type: 'history.redo' }),
    },
    {
      id: 'viewport:fit',
      section: 'View',
      title: 'Fit all',
      onSelect: () => viewportRuntime.fitNodeIds([FIGJAM_BOARD_NODE_ID]),
    },
  ]

  const setStageElement = useCallback((element: HTMLElement | null) => {
    stageRef.current = element
    attachRuntimeStage(element)
  }, [attachRuntimeStage])

  const updatePointerSession = useCallback((session: FigJamPointerSession) => {
    pointerSessionRef.current = session
    setPointerSession(session)
  }, [])

  const clearPointerSession = useCallback((
    event?: ReactPointerEvent<HTMLElement>,
  ) => {
    pointerSessionRef.current = null
    setPointerSession(null)

    if (event?.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [])

  const handleStagePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (isFigJamControlTarget(event.target)) {
      return
    }

    const explicitlyPans = event.button === 1 ||
      event.button === 0 && (tool === 'pan' || temporaryPan)

    if (explicitlyPans) {
      event.preventDefault()
      updatePointerSession({
        client: { x: event.clientX, y: event.clientY },
        kind: 'pan',
        pointerId: event.pointerId,
        viewport: viewportRuntime.read(),
      })
      event.currentTarget.setPointerCapture(event.pointerId)
      return
    }

    if (event.button !== 0) {
      return
    }

    const point = projection.clientToWorld({ x: event.clientX, y: event.clientY })

    if (!point) {
      return
    }

    const hitNodeId = readFigJamSelectableHit(
      projection.hitPath(event.target),
      FIGJAM_EXCLUDED_SELECTION_IDS,
    )

    if (tool === 'eraser') {
      if (hitNodeId && isFigJamErasableDrawing(editor.read.node(hitNodeId))) {
        executePlan(
          planFigJamRemoveSelection(editor.read, [hitNodeId]),
          'Erase node',
        )
      }
      return
    }

    const drawingVariant = toDrawingVariant(tool)

    if (drawingVariant) {
      event.preventDefault()
      updatePointerSession({
        kind: 'drawing',
        pointerId: event.pointerId,
        points: [point],
        variant: drawingVariant,
      })
      event.currentTarget.setPointerCapture(event.pointerId)
      return
    }

    if (tool === 'connector') {
      event.preventDefault()
      updatePointerSession({
        current: point,
        kind: 'connector',
        pointerId: event.pointerId,
        start: point,
        startNodeId: hitNodeId,
      })
      event.currentTarget.setPointerCapture(event.pointerId)
      return
    }

    if (tool === 'comment') {
      event.preventDefault()
      const node = createFigJamCommentNode({
        attachedNodeId: hitNodeId,
        nodeId: createId('comment'),
        x: point.x,
        y: point.y,
      })

      if (insertNode(node, 'Create comment')) {
        window.requestAnimationFrame(() => beginTextEditForNode(node.id))
      }
      return
    }

    const insertionKind = toInsertKind(tool)

    if (insertionKind) {
      event.preventDefault()
      const nodeId = createAtPoint(insertionKind, point)

      if (nodeId && isTextInsertion(insertionKind)) {
        window.requestAnimationFrame(() => beginTextEditForNode(nodeId))
      }
      return
    }

    if (hitNodeId) {
      editor.commands.execute({
        nodeIds: updateFigJamSelection({
          additive: event.shiftKey,
          current: selection,
          nodeId: hitNodeId,
        }),
        type: 'selection.set',
      })
      return
    }

    event.preventDefault()
    updatePointerSession({
      additive: event.shiftKey,
      current: point,
      kind: 'marquee',
      pointerId: event.pointerId,
      start: point,
    })
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleStagePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const session = pointerSessionRef.current

    if (!session || session.pointerId !== event.pointerId) {
      return
    }

    if (session.kind === 'pan') {
      viewportRuntime.set({
        ...session.viewport,
        x: session.viewport.x + event.clientX - session.client.x,
        y: session.viewport.y + event.clientY - session.client.y,
      })
      return
    }

    const point = projection.clientToWorld({ x: event.clientX, y: event.clientY })

    if (!point) {
      return
    }

    if (session.kind === 'marquee' || session.kind === 'connector') {
      updatePointerSession({ ...session, current: point })
      return
    }

    if (session.kind === 'drawing') {
      const previous = session.points.at(-1)

      if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) > 2) {
        updatePointerSession({
          ...session,
          points: [...session.points, point],
        })
      }
    }
  }

  const finishStagePointer = (event: ReactPointerEvent<HTMLElement>) => {
    const session = pointerSessionRef.current

    if (!session || session.pointerId !== event.pointerId) {
      return
    }

    if (session.kind === 'marquee') {
      const marquee = createFigJamMarqueeBounds(session.start, session.current)
      const matches = marquee.w < 3 || marquee.h < 3
        ? []
        : readFigJamMarqueeSelection({
            excludedNodeIds: FIGJAM_EXCLUDED_SELECTION_IDS,
            marquee,
            read: editor.read,
          })
      const nextSelection = session.additive
        ? [...new Set([...selection, ...matches])]
        : matches

      editor.commands.execute({ type: 'selection.set', nodeIds: nextSelection })
    }

    if (session.kind === 'drawing') {
      const placement = localizeFigJamDrawing(session.points)

      if (placement) {
        insertNode(createFigJamDrawingNode({
          geometry: session.variant === 'path'
            ? {
                kind: 'path',
                segments: placement.points.map((point, index) => ({
                  point,
                  type: index === 0 ? 'move' as const : 'line' as const,
                })),
              }
            : { kind: 'points', points: placement.points },
          height: placement.h,
          nodeId: createId(session.variant),
          variant: session.variant,
          width: placement.w,
          x: placement.x,
          y: placement.y,
        }), `Create ${session.variant} drawing`)
      }
    }

    if (session.kind === 'connector') {
      const endTarget = globalThis.document.elementFromPoint(
        event.clientX,
        event.clientY,
      )
      const endNodeId = readFigJamSelectableHit(
        projection.hitPath(endTarget),
        FIGJAM_EXCLUDED_SELECTION_IDS,
      )
      const x = Math.min(session.start.x, session.current.x)
      const y = Math.min(session.start.y, session.current.y)
      const width = Math.max(24, Math.abs(session.current.x - session.start.x))
      const height = Math.max(24, Math.abs(session.current.y - session.start.y))

      if (Math.hypot(
        session.current.x - session.start.x,
        session.current.y - session.start.y,
      ) >= 8) {
        insertNode(createFigJamConnectorNode({
          end: {
            anchor: readNearestAnchor(editor.read, endNodeId, session.current),
            attachedNodeId: endNodeId,
            point: session.current,
          },
          height,
          nodeId: createId('connector'),
          start: {
            anchor: readNearestAnchor(
              editor.read,
              session.startNodeId,
              session.start,
            ),
            attachedNodeId: session.startNodeId,
            point: session.start,
          },
          width,
          x,
          y,
        }), 'Create connector')
      }
    }

    clearPointerSession(event)
  }

  const handleDoubleClick = (event: ReactMouseEvent<HTMLElement>) => {
    const nodeId = readFigJamSelectableHit(
      projection.hitPath(event.target),
      FIGJAM_EXCLUDED_SELECTION_IDS,
    )

    if (nodeId && beginTextEditForNode(nodeId)) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  const handleStageClickCapture = (event: ReactMouseEvent<HTMLElement>) => {
    if (
      event.target instanceof Element &&
      event.target.closest('a[href]') &&
      projection.hitPath(event.target).length > 0
    ) {
      event.preventDefault()
    }
  }

  const handleWheel = (event: ReactWheelEvent<HTMLElement>) => {
    event.preventDefault()

    if (!event.ctrlKey && !event.metaKey) {
      viewportRuntime.panBy({ x: -event.deltaX, y: -event.deltaY })
      return
    }

    viewportRuntime.zoomAtClientPoint(
      { x: event.clientX, y: event.clientY },
      Math.exp(-event.deltaY * 0.002),
    )
  }

  const handleDragOver = (event: ReactDragEvent<HTMLElement>) => {
    if (
      event.dataTransfer.types.includes('text/plain') ||
      event.dataTransfer.types.includes('text/html')
    ) {
      event.preventDefault()
    }
  }

  const handleDrop = (event: ReactDragEvent<HTMLElement>) => {
    const point = projection.clientToWorld({
      x: event.clientX,
      y: event.clientY,
    })

    if (!point) {
      return
    }

    const text = event.dataTransfer.getData('text/plain').trim()
    const html = event.dataTransfer.getData('text/html')

    if (insertTransferredContent({ html, point, text })) {
      event.preventDefault()
    }
  }

  useEffect(() => designDocument.subscribe(() => {
    try {
      globalThis.localStorage?.setItem(
        FIGJAM_DOCUMENT_STORAGE_KEY,
        designDocument.serialize(),
      )
    } catch {
      // Storage is optional; the in-memory canonical document remains active.
    }
  }), [designDocument])

  useEffect(() => {
    if (initialFitRef.current) {
      return undefined
    }

    const frame = window.requestAnimationFrame(() => {
      if (viewportRuntime.fitNodeIds([FIGJAM_BOARD_NODE_ID])) {
        initialFitRef.current = true
      }

      if (editor.read.node('figjam-shape')) {
        editor.commands.execute({
          nodeId: 'figjam-shape',
          type: 'selection.replace',
        })
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [editor, snapshot.revision, viewportRuntime])

  useEffect(() => {
    const registeredNodeIds = projection.registeredNodeIds()
    const selectedIds = new Set(selection)

    for (const nodeId of registeredNodeIds) {
      const element = projection.element(nodeId)

      if (selectedIds.has(nodeId)) {
        element?.setAttribute('data-selected', 'true')
      } else {
        element?.removeAttribute('data-selected')
      }

      if (nodeId === selectedNodeId) {
        element?.setAttribute('data-primary-selected', 'true')
      } else {
        element?.removeAttribute('data-primary-selected')
      }
    }
  }, [projection, selection, selectedNodeId, snapshot.revision])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modified = event.metaKey || event.ctrlKey

      if (isFigJamTextEntryTarget(event.target)) {
        return
      }

      if (event.key === ' ') {
        event.preventDefault()
        setTemporaryPan(true)
        return
      }

      if (modified && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandPaletteOpen(true)
        return
      }

      if (modified && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        editor.commands.execute({
          type: event.shiftKey ? 'history.redo' : 'history.undo',
        })
        return
      }

      if (modified && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        duplicateSelection()
        return
      }

      if (modified && event.key.toLowerCase() === 'g') {
        event.preventDefault()
        if (event.shiftKey) {
          unwrapSelection()
        } else {
          wrapSelection('group')
        }
        return
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault()
        applySelectionRemoval()
        return
      }

      if (event.key === 'Enter' && selectedNodeId) {
        if (beginTextEditForNode(selectedNodeId)) {
          event.preventDefault()
        }
        return
      }

      if (event.key === 'Escape') {
        finishTextEdit(false)
        setCommandPaletteOpen(false)
        setTool('select')
        editor.commands.execute({ type: 'selection.replace', nodeId: null })
        return
      }

      const nudge = readNudge(event)

      if (nudge) {
        const changes = planFigJamNudgeSelection({
          delta: nudge,
          nodeIds: selection,
          read: editor.read,
        })

        if (changes.length > 0) {
          event.preventDefault()
          editor.commands.execute({
            changes,
            label: 'Nudge selection',
            type: 'document.apply',
          })
        }
        return
      }

      const shortcutTool = readToolShortcut(event)

      if (shortcutTool) {
        event.preventDefault()
        setTool(shortcutTool)
      }
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        setTemporaryPan(false)
      }
    }
    const handleBlur = () => setTemporaryPan(false)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [
    applySelectionRemoval,
    beginTextEditForNode,
    duplicateSelection,
    editor,
    finishTextEdit,
    selection,
    selectedNodeId,
    unwrapSelection,
    wrapSelection,
  ])

  useEffect(() => {
    const handleCopy = (event: ClipboardEvent) => {
      if (isFigJamTextEntryTarget(event.target) || !copySelection()) {
        return
      }

      event.preventDefault()
      event.clipboardData?.setData('text/plain', 'FigJam selection')
      event.clipboardData?.setData('application/x-figjam-selection', '1')
    }
    const handleCut = (event: ClipboardEvent) => {
      if (isFigJamTextEntryTarget(event.target) || !copySelection()) {
        return
      }

      event.preventDefault()
      event.clipboardData?.setData('application/x-figjam-selection', '1')
      applySelectionRemoval()
    }
    const handlePaste = (event: ClipboardEvent) => {
      if (isFigJamTextEntryTarget(event.target)) {
        return
      }

      const text = event.clipboardData?.getData('text/plain').trim() ?? ''
      const html = event.clipboardData?.getData('text/html') ?? ''
      const isInternal = event.clipboardData
        ?.getData('application/x-figjam-selection') === '1' ||
        text === 'FigJam selection'

      if (isInternal && pasteClipboard()) {
        event.preventDefault()
        return
      }

      if (!text && !html) {
        return
      }

      event.preventDefault()
      insertTransferredContent({
        html,
        point: getViewportCenter(),
        text,
      })
    }

    window.addEventListener('copy', handleCopy)
    window.addEventListener('cut', handleCut)
    window.addEventListener('paste', handlePaste)

    return () => {
      window.removeEventListener('copy', handleCopy)
      window.removeEventListener('cut', handleCut)
      window.removeEventListener('paste', handlePaste)
    }
  }, [
    applySelectionRemoval,
    copySelection,
    getViewportCenter,
    insertTransferredContent,
    pasteClipboard,
  ])

  return (
    <main
      className="engine-demo-app figjam-react-app"
      data-document-node-count={designDocument.snapshot.nodes.length}
      data-editor-revision={snapshot.revision}
      data-history-can-redo={snapshot.history.canRedo}
      data-history-can-undo={snapshot.history.canUndo}
      data-last-error={lastError ?? undefined}
      data-preview-node-id={snapshot.preview?.nodeId ?? undefined}
      data-selected-node-id={selectedNodeId ?? undefined}
      data-selected-node-ids={selection.join(' ')}
      data-tool={tool}
      data-viewport-scale={viewport.scale}
    >
      <section
        aria-label="FigJam canvas"
        className="engine-demo-workspace"
      >
        <div
          ref={setStageElement}
          className="canvas-stage figjam-react-stage"
          data-gesture={pointerSession?.kind}
          data-mode={canvasPanActive ? 'pan' : tool}
          tabIndex={0}
          onClickCapture={handleStageClickCapture}
          onDoubleClick={handleDoubleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onPointerCancel={clearPointerSession}
          onPointerDown={handleStagePointerDown}
          onPointerMove={handleStagePointerMove}
          onPointerUp={finishStagePointer}
          onWheel={handleWheel}
        >
          <div
            className="figjam-react-world"
            style={{
              transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
            }}
          >
            <ReactDesignEditorRenderer runtime={runtime} />
            {selectedNode?.definition.id ===
            FIGJAM_STICKY_NOTE_DEFINITION_ID ? (
              <FigJamStickyQuickCreate
                bounds={readFigJamNodeWorldBounds(
                  editor.read,
                  selectedNode.id,
                )}
                onCreate={quickCreateSticky}
              />
            ) : null}
            <FigJamPointerPreview session={pointerSession} />
            {textEdit ? (
              <FigJamTextEditor
                edit={textEdit}
                projection={projection}
                onCancel={() => finishTextEdit(false)}
                onChange={updateTextEdit}
                onCommit={() => finishTextEdit(true)}
              />
            ) : null}
          </div>
          <DomEditEditorOverlay
            affordanceState={affordanceState}
            canvasSelection={false}
            draggable={transformCapabilities.move}
            editor={editor}
            isCanvasPanActive={canvasPanActive}
            selectedNodeId={transformableNodeId}
            shellRef={stageRef}
            viewport={viewport}
            resizable={transformCapabilities.resize}
            onAffordanceStateChange={setAffordanceState}
          />
        </div>
      </section>

      <FigJamToolBar tool={tool} onToolChange={setTool} />

      <div
        aria-label="Viewport controls"
        className="engine-demo-viewport-controls"
        role="toolbar"
        onKeyDown={handleToolbarArrowNavigation}
      >
        <span aria-label="Canvas scale">
          {Math.round(viewport.scale * 100)}%
        </span>
        <button
          aria-label="Undo"
          disabled={!snapshot.history.canUndo}
          type="button"
          onClick={() => editor.commands.execute({ type: 'history.undo' })}
        >
          <Undo2 aria-hidden="true" size={14} />
        </button>
        <button
          aria-label="Redo"
          disabled={!snapshot.history.canRedo}
          type="button"
          onClick={() => editor.commands.execute({ type: 'history.redo' })}
        >
          <Redo2 aria-hidden="true" size={14} />
        </button>
        <button
          aria-label="Zoom out"
          type="button"
          onClick={() => viewportRuntime.zoomAtStageCenter(1 / 1.2)}
        >
          <ZoomOut aria-hidden="true" size={14} />
        </button>
        <button
          aria-label="Zoom in"
          type="button"
          onClick={() => viewportRuntime.zoomAtStageCenter(1.2)}
        >
          <ZoomIn aria-hidden="true" size={14} />
        </button>
        <button
          aria-label="Fit selection"
          disabled={selection.length === 0}
          type="button"
          onClick={() => viewportRuntime.fitNodeIds(selection)}
        >
          <Maximize2 aria-hidden="true" size={14} />
        </button>
        <button
          aria-label="Reset viewport"
          type="button"
          onClick={viewportRuntime.reset}
        >
          <RotateCcw aria-hidden="true" size={14} />
        </button>
      </div>

      {selectedNode ? (
        <div
          aria-label="Object actions"
          className="figjam-react-selection-toolbar selection-floating-bar"
          data-dom-edit-editor-control
          role="toolbar"
          onKeyDown={handleToolbarArrowNavigation}
        >
          <span className="figjam-react-selection-toolbar__label">
            {selection.length > 1 ? `${selection.length} objects` : selectedNode.label}
          </span>
          <button type="button" onClick={duplicateSelection}>Duplicate</button>
          {selection.length > 1 ? (
            <>
              <button type="button" onClick={() => wrapSelection('group')}>
                Group
              </button>
              <button type="button" onClick={() => wrapSelection('section')}>
                Section
              </button>
            </>
          ) : null}
          {selectedNode.definition.id === FIGJAM_GROUP_DEFINITION_ID ||
          selectedNode.definition.id === FIGJAM_SECTION_DEFINITION_ID ? (
            <button type="button" onClick={unwrapSelection}>
              {selectedNode.definition.id === FIGJAM_GROUP_DEFINITION_ID
                ? 'Ungroup'
                : 'Unsection'}
            </button>
          ) : null}
          <button type="button" onClick={addStampToSelection}>React</button>
          <button type="button" onClick={applySelectionRemoval}>Delete</button>
          {Inspector && selectedWidgetProps?.ok ? (
            <Inspector
              editProp={editWidgetProp}
              node={selectedNode}
              props={selectedWidgetProps.value}
            />
          ) : null}
        </div>
      ) : null}

      <FigJamCommandPalette
        items={commandItems}
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </main>
  )
}

function FigJamStickyQuickCreate({
  bounds,
  onCreate,
}: {
  readonly bounds: FigJamDocumentBounds | null
  readonly onCreate: (direction: FigJamQuickCreateDirection) => void
}) {
  if (!bounds) {
    return null
  }

  const positions = {
    bottom: { x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h + 18 },
    left: { x: bounds.x - 18, y: bounds.y + bounds.h / 2 },
    right: { x: bounds.x + bounds.w + 18, y: bounds.y + bounds.h / 2 },
    top: { x: bounds.x + bounds.w / 2, y: bounds.y - 18 },
  } satisfies Record<FigJamQuickCreateDirection, FigJamWorldPoint>

  return (Object.entries(positions) as [
    FigJamQuickCreateDirection,
    FigJamWorldPoint,
  ][]).map(([direction, point]) => (
    <button
      aria-label={`Create sticky note ${direction}`}
      className="engine-sticky-quick-create"
      data-direction={direction}
      data-dom-edit-editor-control
      key={direction}
      style={{
        '--engine-sticky-quick-create-x': `${point.x}px`,
        '--engine-sticky-quick-create-y': `${point.y}px`,
      } as CSSProperties}
      title="Create sticky note"
      type="button"
      onClick={() => onCreate(direction)}
      onPointerDown={(event) => event.stopPropagation()}
    >
      +
    </button>
  ))
}

function FigJamToolBar({
  tool,
  onToolChange,
}: {
  readonly tool: FigJamTool
  readonly onToolChange: (tool: FigJamTool) => void
}) {
  return (
    <div
      aria-label="FigJam tools"
      className="engine-demo-controls"
      role="toolbar"
      onKeyDown={handleToolbarArrowNavigation}
    >
      {FIGJAM_TOOLS.map(({ icon: Icon, id, label }) => (
        <button
          aria-label={label}
          aria-pressed={tool === id}
          key={id}
          title={label}
          type="button"
          onClick={() => onToolChange(id)}
        >
          <Icon aria-hidden="true" size={14} strokeWidth={2} />
        </button>
      ))}
    </div>
  )
}

function FigJamPointerPreview({
  session,
}: {
  readonly session: FigJamPointerSession | null
}) {
  if (!session || session.kind === 'pan') {
    return null
  }

  if (session.kind === 'marquee') {
    const bounds = createFigJamMarqueeBounds(session.start, session.current)

    return (
      <div
        className="figjam-react-marquee"
        data-figjam-marquee
        style={toBoundsStyle(bounds)}
      />
    )
  }

  if (session.kind === 'drawing') {
    const placement = localizeFigJamDrawing(session.points)

    return placement ? (
      <svg
        aria-hidden="true"
        className="figjam-react-pointer-preview"
        style={toBoundsStyle(placement)}
        viewBox={`0 0 ${placement.w} ${placement.h}`}
      >
        <polyline
          fill="none"
          opacity={session.variant === 'highlight' ? 0.42 : 1}
          points={placement.points.map(({ x, y }) => `${x},${y}`).join(' ')}
          stroke={session.variant === 'highlight' ? '#fde047' : '#475569'}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={session.variant === 'highlight' ? 18 : 5}
        />
      </svg>
    ) : null
  }

  const bounds = createFigJamMarqueeBounds(session.start, session.current)

  return (
    <svg
      aria-hidden="true"
      className="figjam-react-pointer-preview"
      style={toBoundsStyle({
        ...bounds,
        h: Math.max(bounds.h, 24),
        w: Math.max(bounds.w, 24),
      })}
      viewBox={`0 0 ${Math.max(bounds.w, 24)} ${Math.max(bounds.h, 24)}`}
    >
      <line
        x1={session.start.x - bounds.x}
        x2={session.current.x - bounds.x}
        y1={session.start.y - bounds.y}
        y2={session.current.y - bounds.y}
      />
    </svg>
  )
}

function createStoredFigJamDocument() {
  try {
    return restoreFigJamDesignDocument(
      globalThis.localStorage?.getItem(FIGJAM_DOCUMENT_STORAGE_KEY),
    )
  } catch {
    return restoreFigJamDesignDocument(null)
  }
}

function createFigJamRegistry() {
  return createReactDesignDefinitionRegistry({
    definitions: FIGJAM_PRODUCT_PACK.definitions,
    intrinsics: [],
  })
}

function getFigJamWidgetDefinition(node: DesignNode | null) {
  return node?.definition.kind === 'widget'
    ? FIGJAM_WIDGET_PACK.resolve(node.definition.id)
    : null
}

function toDrawingVariant(tool: FigJamTool): FigJamDrawingVariant | null {
  if (tool === 'marker' || tool === 'highlight') {
    return tool
  }

  return tool === 'pen' ? 'path' : null
}

function toInsertKind(tool: FigJamTool): FigJamInsertKind | null {
  if (
    tool === 'shape' ||
    tool === 'text' ||
    tool === 'sticky' ||
    tool === 'section'
  ) {
    return tool
  }

  return null
}

function isTextInsertion(kind: FigJamInsertKind) {
  return kind === 'sticky' ||
    kind === 'text' ||
    kind === 'label' ||
    kind === 'card' ||
    kind === 'comment'
}

function readNearestAnchor(
  read: Parameters<typeof readFigJamNodeWorldBounds>[0],
  nodeId: DesignNodeId | null,
  point: FigJamWorldPoint,
) {
  if (!nodeId) {
    return 'center' as const
  }

  const bounds = readFigJamNodeWorldBounds(read, nodeId)

  if (!bounds) {
    return 'center' as const
  }

  const distances = [
    ['top', Math.abs(point.y - bounds.y)],
    ['right', Math.abs(point.x - bounds.x - bounds.w)],
    ['bottom', Math.abs(point.y - bounds.y - bounds.h)],
    ['left', Math.abs(point.x - bounds.x)],
  ] as const

  return [...distances].sort((left, right) => left[1] - right[1])[0]?.[0] ??
    'center'
}

function readQuickCreatePlacement(
  source: FigJamDocumentBounds,
  direction: FigJamQuickCreateDirection,
  gap: number,
) {
  switch (direction) {
    case 'left':
      return { ...source, x: source.x - source.w - gap }
    case 'right':
      return { ...source, x: source.x + source.w + gap }
    case 'top':
      return { ...source, y: source.y - source.h - gap }
    case 'bottom':
      return { ...source, y: source.y + source.h + gap }
  }
}

function readQuickCreateEndpoints(
  source: FigJamDocumentBounds,
  target: FigJamDocumentBounds,
  direction: FigJamQuickCreateDirection,
) {
  const sourceCenter = {
    x: source.x + source.w / 2,
    y: source.y + source.h / 2,
  }
  const targetCenter = {
    x: target.x + target.w / 2,
    y: target.y + target.h / 2,
  }

  switch (direction) {
    case 'left':
      return {
        start: { x: source.x, y: sourceCenter.y },
        startAnchor: 'left' as const,
        end: { x: target.x + target.w, y: targetCenter.y },
        endAnchor: 'right' as const,
      }
    case 'right':
      return {
        start: { x: source.x + source.w, y: sourceCenter.y },
        startAnchor: 'right' as const,
        end: { x: target.x, y: targetCenter.y },
        endAnchor: 'left' as const,
      }
    case 'top':
      return {
        start: { x: sourceCenter.x, y: source.y },
        startAnchor: 'top' as const,
        end: { x: targetCenter.x, y: target.y + target.h },
        endAnchor: 'bottom' as const,
      }
    case 'bottom':
      return {
        start: { x: sourceCenter.x, y: source.y + source.h },
        startAnchor: 'bottom' as const,
        end: { x: targetCenter.x, y: target.y },
        endAnchor: 'top' as const,
      }
  }
}

function readConnectorPlacement(
  start: FigJamWorldPoint,
  end: FigJamWorldPoint,
): FigJamDocumentBounds {
  const dx = Math.abs(end.x - start.x)
  const dy = Math.abs(end.y - start.y)
  const w = Math.max(24, dx)
  const h = Math.max(24, dy)

  return {
    h,
    w,
    x: Math.min(start.x, end.x) - (w - dx) / 2,
    y: Math.min(start.y, end.y) - (h - dy) / 2,
  }
}

function readStickyTone(value: unknown): FigJamStickyNoteTone {
  return typeof value === 'string' &&
    (FIGJAM_STICKY_NOTE_TONES as readonly string[]).includes(value)
    ? value as FigJamStickyNoteTone
    : 'yellow'
}

function readNudge(event: KeyboardEvent) {
  const distance = event.shiftKey ? 10 : 1

  switch (event.key) {
    case 'ArrowLeft':
      return { x: -distance, y: 0 }
    case 'ArrowRight':
      return { x: distance, y: 0 }
    case 'ArrowUp':
      return { x: 0, y: -distance }
    case 'ArrowDown':
      return { x: 0, y: distance }
    default:
      return null
  }
}

function readToolShortcut(event: KeyboardEvent): FigJamTool | null {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return null
  }

  switch (event.key.toLowerCase()) {
    case 'v':
      return 'select'
    case 'h':
      return 'pan'
    case 's':
      return 'shape'
    case 't':
      return 'text'
    case 'n':
      return 'sticky'
    case 'c':
      return 'comment'
    case 'f':
      return 'section'
    case 'p':
      return 'pen'
    case 'm':
      return 'marker'
    case 'a':
      return 'connector'
    default:
      return null
  }
}

function handleToolbarArrowNavigation(
  event: ReactKeyboardEvent<HTMLDivElement>,
) {
  if (
    event.key !== 'ArrowLeft' &&
    event.key !== 'ArrowRight' &&
    event.key !== 'Home' &&
    event.key !== 'End'
  ) {
    return
  }

  const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>(
    ':scope > button:not(:disabled)',
  )]
  const current = buttons.indexOf(globalThis.document.activeElement as HTMLButtonElement)
  const next = event.key === 'Home'
    ? 0
    : event.key === 'End'
      ? buttons.length - 1
      : (current + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) %
        buttons.length

  if (buttons[next]) {
    event.preventDefault()
    buttons[next].focus()
  }
}

function isFigJamControlTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest([
    '.command-palette',
    '.engine-demo-controls',
    '.engine-demo-viewport-controls',
    '.figjam-react-selection-toolbar',
    '.figma-selection-layer',
    '[data-dom-edit-editor-control]',
    'button',
    'input',
    'select',
    'textarea',
  ].join(',')) !== null
}

function isFigJamTextEntryTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest(
    'input, textarea, select, [contenteditable="true"]',
  ) !== null
}

function toBoundsStyle(bounds: FigJamDocumentBounds): CSSProperties {
  return {
    height: bounds.h,
    left: bounds.x,
    top: bounds.y,
    width: bounds.w,
  }
}

function sanitizeIdPart(value: string) {
  return value.replace(/[^a-z0-9-]+/gi, '-').replace(/^-|-$/g, '')
}
