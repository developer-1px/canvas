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
  useId,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import type {
  CanvasAffordanceConfig,
  CanvasCommandAvailability,
} from '../../../engine'
import type {
  CanvasItem,
  CanvasShapeLikeItem,
  CanvasShapeType,
  Point,
  Tool,
} from '../../../entities'
import {
  getCanvasShapeKind,
  isCanvasSectionComponentItem,
  isCanvasShapeItem,
  normalizeCanvasArrowRouting,
  setCanvasArrowRouting,
  setCanvasShapeKind,
} from '../../../host'
import { CANVAS_APP_TEXT_TARGET } from '../../affordances/editing/text-editor/CanvasAppTextTarget'
import type {
  CanvasObjectStyleControl,
  CanvasObjectStyleSwatchControl,
} from '../../affordances/editing/inspector/CanvasObjectStyleInspector'
import type { CanvasAppSelectionModel } from '../../workflow/CanvasAppSelectionModel'
import { CanvasCommandSurface } from '../toolbar/CanvasCommandSurface'
import {
  CANVAS_MENU_ITEM_PROPS,
  CANVAS_TOOLBAR_ITEM_PROPS,
  useCanvasMenuRovingFocus,
  useCanvasToolbarRovingFocus,
} from '../toolbar'
import {
  getCanvasCommandSurfaceGroups,
  type CanvasToolbarCustomCommand,
} from '../toolbar/CanvasToolbarItems'
import type {
  CanvasToolbarItemRenderContext,
} from '../toolbar/CanvasToolbarItemRenderer'

export type CanvasSelectionCommandAnchor = Point & {
  placement: 'above' | 'below'
}

type CanvasSelectionFloatingBarInspector = {
  styleControls: readonly CanvasObjectStyleControl[]
}

type CanvasSelectionFloatingBarImageControls = {
  onDownloadImage: () => void
}

type CanvasSelectionFloatingBarZoomControls = {
  onFit: () => void
}

type CanvasSelectionFloatingBarTextEditor = {
  editing: unknown
}

type CanvasSelectionFloatingBarProps = {
  anchor: CanvasSelectionCommandAnchor | null
  commandAvailability: CanvasCommandAvailability
  config: CanvasAffordanceConfig
  customCommands: readonly CanvasToolbarCustomCommand[]
  commandHandlers: CanvasToolbarItemRenderContext['commandHandlers']
  imageControls?: CanvasSelectionFloatingBarImageControls
  inspector?: CanvasSelectionFloatingBarInspector
  onClose?: () => void
  onCustomCommand: CanvasToolbarItemRenderContext['onCustomCommand']
  selection?: CanvasAppSelectionModel
  textEditor?: CanvasSelectionFloatingBarTextEditor
  tool?: Tool
  visible: boolean
  zoomControls?: CanvasSelectionFloatingBarZoomControls
}

type SelectionToolbarContext = {
  arrowItem: Extract<CanvasItem, { type: 'arrow' }> | null
  canArrange: boolean
  canChangeShape: boolean
  canGroup: boolean
  canLayerOrder: boolean
  canSection: boolean
  canUngroup: boolean
  canUnsection: boolean
  canUseSectionActions: boolean
  commandAvailability: CanvasCommandAvailability
  commandHandlers: CanvasToolbarItemRenderContext['commandHandlers']
  disabled: boolean
  imageControls: CanvasSelectionFloatingBarImageControls
  inspector: CanvasSelectionFloatingBarInspector
  items: readonly CanvasItem[]
  onClose: () => void
  selectedItem: CanvasItem | null
  selection: CanvasAppSelectionModel
  zoomControls: CanvasSelectionFloatingBarZoomControls
}

type SelectionToolbarActionDescriptor = {
  closeToolbar?: boolean
  disabled?: (context: SelectionToolbarContext) => boolean
  icon?: LucideIcon
  id: string
  label: string | ((context: SelectionToolbarContext) => string)
  onSelect: (context: SelectionToolbarContext) => void
  pressed?: (context: SelectionToolbarContext) => boolean
  swatchColor?: string | ((context: SelectionToolbarContext) => string)
  text?: string
  title?: string
  tone?: 'danger'
  visible?: (context: SelectionToolbarContext) => boolean
}

type SelectionToolbarButtonDescriptor = SelectionToolbarActionDescriptor & {
  kind: 'button'
}

type SelectionToolbarMenuDescriptor =
  Omit<SelectionToolbarActionDescriptor, 'closeToolbar' | 'onSelect'> & {
    groups: (
      context: SelectionToolbarContext,
    ) => readonly SelectionToolbarMenuGroup[]
    kind: 'menu'
  }

type SelectionToolbarDescriptor =
  | SelectionToolbarButtonDescriptor
  | SelectionToolbarMenuDescriptor

type SelectionToolbarMenuGroup = {
  id: string
  items: readonly SelectionToolbarActionDescriptor[]
  layout?: 'row' | 'swatches'
}

type SelectionToolbarActionStateTarget = Pick<
  SelectionToolbarActionDescriptor,
  'disabled' | 'id' | 'label' | 'pressed' | 'swatchColor' | 'visible'
>

const SELECTION_TOOLBAR_STAMPS = [
  { label: '+1', stamp: 'thumbs-up', title: 'Stamp +1' },
  { label: '!', stamp: 'attention', title: 'Stamp !' },
  { label: '?', stamp: 'question', title: 'Stamp ?' },
] as const

const SELECTION_TOOLBAR_SHAPE_TYPES = [
  { icon: Square, label: 'Rect shape', type: 'rect' },
  { icon: Circle, label: 'Ellipse shape', type: 'ellipse' },
  { icon: Diamond, label: 'Diamond shape', type: 'diamond' },
] as const satisfies readonly {
  icon: LucideIcon
  label: string
  type: CanvasShapeType
}[]

const SELECTION_TOOLBAR_ARROW_ROUTINGS = [
  { icon: CornerDownRight, label: 'Elbow connector', routing: 'elbow' },
  { icon: ArrowUpRight, label: 'Straight connector', routing: 'straight' },
] as const satisfies readonly {
  icon: LucideIcon
  label: string
  routing: Extract<CanvasItem, { type: 'arrow' }>['routing']
}[]

const SELECTION_TOOLBAR_ALIGN_CONTROLS = [
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

const SELECTION_TOOLBAR_DISTRIBUTE_CONTROLS = [
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

const SELECTION_TOOLBAR_LAYER_ORDER_CONTROLS = [
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

const SELECTION_TOOLBAR_DESCRIPTORS = [
  {
    disabled: (context) => context.disabled,
    icon: Type,
    id: 'edit-text',
    kind: 'button',
    label: 'Edit text',
    onSelect: (context) => context.selection.onEditText(),
    visible: (context) =>
      context.selectedItem
        ? CANVAS_APP_TEXT_TARGET.canEdit(context.selectedItem)
        : false,
  },
  {
    disabled: (context) => context.disabled,
    groups: getSelectionToolbarShapeMenuGroups,
    icon: Square,
    id: 'shape',
    kind: 'menu',
    label: 'Shape',
    visible: (context) => context.canChangeShape,
  },
  {
    disabled: (context) => context.disabled,
    groups: getSelectionToolbarArrowMenuGroups,
    icon: ArrowUpRight,
    id: 'arrow',
    kind: 'menu',
    label: 'Arrow',
    visible: (context) => context.arrowItem !== null,
  },
  {
    disabled: (context) => !context.selection.canRotate,
    groups: getSelectionToolbarRotationMenuGroups,
    icon: RotateCw,
    id: 'rotate',
    kind: 'menu',
    label: 'Rotate',
    visible: (context) => context.items.length > 0,
  },
  {
    groups: getSelectionToolbarArrangeMenuGroups,
    icon: LayoutGrid,
    id: 'arrange',
    kind: 'menu',
    label: 'Arrange',
    visible: (context) => context.canArrange,
  },
  {
    groups: getSelectionToolbarLayerMenuGroups,
    icon: BringToFront,
    id: 'layer',
    kind: 'menu',
    label: 'Layer order',
    visible: (context) => context.canLayerOrder,
  },
  {
    groups: getSelectionToolbarStructureMenuGroups,
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
    disabled: (context) => !context.commandAvailability.duplicate,
    icon: Copy,
    id: 'duplicate',
    kind: 'button',
    label: 'Duplicate selection',
    onSelect: (context) => context.commandHandlers.onDuplicate(),
  },
  {
    closeToolbar: true,
    disabled: (context) => !context.commandAvailability.delete,
    icon: Trash2,
    id: 'delete',
    kind: 'button',
    label: 'Delete selection',
    onSelect: (context) => context.commandHandlers.onDelete(),
    tone: 'danger',
  },
  {
    groups: getSelectionToolbarMoreMenuGroups,
    icon: MoreHorizontal,
    id: 'more',
    kind: 'menu',
    label: 'More actions',
  },
] as const satisfies readonly SelectionToolbarDescriptor[]

export function CanvasSelectionFloatingBar({
  anchor,
  commandAvailability,
  config,
  customCommands,
  commandHandlers,
  imageControls,
  inspector,
  onClose = noop,
  onCustomCommand,
  selection,
  textEditor,
  tool,
  visible,
  zoomControls,
}: CanvasSelectionFloatingBarProps) {
  if (!visible || !anchor) {
    return null
  }

  if (
    selection &&
    inspector &&
    imageControls &&
    textEditor &&
    tool &&
    zoomControls
  ) {
    return (
      <CanvasSelectionObjectToolbar
        anchor={anchor}
        commandAvailability={commandAvailability}
        commandHandlers={commandHandlers}
        imageControls={imageControls}
        inspector={inspector}
        onClose={onClose}
        selection={selection}
        textEditor={textEditor}
        tool={tool}
        zoomControls={zoomControls}
      />
    )
  }

  const groups = getCanvasCommandSurfaceGroups({
    commandAvailability,
    config,
    customCommands,
    surface: 'selection-floating-bar',
  })

  return (
    <CanvasCommandSurface
      ariaLabel="Selection actions"
      className="selection-floating-bar"
      context={{
        commandHandlers,
        onCustomCommand,
        onToolChange: noop,
      }}
      groups={groups}
      dataPlacement={anchor.placement}
      style={getSelectionToolbarStyle(anchor)}
    />
  )
}

function CanvasSelectionObjectToolbar({
  anchor,
  commandAvailability,
  commandHandlers,
  imageControls,
  inspector,
  onClose,
  selection,
  textEditor,
  tool,
  zoomControls,
}: {
  anchor: CanvasSelectionCommandAnchor
  commandAvailability: CanvasCommandAvailability
  commandHandlers: CanvasToolbarItemRenderContext['commandHandlers']
  imageControls: CanvasSelectionFloatingBarImageControls
  inspector: CanvasSelectionFloatingBarInspector
  onClose: () => void
  selection: CanvasAppSelectionModel
  textEditor: CanvasSelectionFloatingBarTextEditor
  tool: Tool
  zoomControls: CanvasSelectionFloatingBarZoomControls
}) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const controlId = useId()
  const toolbarRovingFocus = useCanvasToolbarRovingFocus<HTMLDivElement>()

  if (
    selection.ids.length === 0 ||
    textEditor.editing ||
    tool !== 'select'
  ) {
    return null
  }

  const context = getSelectionToolbarContext({
    commandAvailability,
    commandHandlers,
    imageControls,
    inspector,
    onClose,
    selection,
    zoomControls,
  })
  const descriptors = getSelectionToolbarDescriptors(context)

  return (
    <>
      <div
        {...toolbarRovingFocus}
        className="selection-floating-bar"
        role="toolbar"
        aria-label="Object actions"
        data-placement={anchor.placement}
        style={getSelectionToolbarStyle(anchor)}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {descriptors.map((descriptor) => (
          <SelectionToolbarSlot
            context={context}
            controlId={controlId}
            descriptor={descriptor}
            key={descriptor.id}
            open={openMenu === descriptor.id}
            onOpenChange={setOpenMenu}
          />
        ))}
      </div>
      <SelectionToolbarStampPad
        anchor={anchor}
        onClose={onClose}
        selection={selection}
      />
    </>
  )
}

function getSelectionToolbarContext({
  commandAvailability,
  commandHandlers,
  imageControls,
  inspector,
  onClose,
  selection,
  zoomControls,
}: {
  commandAvailability: CanvasCommandAvailability
  commandHandlers: CanvasToolbarItemRenderContext['commandHandlers']
  imageControls: CanvasSelectionFloatingBarImageControls
  inspector: CanvasSelectionFloatingBarInspector
  onClose: () => void
  selection: CanvasAppSelectionModel
  zoomControls: CanvasSelectionFloatingBarZoomControls
}): SelectionToolbarContext {
  const { disabled, items } = selection
  const selectedItem = items.length === 1 ? items[0] : null
  const arrowItem = selectedItem?.type === 'arrow' ? selectedItem : null
  const sectionItems = items.filter(isCanvasSectionComponentItem)
  const canUseSectionActions =
    sectionItems.length > 0 && sectionItems.length === items.length
  const canAlign = SELECTION_TOOLBAR_ALIGN_CONTROLS.some(
    (control) => commandAvailability[control.command],
  )
  const canDistribute = SELECTION_TOOLBAR_DISTRIBUTE_CONTROLS.some(
    (control) => commandAvailability[control.command],
  )
  const canLayerOrder = SELECTION_TOOLBAR_LAYER_ORDER_CONTROLS.some(
    (control) =>
      commandAvailability[control.command] &&
      selection.canReorder[control.mode],
  )

  return {
    arrowItem,
    canArrange:
      canAlign ||
      canDistribute ||
      selection.canTidy ||
      selection.canFlip,
    canChangeShape:
      items.length > 0 && items.every(isCanvasShapeItem),
    canGroup:
      commandAvailability.group && sectionItems.length === 0,
    canLayerOrder,
    canSection: sectionItems.length === 0 && items.length > 0,
    canUngroup: commandAvailability.ungroup,
    canUnsection: canUseSectionActions,
    canUseSectionActions,
    commandAvailability,
    commandHandlers,
    disabled,
    imageControls,
    inspector,
    items,
    onClose,
    selectedItem,
    selection,
    zoomControls,
  }
}

function getSelectionToolbarDescriptors(
  context: SelectionToolbarContext,
): readonly SelectionToolbarDescriptor[] {
  return [
    ...SELECTION_TOOLBAR_DESCRIPTORS.slice(0, 3),
    ...getSelectionStyleToolbarDescriptors(context),
    ...SELECTION_TOOLBAR_DESCRIPTORS.slice(3),
  ].filter((descriptor) =>
    isSelectionToolbarVisible(descriptor, context)
  )
}

function getSelectionStyleToolbarDescriptors(
  context: SelectionToolbarContext,
): SelectionToolbarMenuDescriptor[] {
  return context.inspector.styleControls
    .filter(isSelectionSwatchStyleControl)
    .map((control) => ({
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
      swatchColor: () => getSelectionStyleColor(control),
    }))
}

function isSelectionSwatchStyleControl(
  control: CanvasObjectStyleControl,
): control is CanvasObjectStyleSwatchControl {
  return control.kind === 'swatches'
}

function SelectionToolbarSlot({
  context,
  controlId,
  descriptor,
  onOpenChange,
  open,
}: {
  context: SelectionToolbarContext
  controlId: string
  descriptor: SelectionToolbarDescriptor
  onOpenChange: (id: string | null) => void
  open: boolean
}) {
  const triggerRef = useRef<HTMLButtonElement>(null)

  if (descriptor.kind === 'button') {
    return (
      <div className="selection-toolbar-item">
        <SelectionToolbarButton
          context={context}
          descriptor={descriptor}
          onClick={() => {
            onOpenChange(null)
            runSelectionToolbarAction(descriptor, context)
          }}
        />
      </div>
    )
  }

  const menuGroups = getVisibleSelectionMenuGroups(descriptor, context)
  const disabled =
    isSelectionToolbarDisabled(descriptor, context) ||
    menuGroups.length === 0
  const menuId = `${controlId}-${descriptor.id}-menu`
  const triggerId = `${controlId}-${descriptor.id}-trigger`
  const closeMenu = () => {
    onOpenChange(null)
    triggerRef.current?.focus()
  }

  return (
    <div className="selection-toolbar-item">
      <button
        {...CANVAS_TOOLBAR_ITEM_PROPS}
        ref={triggerRef}
        id={triggerId}
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={getSelectionToolbarLabel(descriptor, context)}
        className="tool-button selection-toolbar-trigger"
        data-has-swatch={hasSelectionSwatch(descriptor, context)}
        data-open={open}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            onOpenChange(open ? null : descriptor.id)
          }
        }}
        title={descriptor.title ?? getSelectionToolbarLabel(
          descriptor,
          context,
        )}
        type="button"
      >
        <SelectionToolbarGlyph
          context={context}
          descriptor={descriptor}
        />
      </button>
      {open && !disabled ? (
        <SelectionToolbarMenu
          context={context}
          groups={menuGroups}
          id={menuId}
          label={getSelectionToolbarLabel(descriptor, context)}
          labelledBy={triggerId}
          onClose={closeMenu}
        />
      ) : null}
    </div>
  )
}

function SelectionToolbarButton({
  context,
  descriptor,
  onClick,
}: {
  context: SelectionToolbarContext
  descriptor: SelectionToolbarButtonDescriptor
  onClick: () => void
}) {
  return (
    <button
      {...CANVAS_TOOLBAR_ITEM_PROPS}
      aria-label={getSelectionToolbarLabel(descriptor, context)}
      aria-pressed={getSelectionToolbarPressed(descriptor, context)}
      className="tool-button selection-toolbar-trigger"
      data-has-swatch={hasSelectionSwatch(descriptor, context)}
      data-tone={descriptor.tone}
      disabled={isSelectionToolbarDisabled(descriptor, context)}
      onClick={onClick}
      title={descriptor.title ?? getSelectionToolbarLabel(
        descriptor,
        context,
      )}
      type="button"
    >
      <SelectionToolbarGlyph
        context={context}
        descriptor={descriptor}
      />
    </button>
  )
}

function SelectionToolbarMenu({
  context,
  groups,
  id,
  label,
  labelledBy,
  onClose,
}: {
  context: SelectionToolbarContext
  groups: readonly SelectionToolbarMenuGroup[]
  id: string
  label: string
  labelledBy: string
  onClose: () => void
}) {
  const menuRovingFocus = useCanvasMenuRovingFocus<HTMLDivElement>({
    onClose,
  })

  return (
    <div
      {...menuRovingFocus}
      className="selection-toolbar-menu"
      id={id}
      role="menu"
      aria-label={label}
      aria-labelledby={labelledBy}
    >
      {groups.map((group) => (
        <div
          className="selection-toolbar-menu-group"
          data-layout={group.layout ?? 'row'}
          key={group.id}
          role="group"
        >
          {group.items.map((item) => {
            const pressed = getSelectionToolbarPressed(item, context)

            return (
              <button
                {...CANVAS_MENU_ITEM_PROPS}
                aria-label={getSelectionToolbarLabel(item, context)}
                aria-checked={pressed}
                className="tool-button selection-toolbar-menu-item"
                data-has-swatch={hasSelectionSwatch(item, context)}
                data-tone={item.tone}
                disabled={isSelectionToolbarDisabled(item, context)}
                key={item.id}
                role={pressed === undefined
                  ? 'menuitem'
                  : 'menuitemcheckbox'}
                onClick={() => {
                  runSelectionToolbarAction(item, context)
                  onClose()
                }}
                title={item.title ?? getSelectionToolbarLabel(item, context)}
                type="button"
              >
                <SelectionToolbarGlyph
                  context={context}
                  descriptor={item}
                />
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function SelectionToolbarGlyph({
  context,
  descriptor,
}: {
  context: SelectionToolbarContext
  descriptor: Pick<
    SelectionToolbarActionDescriptor,
    'icon' | 'id' | 'swatchColor' | 'text'
  >
}) {
  const Icon = descriptor.icon
  const swatchColor = getSelectionToolbarSwatchColor(descriptor, context)

  return (
    <>
      {Icon ? <Icon aria-hidden="true" size={13} strokeWidth={2} /> : null}
      {descriptor.text ? (
        <span className="selection-toolbar-text" aria-hidden="true">
          {descriptor.text}
        </span>
      ) : null}
      {swatchColor ? (
        <span
          className="selection-toolbar-swatch-mark"
          aria-hidden="true"
          style={{ backgroundColor: swatchColor }}
        />
      ) : null}
    </>
  )
}

function SelectionToolbarStampPad({
  anchor,
  onClose,
  selection,
}: {
  anchor: CanvasSelectionCommandAnchor
  onClose: () => void
  selection: CanvasAppSelectionModel
}) {
  if (selection.ids.length === 0 || !selection.canStamp) {
    return null
  }

  return (
    <div
      className="selection-toolbar-stamp-pad"
      role="group"
      aria-label="Stamp reactions"
      data-placement={anchor.placement}
      style={getSelectionToolbarStyle(anchor)}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {SELECTION_TOOLBAR_STAMPS.map((stamp) => (
        <button
          aria-label={`Add ${stamp.label} stamp`}
          disabled={selection.disabled}
          key={stamp.stamp}
          onClick={() => {
            if (selection.onInsertStampNearSelection(stamp)) {
              onClose()
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

function getSelectionToolbarShapeMenuGroups(): SelectionToolbarMenuGroup[] {
  return [{
    id: 'shape',
    items: SELECTION_TOOLBAR_SHAPE_TYPES.map(({ icon, label, type }) => ({
      disabled: (context) => context.disabled,
      icon,
      id: type,
      label,
      onSelect: (context) => {
        context.selection.onReplaceSelectedItems((item) =>
          replaceSelectionShapeType(item, type),
        )
      },
      pressed: (context) => getSelectionShapeType(context.items) === type,
    })),
  }]
}

function getSelectionToolbarArrowMenuGroups(): SelectionToolbarMenuGroup[] {
  return [
    {
      id: 'routing',
      items: SELECTION_TOOLBAR_ARROW_ROUTINGS.map(({ icon, label, routing }) => ({
        disabled: (context) => context.disabled,
        icon,
        id: routing,
        label,
        onSelect: (context) => {
          context.selection.onReplaceSelectedItems((item) =>
            item.type === 'arrow'
              ? setCanvasArrowRouting(item, routing)
              : item,
          )
        },
        pressed: (context) =>
          context.arrowItem
            ? normalizeCanvasArrowRouting(context.arrowItem.routing) === routing
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
            context.selection.onReplaceSelectedItems((item) =>
              item.type === 'arrow' ? setSelectionArrowhead(item, 'end') : item,
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
            context.selection.onReplaceSelectedItems((item) =>
              item.type === 'arrow' ? setSelectionArrowhead(item, 'none') : item,
            )
          },
          pressed: (context) => context.arrowItem?.arrowhead === 'none',
        },
      ],
    },
  ]
}

function getSelectionToolbarRotationMenuGroups(): SelectionToolbarMenuGroup[] {
  return [{
    id: 'rotate',
    items: [
      {
        disabled: (context) => !context.selection.canRotate,
        icon: RotateCcw,
        id: 'rotate-counterclockwise',
        label: 'Rotate counterclockwise',
        onSelect: (context) => context.selection.onRotateSelectedItems(-15),
      },
      {
        disabled: (context) =>
          !context.selection.canRotate || !context.selection.hasRotation,
        id: 'reset-rotation',
        label: 'Reset rotation',
        onSelect: (context) => context.selection.onResetSelectedRotation(),
        text: '0',
      },
      {
        disabled: (context) => !context.selection.canRotate,
        icon: RotateCw,
        id: 'rotate-clockwise',
        label: 'Rotate clockwise',
        onSelect: (context) => context.selection.onRotateSelectedItems(15),
      },
    ],
  }]
}

function getSelectionToolbarArrangeMenuGroups(): SelectionToolbarMenuGroup[] {
  return [
    {
      id: 'align',
      items: SELECTION_TOOLBAR_ALIGN_CONTROLS.map(({
        command,
        icon,
        label,
        mode,
      }) => ({
        disabled: (context) =>
          context.disabled || !context.commandAvailability[command],
        icon,
        id: command,
        label,
        onSelect: (context) => context.commandHandlers.onAlign(mode),
      })),
    },
    {
      id: 'distribute',
      items: SELECTION_TOOLBAR_DISTRIBUTE_CONTROLS.map(({
        command,
        icon,
        label,
        mode,
      }) => ({
        disabled: (context) =>
          context.disabled || !context.commandAvailability[command],
        icon,
        id: command,
        label,
        onSelect: (context) => context.commandHandlers.onDistribute(mode),
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
          onSelect: (context) => context.selection.onTidySelectedItems(),
          visible: (context) => context.selection.canTidy,
        },
        {
          disabled: (context) => context.disabled,
          icon: FlipHorizontal,
          id: 'flip-horizontal',
          label: 'Flip horizontal',
          onSelect: (context) =>
            context.selection.onFlipSelectedItems('horizontal'),
          visible: (context) => context.selection.canFlip,
        },
        {
          disabled: (context) => context.disabled,
          icon: FlipVertical,
          id: 'flip-vertical',
          label: 'Flip vertical',
          onSelect: (context) =>
            context.selection.onFlipSelectedItems('vertical'),
          visible: (context) => context.selection.canFlip,
        },
      ],
    },
  ]
}

function getSelectionToolbarLayerMenuGroups(): SelectionToolbarMenuGroup[] {
  return [{
    id: 'layer',
    items: SELECTION_TOOLBAR_LAYER_ORDER_CONTROLS.map(({
      command,
      icon,
      label,
      mode,
    }) => ({
      disabled: (context) =>
        context.disabled ||
        !context.commandAvailability[command] ||
        !context.selection.canReorder[mode],
      icon,
      id: command,
      label,
      onSelect: (context) => context.commandHandlers.onReorder(mode),
    })),
  }]
}

function getSelectionToolbarStructureMenuGroups(): SelectionToolbarMenuGroup[] {
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
          onSelect: (context) => context.commandHandlers.onGroup(),
          visible: (context) => context.canGroup,
        },
        {
          closeToolbar: true,
          disabled: (context) => context.disabled,
          icon: Ungroup,
          id: 'ungroup',
          label: 'Ungroup selection',
          onSelect: (context) => context.commandHandlers.onUngroup(),
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
            context.selection.onSectionSelectedItems(),
          visible: (context) => context.canSection,
        },
        {
          closeToolbar: true,
          disabled: (context) => context.disabled,
          icon: PanelTopClose,
          id: 'unsection',
          label: 'Delete section frame',
          onSelect: (context) =>
            context.selection.onUnsectionSelectedItems(),
          visible: (context) => context.canUnsection,
        },
        {
          icon: EyeOff,
          id: 'toggle-section-contents',
          label: (context) =>
            context.selection.sectionContentsHidden
              ? 'Show section contents'
              : 'Hide section contents',
          onSelect: (context) => {
            context.selection.onSetSelectedSectionsHidden(
              !context.selection.sectionContentsHidden,
            )
          },
          pressed: (context) => context.selection.sectionContentsHidden,
          visible: (context) => context.canUseSectionActions,
        },
        {
          icon: Lock,
          id: 'toggle-section-lock',
          label: (context) =>
            context.selection.selectedSectionsLocked
              ? 'Unlock section'
              : 'Lock section',
          onSelect: (context) => {
            context.selection.onSetSelectedSectionsLocked(
              !context.selection.selectedSectionsLocked,
            )
          },
          pressed: (context) => context.selection.selectedSectionsLocked,
          visible: (context) => context.canUseSectionActions,
        },
      ],
    },
  ]
}

function getSelectionToolbarMoreMenuGroups(): SelectionToolbarMenuGroup[] {
  return [{
    id: 'more',
    items: [
      {
        disabled: (context) => context.disabled,
        icon: Boxes,
        id: 'select-same',
        label: 'Select same type',
        onSelect: (context) => context.selection.onSelectSameType(),
        visible: (context) => context.selection.canSelectSame,
      },
      {
        icon: Download,
        id: 'download',
        label: 'Export selection as image',
        onSelect: (context) => context.imageControls.onDownloadImage(),
      },
      {
        icon: Maximize2,
        id: 'fit-selection',
        label: 'Fit selection',
        onSelect: (context) => context.zoomControls.onFit(),
      },
    ],
  }]
}

function getVisibleSelectionMenuGroups(
  descriptor: SelectionToolbarMenuDescriptor,
  context: SelectionToolbarContext,
): SelectionToolbarMenuGroup[] {
  return descriptor.groups(context)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        isSelectionToolbarVisible(item, context),
      ),
    }))
    .filter((group) => group.items.length > 0)
}

function runSelectionToolbarAction(
  descriptor: SelectionToolbarActionDescriptor,
  context: SelectionToolbarContext,
) {
  if (isSelectionToolbarDisabled(descriptor, context)) {
    return
  }

  descriptor.onSelect(context)

  if (descriptor.closeToolbar) {
    context.onClose()
  }
}

function isSelectionToolbarVisible(
  descriptor: Pick<SelectionToolbarActionStateTarget, 'id' | 'visible'>,
  context: SelectionToolbarContext,
) {
  return descriptor.visible ? descriptor.visible(context) : true
}

function getSelectionToolbarLabel(
  descriptor: Pick<SelectionToolbarActionStateTarget, 'id' | 'label'>,
  context: SelectionToolbarContext,
) {
  return typeof descriptor.label === 'function'
    ? descriptor.label(context)
    : descriptor.label
}

function isSelectionToolbarDisabled(
  descriptor: Pick<SelectionToolbarActionStateTarget, 'disabled' | 'id'>,
  context: SelectionToolbarContext,
) {
  return descriptor.disabled ? descriptor.disabled(context) : false
}

function getSelectionToolbarPressed(
  descriptor: Pick<SelectionToolbarActionStateTarget, 'id' | 'pressed'>,
  context: SelectionToolbarContext,
) {
  return descriptor.pressed ? descriptor.pressed(context) : undefined
}

function hasSelectionSwatch(
  descriptor: Pick<SelectionToolbarActionStateTarget, 'id' | 'swatchColor'>,
  context: SelectionToolbarContext,
) {
  return getSelectionToolbarSwatchColor(descriptor, context) !== null
}

function getSelectionToolbarSwatchColor(
  descriptor: Pick<SelectionToolbarActionStateTarget, 'id' | 'swatchColor'>,
  context: SelectionToolbarContext,
) {
  if (!descriptor.swatchColor) {
    return null
  }

  return typeof descriptor.swatchColor === 'function'
    ? descriptor.swatchColor(context)
    : descriptor.swatchColor
}

function isSelectionShapeToolbarItem(
  item: CanvasItem,
): item is CanvasShapeLikeItem {
  return isCanvasShapeItem(item)
}

function getSelectionShapeType(
  items: readonly CanvasItem[],
): CanvasShapeType | null {
  const shapeTypes = items
    .filter(isSelectionShapeToolbarItem)
    .map(getCanvasShapeKind)
  const [first] = shapeTypes

  return first && shapeTypes.every((type) => type === first) ? first : null
}

function replaceSelectionShapeType(
  item: CanvasItem,
  shapeType: CanvasShapeType,
): CanvasItem {
  if (isCanvasShapeItem(item)) {
    return setCanvasShapeKind(item, shapeType)
  }

  return item
}

function setSelectionArrowhead(
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

function getSelectionStyleColor(control: CanvasObjectStyleSwatchControl) {
  return (
    control.swatches.find((swatch) => swatch.selected) ??
    control.swatches[0]
  )?.color ?? 'transparent'
}

function getSelectionToolbarStyle(
  anchor: CanvasSelectionCommandAnchor,
): CSSProperties {
  return {
    '--canvas-selection-command-x': `${anchor.x}px`,
    '--canvas-selection-command-y': `${anchor.y}px`,
  } as CSSProperties
}

function noop() {}
