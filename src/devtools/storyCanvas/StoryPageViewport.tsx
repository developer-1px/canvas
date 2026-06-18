import { useCallback, useMemo, useRef, type CSSProperties } from 'react';
import CanvasViewport, { type CanvasViewportFrameRenderer } from './CanvasViewport';
import { mountStoryPageFrame, type StoryFrameConfig } from './storyFrameRenderer';

type StoryPageViewportInfo = {
  h: number;
  id: string;
  label: string;
  order: number;
  w: number;
};

export default function StoryPageViewport({
  modulePath,
  routePath,
  storyExport,
  storyPath,
  viewport,
}: {
  modulePath: string;
  routePath: string;
  storyExport: string;
  storyPath: string;
  viewport: StoryPageViewportInfo;
}) {
  const frameIdRef = useRef(`story-frame-${Math.random().toString(36).slice(2)}`);
  const frameConfig = useMemo<StoryFrameConfig>(() => ({
    frameId: frameIdRef.current,
    modulePath,
    routePath,
    storyExport,
    storyPath,
    viewportHeight: 0,
    viewportWidth: viewport.w,
  }), [modulePath, routePath, storyExport, storyPath, viewport.w]);
  const renderFrame = useCallback<CanvasViewportFrameRenderer>(({ frameDocument, reportError }) => {
    return mountStoryPageFrame(frameDocument, frameConfig, { onError: reportError });
  }, [frameConfig]);
  const viewportStyle = {
    '--story-page-viewport-height': `${viewport.h}px`,
    '--story-page-viewport-width': `${viewport.w}px`,
  } as CSSProperties;

  return (
    <CanvasViewport
      autoHeight
      errorAttribute="data-story-page-error"
      frameId={frameIdRef.current}
      readyAttribute="data-story-page-ready"
      renderFrame={renderFrame}
      style={viewportStyle}
      title={`${storyPath} · ${viewport.label}`}
    />
  );
}
