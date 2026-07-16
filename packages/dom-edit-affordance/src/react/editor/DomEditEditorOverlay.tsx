import type {
  EditorEngine,
  EditorEngineNodeEdit,
  EditorEngineNodeEditScope,
  EditorEnginePreviewSession,
} from '@interactive-os/canvas/editor'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'

import type {
  DomEditAffordanceState,
} from '../../features/node-selection/DomEditAffordanceVisibility'
import type {
  DomEditFrameGuideConfig,
} from '../features/spatial-inspection/DomEditFrameGuides'
import type { DomEditViewport } from '../../shared/model/DomEditTypes'
import type {
  DomEditInteractionAction,
} from '../../interaction/DomEditInteractionCommands'
import {
  DomEditSelectionOverlay,
  type DomEditDirectManipulationEdit,
  type DomEditDirectManipulationLifecycle,
} from '../features/node-selection/DomEditSelectionOverlay'
import {
  executeDomEditEditorAutoLayoutField,
  executeDomEditEditorField,
  toEditorEngineNodeEdit,
  useDomEditEditorModel,
} from './DomEditEditorModel'

export function DomEditEditorOverlay({
  affordanceState: controlledAffordanceState,
  canvasSelection = true,
  draggable = true,
  editScope,
  editor,
  frameGuides,
  isCanvasPanActive,
  selectedNodeId: controlledSelectedNodeId,
  onAffordanceStateChange,
  shellRef,
  spacingGridSize,
  viewport,
  resizable = true,
}: {
  readonly affordanceState?: DomEditAffordanceState
  readonly canvasSelection?: boolean
  readonly draggable?: boolean
  readonly editScope?: EditorEngineNodeEditScope
  readonly editor: EditorEngine
  readonly frameGuides?: DomEditFrameGuideConfig<string> | null
  readonly isCanvasPanActive: boolean
  readonly selectedNodeId?: string | null
  readonly onAffordanceStateChange?: (state: DomEditAffordanceState) => void
  readonly shellRef: RefObject<HTMLElement | null>
  readonly spacingGridSize?: number
  readonly viewport: DomEditViewport
  readonly resizable?: boolean
}) {
  const model = useDomEditEditorModel(editor)
  const [internalAffordanceState, setInternalAffordanceState] =
    useState<DomEditAffordanceState>({ mode: 'idle' })
  const isAffordanceStateControlled = controlledAffordanceState !== undefined
  const affordanceState = controlledAffordanceState ?? internalAffordanceState
  const selectedNodeId = controlledSelectedNodeId === undefined
    ? model.selectedNodeId
    : controlledSelectedNodeId
  const changeAffordanceState = useCallback((state: DomEditAffordanceState) => {
    if (!isAffordanceStateControlled) {
      setInternalAffordanceState(state)
    }

    onAffordanceStateChange?.(state)
  }, [isAffordanceStateControlled, onAffordanceStateChange])
  const directManipulation = useDomEditEditorDirectManipulation(
    editor,
    editScope,
  )

  useDomEditEditorCanvasSelection({
    editor,
    enabled: canvasSelection,
    isCanvasPanActive,
    shellRef,
  })

  return (
    <DomEditSelectionOverlay
      adapter={model.adapter}
      affordanceState={affordanceState}
      directManipulation={directManipulation}
      draggable={draggable}
      frameGuides={frameGuides}
      isCanvasPanActive={isCanvasPanActive}
      selectedNodeId={selectedNodeId}
      resizable={resizable}
      shellRef={shellRef}
      spacingGridSize={spacingGridSize}
      state={model.state}
      viewport={viewport}
      onAffordanceStateChange={changeAffordanceState}
      onChange={(nodeId, field, value) => {
        executeDomEditEditorField(editor, nodeId, field, value, editScope)
      }}
      onChangeAutoLayout={(nodeId, field, value) => {
        executeDomEditEditorAutoLayoutField(
          editor,
          nodeId,
          field,
          value,
          editScope,
        )
      }}
      onCommand={(action) => runDomEditEditorCommand(editor, action, editScope)}
    />
  )
}

function useDomEditEditorDirectManipulation(
  editor: EditorEngine,
  editScope?: EditorEngineNodeEditScope,
): DomEditDirectManipulationLifecycle<string> {
  const sessionRef = useRef<EditorEnginePreviewSession | null>(null)
  const editsRef = useRef(new Map<string, EditorEngineNodeEdit>())

  return useMemo(() => {
    const clear = () => {
      sessionRef.current = null
      editsRef.current.clear()
    }
    const cancel = () => {
      const session = sessionRef.current

      if (!session) {
        return false
      }

      session.cancel()
      clear()
      return true
    }

    return {
      begin({ kind, nodeId }) {
        cancel()
        const session = editor.commands.beginPreview({
          label: readDomEditPreviewLabel(kind),
          nodeId,
          scope: editScope,
        })

        sessionRef.current = session
        return session !== null
      },
      cancel,
      commit() {
        const session = sessionRef.current

        if (!session) {
          return false
        }

        session.commit()
        clear()
        return true
      },
      update(edits) {
        const session = sessionRef.current

        if (!session) {
          return false
        }

        for (const edit of edits) {
          const engineEdit = toEditorEngineNodeEdit(edit)
          const key = engineEdit.target === 'text'
            ? 'text'
            : `${engineEdit.target}:${engineEdit.field}`

          editsRef.current.set(key, engineEdit)
        }

        session.update([...editsRef.current.values()])
        return true
      },
    }
  }, [editScope, editor])
}

function readDomEditPreviewLabel(
  kind: 'gap' | 'move' | 'padding' | 'resize',
) {
  switch (kind) {
    case 'gap':
      return 'Edit gap'
    case 'move':
      return 'Move node'
    case 'padding':
      return 'Edit padding'
    case 'resize':
      return 'Resize node'
  }
}

function useDomEditEditorCanvasSelection({
  editor,
  enabled,
  isCanvasPanActive,
  shellRef,
}: {
  readonly editor: EditorEngine
  readonly enabled: boolean
  readonly isCanvasPanActive: boolean
  readonly shellRef: RefObject<HTMLElement | null>
}) {
  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const shell = shellRef.current

    if (!shell) {
      return undefined
    }

    const selectFromCanvas = (event: MouseEvent) => {
      if (
        isCanvasPanActive ||
        event.button !== 0 ||
        isDomEditEditorControlTarget(event.target)
      ) {
        return
      }

      const hasDesignTarget = editor.projection.hitPath(event.target).length > 0
      const result = editor.commands.execute({
        exactTarget: event.metaKey || event.ctrlKey,
        target: event.target,
        type: 'selection.hit',
      })

      if (hasDesignTarget && result.ok) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    shell.addEventListener('click', selectFromCanvas, true)

    return () => {
      shell.removeEventListener('click', selectFromCanvas, true)
    }
  }, [editor, enabled, isCanvasPanActive, shellRef])
}

function isDomEditEditorControlTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest(
    '.figma-selection-layer, [data-dom-edit-editor-control]',
  ) !== null
}

function runDomEditEditorCommand(
  editor: EditorEngine,
  action: DomEditInteractionAction,
  editScope?: EditorEngineNodeEditScope,
) {
  if (action.type === 'dom-edit.command.undo') {
    return editor.commands.execute({ type: 'history.undo' }).ok
  }

  if (action.type === 'dom-edit.command.redo') {
    return editor.commands.execute({ type: 'history.redo' }).ok
  }

  if (action.type === 'dom-edit.overlay.escape') {
    return editor.commands.execute({ type: 'selection.parent' }).ok
  }

  if (action.type === 'dom-edit.command.nudge') {
    return nudgeDomEditEditorSelection(editor, action.params, editScope).ok
  }

  return false
}

function nudgeDomEditEditorSelection(
  editor: EditorEngine,
  delta: { readonly dx: number; readonly dy: number },
  editScope?: EditorEngineNodeEditScope,
) {
  const nodeId = editor.snapshot().selection.primaryNodeId
  const node = nodeId ? editor.read.node(nodeId) : null

  if (!nodeId || !node) {
    return { code: 'unavailable', ok: false, reason: 'No node selected' } as const
  }

  const edits: DomEditDirectManipulationEdit[] = [
    {
      field: 'x',
      kind: 'number',
      value: readFiniteNumber(node.frame?.x ?? node.layout.x) + delta.dx,
    },
    {
      field: 'y',
      kind: 'number',
      value: readFiniteNumber(node.frame?.y ?? node.layout.y) + delta.dy,
    },
  ]

  return editor.commands.execute({
    edits: edits.map(toEditorEngineNodeEdit),
    label: 'Nudge node',
    nodeId,
    scope: editScope,
    type: 'node.edit',
  })
}

function readFiniteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}
