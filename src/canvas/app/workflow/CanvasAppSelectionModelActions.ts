import {
  canFlipCanvasSelection,
  canSelectSameTypeCanvasSelection,
  canTidyCanvasSelection,
  createCanvasStampItem,
  flipCanvasSelection,
  hasCanvasSelectionRotation,
  resetCanvasSelectionRotation,
  rotateCanvasSelection,
  selectSameTypeCanvasSelection,
  tidyCanvasSelection,
} from '../../host'
import {
  replaceCanvasAppItemsByIds,
  replaceSelectedCanvasAppItems,
  setCanvasAppItemHidden,
  setCanvasAppItemLocked,
} from './CanvasAppSelectionItemUpdates'
import type {
  CanvasAppSelectionModelActions,
  CanvasAppSelectionModelInput,
} from './CanvasAppSelectionModelContracts'
import {
  createCanvasAppSectionItem,
  flattenCanvasAppSectionItems,
  getTopLevelContainedCanvasAppItemIds,
  type CanvasAppSelectionSectionState,
} from './CanvasAppSelectionSections'
import {
  getCanvasAppSelectionStampPlacement,
} from './CanvasAppSelectionStamp'
import {
  editCanvasAppSelectionText,
} from './CanvasAppSelectionTextEditing'

export type CanvasAppSelectionModelActionsInput =
  CanvasAppSelectionModelInput & {
    canRotate: boolean
    canStamp: boolean
    selectedSectionState: CanvasAppSelectionSectionState
  }

export function getCanvasAppSelectionModelActions({
  bounds,
  canRotate,
  canStamp,
  commitItemsChange,
  commitSelection,
  createId,
  disabled,
  itemReadModel,
  items,
  selectedSectionState,
  selection,
  setEditing,
  votingSession,
}: CanvasAppSelectionModelActionsInput): CanvasAppSelectionModelActions {
  return {
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
      const entries = flattenCanvasAppSectionItems(items)
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
