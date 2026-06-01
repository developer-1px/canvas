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
  Download,
  EyeOff,
  FlipHorizontal,
  FlipVertical,
  Frame,
  Group,
  LayoutGrid,
  Lock,
  Maximize2,
  Minus,
  MoreHorizontal,
  MoveDown,
  MoveUp,
  PanelTopClose,
  PaintBucket,
  PencilLine,
  Play,
  RotateCcw,
  RotateCw,
  SendToBack,
  Square,
  Trash2,
  Type,
  Ungroup,
  type LucideIcon,
} from 'lucide-react'
import {
  useState,
  type CSSProperties,
} from 'react'
import {
  CanvasHost,
  type CanvasAppProps,
  type CanvasItem,
  type CanvasShapeLikeItem,
  type CanvasShapeType,
} from '../canvas'

type CanvasEngineDemoModel =
  Parameters<NonNullable<CanvasAppProps['renderApp']>>[0]

type EngineSelectionToolbarContext = {
  activeWidgetId: string | null
  app: CanvasEngineDemoModel
  arrowItem: Extract<CanvasItem, { type: 'arrow' }> | null
  canArrange: boolean
  canChangeShape: boolean
  canGroup: boolean
  canLayerOrder: boolean
  canSection: boolean
  canUngroup: boolean
  canUnsection: boolean
  canUseSectionActions: boolean
  disabled: boolean
  hasWidgetInteraction: (item: CanvasItem | null) => boolean
  items: readonly CanvasItem[]
  onClose: () => void
  onToggleWidgetPlay: () => void
  selectedItem: CanvasItem | null
}

type EngineSelectionToolbarActionDescriptor = {
  closeToolbar?: boolean
  disabled?: (context: EngineSelectionToolbarContext) => boolean
  icon?: LucideIcon
  id: string
  label: string | ((context: EngineSelectionToolbarContext) => string)
  onSelect: (context: EngineSelectionToolbarContext) => void
  pressed?: (context: EngineSelectionToolbarContext) => boolean
  swatchColor?: string | ((context: EngineSelectionToolbarContext) => string)
  text?: string
  title?: string
  tone?: 'danger'
  visible?: (context: EngineSelectionToolbarContext) => boolean
}

type EngineSelectionToolbarButtonDescriptor =
  EngineSelectionToolbarActionDescriptor & {
    kind: 'button'
  }

type EngineSelectionToolbarMenuDescriptor =
  Omit<EngineSelectionToolbarActionDescriptor, 'closeToolbar' | 'onSelect'> & {
    groups: (
      context: EngineSelectionToolbarContext,
    ) => readonly EngineSelectionToolbarMenuGroup[]
    kind: 'menu'
  }

type EngineSelectionToolbarDescriptor =
  | EngineSelectionToolbarButtonDescriptor
  | EngineSelectionToolbarMenuDescriptor

type EngineSelectionToolbarMenuGroup = {
  id: string
  items: readonly EngineSelectionToolbarActionDescriptor[]
  layout?: 'row' | 'swatches'
}

type EngineSelectionToolbarActionStateTarget = Pick<
  EngineSelectionToolbarActionDescriptor,
  'disabled' | 'id' | 'label' | 'pressed' | 'swatchColor' | 'visible'
>

const ENGINE_SELECTION_SHAPE_TYPES = [
  { icon: Square, label: 'Rect shape', type: 'rect' },
  { icon: Circle, label: 'Ellipse shape', type: 'ellipse' },
  { icon: Diamond, label: 'Diamond shape', type: 'diamond' },
] as const satisfies readonly {
  icon: LucideIcon
  label: string
  type: CanvasShapeType
}[]

const ENGINE_SELECTION_ARROW_ROUTINGS = [
  { icon: CornerDownRight, label: 'Elbow connector', routing: 'elbow' },
  { icon: ArrowUpRight, label: 'Straight connector', routing: 'straight' },
] as const satisfies readonly {
  icon: LucideIcon
  label: string
  routing: Extract<CanvasItem, { type: 'arrow' }>['routing']
}[]

const ENGINE_SELECTION_ALIGN_CONTROLS = [
  {
    command: 'alignLeft',
    icon: AlignHorizontalJustifyStart,
    label: 'Align left',
    mode: 'alignLeft',
  },
  {
    command: 'alignCenter',
    icon: AlignHorizontalJustifyCenter,
    label: 'Align center',
    mode: 'alignCenter',
  },
  {
    command: 'alignRight',
    icon: AlignHorizontalJustifyEnd,
    label: 'Align right',
    mode: 'alignRight',
  },
  {
    command: 'alignTop',
    icon: AlignVerticalJustifyStart,
    label: 'Align top',
    mode: 'alignTop',
  },
  {
    command: 'alignMiddle',
    icon: AlignVerticalJustifyCenter,
    label: 'Align middle',
    mode: 'alignMiddle',
  },
  {
    command: 'alignBottom',
    icon: AlignVerticalJustifyEnd,
    label: 'Align bottom',
    mode: 'alignBottom',
  },
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

const ENGINE_SELECTION_TOOLBAR_DESCRIPTORS = [
  {
    disabled: (context) => context.disabled,
    icon: Type,
    id: 'edit-text',
    kind: 'button',
    label: 'Edit text',
    onSelect: (context) => context.app.selection.onEditText(),
    visible: (context) =>
      context.selectedItem
        ? CanvasHost.isCanvasEditableTextItem(context.selectedItem)
        : false,
  },
  {
    disabled: (context) => context.disabled,
    groups: getEngineSelectionShapeMenuGroups,
    icon: Square,
    id: 'shape',
    kind: 'menu',
    label: 'Shape',
    visible: (context) => context.canChangeShape,
  },
  {
    disabled: (context) => context.disabled,
    groups: getEngineSelectionArrowMenuGroups,
    icon: ArrowUpRight,
    id: 'arrow',
    kind: 'menu',
    label: 'Arrow',
    visible: (context) => context.arrowItem !== null,
  },
  {
    icon: Play,
    id: 'widget-play',
    kind: 'button',
    label: (context) =>
      context.activeWidgetId === context.selectedItem?.id
        ? 'Stop widget'
        : 'Play widget',
    onSelect: (context) => context.onToggleWidgetPlay(),
    pressed: (context) =>
      context.activeWidgetId !== null &&
      context.activeWidgetId === context.selectedItem?.id,
    visible: (context) => context.hasWidgetInteraction(context.selectedItem),
  },
  {
    disabled: (context) => !context.app.selection.canRotate,
    groups: getEngineSelectionRotationMenuGroups,
    icon: RotateCw,
    id: 'rotate',
    kind: 'menu',
    label: 'Rotate',
    visible: (context) => context.items.length > 0,
  },
  {
    groups: getEngineSelectionArrangeMenuGroups,
    icon: LayoutGrid,
    id: 'arrange',
    kind: 'menu',
    label: 'Arrange',
    visible: (context) => context.canArrange,
  },
  {
    groups: getEngineSelectionLayerMenuGroups,
    icon: BringToFront,
    id: 'layer',
    kind: 'menu',
    label: 'Layer order',
    visible: (context) => context.canLayerOrder,
  },
  {
    groups: getEngineSelectionStructureMenuGroups,
    icon: Group,
    id: 'structure',
    kind: 'menu',
    label: 'Structure',
    visible: (context) =>
      context.canGroup ||
      context.canUngroup ||
      context.canSection ||
      context.canUnsection ||
      context.canUseSectionActions,
  },
  {
    disabled: (context) => !context.app.toolbar.commandAvailability.duplicate,
    icon: Copy,
    id: 'duplicate',
    kind: 'button',
    label: 'Duplicate selection',
    onSelect: (context) => context.app.toolbar.commandHandlers.onDuplicate(),
  },
  {
    closeToolbar: true,
    disabled: (context) => !context.app.toolbar.commandAvailability.delete,
    icon: Trash2,
    id: 'delete',
    kind: 'button',
    label: 'Delete selection',
    onSelect: (context) => context.app.toolbar.commandHandlers.onDelete(),
    tone: 'danger',
  },
  {
    groups: getEngineSelectionMoreMenuGroups,
    icon: MoreHorizontal,
    id: 'more',
    kind: 'menu',
    label: 'More actions',
  },
] as const satisfies readonly EngineSelectionToolbarDescriptor[]

export function EngineSelectionToolbar({
  activeWidgetId,
  app,
  hasWidgetInteraction,
  onClose,
  onToggleWidgetPlay,
}: {
  activeWidgetId: string | null
  app: CanvasEngineDemoModel
  hasWidgetInteraction: (item: CanvasItem | null) => boolean
  onClose: () => void
  onToggleWidgetPlay: () => void
}) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const {
    anchor,
    ids,
  } = app.selection

  if (
    !anchor ||
    ids.length === 0 ||
    app.textEditor.editing ||
    app.toolbar.tool !== 'select'
  ) {
    return null
  }

  const context = getEngineSelectionToolbarContext({
    activeWidgetId,
    app,
    hasWidgetInteraction,
    onClose,
    onToggleWidgetPlay,
  })
  const descriptors = getEngineSelectionToolbarDescriptors(context)

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
      {descriptors.map((descriptor) => (
        <EngineSelectionToolbarSlot
          context={context}
          descriptor={descriptor}
          key={descriptor.id}
          open={openMenu === descriptor.id}
          onOpenChange={setOpenMenu}
        />
      ))}
    </div>
  )
}

function getEngineSelectionToolbarContext({
  activeWidgetId,
  app,
  hasWidgetInteraction,
  onClose,
  onToggleWidgetPlay,
}: {
  activeWidgetId: string | null
  app: CanvasEngineDemoModel
  hasWidgetInteraction: (item: CanvasItem | null) => boolean
  onClose: () => void
  onToggleWidgetPlay: () => void
}): EngineSelectionToolbarContext {
  const {
    disabled,
    items,
  } = app.selection
  const selectedItem = items.length === 1 ? items[0] : null
  const arrowItem = selectedItem?.type === 'arrow' ? selectedItem : null
  const sectionItems = items.filter(CanvasHost.isCanvasSectionComponentItem)
  const canUseSectionActions =
    sectionItems.length > 0 && sectionItems.length === items.length
  const canAlign = ENGINE_SELECTION_ALIGN_CONTROLS.some(
    (control) => app.toolbar.commandAvailability[control.command],
  )
  const canDistribute = ENGINE_SELECTION_DISTRIBUTE_CONTROLS.some(
    (control) => app.toolbar.commandAvailability[control.command],
  )
  const canLayerOrder = ENGINE_SELECTION_LAYER_ORDER_CONTROLS.some(
    (control) =>
      app.toolbar.commandAvailability[control.command] &&
      app.selection.canReorder[control.mode],
  )

  return {
    activeWidgetId,
    app,
    arrowItem,
    canArrange:
      canAlign ||
      canDistribute ||
      app.selection.canTidy ||
      app.selection.canFlip,
    canChangeShape:
      items.length > 0 && items.every(CanvasHost.isCanvasShapeItem),
    canGroup:
      app.toolbar.commandAvailability.group && sectionItems.length === 0,
    canLayerOrder,
    canSection: sectionItems.length === 0 && items.length > 0,
    canUngroup: app.toolbar.commandAvailability.ungroup,
    canUnsection: canUseSectionActions,
    canUseSectionActions,
    disabled,
    hasWidgetInteraction,
    items,
    onClose,
    onToggleWidgetPlay,
    selectedItem,
  }
}

function getEngineSelectionToolbarDescriptors(
  context: EngineSelectionToolbarContext,
): readonly EngineSelectionToolbarDescriptor[] {
  return [
    ...ENGINE_SELECTION_TOOLBAR_DESCRIPTORS.slice(0, 3),
    ...getEngineSelectionStyleToolbarDescriptors(context),
    ...ENGINE_SELECTION_TOOLBAR_DESCRIPTORS.slice(3),
  ].filter((descriptor) => isEngineSelectionToolbarVisible(
    descriptor,
    context,
  ))
}

function getEngineSelectionStyleToolbarDescriptors(
  context: EngineSelectionToolbarContext,
): EngineSelectionToolbarMenuDescriptor[] {
  return context.app.inspector.styleControls.map((control) => ({
    disabled: (nextContext) => nextContext.disabled || control.disabled,
    groups: () => [{
      id: `${control.id}-swatches`,
      items: control.swatches.map((swatch) => ({
        disabled: (nextContext) => nextContext.disabled || control.disabled,
        id: swatch.color,
        label: `${control.label} ${swatch.color}`,
        onSelect: () => control.onSelect(swatch.color),
        pressed: () => swatch.selected,
        swatchColor: swatch.color,
        title: swatch.color,
      })),
      layout: 'swatches',
    }],
    icon: control.id === 'fill' ? PaintBucket : PencilLine,
    id: `style-${control.id}`,
    kind: 'menu',
    label: `${control.label} color`,
    swatchColor: () => getEngineSelectionStyleColor(control),
  }))
}

function EngineSelectionToolbarSlot({
  context,
  descriptor,
  onOpenChange,
  open,
}: {
  context: EngineSelectionToolbarContext
  descriptor: EngineSelectionToolbarDescriptor
  onOpenChange: (id: string | null) => void
  open: boolean
}) {
  if (descriptor.kind === 'button') {
    return (
      <div className="engine-selection-toolbar-item">
        <EngineSelectionToolbarButton
          context={context}
          descriptor={descriptor}
          onClick={() => {
            onOpenChange(null)
            runEngineSelectionToolbarAction(descriptor, context)
          }}
        />
      </div>
    )
  }

  const menuGroups = getVisibleEngineSelectionMenuGroups(descriptor, context)
  const disabled =
    isEngineSelectionToolbarDisabled(descriptor, context) ||
    menuGroups.length === 0

  return (
    <div className="engine-selection-toolbar-item">
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={getEngineSelectionToolbarLabel(descriptor, context)}
        className="engine-selection-trigger"
        data-has-swatch={hasEngineSelectionSwatch(descriptor, context)}
        data-open={open}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            onOpenChange(open ? null : descriptor.id)
          }
        }}
        title={descriptor.title ?? getEngineSelectionToolbarLabel(
          descriptor,
          context,
        )}
        type="button"
      >
        <EngineSelectionToolbarGlyph
          context={context}
          descriptor={descriptor}
        />
      </button>
      {open && !disabled ? (
        <EngineSelectionMenu
          context={context}
          groups={menuGroups}
          label={getEngineSelectionToolbarLabel(descriptor, context)}
          onClose={() => onOpenChange(null)}
        />
      ) : null}
    </div>
  )
}

function EngineSelectionToolbarButton({
  context,
  descriptor,
  onClick,
}: {
  context: EngineSelectionToolbarContext
  descriptor: EngineSelectionToolbarButtonDescriptor
  onClick: () => void
}) {
  return (
    <button
      aria-label={getEngineSelectionToolbarLabel(descriptor, context)}
      aria-pressed={getEngineSelectionToolbarPressed(descriptor, context)}
      className="engine-selection-trigger"
      data-has-swatch={hasEngineSelectionSwatch(descriptor, context)}
      data-tone={descriptor.tone}
      disabled={isEngineSelectionToolbarDisabled(descriptor, context)}
      onClick={onClick}
      title={descriptor.title ?? getEngineSelectionToolbarLabel(
        descriptor,
        context,
      )}
      type="button"
    >
      <EngineSelectionToolbarGlyph
        context={context}
        descriptor={descriptor}
      />
    </button>
  )
}

function EngineSelectionMenu({
  context,
  groups,
  label,
  onClose,
}: {
  context: EngineSelectionToolbarContext
  groups: readonly EngineSelectionToolbarMenuGroup[]
  label: string
  onClose: () => void
}) {
  return (
    <div className="engine-selection-menu" role="group" aria-label={label}>
      {groups.map((group) => (
        <div
          className="engine-selection-menu-group"
          data-layout={group.layout ?? 'row'}
          key={group.id}
        >
          {group.items.map((item) => (
            <button
              aria-label={getEngineSelectionToolbarLabel(item, context)}
              aria-pressed={getEngineSelectionToolbarPressed(item, context)}
              data-has-swatch={hasEngineSelectionSwatch(item, context)}
              data-tone={item.tone}
              disabled={isEngineSelectionToolbarDisabled(item, context)}
              key={item.id}
              onClick={() => {
                runEngineSelectionToolbarAction(item, context)
                onClose()
              }}
              title={item.title ?? getEngineSelectionToolbarLabel(
                item,
                context,
              )}
              type="button"
            >
              <EngineSelectionToolbarGlyph
                context={context}
                descriptor={item}
              />
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

function EngineSelectionToolbarGlyph({
  context,
  descriptor,
}: {
  context: EngineSelectionToolbarContext
  descriptor: Pick<
    EngineSelectionToolbarActionDescriptor,
    'icon' | 'id' | 'swatchColor' | 'text'
  >
}) {
  const Icon = descriptor.icon
  const swatchColor = getEngineSelectionToolbarSwatchColor(
    descriptor,
    context,
  )

  return (
    <>
      {Icon ? <Icon aria-hidden="true" size={13} strokeWidth={2} /> : null}
      {descriptor.text ? (
        <span className="engine-selection-toolbar-text" aria-hidden="true">
          {descriptor.text}
        </span>
      ) : null}
      {swatchColor ? (
        <span
          className="engine-selection-swatch-mark"
          aria-hidden="true"
          style={{ backgroundColor: swatchColor }}
        />
      ) : null}
    </>
  )
}

function getEngineSelectionShapeMenuGroups(): EngineSelectionToolbarMenuGroup[] {
  return [{
    id: 'shape',
    items: ENGINE_SELECTION_SHAPE_TYPES.map(({ icon, label, type }) => ({
      disabled: (nextContext) => nextContext.disabled,
      icon,
      id: type,
      label,
      onSelect: (nextContext) => {
        nextContext.app.selection.onReplaceSelectedItems((item) =>
          replaceEngineSelectionShapeType(item, type),
        )
      },
      pressed: (nextContext) =>
        getEngineSelectionShapeType(nextContext.items) === type,
    })),
  }]
}

function getEngineSelectionArrowMenuGroups(): EngineSelectionToolbarMenuGroup[] {
  return [
    {
      id: 'routing',
      items: ENGINE_SELECTION_ARROW_ROUTINGS.map(({ icon, label, routing }) => ({
        disabled: (context) => context.disabled,
        icon,
        id: routing,
        label,
        onSelect: (context) => {
          context.app.selection.onReplaceSelectedItems((item) =>
            item.type === 'arrow'
              ? CanvasHost.setCanvasArrowRouting(item, routing)
              : item,
          )
        },
        pressed: (context) =>
          context.arrowItem
            ? getEngineArrowRouting(context.arrowItem) === routing
            : false,
      })),
    },
    {
      id: 'head',
      items: [
        {
          disabled: (context) => context.disabled,
          icon: ArrowUpRight,
          id: 'arrowhead',
          label: 'Arrow head',
          onSelect: (context) => {
            context.app.selection.onReplaceSelectedItems((item) =>
              item.type === 'arrow' ? setEngineArrowhead(item, 'end') : item,
            )
          },
          pressed: (context) => context.arrowItem?.arrowhead !== 'none',
        },
        {
          disabled: (context) => context.disabled,
          icon: Minus,
          id: 'line',
          label: 'Line (no arrow head)',
          onSelect: (context) => {
            context.app.selection.onReplaceSelectedItems((item) =>
              item.type === 'arrow' ? setEngineArrowhead(item, 'none') : item,
            )
          },
          pressed: (context) => context.arrowItem?.arrowhead === 'none',
        },
      ],
    },
  ]
}

function getEngineSelectionRotationMenuGroups(): EngineSelectionToolbarMenuGroup[] {
  return [{
    id: 'rotate',
    items: [
      {
        disabled: (context) => !context.app.selection.canRotate,
        icon: RotateCcw,
        id: 'rotate-counterclockwise',
        label: 'Rotate counterclockwise',
        onSelect: (context) => context.app.selection.onRotateSelectedItems(-15),
      },
      {
        disabled: (context) =>
          !context.app.selection.canRotate || !context.app.selection.hasRotation,
        id: 'reset-rotation',
        label: 'Reset rotation',
        onSelect: (context) => context.app.selection.onResetSelectedRotation(),
        text: '0',
      },
      {
        disabled: (context) => !context.app.selection.canRotate,
        icon: RotateCw,
        id: 'rotate-clockwise',
        label: 'Rotate clockwise',
        onSelect: (context) => context.app.selection.onRotateSelectedItems(15),
      },
    ],
  }]
}

function getEngineSelectionArrangeMenuGroups(): EngineSelectionToolbarMenuGroup[] {
  return [
    {
      id: 'align',
      items: ENGINE_SELECTION_ALIGN_CONTROLS.map(({
        command,
        icon,
        label,
        mode,
      }) => ({
        disabled: (context) =>
          context.disabled || !context.app.toolbar.commandAvailability[command],
        icon,
        id: command,
        label,
        onSelect: (context) => context.app.toolbar.commandHandlers.onAlign(mode),
      })),
    },
    {
      id: 'distribute',
      items: ENGINE_SELECTION_DISTRIBUTE_CONTROLS.map(({
        command,
        icon,
        label,
        mode,
      }) => ({
        disabled: (context) =>
          context.disabled || !context.app.toolbar.commandAvailability[command],
        icon,
        id: command,
        label,
        onSelect: (context) =>
          context.app.toolbar.commandHandlers.onDistribute(mode),
      })),
    },
    {
      id: 'tidy-flip',
      items: [
        {
          disabled: (context) => context.disabled,
          icon: LayoutGrid,
          id: 'tidy',
          label: 'Tidy selection',
          onSelect: (context) => context.app.selection.onTidySelectedItems(),
          visible: (context) => context.app.selection.canTidy,
        },
        {
          disabled: (context) => context.disabled,
          icon: FlipHorizontal,
          id: 'flip-horizontal',
          label: 'Flip horizontal',
          onSelect: (context) =>
            context.app.selection.onFlipSelectedItems('horizontal'),
          visible: (context) => context.app.selection.canFlip,
        },
        {
          disabled: (context) => context.disabled,
          icon: FlipVertical,
          id: 'flip-vertical',
          label: 'Flip vertical',
          onSelect: (context) =>
            context.app.selection.onFlipSelectedItems('vertical'),
          visible: (context) => context.app.selection.canFlip,
        },
      ],
    },
  ]
}

function getEngineSelectionLayerMenuGroups(): EngineSelectionToolbarMenuGroup[] {
  return [{
    id: 'layer',
    items: ENGINE_SELECTION_LAYER_ORDER_CONTROLS.map(({
      command,
      icon,
      label,
      mode,
    }) => ({
      disabled: (context) =>
        context.disabled ||
        !context.app.toolbar.commandAvailability[command] ||
        !context.app.selection.canReorder[mode],
      icon,
      id: command,
      label,
      onSelect: (context) => context.app.toolbar.commandHandlers.onReorder(mode),
    })),
  }]
}

function getEngineSelectionStructureMenuGroups(): EngineSelectionToolbarMenuGroup[] {
  return [
    {
      id: 'groups',
      items: [
        {
          closeToolbar: true,
          disabled: (context) => context.disabled,
          icon: Group,
          id: 'group',
          label: 'Group selection',
          onSelect: (context) => context.app.toolbar.commandHandlers.onGroup(),
          visible: (context) => context.canGroup,
        },
        {
          closeToolbar: true,
          disabled: (context) => context.disabled,
          icon: Ungroup,
          id: 'ungroup',
          label: 'Ungroup selection',
          onSelect: (context) => context.app.toolbar.commandHandlers.onUngroup(),
          visible: (context) => context.canUngroup,
        },
      ],
    },
    {
      id: 'sections',
      items: [
        {
          closeToolbar: true,
          disabled: (context) => context.disabled,
          icon: Frame,
          id: 'section',
          label: 'Section selection',
          onSelect: (context) =>
            context.app.selection.onSectionSelectedItems(),
          visible: (context) => context.canSection,
        },
        {
          closeToolbar: true,
          disabled: (context) => context.disabled,
          icon: PanelTopClose,
          id: 'unsection',
          label: 'Delete section frame',
          onSelect: (context) =>
            context.app.selection.onUnsectionSelectedItems(),
          visible: (context) => context.canUnsection,
        },
        {
          icon: EyeOff,
          id: 'toggle-section-contents',
          label: (context) =>
            context.app.selection.sectionContentsHidden
              ? 'Show section contents'
              : 'Hide section contents',
          onSelect: (context) => {
            context.app.selection.onSetSelectedSectionsHidden(
              !context.app.selection.sectionContentsHidden,
            )
          },
          pressed: (context) => context.app.selection.sectionContentsHidden,
          visible: (context) => context.canUseSectionActions,
        },
        {
          icon: Lock,
          id: 'toggle-section-lock',
          label: (context) =>
            context.app.selection.selectedSectionsLocked
              ? 'Unlock section'
              : 'Lock section',
          onSelect: (context) => {
            context.app.selection.onSetSelectedSectionsLocked(
              !context.app.selection.selectedSectionsLocked,
            )
          },
          pressed: (context) => context.app.selection.selectedSectionsLocked,
          visible: (context) => context.canUseSectionActions,
        },
      ],
    },
  ]
}

function getEngineSelectionMoreMenuGroups(): EngineSelectionToolbarMenuGroup[] {
  return [{
    id: 'more',
    items: [
      {
        disabled: (context) => context.disabled,
        icon: Boxes,
        id: 'select-same',
        label: 'Select same type',
        onSelect: (context) => context.app.selection.onSelectSameType(),
        visible: (context) => context.app.selection.canSelectSame,
      },
      {
        icon: Download,
        id: 'download',
        label: 'Export selection as image',
        onSelect: (context) => context.app.imageControls.onDownloadImage(),
      },
      {
        icon: Maximize2,
        id: 'fit-selection',
        label: 'Fit selection',
        onSelect: (context) => context.app.zoomControls.onFit(),
      },
    ],
  }]
}

function getVisibleEngineSelectionMenuGroups(
  descriptor: EngineSelectionToolbarMenuDescriptor,
  context: EngineSelectionToolbarContext,
): EngineSelectionToolbarMenuGroup[] {
  return descriptor.groups(context)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        isEngineSelectionToolbarVisible(item, context),
      ),
    }))
    .filter((group) => group.items.length > 0)
}

function runEngineSelectionToolbarAction(
  descriptor: EngineSelectionToolbarActionDescriptor,
  context: EngineSelectionToolbarContext,
) {
  if (isEngineSelectionToolbarDisabled(descriptor, context)) {
    return
  }

  descriptor.onSelect(context)

  if (descriptor.closeToolbar) {
    context.onClose()
  }
}

function isEngineSelectionToolbarVisible(
  descriptor: Pick<EngineSelectionToolbarActionStateTarget, 'id' | 'visible'>,
  context: EngineSelectionToolbarContext,
) {
  return descriptor.visible ? descriptor.visible(context) : true
}

function getEngineSelectionToolbarLabel(
  descriptor: Pick<EngineSelectionToolbarActionStateTarget, 'id' | 'label'>,
  context: EngineSelectionToolbarContext,
) {
  return typeof descriptor.label === 'function'
    ? descriptor.label(context)
    : descriptor.label
}

function isEngineSelectionToolbarDisabled(
  descriptor: Pick<EngineSelectionToolbarActionStateTarget, 'disabled' | 'id'>,
  context: EngineSelectionToolbarContext,
) {
  return descriptor.disabled ? descriptor.disabled(context) : false
}

function getEngineSelectionToolbarPressed(
  descriptor: Pick<EngineSelectionToolbarActionStateTarget, 'id' | 'pressed'>,
  context: EngineSelectionToolbarContext,
) {
  return descriptor.pressed ? descriptor.pressed(context) : undefined
}

function hasEngineSelectionSwatch(
  descriptor: Pick<EngineSelectionToolbarActionStateTarget, 'id' | 'swatchColor'>,
  context: EngineSelectionToolbarContext,
) {
  return getEngineSelectionToolbarSwatchColor(descriptor, context) !== null
}

function getEngineSelectionToolbarSwatchColor(
  descriptor: Pick<EngineSelectionToolbarActionStateTarget, 'id' | 'swatchColor'>,
  context: EngineSelectionToolbarContext,
) {
  if (!descriptor.swatchColor) {
    return null
  }

  return typeof descriptor.swatchColor === 'function'
    ? descriptor.swatchColor(context)
    : descriptor.swatchColor
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

function setEngineArrowhead(
  item: Extract<CanvasItem, { type: 'arrow' }>,
  arrowhead: 'end' | 'none',
): CanvasItem {
  if (arrowhead === 'none') {
    return { ...item, arrowhead: 'none' }
  }

  const next = { ...item }
  delete next.arrowhead
  return next
}

function getEngineSelectionStyleColor(
  control: CanvasEngineDemoModel['inspector']['styleControls'][number],
) {
  return (
    control.swatches.find((swatch) => swatch.selected) ??
    control.swatches[0]
  )?.color ?? 'transparent'
}
