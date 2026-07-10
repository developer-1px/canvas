import type { CanvasCustomItem } from '../../../src/canvas'
import {
  createFigmaCloneDomEditorCanvasItems,
  createFigmaCloneDomEditorFrameModule,
  type FigmaCloneDomEditorCanvasItemsOptions,
  type FigmaCloneDomEditorFrameModuleOptions,
} from './dom-editor'
export {
  FIGMA_CLONE_DEFAULT_SECTION_VIEWPORT,
  FIGMA_CLONE_DOM_FRAME_KIND,
  FIGMA_CLONE_DOM_FRAME_PRESENTATION,
  FIGMA_CLONE_DOM_SECTION_ROOT_IDS,
  FIGMA_CLONE_SECTION_VIEWPORT_PRESETS,
  clampFigmaCloneSectionViewportField,
  formatFigmaCloneDomSectionName,
  formatFigmaCloneSectionViewportLabel,
  getFigmaCloneDomFrameRootId,
  getFigmaCloneDomFrameSize,
  getFigmaCloneDomPageHeight,
  getFigmaCloneSectionRootIdForNode,
  isFigmaCloneDomSectionRootId,
  type FigmaCloneDomFrameData,
  type FigmaCloneDomSectionRootId,
  type FigmaCloneFrameId,
  type FigmaCloneSectionFrameMode,
  type FigmaCloneSectionOverflow,
  type FigmaCloneSectionViewport,
} from './dom-editor'
import {
  createFigmaCloneWidgetItem,
  FIGMA_CLONE_WIDGET_MODULE,
} from './widget/FigmaCloneWidgetModule'

export function createFigmaCloneCanvasItems(
  options?: FigmaCloneDomEditorCanvasItemsOptions,
): CanvasCustomItem[] {
  return [
    createFigmaCloneWidgetItem(),
    ...createFigmaCloneDomEditorCanvasItems(options),
  ]
}

export function createFigmaCloneCanvasModules(
  options: FigmaCloneDomEditorFrameModuleOptions,
) {
  return [
    FIGMA_CLONE_WIDGET_MODULE,
    createFigmaCloneDomEditorFrameModule(options),
  ]
}
