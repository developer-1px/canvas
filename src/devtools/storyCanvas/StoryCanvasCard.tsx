import {
  forwardRef,
  memo,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { observeBrowserIntersection } from '../support/browserIntersectionObserver';
import {
  canvasViewportHitSnapshotFromEvent,
  type CanvasViewportLayerSnapshot,
} from './CanvasViewportBridge';
import {
  elementDepth,
  resolveFigmaClickTarget,
  type LayerElement,
} from './elementSelection';
import StoryElementOverlay from './StoryElementOverlay';
import StoryPreviewBoundary from './StoryPreviewBoundary';
import type { StoryRecord } from './storyData';
import Icon from '../support/StoryCanvasIcon';

type StoryCardFrame = 'default' | 'dialog' | 'responsive' | 'section' | 'table';
const STORY_PREVIEW_LAZY_MARGIN = '1200px';

function normalizeStoryCardFrame(cardFrame: string): StoryCardFrame {
  if (cardFrame === 'dialog') return 'dialog';
  if (cardFrame === 'responsive') return 'responsive';
  if (cardFrame === 'section') return 'section';
  if (cardFrame === 'table') return 'table';
  return 'default';
}

export function storyCanvasFrameForStory(story: StoryRecord) {
  return story.responsiveViewport ? 'responsive' : story.previewFrame ?? 'default';
}

const StoryCanvasCardArticle = forwardRef<HTMLElement, Omit<HTMLAttributes<HTMLElement>, 'className'> & { active: boolean; cardFrame: string }>(function StoryCanvasCardArticle({
  active,
  cardFrame,
  ...props
}, ref) {
  const frame = normalizeStoryCardFrame(cardFrame);
  if (frame === 'dialog') return active ? <article className="story-canvas-card--dialog-active" data-story-card="" ref={ref} {...props} /> : <article className="story-canvas-card--dialog" data-story-card="" ref={ref} {...props} />;
  if (frame === 'responsive') return active ? <article className="story-canvas-card--responsive-active" data-story-card="" ref={ref} {...props} /> : <article className="story-canvas-card--responsive" data-story-card="" ref={ref} {...props} />;
  if (frame === 'section') return active ? <article className="story-canvas-card--section-active" data-story-card="" ref={ref} {...props} /> : <article className="story-canvas-card--section" data-story-card="" ref={ref} {...props} />;
  if (frame === 'table') return active ? <article className="story-canvas-card--table-active" data-story-card="" ref={ref} {...props} /> : <article className="story-canvas-card--table" data-story-card="" ref={ref} {...props} />;
  return active ? <article className="story-canvas-card--default-active" data-story-card="" ref={ref} {...props} /> : <article className="story-canvas-card--default" data-story-card="" ref={ref} {...props} />;
});

function StoryCanvasCardPreview({
  cardFrame,
  hot,
  ...props
}: Omit<HTMLAttributes<HTMLDivElement>, 'className'> & { cardFrame: string; hot: boolean }) {
  const frame = normalizeStoryCardFrame(cardFrame);
  if (frame === 'dialog') return hot ? <div className="story-canvas-card__preview--dialog-hot" data-story-preview="" {...props} /> : <div className="story-canvas-card__preview--dialog" data-story-preview="" {...props} />;
  if (frame === 'responsive') return hot ? <div className="story-canvas-card__preview--responsive-hot" data-story-preview="" {...props} /> : <div className="story-canvas-card__preview--responsive" data-story-preview="" {...props} />;
  if (frame === 'section') return hot ? <div className="story-canvas-card__preview--section-hot" data-story-preview="" {...props} /> : <div className="story-canvas-card__preview--section" data-story-preview="" {...props} />;
  if (frame === 'table') return hot ? <div className="story-canvas-card__preview--table-hot" data-story-preview="" {...props} /> : <div className="story-canvas-card__preview--table" data-story-preview="" {...props} />;
  return hot ? <div className="story-canvas-card__preview--default-hot" data-story-preview="" {...props} /> : <div className="story-canvas-card__preview--default" data-story-preview="" {...props} />;
}

function StoryCanvasCardLabel({
  selected,
  ...props
}: Omit<HTMLAttributes<HTMLDivElement>, 'className'> & { selected: boolean }) {
  if (selected) return <div className="story-canvas-card__label--selected" {...props} />;
  return <div className="story-canvas-card__label" {...props} />;
}

export function StoryPreviewFrame({ children, frame, mode = 'preview' }: { children: ReactNode; frame: string; mode?: 'measure' | 'preview' }) {
  const normalizedFrame = normalizeStoryCardFrame(frame);
  if (mode === 'measure') {
    if (normalizedFrame === 'dialog') return <div className="story-canvas-measure-frame--dialog">{children}</div>;
    if (normalizedFrame === 'responsive') return <div className="story-canvas-measure-frame--responsive">{children}</div>;
    if (normalizedFrame === 'section') return <div className="story-canvas-measure-frame--section">{children}</div>;
    if (normalizedFrame === 'table') return <div className="story-canvas-measure-frame--table">{children}</div>;
    return <div className="story-canvas-measure-frame--default">{children}</div>;
  }

  if (normalizedFrame === 'dialog') return <div className="story-preview-frame--dialog">{children}</div>;
  if (normalizedFrame === 'responsive') return <div className="story-preview-frame--responsive">{children}</div>;
  if (normalizedFrame === 'section') return <div className="story-preview-frame--section">{children}</div>;
  if (normalizedFrame === 'table') return <div className="story-preview-frame--table">{children}</div>;
  return <div className="story-preview-frame--default">{children}</div>;
}

function resolveCanvasViewportClickTarget(
  chain: CanvasViewportLayerSnapshot[],
  previewRoot: Element,
  selectedElement: LayerElement | null,
  deep: boolean,
) {
  if (chain.length === 0) return null;
  if (deep) return chain[chain.length - 1];
  if (!selectedElement) return chain[0];

  const selectedIndex = chain.findIndex((snapshot) => snapshot.element === selectedElement);
  if (selectedIndex >= 0) return chain[Math.min(selectedIndex + 1, chain.length - 1)];

  const depth = elementDepth(selectedElement, previewRoot);
  return chain[Math.min(Math.max(depth, 1), chain.length) - 1];
}

const StoryCanvasCard = memo(function StoryCanvasCard({
  isFavorite,
  isSelected,
  onSelectElement,
  onSelectStory,
  onToggleFavorite,
  selectedElement,
  story,
  treeHoverElement,
}: {
  isFavorite: boolean;
  isSelected: boolean;
  selectedElement: LayerElement | null;
  story?: StoryRecord;
  treeHoverElement: LayerElement | 'frame' | null;
  onSelectElement: (storyId: string, element: LayerElement | null, snapshot?: CanvasViewportLayerSnapshot | null) => void;
  onSelectStory: (storyId: string) => void;
  onToggleFavorite: (storyId: string) => void;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const [hover, setHover] = useState<{ alt: boolean; element: LayerElement } | null>(null);
  const [, setOverlayTick] = useState(0);
  const elementMode = isSelected && Boolean(story);
  const previewMounted = useStoryPreviewMounted(cardRef, Boolean(isSelected || treeHoverElement));

  useEffect(() => {
    if (!elementMode) setHover(null);
  }, [elementMode]);

  if (!story) {
    return <div className="story-canvas-card-missing" />;
  }

  const iframeGated = Boolean(story.responsiveViewport && !isSelected);
  const frameHover = treeHoverElement === 'frame';
  const active = isSelected || frameHover;
  const cardFrame = storyCanvasFrameForStory(story);
  const selectStory = () => onSelectStory(story.id);
  const toggleFavorite = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleFavorite(story.id);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    selectStory();
  };

  const handlePreviewClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!elementMode) return;
    event.stopPropagation();
    event.preventDefault();
    const viewportHit = canvasViewportHitSnapshotFromEvent(event.nativeEvent);
    const snapshotTarget = viewportHit
      ? resolveCanvasViewportClickTarget(
        viewportHit.chain,
        event.currentTarget,
        selectedElement,
        event.metaKey || event.ctrlKey,
      )
      : null;
    const target = snapshotTarget?.element ?? resolveFigmaClickTarget(
      event.currentTarget,
      event.clientX,
      event.clientY,
      selectedElement,
      event.metaKey || event.ctrlKey,
    );
    onSelectElement(story.id, target, snapshotTarget);
  };

  const handlePreviewMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!elementMode) return;
    const viewportHit = canvasViewportHitSnapshotFromEvent(event.nativeEvent);
    const snapshotTarget = viewportHit
      ? resolveCanvasViewportClickTarget(
        viewportHit.chain,
        event.currentTarget,
        selectedElement,
        event.metaKey || event.ctrlKey,
      )
      : null;
    const target = snapshotTarget?.element ?? resolveFigmaClickTarget(
      event.currentTarget,
      event.clientX,
      event.clientY,
      selectedElement,
      event.metaKey || event.ctrlKey,
    );
    setHover(target ? { alt: event.altKey, element: target } : null);
  };

  return (
    <StoryCanvasCardArticle
      active={active}
      aria-label={`${story.name} story preview`}
      aria-pressed={isSelected}
      cardFrame={cardFrame}
      data-selected={isSelected ? 'true' : 'false'}
      data-story-id={story.id}
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={(event) => {
        event.stopPropagation();
        selectStory();
      }}
      onKeyDown={handleKeyDown}
    >
      <StoryCanvasCardLabel selected={isSelected} title={story.path}>
        <button
          aria-label={isFavorite ? `${story.name} favorite 해제` : `${story.name} favorite 추가`}
          aria-pressed={isFavorite}
          className={isFavorite ? 'story-canvas-favorite--active' : 'story-canvas-favorite'}
          title={isFavorite ? 'Favorite 해제' : 'Favorite 추가'}
          type="button"
          onClick={toggleFavorite}
        >
          <Icon
            className="story-canvas-favorite-icon"
            includeBaseClass={false}
            name="star"
            svgClassName={isFavorite ? 'story-canvas-favorite-icon-svg--active' : 'story-canvas-favorite-icon-svg'}
          />
        </button>
        <span className="story-canvas-card__name">{story.name}</span>
      </StoryCanvasCardLabel>
      <StoryCanvasCardPreview
        cardFrame={cardFrame}
        hot={frameHover && !isSelected}
        onClickCapture={handlePreviewClick}
        onFocusCapture={(event) => {
          if (event.target instanceof HTMLElement) event.target.blur();
        }}
        onKeyDownCapture={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onMouseLeave={() => setHover(null)}
        onMouseMove={handlePreviewMouseMove}
        onScroll={() => setOverlayTick((tick) => tick + 1)}
      >
        {previewMounted ? (
          <StoryPreviewBoundary storyId={story.id}>
            <StoryPreviewFrame frame={cardFrame}>
              {story.preview}
            </StoryPreviewFrame>
          </StoryPreviewBoundary>
        ) : (
          <StoryCanvasPreviewPlaceholder />
        )}
        {previewMounted && iframeGated ? <div className="story-page-iframe-gate" aria-hidden="true" /> : null}
      </StoryCanvasCardPreview>
      {elementMode || (treeHoverElement && treeHoverElement !== 'frame') ? (
        <StoryElementOverlay
          cardRoot={cardRef.current}
          hoverElement={hover?.element ?? (treeHoverElement !== 'frame' ? treeHoverElement : null)}
          selectedElement={elementMode ? selectedElement : null}
          showDistances={Boolean(hover?.alt)}
          storyPath={story.path}
        />
      ) : null}
    </StoryCanvasCardArticle>
  );
});

function StoryCanvasPreviewPlaceholder() {
  return <div className="story-canvas-preview-placeholder" aria-hidden="true" />;
}

function useStoryPreviewMounted(rootRef: RefObject<HTMLElement | null>, forceMounted: boolean) {
  const [mounted, setMounted] = useState(forceMounted);

  useEffect(() => {
    if (forceMounted) {
      setMounted(true);
      return undefined;
    }
    if (mounted) return undefined;

    const root = rootRef.current;
    if (!root) return undefined;

    return observeBrowserIntersection(root, (entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setMounted(true);
      observer.disconnect();
    }, { rootMargin: STORY_PREVIEW_LAZY_MARGIN }, () => setMounted(true));
  }, [forceMounted, mounted, rootRef]);

  return mounted;
}

export default StoryCanvasCard;
