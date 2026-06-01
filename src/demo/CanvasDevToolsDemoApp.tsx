import {
  ArrowUpRight,
  Eraser,
  Frame,
  Highlighter,
  Maximize2,
  MessageSquareText,
  Minus,
  Moon,
  MousePointer2,
  Move,
  PencilLine,
  Plus,
  RotateCcw,
  Square,
  StickyNote,
  Sun,
  Type,
  Unlock,
  Vote,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import {
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  CanvasApp,
  CanvasContextCommandMenu,
  type CanvasAppAssemblyInput,
  type CanvasAppProps,
  type CanvasContextCommandMenuState,
  type CanvasStampKind,
  type Tool,
} from '../canvas'
import { EngineSelectionToolbar } from './CanvasDevToolsSelectionToolbar'
import { EngineWidgetPlayOverlay } from './CanvasDevToolsWidgetPlayOverlay'
import {
  isTodoWidgetData,
  toggleTodoWidgetItemDone,
} from './widget-catalog/TodoWidget'
import './CanvasDevToolsDemoApp.css'

type CanvasEngineDemoModel =
  Parameters<NonNullable<CanvasAppProps['renderApp']>>[0]

const ENGINE_DEMO_TOOLS = [
  { icon: MousePointer2, id: 'select', label: 'Select tool' },
  { icon: Move, id: 'pan', label: 'Pan tool' },
  { icon: Square, id: 'rect', label: 'Shape tool' },
  { icon: Type, id: 'text', label: 'Text tool' },
  { icon: StickyNote, id: 'sticky', label: 'Sticky note tool' },
  { icon: MessageSquareText, id: 'comment', label: 'Comment tool' },
  { icon: Frame, id: 'section', label: 'Section tool' },
  { icon: PencilLine, id: 'marker', label: 'Marker tool' },
  { icon: Highlighter, id: 'highlight', label: 'Highlighter tool' },
  { icon: Eraser, id: 'eraser', label: 'Eraser tool' },
  { icon: ArrowUpRight, id: 'arrow', label: 'Arrow tool' },
] as const satisfies readonly {
  icon: typeof MousePointer2
  id: Tool
  label: string
}[]

type EngineSelectionPointerState = {
  dragging: boolean
  pointerId: number
  x: number
  y: number
}

const ENGINE_SELECTION_DRAG_THRESHOLD = 3

const ENGINE_SELECTION_STAMPS = [
  { label: '+1', stamp: 'thumbs-up', title: 'Stamp +1' },
  { label: '!', stamp: 'attention', title: 'Stamp !' },
  { label: '?', stamp: 'question', title: 'Stamp ?' },
] as const satisfies readonly {
  label: string
  stamp: CanvasStampKind
  title: string
}[]

export function CanvasDevToolsDemoApp({
  assemblyInput,
}: {
  assemblyInput?: CanvasAppAssemblyInput
}) {
  return (
    <CanvasApp
      assemblyInput={assemblyInput}
      renderApp={(app) => <CanvasEngineDemoSurface app={app} />}
    />
  )
}

function CanvasEngineDemoSurface({
  app,
}: {
  app: CanvasEngineDemoModel
}) {
  const viewportPercent = `${Math.round(app.zoomControls.scale * 100)}%`
  const [selectionToolbarVisible, setSelectionToolbarVisible] = useState(false)
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>('light')
  const [votingPanelOpen, setVotingPanelOpen] = useState(false)
  const [contextMenu, setContextMenu] =
    useState<CanvasContextCommandMenuState | null>(null)
  const [, setSelectionPointer] =
    useState<EngineSelectionPointerState | null>(null)
  const votingPanelVisible = votingPanelOpen ||
    app.votingSession.status !== 'idle'
  // Play mode is bound to the single selected widget: if the selection moves
  // off it, leave play mode (React-sanctioned reset-state-on-prop-change).
  const selectedSingleId =
    app.selection.items.length === 1 ? app.selection.items[0].id : null
  if (activeWidgetId !== null && activeWidgetId !== selectedSingleId) {
    setActiveWidgetId(null)
  }
  const activeWidgetItem = activeWidgetId
    ? app.selection.items.find((item) => item.id === activeWidgetId) ?? null
    : null
  const activeWidgetData =
    activeWidgetItem?.type === 'custom' && isTodoWidgetData(activeWidgetItem.data)
      ? activeWidgetItem.data
      : null
  const onToggleWidgetPlay = () => {
    const selectedId =
      app.selection.items.length === 1 ? app.selection.items[0].id : null
    setActiveWidgetId((current) =>
      current && current === selectedId ? null : selectedId,
    )
  }
  const onToggleWidgetItem = (index: number) => {
    app.selection.onReplaceSelectedItems((item) =>
      item.id === activeWidgetId &&
      item.type === 'custom' &&
      isTodoWidgetData(item.data)
        ? { ...item, data: toggleTodoWidgetItemDone(item.data, index) }
        : item,
    )
  }
  const hideSelectionToolbar = () => {
    setSelectionToolbarVisible(false)
  }
  const closeContextMenu = () => {
    setContextMenu(null)
  }
  const handleWorkspacePointerDownCapture = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (isEngineDemoControlTarget(event.target)) {
      return
    }

    setSelectionToolbarVisible(false)
    setContextMenu(null)
    setSelectionPointer({
      dragging: false,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    })
  }
  const handleWorkspacePointerMoveCapture = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    setSelectionPointer((current) => {
      if (!current || current.pointerId !== event.pointerId) {
        return current
      }

      const dx = event.clientX - current.x
      const dy = event.clientY - current.y

      return current.dragging ||
          Math.hypot(dx, dy) <= ENGINE_SELECTION_DRAG_THRESHOLD
        ? current
        : { ...current, dragging: true }
    })
  }
  const handleWorkspacePointerUpCapture = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (isEngineDemoControlTarget(event.target)) {
      return
    }

    setSelectionPointer((current) => {
      if (!current || current.pointerId !== event.pointerId) {
        return null
      }

      setSelectionToolbarVisible(!current.dragging)
      return null
    })
  }
  const handleWorkspacePointerCancelCapture = () => {
    setSelectionPointer(null)
    setSelectionToolbarVisible(false)
  }
  const handleWorkspaceContextMenuCapture = (
    event: ReactMouseEvent<HTMLElement>,
  ) => {
    if (isEngineDemoControlTarget(event.target)) {
      return
    }

    event.preventDefault()
    setSelectionToolbarVisible(false)
    setContextMenu(getEngineContextMenuPoint({
      app,
      fallback: { x: event.clientX, y: event.clientY },
    }))
  }
  const handleWorkspaceKeyDownCapture = (
    event: ReactKeyboardEvent<HTMLElement>,
  ) => {
    if (
      event.key !== 'ContextMenu' &&
      !(event.key === 'F10' && event.shiftKey)
    ) {
      return
    }

    if (isEngineDemoControlTarget(event.target)) {
      return
    }

    event.preventDefault()
    setSelectionToolbarVisible(false)
    setContextMenu(getEngineContextMenuPoint({ app }))
  }

  return (
    <main className="engine-demo-app" data-theme={theme}>
      <section
        className="engine-demo-workspace"
        aria-label="Canvas"
        tabIndex={0}
        onContextMenuCapture={handleWorkspaceContextMenuCapture}
        onKeyDownCapture={handleWorkspaceKeyDownCapture}
        onPointerCancelCapture={handleWorkspacePointerCancelCapture}
        onPointerDownCapture={handleWorkspacePointerDownCapture}
        onPointerMoveCapture={handleWorkspacePointerMoveCapture}
        onPointerUpCapture={handleWorkspacePointerUpCapture}
      >
        {app.stage}
        <EngineStickyQuickCreateControls
          stickyQuickCreate={app.stickyQuickCreate}
          onCreate={hideSelectionToolbar}
        />
        {selectionToolbarVisible ? (
          <EngineSelectionToolbar
            key={app.selection.ids.join('\u0000')}
            activeWidgetId={activeWidgetId}
            app={app}
            onClose={hideSelectionToolbar}
            onToggleWidgetPlay={onToggleWidgetPlay}
          />
        ) : null}
        {selectionToolbarVisible ? (
          <EngineStampPad
            app={app}
            onInsert={hideSelectionToolbar}
          />
        ) : null}
        <EngineWidgetPlayOverlay
          activeWidgetId={activeWidgetData ? activeWidgetId : null}
          data={activeWidgetData}
          onToggle={onToggleWidgetItem}
        />
        <EngineTextEditor {...app.textEditor} />
        <CanvasContextCommandMenu
          commandAvailability={app.toolbar.commandAvailability}
          config={app.toolbar.config}
          customCommands={app.toolbar.customCommands}
          commandHandlers={app.toolbar.commandHandlers}
          menu={contextMenu}
          onClose={closeContextMenu}
          onCustomCommand={app.toolbar.onCustomCommand}
        />
      </section>
      <div
        className="engine-demo-controls"
        role="toolbar"
        aria-label="Engine affordances"
      >
        {ENGINE_DEMO_TOOLS.map(({ icon: Icon, id, label }) => (
          <button
            aria-label={label}
            aria-pressed={app.toolbar.tool === id}
            key={id}
            onClick={() => {
              hideSelectionToolbar()
              app.toolbar.onToolChange(id)
            }}
            type="button"
          >
            <Icon aria-hidden="true" size={14} strokeWidth={2} />
          </button>
        ))}
      </div>
      <div
        className="engine-demo-viewport-controls"
        role="toolbar"
        aria-label="Viewport controls"
      >
        <span aria-label="Canvas scale">{viewportPercent}</span>
        <button
          aria-label="Zoom out"
          onClick={app.zoomControls.onZoomOut}
          type="button"
        >
          <ZoomOut aria-hidden="true" size={14} strokeWidth={2} />
        </button>
        <button
          aria-label="Zoom in"
          onClick={app.zoomControls.onZoomIn}
          type="button"
        >
          <ZoomIn aria-hidden="true" size={14} strokeWidth={2} />
        </button>
        <button
          aria-label="Fit selection"
          onClick={app.zoomControls.onFit}
          type="button"
        >
          <Maximize2 aria-hidden="true" size={14} strokeWidth={2} />
        </button>
        <button
          aria-label="Voting session"
          aria-pressed={votingPanelVisible}
          onClick={() => setVotingPanelOpen((open) => !open)}
          type="button"
        >
          <Vote aria-hidden="true" size={14} strokeWidth={2} />
        </button>
        <button
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-pressed={theme === 'dark'}
          onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          type="button"
        >
          {theme === 'dark' ? (
            <Sun aria-hidden="true" size={14} strokeWidth={2} />
          ) : (
            <Moon aria-hidden="true" size={14} strokeWidth={2} />
          )}
        </button>
        <button
          aria-label="Reset viewport"
          onClick={app.zoomControls.onReset}
          type="button"
        >
          <RotateCcw aria-hidden="true" size={14} strokeWidth={2} />
        </button>
        <button
          aria-label="Unlock all"
          onClick={app.toolbar.commandHandlers.onUnlockAll}
          type="button"
        >
          <Unlock aria-hidden="true" size={14} strokeWidth={2} />
        </button>
      </div>
      <EngineVotingSessionPanel
        visible={votingPanelVisible}
        votingSession={app.votingSession}
        onClose={() => setVotingPanelOpen(false)}
      />
    </main>
  )
}

function EngineStickyQuickCreateControls({
  stickyQuickCreate,
  onCreate,
}: {
  stickyQuickCreate: CanvasEngineDemoModel['stickyQuickCreate']
  onCreate: () => void
}) {
  if (!stickyQuickCreate.visible) {
    return null
  }

  return (
    <>
      {stickyQuickCreate.controls.map((control) => (
        <button
          aria-label={`Create sticky note ${control.direction}`}
          className="engine-sticky-quick-create"
          data-direction={control.direction}
          key={control.direction}
          onClick={() => {
            if (stickyQuickCreate.onQuickCreate(control.direction)) {
              onCreate()
            }
          }}
          onPointerDown={(event) => event.stopPropagation()}
          style={{
            '--engine-sticky-quick-create-x': `${control.x}px`,
            '--engine-sticky-quick-create-y': `${control.y}px`,
          } as CSSProperties}
          title="Create sticky note"
          type="button"
        >
          <Plus aria-hidden="true" size={13} strokeWidth={2.4} />
        </button>
      ))}
    </>
  )
}

function EngineStampPad({
  app,
  onInsert,
}: {
  app: CanvasEngineDemoModel
  onInsert: () => void
}) {
  const {
    anchor,
    disabled,
    ids,
  } = app.selection

  if (
    !anchor ||
    ids.length === 0 ||
    !app.selection.canStamp ||
    app.textEditor.editing ||
    app.toolbar.tool !== 'select'
  ) {
    return null
  }

  return (
    <div
      className="engine-stamp-pad"
      role="group"
      aria-label="Stamp reactions"
      data-placement={anchor.placement}
      style={{
        '--engine-selection-x': `${anchor.x}px`,
        '--engine-selection-y': `${anchor.y}px`,
      } as CSSProperties}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {ENGINE_SELECTION_STAMPS.map((stamp) => (
        <button
          aria-label={`Add ${stamp.label} stamp`}
          disabled={disabled}
          key={stamp.stamp}
          onClick={() => {
            if (app.selection.onInsertStampNearSelection(stamp)) {
              onInsert()
            }
          }}
          title={stamp.title}
          type="button"
        >
          {stamp.label}
        </button>
      ))}
    </div>
  )
}

function EngineVotingSessionPanel({
  visible,
  votingSession,
  onClose,
}: {
  visible: boolean
  votingSession: CanvasEngineDemoModel['votingSession']
  onClose: () => void
}) {
  if (!visible) {
    return null
  }

  const isActive = votingSession.status === 'active'

  return (
    <section
      className="engine-voting-session"
      data-status={votingSession.status}
      aria-label="Voting session"
    >
      <input
        aria-label="Voting prompt"
        disabled={isActive}
        maxLength={80}
        value={votingSession.prompt}
        onChange={(event) =>
          votingSession.onPromptChange(event.currentTarget.value)}
      />
      <div className="engine-voting-stepper">
        <button
          aria-label="Decrease votes"
          disabled={isActive}
          onClick={() =>
            votingSession.onVotesPerParticipantChange(
              votingSession.votesPerParticipant - 1,
            )}
          type="button"
        >
          <Minus aria-hidden="true" size={12} strokeWidth={2} />
        </button>
        <span aria-label="Votes per person">
          {votingSession.votesPerParticipant}
        </span>
        <button
          aria-label="Increase votes"
          disabled={isActive}
          onClick={() =>
            votingSession.onVotesPerParticipantChange(
              votingSession.votesPerParticipant + 1,
            )}
          type="button"
        >
          <Plus aria-hidden="true" size={12} strokeWidth={2} />
        </button>
      </div>
      <span
        className="engine-voting-count"
        aria-label="Voting result count"
      >
        {votingSession.votesCast}/{votingSession.votesPerParticipant}
      </span>
      {isActive ? (
        <button
          aria-label="End voting"
          onClick={votingSession.onEnd}
          type="button"
        >
          End
        </button>
      ) : (
        <button
          aria-label="Start voting"
          onClick={votingSession.onStart}
          type="button"
        >
          Start
        </button>
      )}
      {votingSession.status === 'ended' ? (
        <button
          aria-label="Clear voting results"
          onClick={() => {
            votingSession.onReset()
            onClose()
          }}
          type="button"
        >
          Clear
        </button>
      ) : null}
      {isActive && !votingSession.canCastVote ? (
        <span
          className="engine-voting-done"
          aria-label="Voting complete"
        >
          Done
        </span>
      ) : null}
    </section>
  )
}

function getEngineContextMenuPoint({
  app,
  fallback,
}: {
  app: CanvasEngineDemoModel
  fallback?: CanvasContextCommandMenuState
}): CanvasContextCommandMenuState {
  if (fallback && (fallback.x !== 0 || fallback.y !== 0)) {
    return fallback
  }

  const anchor = app.selection.anchor

  if (anchor) {
    return { x: anchor.x, y: anchor.y }
  }

  return {
    x: globalThis.innerWidth / 2,
    y: globalThis.innerHeight / 2,
  }
}

function isEngineDemoControlTarget(target: EventTarget) {
  return target instanceof Element &&
    target.closest(
      [
        '.context-command-menu',
        '.engine-demo-controls',
        '.engine-demo-viewport-controls',
        '.engine-sticky-quick-create',
        '.engine-selection-toolbar',
        '.engine-stamp-pad',
        '.engine-voting-session',
        '.text-editor',
        'button',
        'input',
        'textarea',
      ].join(','),
    ) !== null
}

function EngineTextEditor({
  editing,
  editorRef,
  style,
  visible,
  onBlur,
  onCancel,
  onChange,
  onCommit,
}: CanvasEngineDemoModel['textEditor']) {
  if (!visible || !editing || !style) {
    return null
  }

  return (
    <textarea
      ref={editorRef}
      className="text-editor"
      value={editing.value}
      style={style}
      spellCheck={false}
      onBlur={onBlur}
      onChange={(event) => {
        onChange({
          id: editing.id,
          value: event.target.value,
        })
      }}
      onKeyDown={(event) => {
        const shortcutModifier = event.metaKey || event.ctrlKey

        if (
          event.key === 'Enter' &&
          !event.shiftKey &&
          !shortcutModifier
        ) {
          event.preventDefault()
          onCommit()
        }

        if (event.key === 'Escape') {
          event.preventDefault()
          onCancel()
        }
      }}
      onPointerDown={(event) => event.stopPropagation()}
    />
  )
}
