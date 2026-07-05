import {
  type CanvasCustomItem,
} from '../../../../src/canvas'
import {
  defineCanvasAppCustomItemModule,
} from '../../../../src/canvas/app/authoring'
import { isDomEditCanvasPanTarget } from '@interactive-os/dom-edit-affordance/canvas'
import { FigmaCloneDomEditSurface } from '../dom-edit/FigmaCloneDomEditSurface'
import type {
  FigmaCloneDomEditState,
  FigmaCloneDomNodeId,
  FigmaCloneDomTextState,
} from '../dom-edit/FigmaCloneDomEditModel'
import {
  FIGMA_CLONE_DEFAULT_SECTION_VIEWPORT,
  FIGMA_CLONE_DOM_FRAME_KIND,
  FIGMA_CLONE_DOM_FRAME_PRESENTATION,
  getFigmaCloneDomFrameRootId,
  getFigmaCloneDomFrameSize,
  formatFigmaCloneDomSectionName,
  formatFigmaCloneSectionViewportLabel,
  isFigmaCloneDomSectionRootId,
  type FigmaCloneDomFrameData,
  type FigmaCloneDomSectionRootId,
  type FigmaCloneSectionViewport,
} from './section'

export type FigmaCloneDomEditorFrameModuleOptions = {
  isSectionSelected: (rootId: FigmaCloneDomSectionRootId) => boolean
  sectionViewport: FigmaCloneSectionViewport
  selectedNodeId: FigmaCloneDomNodeId | null
  state: FigmaCloneDomEditState
  textState: FigmaCloneDomTextState
  onSelectSection: (rootId: FigmaCloneDomSectionRootId) => void
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void
}

export function createFigmaCloneDomEditorCanvasItems(): CanvasCustomItem[] {
  const defaultState = {} as FigmaCloneDomEditState
  const workspaceFrameSize = getFigmaCloneDomFrameSize({
    rootId: 'workspacePage',
    sectionViewport: FIGMA_CLONE_DEFAULT_SECTION_VIEWPORT,
    state: defaultState,
  })
  const homeFrameSize = getFigmaCloneDomFrameSize({
    rootId: 'homePage',
    sectionViewport: FIGMA_CLONE_DEFAULT_SECTION_VIEWPORT,
    state: defaultState,
  })

  return [
    createFigmaCloneDomEditorFrameItem({
      frameSize: workspaceFrameSize,
      id: 'figma-dom-workspace-frame',
      rootId: 'workspacePage',
      title: 'Workspace section',
      x: 40,
      y: 76,
    }),
    createFigmaCloneDomEditorFrameItem({
      frameSize: homeFrameSize,
      id: 'figma-dom-home-frame',
      rootId: 'homePage',
      title: 'Homepage section',
      x: 40 + workspaceFrameSize.w + 96,
      y: 76,
    }),
  ]
}

export function createFigmaCloneDomEditorFrameModule({
  isSectionSelected,
  sectionViewport,
  selectedNodeId,
  state,
  textState,
  onSelectSection,
  onSelectNode,
  onChangeText,
}: FigmaCloneDomEditorFrameModuleOptions) {
  return defineCanvasAppCustomItemModule({
    id: FIGMA_CLONE_DOM_FRAME_KIND,
    presentation: FIGMA_CLONE_DOM_FRAME_PRESENTATION,
    renderItem: ({ item }) => {
      const rootId = getFigmaCloneDomFrameRootId(item.data)
      const frameSize = getFigmaCloneDomFrameSize({
        rootId,
        sectionViewport,
        state,
      })

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
              if (isDomEditCanvasPanTarget(event.target)) {
                return
              }

              event.stopPropagation()
            }}
          >
            <div className="figma-frame__label">
              Section · {formatFigmaCloneDomSectionName(rootId)} · {formatFigmaCloneSectionViewportLabel({
                rootId,
                sectionViewport,
                state,
              })}
            </div>
            <FigmaCloneDomEditSurface
              isSectionSelected={isSectionSelected(rootId)}
              rootId={rootId}
              sectionViewport={sectionViewport}
              selectedNodeId={selectedNodeId}
              state={state}
              textState={textState}
              onSelectSection={() => onSelectSection(rootId)}
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
      item.data.frameId === 'dom' &&
      isFigmaCloneDomSectionRootId(item.data.rootId),
  })
}

export function createFigmaCloneDomEditorCanvasModules(
  options: FigmaCloneDomEditorFrameModuleOptions,
) {
  return [createFigmaCloneDomEditorFrameModule(options)]
}

export function createFigmaCloneDomEditorFrameItem({
  frameSize,
  id,
  rootId,
  title,
  x,
  y,
}: {
  frameSize: ReturnType<typeof getFigmaCloneDomFrameSize>
  id: string
  rootId: FigmaCloneDomSectionRootId
  title: string
  x: number
  y: number
}): CanvasCustomItem {
  return {
    data: { frameId: 'dom', rootId } satisfies FigmaCloneDomFrameData,
    h: frameSize.h,
    id,
    kind: FIGMA_CLONE_DOM_FRAME_KIND,
    presentation: FIGMA_CLONE_DOM_FRAME_PRESENTATION,
    title,
    type: 'custom',
    w: frameSize.w,
    x,
    y,
  }
}
