import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import type { CanvasViewportLayerSnapshot } from './CanvasViewportBridge';
import {
  elementDescriptor,
  isInstanceElementForStory,
  type EdgeDistance,
  type LayerElement,
} from './elementSelection';
import { getStorySelectionGeometry } from './selectionGeometry';
import {
  StoryPreviewFrame,
  storyCanvasFrameForStory,
} from './StoryCanvasCard';
import type { StoryMeasurement } from './storyCanvasModel';
import {
  queryStoryCanvasElement,
  queryStoryCanvasElements,
} from './storyCanvasDomBoundary';
import {
  PREVIEW_INSET,
  PREVIEW_MAX_WIDTH,
  type StoryRecord,
} from './storyData';

const STORY_MEASURE_BATCH_DELAY_MS = 80;
const STORY_MEASURE_BATCH_SIZE = 48;

export function StoryElementDistanceLine({
  line,
  zoom,
}: {
  line: EdgeDistance;
  zoom: number;
}) {
  if (line.axis === 'x') {
    return (
      <div
        className="story-el-distance-x"
        style={distanceLineStyle(line)}
      >
        <span className="story-el-distance-label-x">{Math.round(line.length / zoom)}</span>
      </div>
    );
  }

  return (
    <div
      className="story-el-distance-y"
      style={distanceLineStyle(line)}
    >
      <span className="story-el-distance-label-y">{Math.round(line.length / zoom)}</span>
    </div>
  );
}

export function StorySelectionLayer({
  canvasKey,
  selectedElement,
  selectedSnapshot,
  selectedStoryId,
  stageRef,
  storyRecordById,
}: {
  canvasKey: string;
  selectedElement: LayerElement | null;
  selectedSnapshot: CanvasViewportLayerSnapshot | null;
  selectedStoryId: string | null;
  stageRef: RefObject<HTMLElement | null>;
  storyRecordById: Map<string, StoryRecord>;
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !selectedStoryId) return undefined;
    const bump = () => setTick((tick) => tick + 1);
    const observer = new MutationObserver(bump);
    let raf = 0;

    const attach = () => {
      const group = queryStoryCanvasElement(stage, 'svg g[transform]');
      if (!group) {
        raf = requestAnimationFrame(attach);
        return;
      }
      observer.observe(group, { attributeFilter: ['transform'], attributes: true });
      bump();
    };
    attach();
    stage.addEventListener('scroll', bump, true);
    window.addEventListener('resize', bump);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      stage.removeEventListener('scroll', bump, true);
      window.removeEventListener('resize', bump);
    };
  }, [canvasKey, selectedStoryId, stageRef]);

  const stage = stageRef.current;
  if (!stage || !selectedStoryId) return null;

  const element = selectedElement?.isConnected ? selectedElement : null;
  const geometry = getStorySelectionGeometry({
    element,
    selectedSnapshot,
    selectedStoryId,
    stage,
  });
  if (!geometry) return null;
  const fillStyle = geometry.fillBox ? storySelectionBoxStyle(geometry.fillBox) : null;
  const story = storyRecordById.get(selectedStoryId);
  const isInstance = Boolean(element && story && isInstanceElementForStory(element, story.path));
  const isClipped = geometry.isClipped;
  const label = element ? selectedLayerLabel(element) : story?.name ?? 'Frame';
  const size = geometry.size;
  const transformBox = geometry.transformBox;

  return (
    <div className="story-selection-layer" aria-hidden="true">
      {fillStyle ? <div className={isInstance ? 'story-el-selected__visible--instance' : 'story-el-selected__visible'} style={fillStyle} /> : null}
      {isInstance ? (
        <div
          className={isClipped ? 'story-el-selected--instance-clipped' : 'story-el-selected--instance'}
          style={storySelectionBoxStyle(transformBox)}
        >
          <SelectionHandles />
          <span className="story-el-selected__label--instance">{label} · instance</span>
          <span className="story-el-selected__size--instance">{size.w} × {size.h}</span>
        </div>
      ) : (
        <div
          className={isClipped ? 'story-el-selected--clipped' : 'story-el-selected'}
          style={storySelectionBoxStyle(transformBox)}
        >
          <SelectionHandles />
          <span className="story-el-selected__label">{label}</span>
          <span className="story-el-selected__size">{size.w} × {size.h}</span>
        </div>
      )}
    </div>
  );
}

function selectedLayerLabel(element: LayerElement) {
  const descriptor = elementDescriptor(element);
  return descriptor.component || descriptor.tag;
}

function SelectionHandles() {
  return (
    <>
      <i className="story-el-handle--nw" />
      <i className="story-el-handle--ne" />
      <i className="story-el-handle--sw" />
      <i className="story-el-handle--se" />
    </>
  );
}

export function StoryMeasureLayer({
  onMeasured,
  stories,
}: {
  stories: StoryRecord[];
  onMeasured: (measurements: StoryMeasurement[]) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const measuringStories = useMemo(() => stories.slice(0, STORY_MEASURE_BATCH_SIZE), [stories]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const timer = window.setTimeout(() => {
      const measurements: StoryMeasurement[] = [];
      for (const box of queryStoryCanvasElements(root, '[data-measure-story]')) {
        const storyId = box.getAttribute('data-measure-story');
        if (!storyId || !(box instanceof HTMLElement)) continue;
        const visualSize = measuredStoryVisualSize(box);
        measurements.push({
          storyId,
          size: {
            h: Math.min(Math.max(visualSize.h + PREVIEW_INSET * 2, 24), 1600),
            w: Math.min(Math.max(visualSize.w + PREVIEW_INSET * 2, 24), PREVIEW_MAX_WIDTH),
          },
        });
      }

      onMeasured(measurements);
    }, STORY_MEASURE_BATCH_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [measuringStories, onMeasured]);

  return (
    <div className="story-canvas-measure-offscreen" aria-hidden="true" ref={rootRef}>
      {measuringStories.map((story) => {
        const frame = storyCanvasFrameForStory(story);
        return (
          <div
            data-frame={frame}
            data-measure-story={story.id}
            key={story.id}
          >
            <StoryPreviewFrame frame={frame} mode="measure">
              {story.preview}
            </StoryPreviewFrame>
          </div>
        );
      })}
    </div>
  );
}

function measuredStoryVisualSize(root: HTMLElement) {
  const origin = root.getBoundingClientRect();
  let minLeft = Number.POSITIVE_INFINITY;
  let minTop = Number.POSITIVE_INFINITY;
  let maxRight = Number.NEGATIVE_INFINITY;
  let maxBottom = Number.NEGATIVE_INFINITY;

  for (const element of queryStoryCanvasElements(root, '*')) {
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') continue;

    for (const rect of Array.from(element.getClientRects())) {
      if (rect.width === 0 && rect.height === 0) continue;
      minLeft = Math.min(minLeft, rect.left - origin.left);
      minTop = Math.min(minTop, rect.top - origin.top);
      maxRight = Math.max(maxRight, rect.right - origin.left);
      maxBottom = Math.max(maxBottom, rect.bottom - origin.top);
    }
  }

  if (!Number.isFinite(minLeft) || !Number.isFinite(minTop) || !Number.isFinite(maxRight) || !Number.isFinite(maxBottom)) {
    return {
      h: root.offsetHeight,
      w: root.offsetWidth,
    };
  }

  return {
    h: Math.ceil(maxBottom - minTop),
    w: Math.ceil(maxRight - minLeft),
  };
}

function distanceLineStyle(line: EdgeDistance): CSSProperties {
  if (line.axis === 'x') {
    return {
      left: line.from.x,
      top: line.from.y,
      width: line.length,
    };
  }

  return {
    height: line.length,
    left: line.from.x,
    top: line.from.y,
  };
}

function storySelectionBoxStyle(box: { h: number; w: number; x: number; y: number }): CSSProperties {
  return {
    height: box.h,
    left: box.x,
    top: box.y,
    width: box.w,
  };
}
