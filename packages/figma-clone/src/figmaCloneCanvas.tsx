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
  FigmaCloneDomTextState,
} from './dom-edit/FigmaCloneDomEditModel'
import {
  createFigmaCloneWidgetItem,
  FIGMA_CLONE_WIDGET_MODULE,
} from './widget/FigmaCloneWidgetModule'

export const FIGMA_CLONE_DOM_FRAME_KIND = 'figma-clone-dom-frame'
export const FIGMA_CLONE_DOM_FRAME_PRESENTATION = 'figma-clone-dom-frame-card'

export type FigmaCloneFrameId = 'dom' | 'widget'
export type FigmaCloneSectionOverflow = 'clip' | 'scroll'
export type FigmaCloneSectionViewport = {
  h: number
  overflow: FigmaCloneSectionOverflow
  w: number
}

export type FigmaCloneDomFrameData = CanvasJsonObject & {
  frameId: 'dom'
}

const FIGMA_CLONE_DOM_FRAME_PAD = 56

export const FIGMA_CLONE_SECTION_VIEWPORT_PRESETS = [
  { id: 'desktop', label: 'Desktop', w: 1440, h: 900 },
  { id: 'laptop', label: 'Laptop', w: 1280, h: 800 },
  { id: 'tablet', label: 'Tablet', w: 768, h: 1024 },
  { id: 'mobile', label: 'Mobile', w: 390, h: 844 },
] as const

export const FIGMA_CLONE_DEFAULT_SECTION_VIEWPORT = {
  h: 800,
  overflow: 'scroll',
  w: 1280,
} satisfies FigmaCloneSectionViewport

export function createFigmaCloneCanvasItems(): CanvasCustomItem[] {
  const frameSize = getFigmaCloneDomFrameSize(
    FIGMA_CLONE_DEFAULT_SECTION_VIEWPORT,
  )

  return [
    createFigmaCloneWidgetItem(),
    {
      data: { frameId: 'dom' },
      h: frameSize.h,
      id: 'figma-dom-frame',
      kind: FIGMA_CLONE_DOM_FRAME_KIND,
      presentation: FIGMA_CLONE_DOM_FRAME_PRESENTATION,
      title: 'DOM edit frame',
      type: 'custom',
      w: frameSize.w,
      x: 40,
      y: 76,
    },
  ]
}

export function createFigmaCloneDomFrameModule({
  isSectionSelected,
  sectionViewport,
  selectedNodeId,
  state,
  textState,
  onSelectSection,
  onSelectNode,
  onChangeText,
}: {
  isSectionSelected: boolean
  sectionViewport: FigmaCloneSectionViewport
  selectedNodeId: FigmaCloneDomNodeId | null
  state: FigmaCloneDomEditState
  textState: FigmaCloneDomTextState
  onSelectSection: () => void
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void
}) {
  return defineCanvasAppCustomItemModule({
    id: FIGMA_CLONE_DOM_FRAME_KIND,
    presentation: FIGMA_CLONE_DOM_FRAME_PRESENTATION,
    renderItem: ({ item }) => {
      const frameSize = getFigmaCloneDomFrameSize(sectionViewport)

      return (
        <foreignObject
          x={item.x}
          y={item.y}
          width={frameSize.w}
          height={frameSize.h}
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
            <div className="figma-frame__label">
              Section · {sectionViewport.w} × {sectionViewport.h} · {formatFigmaCloneSectionOverflow(sectionViewport.overflow)}
            </div>
            <FigmaCloneDomEditSurface
              isSectionSelected={isSectionSelected}
              sectionViewport={sectionViewport}
              selectedNodeId={selectedNodeId}
              state={state}
              textState={textState}
              onSelectSection={onSelectSection}
              onSelectNode={onSelectNode}
              onChangeText={onChangeText}
            />
          </div>
        </foreignObject>
      )
    },
    validateItem: (item) =>
      item.kind === FIGMA_CLONE_DOM_FRAME_KIND &&
      item.presentation === FIGMA_CLONE_DOM_FRAME_PRESENTATION &&
      item.data.frameId === 'dom',
  })
}

export function createFigmaCloneCanvasModules({
  isSectionSelected,
  sectionViewport,
  selectedNodeId,
  state,
  textState,
  onSelectSection,
  onSelectNode,
  onChangeText,
}: {
  isSectionSelected: boolean
  sectionViewport: FigmaCloneSectionViewport
  selectedNodeId: FigmaCloneDomNodeId | null
  state: FigmaCloneDomEditState
  textState: FigmaCloneDomTextState
  onSelectSection: () => void
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void
}) {
  return [
    FIGMA_CLONE_WIDGET_MODULE,
    createFigmaCloneDomFrameModule({
      isSectionSelected,
      sectionViewport,
      selectedNodeId,
      state,
      textState,
      onSelectSection,
      onSelectNode,
      onChangeText,
    }),
  ]
}

function getFigmaCloneDomFrameSize({
  h,
  w,
}: Pick<FigmaCloneSectionViewport, 'h' | 'w'>) {
  return {
    h: h + FIGMA_CLONE_DOM_FRAME_PAD * 2,
    w: w + FIGMA_CLONE_DOM_FRAME_PAD * 2,
  }
}

function formatFigmaCloneSectionOverflow(overflow: FigmaCloneSectionOverflow) {
  return overflow === 'scroll' ? 'Scroll' : 'Clip'
}
