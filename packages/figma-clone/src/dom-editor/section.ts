import type { CanvasJsonObject } from '../../../../src/canvas'
import {
  getFigmaCloneDomEditStyle,
  getFigmaCloneDomRootId,
  type FigmaCloneDomEditState,
  type FigmaCloneDomNode,
  type FigmaCloneDomNodeId,
} from '../dom-edit/FigmaCloneDomEditModel'

export type FigmaCloneFrameId = 'dom' | 'widget'

export const FIGMA_CLONE_DOM_SECTION_ROOT_IDS = [
  'workspacePage',
  'homePage',
] as const

export type FigmaCloneDomSectionRootId =
  typeof FIGMA_CLONE_DOM_SECTION_ROOT_IDS[number]

export type FigmaCloneSectionFrameMode = 'mock' | 'page'
export type FigmaCloneSectionOverflow = 'clip' | 'scroll'

export type FigmaCloneSectionViewport = {
  frameMode: FigmaCloneSectionFrameMode
  h: number
  overflow: FigmaCloneSectionOverflow
  w: number
}

export type FigmaCloneDomFrameData = CanvasJsonObject & {
  frameId: 'dom'
  rootId: FigmaCloneDomSectionRootId
}

export const FIGMA_CLONE_DOM_FRAME_KIND = 'figma-clone-dom-frame'
export const FIGMA_CLONE_DOM_FRAME_PRESENTATION = 'figma-clone-dom-frame-card'

export const FIGMA_CLONE_SECTION_VIEWPORT_PRESETS = [
  { id: 'desktop', label: 'Desktop', w: 1440, h: 900 },
  { id: 'laptop', label: 'Laptop', w: 1280, h: 800 },
  { id: 'tablet', label: 'Tablet', w: 768, h: 1024 },
  { id: 'mobile', label: 'Mobile', w: 390, h: 844 },
] as const

export const FIGMA_CLONE_DEFAULT_SECTION_VIEWPORT = {
  frameMode: 'page',
  h: 800,
  overflow: 'scroll',
  w: 1280,
} satisfies FigmaCloneSectionViewport

export function isFigmaCloneDomSectionRootId(
  value: unknown,
): value is FigmaCloneDomSectionRootId {
  return FIGMA_CLONE_DOM_SECTION_ROOT_IDS.some((rootId) => rootId === value)
}

export function getFigmaCloneSectionRootIdForNode(
  nodeId: FigmaCloneDomNodeId,
  nodes?: readonly FigmaCloneDomNode[],
): FigmaCloneDomSectionRootId {
  const rootId = getFigmaCloneDomRootId(nodeId, nodes)

  return isFigmaCloneDomSectionRootId(rootId) ? rootId : 'workspacePage'
}

export function getFigmaCloneDomFrameRootId(
  data: CanvasJsonObject,
): FigmaCloneDomSectionRootId {
  return isFigmaCloneDomSectionRootId(data.rootId)
    ? data.rootId
    : 'workspacePage'
}

export function getFigmaCloneDomFrameSize({
  rootId,
  sectionViewport,
  state,
}: {
  rootId: FigmaCloneDomSectionRootId
  sectionViewport: FigmaCloneSectionViewport
  state: FigmaCloneDomEditState
}) {
  const sectionHeight = sectionViewport.frameMode === 'mock'
    ? sectionViewport.h
    : getFigmaCloneDomPageHeight(rootId, state)

  return {
    h: sectionHeight + FIGMA_CLONE_DOM_FRAME_PAD * 2,
    w: sectionViewport.w + FIGMA_CLONE_DOM_FRAME_PAD * 2,
  }
}

export function formatFigmaCloneDomSectionName(
  rootId: FigmaCloneDomSectionRootId,
) {
  return rootId === 'homePage' ? 'Editorial homepage' : 'Workspace page'
}

export function formatFigmaCloneSectionViewportLabel({
  rootId,
  sectionViewport,
  state,
}: {
  rootId: FigmaCloneDomSectionRootId
  sectionViewport: FigmaCloneSectionViewport
  state: FigmaCloneDomEditState
}) {
  if (sectionViewport.frameMode === 'mock') {
    const overflow = sectionViewport.overflow === 'scroll' ? 'Scroll' : 'Clip'

    return `Mock · ${sectionViewport.w} × ${sectionViewport.h} · ${overflow}`
  }

  return `Page · ${sectionViewport.w} × ${getFigmaCloneDomPageHeight(
    rootId,
    state,
  )} Hug`
}

export function clampFigmaCloneSectionViewportField(
  field: 'h' | 'w',
  value: number,
) {
  const min = field === 'w' ? 320 : 360
  const max = field === 'w' ? 1920 : 1400
  const finite = Number.isFinite(value)
    ? value
    : FIGMA_CLONE_DEFAULT_SECTION_VIEWPORT[field]

  return Math.min(max, Math.max(min, Math.round(finite)))
}

export function getFigmaCloneDomPageHeight(
  rootId: FigmaCloneDomSectionRootId,
  state: FigmaCloneDomEditState,
) {
  const style = getFigmaCloneDomEditStyle(state, rootId)
  const measuredDefaultHeight = rootId === 'homePage' ? 1948 : style.h

  return Math.max(style.h, measuredDefaultHeight)
}

const FIGMA_CLONE_DOM_FRAME_PAD = 56
