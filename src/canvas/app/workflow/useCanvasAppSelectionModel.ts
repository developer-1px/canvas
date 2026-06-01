import { useMemo } from 'react'
import type {
  Bounds,
  EditingText,
} from '../../entities'
import type { CanvasAppStampVotingSessionContext } from './CanvasAppStampConsumerContracts'
import type { CanvasWorkspaceSelectionModelContext } from './CanvasWorkspaceConsumerContracts'
import {
  getCanvasAppSelectionModel,
  type CanvasAppSelectionAnchor,
} from './CanvasAppSelectionModel'

export function useCanvasAppSelectionModel({
  anchor,
  bounds,
  disabled,
  label,
  setEditing,
  votingSession,
  workspace,
}: {
  anchor: CanvasAppSelectionAnchor | null
  bounds: Bounds | null
  disabled: boolean
  label: string | null
  setEditing: (editing: EditingText | null) => void
  votingSession?: CanvasAppStampVotingSessionContext
  workspace: CanvasWorkspaceSelectionModelContext
}) {
  return useMemo(
    () =>
      getCanvasAppSelectionModel({
        anchor,
        bounds,
        commitItemsChange: workspace.commitItemsChange,
        commitSelection: workspace.commitSelection,
        createId: workspace.createId,
        disabled,
        itemReadModel: workspace.itemReadModel,
        items: workspace.items,
        label,
        selection: workspace.selection,
        setEditing,
        votingSession,
      }),
    [
      anchor,
      bounds,
      disabled,
      label,
      setEditing,
      workspace.commitItemsChange,
      workspace.commitSelection,
      workspace.createId,
      workspace.itemReadModel,
      workspace.items,
      workspace.selection,
      votingSession,
    ],
  )
}
