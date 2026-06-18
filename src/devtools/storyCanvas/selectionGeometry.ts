import {
  canvasViewportLayerSnapshot,
  type CanvasViewportLayerSnapshot,
} from './CanvasViewportBridge';
import {
  elementBoxSize,
  elementClipGeometry,
  elementScreenRect,
  STORY_CANVAS_PREVIEW_SELECTOR,
  type LayerElement,
} from './elementSelection';
import { queryStoryCanvasElement } from './storyCanvasDomBoundary';

type ScreenRectLike = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export type StorySelectionBox = {
  h: number;
  w: number;
  x: number;
  y: number;
};

export type StorySelectionGeometry = {
  boundsBox: StorySelectionBox;
  fillBox: StorySelectionBox | null;
  isClipped: boolean;
  size: {
    h: number;
    w: number;
  };
  transformBox: StorySelectionBox;
  visibleBox: StorySelectionBox | null;
};

export function getStorySelectionGeometry({
  element,
  selectedSnapshot,
  selectedStoryId,
  stage,
}: {
  element: LayerElement | null;
  selectedSnapshot: CanvasViewportLayerSnapshot | null;
  selectedStoryId: string;
  stage: HTMLElement;
}): StorySelectionGeometry | null {
  const preview = queryStoryCanvasElement(stage, `[data-story-id="${selectedStoryId}"] ${STORY_CANVAS_PREVIEW_SELECTOR}`);
  if (!preview) return null;

  if (!element?.isConnected) {
    const zoom = storyStageZoom(stage);
    const boundsBox = stageLocalBox(stage, preview.getBoundingClientRect());
    return {
      boundsBox,
      fillBox: null,
      isClipped: false,
      size: {
        h: Math.round(boundsBox.h / zoom),
        w: Math.round(boundsBox.w / zoom),
      },
      transformBox: boundsBox,
      visibleBox: null,
    };
  }

  const snapshot = canvasViewportLayerSnapshot(element) ?? selectedSnapshot;
  const liveGeometry = elementClipGeometry(element);
  const measuredGeometry = liveGeometry ?? snapshot?.geometry;
  const screenRect = measuredGeometry?.screenRect ?? elementScreenRect(element);
  const boundsBox = stageLocalBox(stage, screenRect);
  const visibleBox = measuredGeometry?.isClipped
    ? stageLocalBox(stage, measuredGeometry.visibleScreenRect)
    : null;

  return {
    boundsBox,
    fillBox: visibleBox ?? boundsBox,
    isClipped: Boolean(measuredGeometry?.isClipped),
    size: measuredGeometry?.size ?? elementBoxSize(element),
    transformBox: boundsBox,
    visibleBox,
  };
}

function storyStageZoom(stage: HTMLElement) {
  const transform = queryStoryCanvasElement(stage, 'svg g[transform]')?.getAttribute('transform') ?? '';
  return Number(transform.match(/scale\(([\d.]+)\)/)?.[1]) || 1;
}

function stageLocalBox(stage: HTMLElement, rect: ScreenRectLike): StorySelectionBox {
  const stageRect = stage.getBoundingClientRect();
  return {
    h: rect.height,
    w: rect.width,
    x: rect.left - stageRect.left,
    y: rect.top - stageRect.top,
  };
}
