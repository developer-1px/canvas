import type {
  Bounds,
  CanvasItem,
  CanvasStampKind,
  EditingText,
} from '../../entities'
import {
  CANVAS_STAMP_ITEM_SIZE,
  canFlipCanvasSelection,
  canReorderCanvasItems,
  canRotateCanvasSelection,
  canSelectSameTypeCanvasSelection,
  getCanvasSelectionRotation,
  hasCanvasSelectionRotation,
  canTidyCanvasSelection,
  createCanvasStampItem,
  flipCanvasSelection,
  isCanvasGroupItem,
  isCanvasSectionComponentItem,
  isCanvasStampItem,
  resetCanvasSelectionRotation,
  rotateCanvasSelection,
  selectSameTypeCanvasSelection,
  tidyCanvasSelection,
  type CanvasFlipAxis,
  type CanvasZOrderMode,
} from '../../host'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import type { CanvasAppStampVotingSessionContext } from './CanvasAppStampConsumerContracts'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from './CanvasWorkflowContract'

const CANVAS_SELECTION_STAMP_GAP = 6

export type CanvasAppSelectionAnchor = {
  placement: 'above' | 'below'
  x: number
  y: number
}

export type CanvasAppSelectionStamp = {
  label: string
  stamp: CanvasStampKind
}

export type CanvasAppSelectionModel = {
  anchor: CanvasAppSelectionAnchor | null
  bounds: Bounds | null
  canStamp: boolean
  canReorder: Record<CanvasZOrderMode, boolean>
  canRotate: boolean
  disabled: boolean
  hasRotation: boolean
  ids: string[]
  items: CanvasItem[]
  label: string | null
  rotation: number | null
  canFlip: boolean
  canSelectSame: boolean
  canTidy: boolean
  sectionContentsHidden: boolean
  selectedSectionsLocked: boolean
  onEditText: () => boolean
  onFlipSelectedItems: (axis: CanvasFlipAxis) => boolean
  onSelectSameType: () => boolean
  onInsertStampNearSelection: (stamp: CanvasAppSelectionStamp) => boolean
  onReplaceSelectedItems: (
    replaceItem: (item: CanvasItem) => CanvasItem,
  ) => boolean
  onResetSelectedRotation: () => boolean
  onRotateSelectedItems: (deltaDegrees: number) => boolean
  onSetSelectedSectionsHidden: (hidden: boolean) => boolean
  onSetSelectedSectionsLocked: (locked: boolean) => boolean
  onSectionSelectedItems: () => boolean
  onTidySelectedItems: () => boolean
  onUnsectionSelectedItems: () => boolean
}

export function getCanvasAppSelectionModel({
  anchor,
  bounds,
  commitItemsChange,
  commitSelection,
  createId,
  disabled,
  itemReadModel,
  items,
  label,
  selection,
  setEditing,
  votingSession,
}: {
  anchor: CanvasAppSelectionAnchor | null
  bounds: Bounds | null
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  createId: (prefix: string) => string
  disabled: boolean
  itemReadModel: CanvasAppItemReadModel
  items: CanvasItem[]
  label: string | null
  selection: string[]
  setEditing: (editing: EditingText | null) => void
  votingSession?: CanvasAppStampVotingSessionContext
}): CanvasAppSelectionModel {
  const selectedItems = itemReadModel.getSelectedItems(selection)
  const canRotate = !disabled && canRotateCanvasSelection(items, selection)
  const selectedSectionState = getSelectedCanvasAppSectionState({
    itemReadModel,
    items,
    selectedItems,
  })
  const canStamp = !disabled &&
    canStampCanvasAppSelection(selectedItems) &&
    (votingSession?.active !== true || votingSession.canCastVote)

  return {
    anchor,
    bounds,
    canStamp,
    canReorder: getCanvasAppSelectionLayerOrderAvailability({
      disabled,
      items,
      selection,
    }),
    canRotate,
    disabled,
    hasRotation: hasCanvasSelectionRotation(items, selection),
    ids: selection,
    items: selectedItems,
    label,
    rotation: getCanvasSelectionRotation(items, selection),
    canFlip: !disabled && canFlipCanvasSelection(items, selection),
    canSelectSame: !disabled && canSelectSameTypeCanvasSelection(items, selection),
    canTidy: canTidyCanvasSelection(items, selection),
    sectionContentsHidden: selectedSectionState.contentIds.length > 0 &&
      selectedSectionState.contentIds.every((id) =>
        selectedSectionState.itemById.get(id)?.hidden === true,
      ),
    selectedSectionsLocked: selectedSectionState.sections.length > 0 &&
      selectedSectionState.sections.every((item) => item.locked === true),
    onEditText: () =>
      editCanvasAppSelectionText({
        disabled,
        itemReadModel,
        selection,
        setEditing,
      }),
    onFlipSelectedItems: (axis) => {
      if (disabled || !canFlipCanvasSelection(items, selection)) {
        return false
      }

      return commitItemsChange({
        type: 'replace-changed',
        items: flipCanvasSelection(items, selection, axis),
      }, {
        before: selection,
        after: selection,
      })
    },
    onSelectSameType: () => {
      if (disabled || !canSelectSameTypeCanvasSelection(items, selection)) {
        return false
      }

      return commitSelection(selectSameTypeCanvasSelection(items, selection))
    },
    onInsertStampNearSelection: (stamp) => {
      const selectionBounds = bounds ?? itemReadModel.getSelectionBounds(selection)

      if (disabled || !canStamp || selection.length === 0 || !selectionBounds) {
        return false
      }

      const placement = getCanvasAppSelectionStampPlacement({
        bounds: selectionBounds,
        items,
      })
      const item = createCanvasStampItem({
        id: createId('stamp'),
        label: stamp.label,
        stamp: stamp.stamp,
        x: placement.x,
        y: placement.y,
      })

      const inserted = commitItemsChange({
        type: 'add',
        items: [item],
      }, {
        before: selection,
        after: [item.id],
      })

      if (inserted && votingSession?.active === true) {
        votingSession.onVoteCast()
      }

      return inserted
    },
    onReplaceSelectedItems: (replaceItem) => {
      if (disabled || selection.length === 0) {
        return false
      }

      const selectedIds = new Set(selection)
      const nextItems = replaceSelectedCanvasAppItems(
        items,
        selectedIds,
        replaceItem,
      )

      return commitItemsChange({
        type: 'replace-changed',
        items: nextItems,
      }, {
        before: selection,
        after: selection,
      })
    },
    onResetSelectedRotation: () => {
      if (!canRotate || !hasCanvasSelectionRotation(items, selection)) {
        return false
      }

      return commitItemsChange({
        type: 'replace-changed',
        items: resetCanvasSelectionRotation(items, selection),
      }, {
        before: selection,
        after: selection,
      })
    },
    onRotateSelectedItems: (deltaDegrees) => {
      if (!canRotate) {
        return false
      }

      return commitItemsChange({
        type: 'replace-changed',
        items: rotateCanvasSelection(items, selection, deltaDegrees),
      }, {
        before: selection,
        after: selection,
      })
    },
    onSetSelectedSectionsHidden: (hidden) => {
      if (selection.length === 0 || selectedSectionState.sections.length === 0) {
        return false
      }

      const targetIds = new Set(selectedSectionState.contentIds)

      if (targetIds.size === 0) {
        return false
      }

      const nextItems = replaceCanvasAppItemsByIds(
        items,
        targetIds,
        (item) => setCanvasAppItemHidden(item, hidden),
      )

      return commitItemsChange({
        type: 'replace-changed',
        items: nextItems,
      }, {
        before: selection,
        after: selection,
      })
    },
    onSetSelectedSectionsLocked: (locked) => {
      if (selection.length === 0 || selectedSectionState.sections.length === 0) {
        return false
      }

      const targetIds = new Set([
        ...selectedSectionState.sections.map((item) => item.id),
        ...selectedSectionState.contentIds,
      ])
      const nextItems = replaceCanvasAppItemsByIds(
        items,
        targetIds,
        (item) => setCanvasAppItemLocked(item, locked),
      )

      return commitItemsChange({
        type: 'replace-changed',
        items: nextItems,
      }, {
        before: selection,
        after: selection,
      })
    },
    onSectionSelectedItems: () => {
      const selectionBounds = bounds ?? itemReadModel.getSelectionBounds(selection)

      if (disabled || selection.length === 0 || !selectionBounds) {
        return false
      }

      const section = createCanvasAppSectionItem({
        bounds: selectionBounds,
        id: createId('section'),
      })

      return commitItemsChange({
        type: 'transform',
        beforeItems: items,
        afterItems: [section, ...items],
      }, {
        before: selection,
        after: [section.id],
      })
    },
    onTidySelectedItems: () => {
      if (disabled || !canTidyCanvasSelection(items, selection)) {
        return false
      }

      return commitItemsChange({
        type: 'replace-changed',
        items: tidyCanvasSelection(items, selection),
      }, {
        before: selection,
        after: selection,
      })
    },
    onUnsectionSelectedItems: () => {
      if (disabled || selection.length === 0) {
        return false
      }

      const selectedSections = selectedSectionState.sections

      if (selectedSections.length === 0) {
        return false
      }

      const selectedSectionIds = new Set(
        selectedSections.map((item) => item.id),
      )
      const sectionBounds = selectedSections.map((item) =>
        itemReadModel.getItemBounds(item),
      )
      const entries = flattenCanvasAppItems(items)
      const containedIds = getTopLevelContainedCanvasAppItemIds({
        entries,
        sectionBounds,
        selectedSectionIds,
        itemReadModel,
      })

      return commitItemsChange({
        type: 'remove-selection',
        selection: selectedSections.map((item) => item.id),
      }, {
        before: selection,
        after: containedIds,
      })
    },
  }
}

export function editCanvasAppSelectionText({
  disabled = false,
  itemReadModel,
  selection,
  setEditing,
}: {
  disabled?: boolean
  itemReadModel: CanvasAppItemReadModel
  selection: readonly string[]
  setEditing: (editing: EditingText | null) => void
}) {
  if (disabled || selection.length !== 1) {
    return false
  }

  const [id] = selection
  const item = id ? itemReadModel.findTextEditTarget(id) : null

  if (!item) {
    return false
  }

  setEditing({
    id: item.id,
    value: itemReadModel.textTarget.getValue(item),
  })
  return true
}

const CANVAS_APP_SELECTION_LAYER_ORDER_MODES = [
  'bringForward',
  'bringToFront',
  'sendBackward',
  'sendToBack',
] as const satisfies readonly CanvasZOrderMode[]

function getCanvasAppSelectionLayerOrderAvailability({
  disabled,
  items,
  selection,
}: {
  disabled: boolean
  items: CanvasItem[]
  selection: string[]
}): Record<CanvasZOrderMode, boolean> {
  return Object.fromEntries(
    CANVAS_APP_SELECTION_LAYER_ORDER_MODES.map((mode) => [
      mode,
      !disabled && canReorderCanvasItems(items, selection, mode),
    ]),
  ) as Record<CanvasZOrderMode, boolean>
}

function replaceSelectedCanvasAppItems(
  items: CanvasItem[],
  selectedIds: ReadonlySet<string>,
  replaceItem: (item: CanvasItem) => CanvasItem,
): CanvasItem[] {
  return replaceCanvasAppItemsByIds(items, selectedIds, replaceItem)
}

function replaceCanvasAppItemsByIds(
  items: CanvasItem[],
  targetIds: ReadonlySet<string>,
  replaceItem: (item: CanvasItem) => CanvasItem,
): CanvasItem[] {
  return items.map((item) => {
    const nextItem = targetIds.has(item.id) ? replaceItem(item) : item

    return nextItem.type === 'group'
      ? {
          ...nextItem,
          children: replaceCanvasAppItemsByIds(
            nextItem.children,
            targetIds,
            replaceItem,
          ),
        }
      : nextItem
  })
}

function setCanvasAppItemHidden(item: CanvasItem, hidden: boolean): CanvasItem {
  if (hidden) {
    return { ...item, hidden: true }
  }

  const nextItem = { ...item }
  delete nextItem.hidden
  return nextItem
}

function setCanvasAppItemLocked(item: CanvasItem, locked: boolean): CanvasItem {
  if (locked) {
    return { ...item, locked: true }
  }

  const nextItem = { ...item }
  delete nextItem.locked
  return nextItem
}

function canStampCanvasAppSelection(selectedItems: readonly CanvasItem[]) {
  return selectedItems.length > 0 && !selectedItems.every(isCanvasStampItem)
}

function getCanvasAppSelectionStampPlacement({
  bounds,
  items,
}: {
  bounds: Bounds
  items: CanvasItem[]
}) {
  const x = bounds.x + bounds.w - CANVAS_STAMP_ITEM_SIZE / 2
  const y = bounds.y - CANVAS_STAMP_ITEM_SIZE / 2
  const sameRowStampCount = flattenCanvasAppItems(items).filter((entry) =>
    isCanvasStampItem(entry.item) &&
    Math.abs(entry.item.y - y) < 0.5 &&
    entry.item.x >= x - 0.5,
  ).length

  return {
    x: x + sameRowStampCount *
      (CANVAS_STAMP_ITEM_SIZE + CANVAS_SELECTION_STAMP_GAP),
    y,
  }
}

function getSelectedCanvasAppSectionState({
  itemReadModel,
  items,
  selectedItems,
}: {
  itemReadModel: CanvasAppItemReadModel
  items: CanvasItem[]
  selectedItems: CanvasItem[]
}) {
  const sections = selectedItems.filter(isCanvasSectionComponentItem)
  const selectedSectionIds = new Set(sections.map((item) => item.id))
  const sectionBounds = sections.map((item) => itemReadModel.getItemBounds(item))
  const entries = flattenCanvasAppItems(items)
  const contentIds = getTopLevelContainedCanvasAppItemIds({
    entries,
    itemReadModel,
    sectionBounds,
    selectedSectionIds,
  })
  const itemById = new Map(entries.map((entry) => [entry.item.id, entry.item]))

  return {
    contentIds,
    itemById,
    sections,
  }
}

function createCanvasAppSectionItem({
  bounds,
  id,
}: {
  bounds: Bounds
  id: string
}): Extract<CanvasItem, { type: 'component' }> {
  const horizontalPadding = 34
  const topPadding = 56
  const bottomPadding = 30
  const w = Math.max(260, bounds.w + horizontalPadding * 2)
  const h = Math.max(180, bounds.h + topPadding + bottomPadding)

  return {
    accent: '#64748b',
    body: '',
    component: 'section',
    fill: 'rgba(241, 245, 249, 0.18)',
    h,
    id,
    stroke: '#94a3b8',
    title: 'Section',
    type: 'component',
    w,
    x: bounds.x + bounds.w / 2 - w / 2,
    y: bounds.y - topPadding,
  }
}

type CanvasAppItemEntry = {
  item: CanvasItem
  path: number[]
}

function flattenCanvasAppItems(items: CanvasItem[]) {
  const entries: CanvasAppItemEntry[] = []

  function visit(nodes: CanvasItem[], parentPath: number[]) {
    nodes.forEach((item, index) => {
      const path = [...parentPath, index]
      entries.push({ item, path })

      if (isCanvasGroupItem(item)) {
        visit(item.children, path)
      }
    })
  }

  visit(items, [])
  return entries
}

function getTopLevelContainedCanvasAppItemIds({
  entries,
  itemReadModel,
  sectionBounds,
  selectedSectionIds,
}: {
  entries: CanvasAppItemEntry[]
  itemReadModel: CanvasAppItemReadModel
  sectionBounds: Bounds[]
  selectedSectionIds: ReadonlySet<string>
}) {
  const contained = entries.filter((entry) =>
    !selectedSectionIds.has(entry.item.id) &&
    isBoundsContainedByAnySection(
      itemReadModel.getItemBounds(entry.item),
      sectionBounds,
    ),
  )
  const containedPaths = contained.map((entry) => entry.path)

  return contained
    .filter((entry) =>
      !containedPaths.some((path) => isAncestorPath(path, entry.path)),
    )
    .map((entry) => entry.item.id)
}

function isBoundsContainedByAnySection(
  bounds: Bounds,
  sectionBounds: readonly Bounds[],
) {
  return sectionBounds.some((section) =>
    bounds.x >= section.x &&
    bounds.y >= section.y &&
    bounds.x + bounds.w <= section.x + section.w &&
    bounds.y + bounds.h <= section.y + section.h,
  )
}

function isAncestorPath(candidate: readonly number[], path: readonly number[]) {
  return candidate.length < path.length &&
    candidate.every((segment, index) => path[index] === segment)
}
