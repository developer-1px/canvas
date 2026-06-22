import type {
  Bounds,
  CanvasItem,
  CanvasStampKind,
  EditingText,
} from '../../entities'
import type {
  CanvasFlipAxis,
  CanvasZOrderMode,
} from '../../host'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import type { CanvasAppStampVotingSessionContext } from './CanvasAppStampConsumerContracts'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from './CanvasWorkflowContract'

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

export type CanvasAppSelectionModelInput = {
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
}

export type CanvasAppSelectionModelActions = Pick<
  CanvasAppSelectionModel,
  | 'onEditText'
  | 'onFlipSelectedItems'
  | 'onInsertStampNearSelection'
  | 'onReplaceSelectedItems'
  | 'onResetSelectedRotation'
  | 'onRotateSelectedItems'
  | 'onSectionSelectedItems'
  | 'onSelectSameType'
  | 'onSetSelectedSectionsHidden'
  | 'onSetSelectedSectionsLocked'
  | 'onTidySelectedItems'
  | 'onUnsectionSelectedItems'
>
