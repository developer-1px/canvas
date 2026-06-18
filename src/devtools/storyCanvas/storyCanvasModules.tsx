import { useSyncExternalStore, type CSSProperties } from 'react';
import {
  CANVAS_APP_READ_ONLY_CAPABILITIES,
  CANVAS_STORY_CANVAS_SUITE_ID,
  DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  type CanvasAppAssemblyInput,
  type CanvasWorkspaceStorageProvider,
  createCanvasAppFeaturePackProfile,
  createCanvasStoryCanvasFeaturePackAssemblyInput,
  createCanvasStoryPreviewItemsFeaturePackManifest,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackProfile,
  type CanvasStoryPreviewGroupRenderInput,
  type CanvasStoryPreviewItemRenderInput,
} from '../../canvas';
import type { CanvasViewportLayerSnapshot } from './CanvasViewportBridge';
import StoryCanvasCard from './StoryCanvasCard';
import type { StoryElementSelection, StoryTreeHover } from './storyCanvasModel';
import type { StoryRecord } from './storyData';
import type { LayerElement } from './elementSelection';

const storyGroupForeignObjectStyle: CSSProperties = {
  pointerEvents: 'none',
};

function renderStoryGroupItem({
  count,
  groupLabel,
  item,
}: CanvasStoryPreviewGroupRenderInput) {
  return (
    <foreignObject x={item.x} y={item.y} width={item.w} height={item.h} style={storyGroupForeignObjectStyle}>
      <div className="story-group">
        <span className="story-group__label">
          ◆ {groupLabel}
          <em>{count ?? ''}</em>
        </span>
      </div>
    </foreignObject>
  );
}

export const STORY_CANVAS_AFFORDANCE_CONFIG: CanvasAppAssemblyInput['affordanceConfig'] = {
  gestures: {
    createArrow: false,
    createComment: false,
    createCustom: false,
    createSection: false,
    createShape: false,
    createSticky: false,
    createText: false,
    drawHighlight: false,
    drawMarker: false,
    drawPath: false,
    eraseDrawing: false,
    marquee: true,
    move: false,
    pan: true,
    resize: false,
    temporaryPan: true,
    wheelZoom: true,
  },
  overlays: {
    alignmentGuides: false,
    commandPalette: false,
    componentPalette: false,
    cursorChat: false,
    draftArrow: false,
    draftRect: false,
    draftStroke: false,
    drawingControls: false,
    emoteBursts: false,
    emoteControls: false,
    findReplace: false,
    grid: true,
    imageControls: false,
    inspector: false,
    itemOutline: true,
    marquee: true,
    presence: false,
    presentationMode: false,
    resizeHandles: false,
    selectionBounds: true,
    sessionTimer: false,
    spacingGuides: false,
    spotlight: false,
    stampControls: false,
    stickyQuickCreate: false,
    status: false,
    textEditor: false,
    toolbar: false,
    votingSession: false,
    zoomControls: true,
  },
  shortcuts: {
    arrowTool: false,
    commandPalette: false,
    commentTool: false,
    copy: false,
    cut: false,
    delete: false,
    duplicate: false,
    ellipseTool: false,
    eraserTool: false,
    findReplace: false,
    highlighterTool: false,
    markerTool: false,
    paste: false,
    penTool: false,
    quickCreateSticky: false,
    rectTool: false,
    redo: false,
    selectAll: false,
    stickyTool: false,
    textTool: false,
    undo: false,
    zoomIn: true,
    zoomOut: true,
    zoomReset: true,
  },
  tools: {
    arrow: false,
    comment: false,
    diamond: false,
    ellipse: false,
    eraser: false,
    highlight: false,
    marker: false,
    pan: true,
    pen: false,
    rect: false,
    section: false,
    select: true,
    sticky: false,
    text: false,
  },
};

export const STORY_CANVAS_FEATURE_PACK_PROFILE: CanvasAppFeaturePackProfile =
  createCanvasAppFeaturePackProfile({
    id: 'story-canvas-runtime',
    installedFeaturePackIds: [
      'component-library',
      'component-source-outline',
      'zoom-controls',
    ],
    installedSuiteIds: [CANVAS_STORY_CANVAS_SUITE_ID],
    label: 'Story canvas runtime',
    suiteManifests: DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  });

type StoryViewState = {
  elementSelection: StoryElementSelection | null;
  favoriteStoryIds: Set<string>;
  selectedStoryId: string | null;
  treeHover: StoryTreeHover | null;
};

export function createStoryViewStore() {
  let state: StoryViewState = {
    elementSelection: null,
    favoriteStoryIds: new Set(),
    selectedStoryId: null,
    treeHover: null,
  };
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (next: StoryViewState) => {
      state = next;
      for (const listener of listeners) listener();
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

type StoryViewStore = ReturnType<typeof createStoryViewStore>;

type StoryPreviewRendererInput = {
  store: StoryViewStore;
  storyRecordById: Map<string, StoryRecord>;
  onSelectElement: (storyId: string, element: LayerElement | null, snapshot?: CanvasViewportLayerSnapshot | null) => void;
  onSelectStory: (storyId: string) => void;
  onToggleFavorite: (storyId: string) => void;
};

export type StoryCanvasRuntimeAssemblyInput = StoryPreviewRendererInput & Readonly<{
  componentDefinitions: NonNullable<CanvasAppAssemblyInput['componentDefinitions']>;
  initialItems: NonNullable<CanvasAppAssemblyInput['initialItems']>;
  initialSelection?: CanvasAppAssemblyInput['initialSelection'];
  workspaceStorageProvider: CanvasWorkspaceStorageProvider;
}>;

function StoryCanvasCardContainer({
  onSelectElement,
  onSelectStory,
  onToggleFavorite,
  store,
  story,
}: {
  store: StoryViewStore;
  story?: StoryRecord;
  onSelectElement: (storyId: string, element: LayerElement | null, snapshot?: CanvasViewportLayerSnapshot | null) => void;
  onSelectStory: (storyId: string) => void;
  onToggleFavorite: (storyId: string) => void;
}) {
  const snapshot = useSyncExternalStore(store.subscribe, () => {
    const state = store.getState();
    if (!story) return '';
    const elementVersion = state.elementSelection?.storyId === story.id ? state.elementSelection.version : 0;
    const treeHoverVersion = state.treeHover?.storyId === story.id ? state.treeHover.version : 0;
    return `${state.selectedStoryId === story.id ? 1 : 0}${state.favoriteStoryIds.has(story.id) ? 1 : 0}|${elementVersion}|${treeHoverVersion}`;
  });
  const state = store.getState();
  const selectedElement = story && state.elementSelection?.storyId === story.id ? state.elementSelection.element : null;
  const treeHover = story && state.treeHover?.storyId === story.id ? state.treeHover : null;

  return (
    <StoryCanvasCard
      isFavorite={snapshot[1] === '1'}
      isSelected={snapshot[0] === '1'}
      selectedElement={selectedElement}
      story={story}
      treeHoverElement={treeHover ? treeHover.element ?? 'frame' : null}
      onSelectElement={onSelectElement}
      onSelectStory={onSelectStory}
      onToggleFavorite={onToggleFavorite}
    />
  );
}

function createStoryPreviewItemRenderer({
  onSelectElement,
  onSelectStory,
  onToggleFavorite,
  storyRecordById,
  store,
}: StoryPreviewRendererInput) {
  return ({ item, storyId }: CanvasStoryPreviewItemRenderInput) => {
    const story = storyRecordById.get(storyId);

    return (
      <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
        <StoryCanvasCardContainer
          store={store}
          story={story}
          onSelectElement={onSelectElement}
          onSelectStory={onSelectStory}
          onToggleFavorite={onToggleFavorite}
        />
      </foreignObject>
    );
  };
}

export function createStoryPreviewFeaturePackManifest({
  onSelectElement,
  onSelectStory,
  onToggleFavorite,
  storyRecordById,
  store,
}: {
  store: StoryViewStore;
  storyRecordById: Map<string, StoryRecord>;
  onSelectElement: (storyId: string, element: LayerElement | null, snapshot?: CanvasViewportLayerSnapshot | null) => void;
  onSelectStory: (storyId: string) => void;
  onToggleFavorite: (storyId: string) => void;
}): CanvasAppFeaturePackManifest {
  return createCanvasStoryPreviewItemsFeaturePackManifest({
    renderGroupItem: renderStoryGroupItem,
    renderPreviewItem: createStoryPreviewItemRenderer({
      onSelectElement,
      onSelectStory,
      onToggleFavorite,
      storyRecordById,
      store,
    }),
  });
}

export function createStoryCanvasRuntimeAssemblyInput({
  componentDefinitions,
  initialItems,
  initialSelection = [],
  onSelectElement,
  onSelectStory,
  onToggleFavorite,
  storyRecordById,
  store,
  workspaceStorageProvider,
}: StoryCanvasRuntimeAssemblyInput): CanvasAppAssemblyInput {
  const featurePackAssemblyInput = createCanvasStoryCanvasFeaturePackAssemblyInput({
    assemblyInput: {
      featurePackProfile: STORY_CANVAS_FEATURE_PACK_PROFILE,
    },
    renderGroupItem: renderStoryGroupItem,
    renderPreviewItem: createStoryPreviewItemRenderer({
      onSelectElement,
      onSelectStory,
      onToggleFavorite,
      storyRecordById,
      store,
    }),
  });

  return Object.freeze({
    ...featurePackAssemblyInput,
    affordanceConfig: STORY_CANVAS_AFFORDANCE_CONFIG,
    capabilities: CANVAS_APP_READ_ONLY_CAPABILITIES,
    componentDefinitions,
    initialItems,
    initialSelection,
    workspaceStorageProvider,
  });
}
