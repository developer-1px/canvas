import {
  canFlipCanvasSelection,
  canRotateCanvasSelection,
  canSelectSameTypeCanvasSelection,
  canTidyCanvasSelection,
  getCanvasSelectionRotation,
  hasCanvasSelectionRotation,
} from '../../host'
import {
  getCanvasAppSelectionLayerOrderAvailability,
} from './CanvasAppSelectionLayerOrder'
import {
  getCanvasAppSelectionModelActions,
} from './CanvasAppSelectionModelActions'
import type {
  CanvasAppSelectionModel,
  CanvasAppSelectionModelInput,
} from './CanvasAppSelectionModelContracts'
import {
  getSelectedCanvasAppSectionState,
} from './CanvasAppSelectionSections'
import {
  canStampCanvasAppSelection,
} from './CanvasAppSelectionStamp'

export {
  editCanvasAppSelectionText,
} from './CanvasAppSelectionTextEditing'
export type {
  CanvasAppSelectionAnchor,
  CanvasAppSelectionModel,
  CanvasAppSelectionModelActions,
  CanvasAppSelectionModelInput,
  CanvasAppSelectionStamp,
} from './CanvasAppSelectionModelContracts'

export function getCanvasAppSelectionModel(
  input: CanvasAppSelectionModelInput,
): CanvasAppSelectionModel {
  const {
    anchor,
    bounds,
    disabled,
    itemReadModel,
    items,
    label,
    selection,
    votingSession,
  } = input
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
    canSelectSame: !disabled && canSelectSameTypeCanvasSelection(
      items,
      selection,
    ),
    canTidy: canTidyCanvasSelection(items, selection),
    sectionContentsHidden: selectedSectionState.contentIds.length > 0 &&
      selectedSectionState.contentIds.every((id) =>
        selectedSectionState.itemById.get(id)?.hidden === true,
      ),
    selectedSectionsLocked: selectedSectionState.sections.length > 0 &&
      selectedSectionState.sections.every((item) => item.locked === true),
    ...getCanvasAppSelectionModelActions({
      ...input,
      canRotate,
      canStamp,
      selectedSectionState,
    }),
  }
}
