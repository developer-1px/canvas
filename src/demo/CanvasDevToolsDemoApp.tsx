import {
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignHorizontalSpaceBetween,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalSpaceBetween,
  ArrowUpRight,
  Boxes,
  BringToFront,
  Circle,
  Copy,
  CornerDownRight,
  Diamond,
  Eraser,
  Eye,
  EyeOff,
  FlipHorizontal,
  FlipVertical,
  Frame,
  Group,
  Highlighter,
  LayoutGrid,
  Lock,
  Maximize2,
  MessageSquareText,
  Minus,
  Moon,
  MousePointer2,
  Move,
  MoveDown,
  MoveUp,
  PanelTopClose,
  PaintBucket,
  PencilLine,
  Plus,
  RotateCcw,
  RotateCw,
  SendToBack,
  Square,
  StickyNote,
  Sun,
  Type,
  Trash2,
  Ungroup,
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
  CanvasHost,
  type CanvasAppAssemblyInput,
  type CanvasAppProps,
  type CanvasContextCommandMenuState,
  type CanvasItem,
  type CanvasShapeLikeItem,
  type CanvasShapeType,
  type CanvasStampKind,
  type Tool,
} from '../canvas'
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

type EngineSelectionStyleControlId = 'fill' | 'stroke'

type EngineSelectionPointerState = {
  dragging: boolean
  pointerId: number
  x: number
  y: number
}

const ENGINE_SELECTION_DRAG_THRESHOLD = 3

const ENGINE_SELECTION_SHAPE_TYPES = [
  { icon: Square, label: 'Rect shape', type: 'rect' },
  { icon: Circle, label: 'Ellipse shape', type: 'ellipse' },
  { icon: Diamond, label: 'Diamond shape', type: 'diamond' },
] as const satisfies readonly {
  icon: typeof Square
  label: string
  type: CanvasShapeType
}[]

const ENGINE_SELECTION_ARROW_ROUTINGS = [
  { icon: CornerDownRight, label: 'Elbow connector', routing: 'elbow' },
  { icon: ArrowUpRight, label: 'Straight connector', routing: 'straight' },
] as const satisfies readonly {
  icon: typeof ArrowUpRight
  label: string
  routing: Extract<CanvasItem, { type: 'arrow' }>['routing']
}[]

const ENGINE_SELECTION_STAMPS = [
  { label: '+1', stamp: 'thumbs-up', title: 'Stamp +1' },
  { label: '!', stamp: 'attention', title: 'Stamp !' },
  { label: '?', stamp: 'question', title: 'Stamp ?' },
] as const satisfies readonly {
  label: string
  stamp: CanvasStampKind
  title: string
}[]

const ENGINE_SELECTION_ALIGN_CONTROLS = [
  { command: 'alignLeft', icon: AlignHorizontalJustifyStart, label: 'Align left', mode: 'alignLeft' },
  { command: 'alignCenter', icon: AlignHorizontalJustifyCenter, label: 'Align center', mode: 'alignCenter' },
  { command: 'alignRight', icon: AlignHorizontalJustifyEnd, label: 'Align right', mode: 'alignRight' },
  { command: 'alignTop', icon: AlignVerticalJustifyStart, label: 'Align top', mode: 'alignTop' },
  { command: 'alignMiddle', icon: AlignVerticalJustifyCenter, label: 'Align middle', mode: 'alignMiddle' },
  { command: 'alignBottom', icon: AlignVerticalJustifyEnd, label: 'Align bottom', mode: 'alignBottom' },
] as const

const ENGINE_SELECTION_DISTRIBUTE_CONTROLS = [
  {
    command: 'distributeHorizontal',
    icon: AlignHorizontalSpaceBetween,
    label: 'Distribute horizontally',
    mode: 'distributeHorizontal',
  },
  {
    command: 'distributeVertical',
    icon: AlignVerticalSpaceBetween,
    label: 'Distribute vertically',
    mode: 'distributeVertical',
  },
] as const

const ENGINE_SELECTION_LAYER_ORDER_CONTROLS = [
  {
    command: 'bringToFront',
    icon: BringToFront,
    label: 'Bring to front',
    mode: 'bringToFront',
  },
  {
    command: 'bringForward',
    icon: MoveUp,
    label: 'Bring forward',
    mode: 'bringForward',
  },
  {
    command: 'sendBackward',
    icon: MoveDown,
    label: 'Send backward',
    mode: 'sendBackward',
  },
  {
    command: 'sendToBack',
    icon: SendToBack,
    label: 'Send to back',
    mode: 'sendToBack',
  },
] as const

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
  const [theme, setTheme] = useState<'dark' | 'light'>('light')
  const [votingPanelOpen, setVotingPanelOpen] = useState(false)
  const [contextMenu, setContextMenu] =
    useState<CanvasContextCommandMenuState | null>(null)
  const [, setSelectionPointer] =
    useState<EngineSelectionPointerState | null>(null)
  const votingPanelVisible = votingPanelOpen ||
    app.votingSession.status !== 'idle'
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
            app={app}
            onClose={hideSelectionToolbar}
          />
        ) : null}
        {selectionToolbarVisible ? (
          <EngineStampPad
            app={app}
            onInsert={hideSelectionToolbar}
          />
        ) : null}
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

function EngineSelectionToolbar({
  app,
  onClose,
}: {
  app: CanvasEngineDemoModel
  onClose: () => void
}) {
  const [openStyleControl, setOpenStyleControl] =
    useState<EngineSelectionStyleControlId | null>(null)
  const {
    anchor,
    disabled,
    ids,
    items,
  } = app.selection
  const selectedItem = items.length === 1 ? items[0] : null
  const canEditText = selectedItem
    ? CanvasHost.isCanvasEditableTextItem(selectedItem)
    : false
  const canChangeShape = items.length > 0 &&
    items.every(CanvasHost.isCanvasShapeItem)
  const arrowItem = selectedItem?.type === 'arrow' ? selectedItem : null
  const sectionItems = items.filter(CanvasHost.isCanvasSectionComponentItem)
  const canUseSectionActions =
    sectionItems.length > 0 && sectionItems.length === items.length
  const canGroup =
    app.toolbar.commandAvailability.group && sectionItems.length === 0
  const canUngroup = app.toolbar.commandAvailability.ungroup
  const canSection = sectionItems.length === 0 && items.length > 0
  const canUnsection = canUseSectionActions
  const canDuplicate = app.toolbar.commandAvailability.duplicate
  const canDelete = app.toolbar.commandAvailability.delete
  const canAlign = ENGINE_SELECTION_ALIGN_CONTROLS.some(
    (control) => app.toolbar.commandAvailability[control.command],
  )
  const canDistribute = ENGINE_SELECTION_DISTRIBUTE_CONTROLS.some(
    (control) => app.toolbar.commandAvailability[control.command],
  )
  const canArrange =
    canAlign ||
    canDistribute ||
    app.selection.canTidy ||
    app.selection.canFlip ||
    app.selection.canSelectSame
  const canLayerOrder = ENGINE_SELECTION_LAYER_ORDER_CONTROLS.some(
    (control) =>
      app.toolbar.commandAvailability[control.command] &&
      app.selection.canReorder[control.mode],
  )
  const showRotationControls = items.length > 0

  if (
    !anchor ||
    ids.length === 0 ||
    app.textEditor.editing ||
    app.toolbar.tool !== 'select'
  ) {
    return null
  }

  const visibleStyleControl = app.inspector.styleControls.find(
    (control) => control.id === openStyleControl,
  )

  return (
    <div
      className="engine-selection-toolbar"
      role="toolbar"
      aria-label="Object actions"
      data-placement={anchor.placement}
      style={{
        '--engine-selection-x': `${anchor.x}px`,
        '--engine-selection-y': `${anchor.y}px`,
      } as CSSProperties}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {canEditText ? (
        <button
          aria-label="Edit text"
          disabled={disabled}
          onClick={app.selection.onEditText}
          type="button"
        >
          <Type aria-hidden="true" size={13} strokeWidth={2} />
        </button>
      ) : null}

      {canChangeShape ? (
        <>
          <EngineSelectionDivider />
          {ENGINE_SELECTION_SHAPE_TYPES.map(({ icon: Icon, label, type }) => (
            <button
              aria-label={label}
              aria-pressed={getEngineSelectionShapeType(items) === type}
              disabled={disabled}
              key={type}
              onClick={() => {
                app.selection.onReplaceSelectedItems((item) =>
                  replaceEngineSelectionShapeType(item, type),
                )
              }}
              type="button"
            >
              <Icon aria-hidden="true" size={13} strokeWidth={2} />
            </button>
          ))}
        </>
      ) : null}

      {arrowItem ? (
        <>
          <EngineSelectionDivider />
          {ENGINE_SELECTION_ARROW_ROUTINGS.map(({ icon: Icon, label, routing }) => (
            <button
              aria-label={label}
              aria-pressed={getEngineArrowRouting(arrowItem) === routing}
              disabled={disabled}
              key={routing}
              onClick={() => {
                app.selection.onReplaceSelectedItems((item) =>
                  item.type === 'arrow'
                    ? CanvasHost.setCanvasArrowRouting(item, routing)
                    : item,
                )
              }}
              type="button"
            >
              <Icon aria-hidden="true" size={13} strokeWidth={2} />
            </button>
          ))}
        </>
      ) : null}

      {app.inspector.styleControls.map((control) => (
        <div className="engine-selection-style-control" key={control.id}>
          <EngineSelectionDivider />
          <button
            aria-label={`${control.label} color`}
            aria-expanded={openStyleControl === control.id}
            className="engine-selection-style-button"
            disabled={disabled || control.disabled}
            onClick={() =>
              setOpenStyleControl((current) =>
                current === control.id ? null : control.id,
              )}
            type="button"
          >
            {control.id === 'fill' ? (
              <PaintBucket aria-hidden="true" size={12} strokeWidth={2} />
            ) : (
              <PencilLine aria-hidden="true" size={12} strokeWidth={2} />
            )}
            <span
              className="engine-selection-current-swatch"
              style={{
                backgroundColor: getEngineSelectionStyleColor(control),
              }}
            />
          </button>
        </div>
      ))}

      {showRotationControls ? <EngineSelectionDivider /> : null}
      {showRotationControls ? (
        <>
          <button
            aria-label="Rotate counterclockwise"
            disabled={!app.selection.canRotate}
            onClick={() => {
              app.selection.onRotateSelectedItems(-15)
            }}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={13} strokeWidth={2} />
          </button>
          <button
            aria-label="Reset rotation"
            disabled={!app.selection.canRotate || !app.selection.hasRotation}
            onClick={app.selection.onResetSelectedRotation}
            type="button"
          >
            <span aria-hidden="true">0</span>
          </button>
          <button
            aria-label="Rotate clockwise"
            disabled={!app.selection.canRotate}
            onClick={() => {
              app.selection.onRotateSelectedItems(15)
            }}
            type="button"
          >
            <RotateCw aria-hidden="true" size={13} strokeWidth={2} />
          </button>
        </>
      ) : null}

      {canArrange ? <EngineSelectionDivider /> : null}
      {canAlign
        ? ENGINE_SELECTION_ALIGN_CONTROLS.map(({ command, icon: Icon, label, mode }) => (
          <button
            aria-label={label}
            disabled={disabled || !app.toolbar.commandAvailability[command]}
            key={command}
            onClick={() => {
              app.toolbar.commandHandlers.onAlign(mode)
            }}
            type="button"
          >
            <Icon aria-hidden="true" size={13} strokeWidth={2} />
          </button>
        ))
        : null}
      {canDistribute
        ? ENGINE_SELECTION_DISTRIBUTE_CONTROLS.map(({
          command,
          icon: Icon,
          label,
          mode,
        }) => (
          <button
            aria-label={label}
            disabled={disabled || !app.toolbar.commandAvailability[command]}
            key={command}
            onClick={() => {
              app.toolbar.commandHandlers.onDistribute(mode)
            }}
            type="button"
          >
            <Icon aria-hidden="true" size={13} strokeWidth={2} />
          </button>
        ))
        : null}
      {app.selection.canTidy ? (
        <button
          aria-label="Tidy selection"
          disabled={disabled}
          onClick={app.selection.onTidySelectedItems}
          type="button"
        >
          <LayoutGrid aria-hidden="true" size={13} strokeWidth={2} />
        </button>
      ) : null}
      {app.selection.canFlip ? (
        <>
          <button
            aria-label="Flip horizontal"
            disabled={disabled}
            onClick={() => {
              app.selection.onFlipSelectedItems('horizontal')
            }}
            type="button"
          >
            <FlipHorizontal aria-hidden="true" size={13} strokeWidth={2} />
          </button>
          <button
            aria-label="Flip vertical"
            disabled={disabled}
            onClick={() => {
              app.selection.onFlipSelectedItems('vertical')
            }}
            type="button"
          >
            <FlipVertical aria-hidden="true" size={13} strokeWidth={2} />
          </button>
        </>
      ) : null}
      {app.selection.canSelectSame ? (
        <button
          aria-label="Select same type"
          disabled={disabled}
          onClick={app.selection.onSelectSameType}
          type="button"
        >
          <Boxes aria-hidden="true" size={13} strokeWidth={2} />
        </button>
      ) : null}

      {canLayerOrder ? <EngineSelectionDivider /> : null}
      {canLayerOrder
        ? ENGINE_SELECTION_LAYER_ORDER_CONTROLS.map(({
          command,
          icon: Icon,
          label,
          mode,
        }) => (
          <button
            aria-label={label}
            disabled={disabled ||
              !app.toolbar.commandAvailability[command] ||
              !app.selection.canReorder[mode]}
            key={command}
            onClick={() => {
              app.toolbar.commandHandlers.onReorder(mode)
            }}
            type="button"
          >
            <Icon aria-hidden="true" size={13} strokeWidth={2} />
          </button>
        ))
        : null}

      {canGroup || canUngroup || canSection || canUnsection ? (
        <EngineSelectionDivider />
      ) : null}
      {canGroup ? (
        <button
          aria-label="Group selection"
          disabled={disabled}
          onClick={() => {
            app.toolbar.commandHandlers.onGroup()
            onClose()
          }}
          type="button"
        >
          <Group aria-hidden="true" size={13} strokeWidth={2} />
        </button>
      ) : null}
      {canUngroup ? (
        <button
          aria-label="Ungroup selection"
          disabled={disabled}
          onClick={() => {
            app.toolbar.commandHandlers.onUngroup()
            onClose()
          }}
          type="button"
        >
          <Ungroup aria-hidden="true" size={13} strokeWidth={2} />
        </button>
      ) : null}
      {canSection ? (
        <button
          aria-label="Section selection"
          disabled={disabled}
          onClick={() => {
            app.selection.onSectionSelectedItems()
            onClose()
          }}
          type="button"
        >
          <Frame aria-hidden="true" size={13} strokeWidth={2} />
        </button>
      ) : null}
      {canUnsection ? (
        <button
          aria-label="Delete section frame"
          disabled={disabled}
          onClick={() => {
            app.selection.onUnsectionSelectedItems()
            onClose()
          }}
          type="button"
        >
          <PanelTopClose aria-hidden="true" size={13} strokeWidth={2} />
        </button>
      ) : null}
      {canUseSectionActions ? (
        <button
          aria-label={
            app.selection.sectionContentsHidden
              ? 'Show section contents'
              : 'Hide section contents'
          }
          onClick={() => {
            app.selection.onSetSelectedSectionsHidden(
              !app.selection.sectionContentsHidden,
            )
          }}
          type="button"
        >
          {app.selection.sectionContentsHidden ? (
            <Eye aria-hidden="true" size={13} strokeWidth={2} />
          ) : (
            <EyeOff aria-hidden="true" size={13} strokeWidth={2} />
          )}
        </button>
      ) : null}
      {canUseSectionActions ? (
        <button
          aria-label={
            app.selection.selectedSectionsLocked
              ? 'Unlock section'
              : 'Lock section'
          }
          onClick={() => {
            app.selection.onSetSelectedSectionsLocked(
              !app.selection.selectedSectionsLocked,
            )
          }}
          type="button"
        >
          {app.selection.selectedSectionsLocked ? (
            <Unlock aria-hidden="true" size={13} strokeWidth={2} />
          ) : (
            <Lock aria-hidden="true" size={13} strokeWidth={2} />
          )}
        </button>
      ) : null}

      <EngineSelectionDivider />
      <button
        aria-label="Duplicate selection"
        disabled={!canDuplicate}
        onClick={() => {
          app.toolbar.commandHandlers.onDuplicate()
        }}
        type="button"
      >
        <Copy aria-hidden="true" size={13} strokeWidth={2} />
      </button>
      <button
        aria-label="Delete selection"
        disabled={!canDelete}
        onClick={() => {
          app.toolbar.commandHandlers.onDelete()
          onClose()
        }}
        type="button"
      >
        <Trash2 aria-hidden="true" size={13} strokeWidth={2} />
      </button>
      <button
        aria-label="Fit selection"
        onClick={app.zoomControls.onFit}
        type="button"
      >
        <Maximize2 aria-hidden="true" size={13} strokeWidth={2} />
      </button>
      {visibleStyleControl ? (
        <div
          className="engine-selection-color-popover"
          role="menu"
          aria-label={`${visibleStyleControl.label} colors`}
        >
          {visibleStyleControl.swatches.map((swatch) => (
            <button
              aria-label={`${visibleStyleControl.label} ${swatch.color}`}
              aria-pressed={swatch.selected}
              className="engine-selection-swatch"
              disabled={disabled || visibleStyleControl.disabled}
              key={swatch.color}
              onClick={() => {
                visibleStyleControl.onSelect(swatch.color)
                setOpenStyleControl(null)
              }}
              style={{ backgroundColor: swatch.color }}
              title={swatch.color}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
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

function EngineSelectionDivider() {
  return <span className="engine-selection-divider" aria-hidden="true" />
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

function isEngineShapeToolbarItem(
  item: CanvasItem,
): item is CanvasShapeLikeItem {
  return CanvasHost.isCanvasShapeItem(item)
}

function getEngineSelectionShapeType(
  items: readonly CanvasItem[],
): CanvasShapeType | null {
  const shapeTypes = items
    .filter(isEngineShapeToolbarItem)
    .map(getEngineShapeType)
  const [first] = shapeTypes

  return first && shapeTypes.every((type) => type === first) ? first : null
}

function getEngineShapeType(item: CanvasShapeLikeItem): CanvasShapeType {
  return CanvasHost.getCanvasShapeKind(item)
}

function replaceEngineSelectionShapeType(
  item: CanvasItem,
  shapeType: CanvasShapeType,
): CanvasItem {
  if (CanvasHost.isCanvasShapeItem(item)) {
    return CanvasHost.setCanvasShapeKind(item, shapeType)
  }

  return item
}

function getEngineArrowRouting(
  item: Extract<CanvasItem, { type: 'arrow' }>,
) {
  return CanvasHost.normalizeCanvasArrowRouting(item.routing)
}

function getEngineSelectionStyleColor(
  control: CanvasEngineDemoModel['inspector']['styleControls'][number],
) {
  return (
    control.swatches.find((swatch) => swatch.selected) ??
    control.swatches[0]
  )?.color ?? 'transparent'
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
