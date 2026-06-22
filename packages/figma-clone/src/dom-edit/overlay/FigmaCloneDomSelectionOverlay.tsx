import { DomEditSelectionOverlay } from '@interactive-os/dom-edit-affordance/react'
import type { RefObject } from 'react'
import type { Viewport } from '@interactive-os/canvas'
import {
  FIGMA_CLONE_DOM_EDIT_ADAPTER,
  type FigmaCloneDomAutoLayoutField,
  type FigmaCloneDomEditField,
  type FigmaCloneDomEditNodeState,
  type FigmaCloneDomEditState,
  type FigmaCloneDomNodeId,
} from '../FigmaCloneDomEditModel'
import type { FigmaCloneDomAffordanceState } from './FigmaCloneDomAffordanceVisibility'

export function FigmaCloneDomSelectionOverlay({
  shellRef,
  selectedNodeId,
  state,
  viewport,
  affordanceState,
  isCanvasPanActive,
  onAffordanceStateChange,
  onChange,
  onChangeAutoLayout,
}: {
  affordanceState: FigmaCloneDomAffordanceState
  isCanvasPanActive: boolean
  selectedNodeId: FigmaCloneDomNodeId | null
  shellRef: RefObject<HTMLElement | null>
  state: FigmaCloneDomEditState
  viewport: Viewport
  onAffordanceStateChange: (state: FigmaCloneDomAffordanceState) => void
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
}) {
  return (
    <DomEditSelectionOverlay
      adapter={FIGMA_CLONE_DOM_EDIT_ADAPTER}
      affordanceState={affordanceState}
      isCanvasPanActive={isCanvasPanActive}
      selectedNodeId={selectedNodeId}
      shellRef={shellRef}
      state={state}
      viewport={viewport}
      onAffordanceStateChange={onAffordanceStateChange}
      onChange={onChange}
      onChangeAutoLayout={onChangeAutoLayout}
    />
  )
}
