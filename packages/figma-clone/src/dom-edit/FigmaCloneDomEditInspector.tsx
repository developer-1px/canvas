import { DomEditInspector } from '@interactive-os/dom-edit-affordance/react'
import type { Viewport } from '../../../../src/canvas'
import {
  FIGMA_CLONE_DOM_EDIT_ADAPTER,
  canFigmaCloneDomNodeEditText,
  getFigmaCloneDomText,
  type FigmaCloneDomAutoLayoutField,
  type FigmaCloneDomEditField,
  type FigmaCloneDomEditNodeState,
  type FigmaCloneDomEditState,
  type FigmaCloneDomNodeId,
  type FigmaCloneDomTextState,
} from './FigmaCloneDomEditModel'

export function FigmaCloneDomEditInspector({
  selectedNodeId,
  state,
  textState,
  viewport,
  onChange,
  onChangeAutoLayout,
  onChangeText,
}: {
  selectedNodeId: FigmaCloneDomNodeId | null
  state: FigmaCloneDomEditState
  textState: FigmaCloneDomTextState
  viewport: Viewport
  onChange: (
    nodeId: FigmaCloneDomNodeId,
    field: FigmaCloneDomEditField,
    value: number,
  ) => void
  onChangeAutoLayout: (
    nodeId: FigmaCloneDomNodeId,
    field: FigmaCloneDomAutoLayoutField,
    value: FigmaCloneDomEditNodeState[FigmaCloneDomAutoLayoutField],
  ) => void
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void
}) {
  return (
    <DomEditInspector
      adapter={FIGMA_CLONE_DOM_EDIT_ADAPTER}
      canEditText={canFigmaCloneDomNodeEditText}
      getText={(nodeId) => getFigmaCloneDomText(textState, nodeId)}
      selectedNodeId={selectedNodeId}
      state={state}
      viewport={viewport}
      onChange={onChange}
      onChangeAutoLayout={onChangeAutoLayout}
      onChangeText={onChangeText}
    />
  )
}
