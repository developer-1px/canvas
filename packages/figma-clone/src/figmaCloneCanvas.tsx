import {
  defineCanvasAppCustomItemModule,
  type CanvasCustomItem,
  type CanvasJsonObject,
} from '../../../src/canvas'
import { isFigmaCloneDomCanvasPanTarget } from './dom-edit/FigmaCloneDomCanvasPointer'
import { FigmaCloneDomEditSurface } from './dom-edit/FigmaCloneDomEditSurface'
import type {
  FigmaCloneDomEditState,
  FigmaCloneDomNodeId,
} from './dom-edit/FigmaCloneDomEditModel'
import {
  createFigmaCloneWidgetItem,
  FIGMA_CLONE_WIDGET_MODULE,
} from './widget/FigmaCloneWidgetModule'

export const FIGMA_CLONE_DOM_FRAME_KIND = 'figma-clone-dom-frame'
export const FIGMA_CLONE_DOM_FRAME_PRESENTATION = 'figma-clone-dom-frame-card'

export type FigmaCloneFrameId = 'dom' | 'widget'

export type FigmaCloneDomFrameData = CanvasJsonObject & {
  frameId: 'dom'
}

export function createFigmaCloneCanvasItems(): CanvasCustomItem[] {
  return [
    createFigmaCloneWidgetItem(),
    {
      data: { frameId: 'dom' },
      h: 720,
      id: 'figma-dom-frame',
      kind: FIGMA_CLONE_DOM_FRAME_KIND,
      presentation: FIGMA_CLONE_DOM_FRAME_PRESENTATION,
      title: 'DOM edit frame',
      type: 'custom',
      w: 960,
      x: 40,
      y: 76,
    },
  ]
}

export function createFigmaCloneDomFrameModule({
  selectedNodeId,
  state,
  onSelectNode,
}: {
  selectedNodeId: FigmaCloneDomNodeId | null
  state: FigmaCloneDomEditState
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
}) {
  return defineCanvasAppCustomItemModule({
    id: FIGMA_CLONE_DOM_FRAME_KIND,
    presentation: FIGMA_CLONE_DOM_FRAME_PRESENTATION,
    renderItem: ({ item }) => (
      <foreignObject
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
      >
        <div
          className="figma-frame figma-frame--dom"
          data-figma-frame="dom"
          onPointerDown={(event) => {
            if (isFigmaCloneDomCanvasPanTarget(event.target)) {
              return
            }

            event.stopPropagation()
          }}
        >
          <div className="figma-frame__label">DOM edit</div>
          <FigmaCloneDomEditSurface
            selectedNodeId={selectedNodeId}
            state={state}
            onSelectNode={onSelectNode}
          />
        </div>
      </foreignObject>
    ),
    validateItem: (item) =>
      item.kind === FIGMA_CLONE_DOM_FRAME_KIND &&
      item.presentation === FIGMA_CLONE_DOM_FRAME_PRESENTATION &&
      item.data.frameId === 'dom',
  })
}

export function createFigmaCloneCanvasModules({
  selectedNodeId,
  state,
  onSelectNode,
}: {
  selectedNodeId: FigmaCloneDomNodeId | null
  state: FigmaCloneDomEditState
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
}) {
  return [
    FIGMA_CLONE_WIDGET_MODULE,
    createFigmaCloneDomFrameModule({
      selectedNodeId,
      state,
      onSelectNode,
    }),
  ]
}
