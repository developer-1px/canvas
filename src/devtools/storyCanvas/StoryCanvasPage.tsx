import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import { useTranslation } from '../support/storyCanvasLanguage';
import {
  CANVAS_APP_READ_ONLY_CAPABILITIES,
  CanvasApp,
  type CanvasAppAssemblyInput,
  type CanvasItem,
  type CanvasWorkspaceStorageProvider,
} from '../../canvas';
import {
  bridgeFavoriteEntries,
  bridgeNoteEntries,
  favoritesFromBridgeSnapshot,
  isBridgeEnabled,
  notesFromBridgeSnapshot,
  pushBridgeSnapshot,
  readBridgeSnapshot,
  storyBridgePayload,
} from './bridgeClient';
import {
  ROUTE_PAGE_INFOS,
  STORY_RECORDS,
  filterStories,
  isHuggableStory,
  loadEntityStoryRecords,
  loadFoundationStoryRecords,
  loadStoryRecords,
  type StoryRecord,
  type StoryReviewNotes,
} from './storyData';
import {
  INITIAL_STORY_CANVAS_VIEWPORT,
  createStoryBoard,
  parseStoryWorkspaceState,
  serializeStoryWorkspace,
} from './storyBoard';
import {
  canvasViewportLayerSnapshot,
  type CanvasViewportLayerSnapshot,
} from './CanvasViewportBridge';
import { copyText } from '../support/browserClipboard';
import {
  edgeDistances,
  elementBoxSize,
  elementClipGeometry,
  elementDescriptor,
  findLayerElementByLocator,
  layerElementLocator,
  parentAnnotated,
  STORY_CANVAS_PREVIEW_SELECTOR,
  type EdgeDistance,
  type LayerElement,
} from './elementSelection';
import StoryCanvasInspector, { StoryCanvasToolbar } from './StoryCanvasInspector';
import StoryCanvasShell from './StoryCanvasShell';
import {
  StoryElementDistanceLine,
  StoryMeasureLayer,
  StorySelectionLayer,
} from './StoryCanvasSelectionLayer';
import StoryLayersPanel, {
  DEFAULT_STORY_LAYERS_PANEL_TEXT,
  type StoryLayersPanelText,
} from './StoryLayersPanel';
import {
  STORY_CANVAS_AFFORDANCE_CONFIG,
  createStoryPreviewModules,
  createStoryViewStore,
} from './storyCanvasModules';
import {
  DEFAULT_STORY_PAGE_PATH,
  ENTITY_PAGE_PATH,
  FOUNDATION_PAGE_PATH,
  createEntityStoryCanvasPages,
  createFoundationStoryCanvasPages,
  createStoryCanvasPages,
  entityFolderFromStoryPath,
  foundationFolderFromStoryPath,
  isEntityStoryRecord,
  isFoundationStoryRecord,
} from './storyCanvasPages';
import {
  canvasItemsBounds,
  elementInstanceTarget,
  isStoryCanvasContentItem,
  paddedCanvasBounds,
  sourceReferenceForSelection,
  type CameraFocusRequest,
  type CameraFocusTarget,
  type ElementInstanceTarget,
  type StoryElementSelection,
  type StoryMeasuredSize,
  type StoryMeasurement,
  type StoryTreeHover,
} from './storyCanvasModel';
import { hashString } from './hashString';
import { useBodyAttributes } from './useBodyAttributes';
import { useDebouncedValue } from './useDebouncedValue';
import {
  closestStoryCanvasElement,
  queryStoryCanvasElement,
} from './storyCanvasDomBoundary';
import {
  readStoryCanvasUrlState,
  replaceStoryCanvasUrlState,
} from './storyCanvasUrlState';
import { usePageMeta } from '../support/pageMeta';
import { changeAppLanguage, normalizeLanguage } from '../support/storyCanvasLanguage';
import type { SupportedLanguage } from '../support/storyCanvasLanguage';
import { useWindowEvent } from '../support/windowEvent';
import '../DevtoolsStoryFixture.css';
import './StoryCanvasPage.css';

const STORY_CANVAS_PAGE_TITLE = 'C* — Story Canvas';
const FOUNDATION_VIEW_PAGE_TITLE = 'C* — Foundation View';
const ENTITY_VIEW_PAGE_TITLE = 'C* — Entities View';
const BODY_ATTRS = {
  'data-v2': '',
  'data-story-canvas': '',
} as const;

const QUERY_DEBOUNCE_MS = 200;
const FULL_STORY_LOAD_DELAY_MS = 4000;
const URL_VIEW_WRITE_DELAY_MS = 200;
const URL_NODE_RESTORE_ATTEMPTS = 30;

export type StoryCanvasPreset = 'default' | 'foundation' | 'entities';

function storyCanvasTitleForPreset(preset: StoryCanvasPreset) {
  if (preset === 'foundation') return FOUNDATION_VIEW_PAGE_TITLE;
  if (preset === 'entities') return ENTITY_VIEW_PAGE_TITLE;
  return STORY_CANVAS_PAGE_TITLE;
}

function defaultStoryCanvasPagePathForPreset(preset: StoryCanvasPreset) {
  if (preset === 'foundation') return FOUNDATION_PAGE_PATH;
  if (preset === 'entities') return ENTITY_PAGE_PATH;
  return DEFAULT_STORY_PAGE_PATH;
}

function storyRecordLoadDelayForPreset(preset: StoryCanvasPreset) {
  if (preset === 'foundation' || preset === 'entities') return 0;
  return FULL_STORY_LOAD_DELAY_MS;
}

function loadStoryRecordsForPreset(preset: StoryCanvasPreset) {
  if (preset === 'foundation') return loadFoundationStoryRecords();
  if (preset === 'entities') return loadEntityStoryRecords();
  return loadStoryRecords();
}

function storyCanvasPagesForPreset(preset: StoryCanvasPreset, stories: typeof STORY_RECORDS) {
  if (preset === 'foundation') return createFoundationStoryCanvasPages(stories);
  if (preset === 'entities') return createEntityStoryCanvasPages(stories);
  return createStoryCanvasPages(stories, ROUTE_PAGE_INFOS);
}

function storyLayersPanelTextForPreset(preset: StoryCanvasPreset): StoryLayersPanelText {
  if (preset === 'foundation') {
    return {
      currentTitle: 'Current Group',
      overviewLabel: 'All Shared',
      overviewTitle: 'Foundation',
      pagesTitle: 'Shared Library',
      panelTitle: 'Foundation',
      searchPlaceholder: 'Component, state, file',
    };
  }

  if (preset === 'entities') {
    return {
      currentTitle: 'Current Entity',
      overviewLabel: 'All Entities',
      overviewTitle: 'Entities',
      pagesTitle: 'Entity Library',
      panelTitle: 'Entities',
      searchPlaceholder: 'Entity, state, file',
    };
  }

  return DEFAULT_STORY_LAYERS_PANEL_TEXT;
}

function foundationSectionForStory(story: StoryRecord) {
  const folder = foundationFolderFromStoryPath(story.path);
  return {
    key: folder.folderPath,
    label: folder.folderLabel,
  };
}

function entitySectionForStory(story: StoryRecord) {
  const folder = entityFolderFromStoryPath(story.path);
  return {
    key: folder.folderPath,
    label: folder.folderLabel,
  };
}

function scopedStoryRecordsForPreset(preset: StoryCanvasPreset, records: StoryRecord[]) {
  if (preset === 'foundation') return records.filter(isFoundationStoryRecord);
  if (preset === 'entities') return records.filter(isEntityStoryRecord);
  return records;
}

function boardOptionsForPreset(preset: StoryCanvasPreset) {
  if (preset === 'foundation') return { sectionForStory: foundationSectionForStory };
  if (preset === 'entities') return { sectionForStory: entitySectionForStory };
  return undefined;
}

function bridgePageForPreset(preset: StoryCanvasPreset) {
  if (preset === 'foundation') return '/devtools/foundation';
  if (preset === 'entities') return '/devtools/entities';
  return '/devtools/story-canvas';
}

export default function StoryCanvasPage({ preset = 'default' }: { preset?: StoryCanvasPreset }) {
  usePageMeta(storyCanvasTitleForPreset(preset));
  useBodyAttributes(BODY_ATTRS);
  const { i18n } = useTranslation();
  const canvasLanguage = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const [initialUrlState] = useState(() => readStoryCanvasUrlState());
  const [storyRecords, setStoryRecords] = useState(STORY_RECORDS);
  const [selectedPagePath, setSelectedPagePath] = useState(() => initialUrlState.view?.page ?? defaultStoryCanvasPagePathForPreset(preset));
  const [query, setQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [panelsHidden, setPanelsHidden] = useState(false);
  const [favoriteStoryIds, setFavoriteStoryIds] = useState<Set<string>>(() => new Set());
  const [reviewNotes, setReviewNotes] = useState<StoryReviewNotes>({});
  const [bridgeLoaded, setBridgeLoaded] = useState(!isBridgeEnabled());
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(() => initialUrlState.storyId);
  const [copyState, setCopyState] = useState('');
  const pendingUrlStoryIdRef = useRef<string | null>(initialUrlState.storyId);
  const pendingUrlNodeRef = useRef(initialUrlState.node);
  const mountedRef = useRef(false);
  const loadedStoryRecordsPresetRef = useRef<StoryCanvasPreset | null>(null);
  const storyRecordsLoadRef = useRef<{ preset: StoryCanvasPreset; promise: Promise<void> } | null>(null);
  const debouncedQuery = useDebouncedValue(query, QUERY_DEBOUNCE_MS);
  const storyRecordById = useMemo(() => new Map(storyRecords.map((entry) => [entry.id, entry])), [storyRecords]);
  const scopedStoryRecords = useMemo(
    () => scopedStoryRecordsForPreset(preset, storyRecords),
    [preset, storyRecords],
  );
  const scopedStoryIds = useMemo(() => new Set(scopedStoryRecords.map((story) => story.id)), [scopedStoryRecords]);
  const storyCanvasPages = useMemo(() => storyCanvasPagesForPreset(preset, storyRecords), [preset, storyRecords]);
  const selectedPage = useMemo(
    () => storyCanvasPages.find((page) => page.path === selectedPagePath) ?? storyCanvasPages[0],
    [selectedPagePath, storyCanvasPages],
  );
  const pageStories = useMemo(
    () => selectedPage ? scopedStoryRecords.filter((story) => selectedPage.storyIds.has(story.id)) : [],
    [scopedStoryRecords, selectedPage],
  );
  const favoriteCount = useMemo(() => {
    if (preset === 'default') return favoriteStoryIds.size;
    let count = 0;
    favoriteStoryIds.forEach((storyId) => {
      if (scopedStoryIds.has(storyId)) count += 1;
    });
    return count;
  }, [favoriteStoryIds, preset, scopedStoryIds]);
  const sourceStories = favoritesOnly ? scopedStoryRecords : pageStories;
  const visibleTotalCount = favoritesOnly ? favoriteCount : pageStories.length;
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const loadFullStoryRecords = useCallback(() => {
    if (loadedStoryRecordsPresetRef.current === preset) return Promise.resolve();

    const current = storyRecordsLoadRef.current;
    if (current?.preset === preset) return current.promise;

    const promise = loadStoryRecordsForPreset(preset)
      .then((records) => {
        loadedStoryRecordsPresetRef.current = preset;
        if (mountedRef.current) setStoryRecords(records);
      })
      .catch((error: unknown) => {
        console.error('Story canvas full story load failed', error);
      })
      .finally(() => {
        if (storyRecordsLoadRef.current?.promise === promise) storyRecordsLoadRef.current = null;
      });

    storyRecordsLoadRef.current = { preset, promise };
    return promise;
  }, [preset]);
  useEffect(() => {
    let timeoutId = 0;

    const loadDelayMs = storyRecordLoadDelayForPreset(preset);
    if (loadDelayMs === 0) {
      void loadFullStoryRecords();
      return undefined;
    }

    timeoutId = window.setTimeout(() => {
      void loadFullStoryRecords();
    }, loadDelayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadFullStoryRecords, preset]);
  useEffect(() => {
    if (storyCanvasPages.some((page) => page.path === selectedPagePath)) return;
    setSelectedPagePath(storyCanvasPages[0]?.path ?? '');
  }, [selectedPagePath, storyCanvasPages]);
  const filteredStories = useMemo(() => filterStories(sourceStories, {
    favoriteStoryIds,
    favoritesOnly,
    frame: 'all',
    layer: 'all',
    query: debouncedQuery,
  }), [debouncedQuery, favoriteStoryIds, favoritesOnly, sourceStories]);
  // Figma frames hug their content: huggable stories get measured offscreen
  // once, then the board is rebuilt with content-fit sizes.
  const [measuredStorySizes, setMeasuredStorySizes] = useState<Map<string, StoryMeasuredSize>>(() => new Map());
  useEffect(() => {
    setMeasuredStorySizes((current) => {
      let changed = false;
      const next = new Map<string, StoryMeasuredSize>();
      for (const [storyId, size] of current) {
        if (storyRecordById.has(storyId)) next.set(storyId, size);
        else changed = true;
      }
      return changed ? next : current;
    });
  }, [storyRecordById]);
  const unmeasuredStories = useMemo(
    () => filteredStories.filter((story) => isHuggableStory(story) && !measuredStorySizes.has(story.id)),
    [filteredStories, measuredStorySizes],
  );
  const sizeOverrides = useMemo(() => {
    const overrides = new Map<string, StoryMeasuredSize>();
    for (const story of filteredStories) {
      const measured = isHuggableStory(story) ? measuredStorySizes.get(story.id) : undefined;
      if (measured) overrides.set(story.id, measured);
    }
    return overrides;
  }, [filteredStories, measuredStorySizes]);
  const handleMeasured = useCallback((measurements: StoryMeasurement[]) => {
    setMeasuredStorySizes((current) => {
      let changed = false;
      const next = new Map(current);
      for (const { size, storyId } of measurements) {
        const currentSize = next.get(storyId);
        if (currentSize?.h === size.h && currentSize.w === size.w) continue;
        next.set(storyId, size);
        changed = true;
      }
      return changed ? next : current;
    });
  }, []);
  const handleLanguageChange = useCallback((language: SupportedLanguage) => {
    if (language === canvasLanguage) return;
    setMeasuredStorySizes(new Map());
    void changeAppLanguage(language);
  }, [canvasLanguage]);
  useEffect(() => {
    setMeasuredStorySizes(new Map());
  }, [canvasLanguage]);
  const board = useMemo(() => createStoryBoard(
    filteredStories,
    sizeOverrides,
    boardOptionsForPreset(preset),
  ), [filteredStories, preset, sizeOverrides]);
  const selectedStory = selectedStoryId ? storyRecordById.get(selectedStoryId) : undefined;
  const selectedStoryVisible = selectedStory ? filteredStories.some((story) => story.id === selectedStory.id) : false;
  const [cameraFocusRequest, setCameraFocusRequest] = useState<CameraFocusRequest | null>(null);
  const requestCameraFocus = useCallback((target: CameraFocusTarget) => {
    setCameraFocusRequest((current) => ({
      ...target,
      sequence: (current?.sequence ?? 0) + 1,
    }));
  }, []);
  const handleSelectStory = useCallback((storyId: string, options?: { focusCamera?: boolean }) => {
    if (pendingUrlStoryIdRef.current && pendingUrlStoryIdRef.current !== storyId) {
      pendingUrlStoryIdRef.current = null;
      pendingUrlNodeRef.current = null;
    }
    setSelectedStoryId(storyId);
    if (options?.focusCamera) requestCameraFocus({ kind: 'story', storyId });
  }, [requestCameraFocus]);
  const handleFavoritesOnlyChange = useCallback((value: boolean) => {
    pendingUrlStoryIdRef.current = null;
    pendingUrlNodeRef.current = null;
    setFavoritesOnly(value);
    setSelectedStoryId(null);
    requestCameraFocus({ kind: 'page' });
  }, [requestCameraFocus]);
  const handlePageChange = useCallback((path: string) => {
    pendingUrlStoryIdRef.current = null;
    pendingUrlNodeRef.current = null;
    void loadFullStoryRecords();
    setFavoritesOnly(false);
    setSelectedPagePath(path);
    setSelectedStoryId(null);
    requestCameraFocus({ kind: 'page' });
  }, [loadFullStoryRecords, requestCameraFocus]);
  const elementVersionRef = useRef(0);
  const [elementSelection, setElementSelection] = useState<StoryElementSelection | null>(null);
  const handleSelectElement = useCallback((storyId: string, element: LayerElement | null, snapshot?: CanvasViewportLayerSnapshot | null) => {
    if (pendingUrlNodeRef.current && element) pendingUrlNodeRef.current = null;
    elementVersionRef.current += 1;
    setElementSelection(element ? {
      element,
      snapshot: snapshot ?? canvasViewportLayerSnapshot(element),
      storyId,
      version: elementVersionRef.current,
    } : null);
  }, []);
  const handleToggleFavorite = useCallback((storyId: string) => {
    setFavoriteStoryIds((current) => {
      const next = new Set(current);
      if (next.has(storyId)) {
        next.delete(storyId);
      } else {
        next.add(storyId);
      }
      return next;
    });
  }, []);
  const visibleSelectedElement = elementSelection?.storyId === selectedStoryId ? elementSelection.element : null;
  const visibleSelectedSnapshot = elementSelection?.storyId === selectedStoryId ? elementSelection.snapshot : null;
  const visibleSelectedClipGeometry = useMemo(
    () => visibleSelectedElement?.isConnected ? elementClipGeometry(visibleSelectedElement) : null,
    [elementSelection?.version, visibleSelectedElement],
  );
  const selectedElementInstance = useMemo(
    () => elementInstanceTarget(
      visibleSelectedElement,
      selectedStoryVisible ? selectedStory : undefined,
      storyRecords,
      storyCanvasPages,
    ),
    [elementSelection?.version, selectedStory, selectedStoryVisible, storyCanvasPages, storyRecords, visibleSelectedElement],
  );
  const handleGoToInstanceSource = useCallback((target: ElementInstanceTarget) => {
    if (!target.targetPagePath || !target.targetStoryId) return;
    pendingUrlStoryIdRef.current = null;
    pendingUrlNodeRef.current = null;
    setSelectedPagePath(target.targetPagePath);
    setSelectedStoryId(target.targetStoryId);
    setElementSelection(null);
    requestCameraFocus({ kind: 'story', storyId: target.targetStoryId });
  }, [requestCameraFocus]);
  const handleInspectorStorySelect = useCallback((storyId: string) => {
    handleSelectStory(storyId, { focusCamera: true });
    setElementSelection(null);
  }, [handleSelectStory]);
  // Card state (selection/favorites/measure) flows through an external store the
  // cards subscribe to individually. The module itself stays stable, so a
  // selection change re-renders only the two affected cards — never the
  // canvas and its ~400 live previews.
  // Figma reveals tree hover on canvas: hovering a layers-panel row outlines
  // the matching frame/layer.
  const treeHoverVersionRef = useRef(0);
  const [treeHover, setTreeHover] = useState<StoryTreeHover | null>(null);
  const handleHoverLayer = useCallback((target: { element: LayerElement | null; storyId: string } | null) => {
    treeHoverVersionRef.current += 1;
    setTreeHover(target ? { ...target, version: treeHoverVersionRef.current } : null);
  }, []);
  const storyViewStore = useMemo(() => createStoryViewStore(), []);
  useEffect(() => {
    storyViewStore.setState({ elementSelection, favoriteStoryIds, selectedStoryId, treeHover });
  }, [elementSelection, favoriteStoryIds, selectedStoryId, storyViewStore, treeHover]);
  const storyPreviewModules = useMemo(() => createStoryPreviewModules({
    onSelectElement: handleSelectElement,
    onSelectStory: handleSelectStory,
    onToggleFavorite: handleToggleFavorite,
    storyRecordById,
    store: storyViewStore,
  }), [handleSelectElement, handleSelectStory, handleToggleFavorite, storyRecordById, storyViewStore]);

  // The canvas remounts when the visible board changes (key below). The
  // storage provider keeps the latest viewport/selection snapshot so a
  // remount restores the designer's zoom and position instead of resetting.
  const boardItemsRef = useRef(board.items);
  boardItemsRef.current = board.items;
  const viewportRef = useRef(initialUrlState.view?.viewport ?? INITIAL_STORY_CANVAS_VIEWPORT);
  const selectedPagePathRef = useRef(selectedPagePath);
  const selectedStoryIdRef = useRef(selectedStoryId);
  const elementSelectionRef = useRef<StoryElementSelection | null>(null);
  const urlStateActiveRef = useRef(Boolean(initialUrlState.storyId || initialUrlState.node || initialUrlState.view));
  const urlWriteTimerRef = useRef<number | null>(null);
  const canvasSelectionRef = useRef<string[]>([]);
  const currentUrlNode = useCallback(() => {
    const selection = elementSelectionRef.current;
    if (!selection?.element.isConnected) return null;
    const previewRoot = queryStoryCanvasElement(
      document,
      `[data-story-id="${selection.storyId}"] ${STORY_CANVAS_PREVIEW_SELECTOR}`,
    );
    return previewRoot ? layerElementLocator(previewRoot, selection.element) : null;
  }, []);
  const replaceUrlState = useCallback(() => {
    if (pendingUrlStoryIdRef.current || pendingUrlNodeRef.current) return;
    if (!urlStateActiveRef.current && !selectedStoryIdRef.current && !elementSelectionRef.current) return;
    const storyId = selectedStoryIdRef.current;
    replaceStoryCanvasUrlState({
      node: storyId ? currentUrlNode() : null,
      storyId,
      view: {
        page: selectedPagePathRef.current,
        v: 1,
        viewport: viewportRef.current,
      },
    });
  }, [currentUrlNode]);
  const scheduleUrlStateReplace = useCallback((delay = 0) => {
    if (typeof window === 'undefined') return;
    if (urlWriteTimerRef.current) window.clearTimeout(urlWriteTimerRef.current);
    urlWriteTimerRef.current = window.setTimeout(() => {
      urlWriteTimerRef.current = null;
      replaceUrlState();
    }, delay);
  }, [replaceUrlState]);
  const storageProvider = useMemo<CanvasWorkspaceStorageProvider>(() => () => ({
    getItem: () => serializeStoryWorkspace(boardItemsRef.current, canvasSelectionRef.current, viewportRef.current),
    setItem: (_key, value) => {
      const state = parseStoryWorkspaceState(value);
      if (state.viewport) viewportRef.current = state.viewport;
      canvasSelectionRef.current = state.selection;
      if (urlStateActiveRef.current) scheduleUrlStateReplace(URL_VIEW_WRITE_DELAY_MS);
    },
  }), [scheduleUrlStateReplace]);

  useEffect(() => () => {
    if (urlWriteTimerRef.current) window.clearTimeout(urlWriteTimerRef.current);
  }, []);

  useEffect(() => {
    selectedPagePathRef.current = selectedPagePath;
    selectedStoryIdRef.current = selectedStoryId;
    elementSelectionRef.current = elementSelection;
    if (selectedStoryId || elementSelection) urlStateActiveRef.current = true;
    scheduleUrlStateReplace();
  }, [elementSelection, scheduleUrlStateReplace, selectedPagePath, selectedStoryId]);

  const assemblyInput = useMemo<CanvasAppAssemblyInput>(() => ({
    affordanceConfig: STORY_CANVAS_AFFORDANCE_CONFIG,
    capabilities: CANVAS_APP_READ_ONLY_CAPABILITIES,
    customItemModules: storyPreviewModules,
    initialItems: board.items,
    initialSelection: [],
    workspaceStorageProvider: storageProvider,
  }), [board.items, storageProvider, storyPreviewModules]);
  // Key changes remount the canvas: filter changes, hug measurements landing,
  // and explicit zoom jumps (Shift+1/2/0) which apply a new stored viewport.
  const [focusNonce, setFocusNonce] = useState(0);
  const canvasKey = useMemo(
    () => `${filteredStories.length}-${hashString(filteredStories.map((story) => story.id).join('|'))}-m${sizeOverrides.size}-f${focusNonce}-${canvasLanguage}`,
    [canvasLanguage, filteredStories, focusNonce, sizeOverrides.size],
  );
  // Memoized element: page re-renders (search keystrokes, copy toast, note
  // typing) must not re-render the canvas and its ~400 live previews.
  const canvasNode = useMemo(
    () => <CanvasApp key={canvasKey} assemblyInput={assemblyInput} />,
    [assemblyInput, canvasKey],
  );

  useEffect(() => {
    const storyId = pendingUrlStoryIdRef.current;
    if (!storyId || !storyRecordById.has(storyId)) return;

    const preferredPage = initialUrlState.view?.page
      ? storyCanvasPages.find((page) => page.path === initialUrlState.view?.page && page.storyIds.has(storyId))
      : null;
    const targetPage = preferredPage ?? storyCanvasPages.find((page) => page.storyIds.has(storyId));
    if (!targetPage) return;

    setFavoritesOnly(false);
    setSelectedPagePath(targetPage.path);
    setSelectedStoryId(storyId);
    if (!initialUrlState.view?.viewport) requestCameraFocus({ kind: 'story', storyId });
  }, [initialUrlState.view?.page, initialUrlState.view?.viewport, requestCameraFocus, storyCanvasPages, storyRecordById]);

  useEffect(() => {
    const storyId = pendingUrlStoryIdRef.current;
    if (!storyId || !filteredStories.some((story) => story.id === storyId)) return;
    pendingUrlStoryIdRef.current = null;
    if (!pendingUrlNodeRef.current) scheduleUrlStateReplace();
  }, [filteredStories, scheduleUrlStateReplace]);

  useEffect(() => {
    if (selectedStoryId && !filteredStories.some((story) => story.id === selectedStoryId)) {
      if (pendingUrlStoryIdRef.current === selectedStoryId) return;
      setSelectedStoryId(null);
    }
  }, [filteredStories, selectedStoryId]);

  // Element selection holds a live DOM node — drop it whenever the canvas
  // remounts (filter change replaces the DOM) or the story selection moves.
  useEffect(() => {
    setElementSelection(null);
  }, [canvasKey]);
  useEffect(() => {
    setElementSelection((current) =>
      current && current.storyId === selectedStoryId ? current : null);
  }, [selectedStoryId]);

  useEffect(() => {
    const locator = pendingUrlNodeRef.current;
    if (!locator || !selectedStoryId || pendingUrlStoryIdRef.current) return undefined;

    let cancelled = false;
    let frameId = 0;
    let attempts = 0;

    const restoreNode = () => {
      if (cancelled) return;
      attempts += 1;
      const previewRoot = queryStoryCanvasElement(
        document,
        `[data-story-id="${selectedStoryId}"] ${STORY_CANVAS_PREVIEW_SELECTOR}`,
      );
      const element = previewRoot ? findLayerElementByLocator(previewRoot, locator) : null;

      if (element) {
        pendingUrlNodeRef.current = null;
        handleSelectElement(selectedStoryId, element);
        return;
      }

      if (attempts >= URL_NODE_RESTORE_ATTEMPTS) {
        pendingUrlNodeRef.current = null;
        scheduleUrlStateReplace();
        return;
      }

      frameId = window.requestAnimationFrame(restoreNode);
    };

    frameId = window.requestAnimationFrame(restoreNode);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
    };
  }, [canvasKey, handleSelectElement, scheduleUrlStateReplace, selectedStoryId]);

  useEffect(() => {
    if (!copyState) return undefined;
    const timer = window.setTimeout(() => setCopyState(''), 1400);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  useEffect(() => {
    if (!isBridgeEnabled()) return undefined;
    let cancelled = false;

    void readBridgeSnapshot().then((snapshot) => {
      if (cancelled) return;
      const bridgeNotes = notesFromBridgeSnapshot(snapshot);
      const bridgeFavorites = favoritesFromBridgeSnapshot(snapshot);
      setReviewNotes((current) => ({ ...bridgeNotes, ...current }));
      setFavoriteStoryIds((current) => new Set([...bridgeFavorites, ...current]));
      setBridgeLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!bridgeLoaded || !isBridgeEnabled()) return;

    const element = elementSelection?.element;
    pushBridgeSnapshot({
      counts: { filtered: filteredStories.length, total: visibleTotalCount },
      favorites: bridgeFavoriteEntries(favoriteStoryIds, storyRecordById),
      filter: { favoritesOnly, frame: 'all', layer: 'all', page: favoritesOnly ? '__favorites' : selectedPage?.path ?? '', query: debouncedQuery },
      notes: bridgeNoteEntries(reviewNotes, storyRecordById),
      page: bridgePageForPreset(preset),
      // The picked layer is the most precise instruction context we have:
      // `source` carries the exact TSX file:line:column.
      selectedElement: elementSelection && element?.isConnected ? {
        ...elementDescriptor(element),
        ...elementBoxSize(element),
        storyId: elementSelection.storyId,
      } : null,
      selectedStory: selectedStory
        ? {
          ...storyBridgePayload(selectedStory),
          favorite: favoriteStoryIds.has(selectedStory.id),
          reviewNote: reviewNotes[selectedStory.id] ?? '',
        }
        : null,
      version: 1,
    });
  }, [bridgeLoaded, debouncedQuery, elementSelection, favoriteStoryIds, favoritesOnly, filteredStories.length, preset, reviewNotes, selectedPage?.path, selectedStory, storyRecordById, visibleTotalCount]);

  // Figma zoom jumps: Shift+1 fit all, Shift+2 fit selection, Shift+0 100%.
  // Implemented by writing the target viewport and forcing a keyed remount,
  // which restores it through the storage provider.
  const stageRef = useRef<HTMLElement>(null);
  const stagePointerRef = useRef<{ x: number; y: number } | null>(null);
  // Stage transform is `translate(viewport.x viewport.y) scale(viewport.scale)`
  // (CanvasSvgStage) — viewport.x/y are screen-space offsets.
  const zoomToBounds = useCallback((bounds: { h: number; w: number; x: number; y: number }) => {
    const stage = stageRef.current;
    if (!stage || bounds.w <= 0 || bounds.h <= 0) return;
    const scale = Math.min(Math.max(Math.min(stage.clientWidth / bounds.w, stage.clientHeight / bounds.h) * 0.9, 0.02), 4);
    viewportRef.current = {
      scale,
      x: (stage.clientWidth - bounds.w * scale) / 2 - bounds.x * scale,
      y: (stage.clientHeight - bounds.h * scale) / 2 - bounds.y * scale,
    };
    setFocusNonce((nonce) => nonce + 1);
    scheduleUrlStateReplace(URL_VIEW_WRITE_DELAY_MS);
  }, [scheduleUrlStateReplace]);
  useEffect(() => {
    if (!cameraFocusRequest) return;

    const items = boardItemsRef.current;
    let bounds: { h: number; w: number; x: number; y: number } | null;

    if (cameraFocusRequest.kind === 'story') {
      const item = items.find((candidate) => candidate.id === `story-${cameraFocusRequest.storyId}`);
      bounds = item ? paddedCanvasBounds(item, 96) : null;
    } else {
      const title = items.find((item) => item.type === 'text');
      const firstContent = items.find(isStoryCanvasContentItem);
      const sectionBounds = canvasItemsBounds([title, firstContent].filter((item): item is CanvasItem => Boolean(item)));
      bounds = sectionBounds ? paddedCanvasBounds(sectionBounds, 96) : canvasItemsBounds(items);
    }

    if (bounds) zoomToBounds(bounds);
  }, [cameraFocusRequest, zoomToBounds]);
  const handleZoomShortcut = useCallback((code: string) => {
    const items = boardItemsRef.current;
    if (items.length === 0) return;

    if (code === 'Digit0') {
      const stage = stageRef.current;
      if (!stage) return;
      const current = viewportRef.current;
      const worldCenterX = (stage.clientWidth / 2 - current.x) / current.scale;
      const worldCenterY = (stage.clientHeight / 2 - current.y) / current.scale;
      viewportRef.current = {
        scale: 1,
        x: stage.clientWidth / 2 - worldCenterX,
        y: stage.clientHeight / 2 - worldCenterY,
      };
      setFocusNonce((nonce) => nonce + 1);
      return;
    }

    if (code === 'Digit2' && selectedStoryId) {
      const item = items.find((candidate) => candidate.id === `story-${selectedStoryId}`);
      if (item) {
        zoomToBounds({ h: item.h + 80, w: item.w + 80, x: item.x - 40, y: item.y - 40 });
        return;
      }
    }

    const minX = Math.min(...items.map((item) => item.x));
    const minY = Math.min(...items.map((item) => item.y));
    const maxX = Math.max(...items.map((item) => item.x + item.w));
    const maxY = Math.max(...items.map((item) => item.y + item.h));
    zoomToBounds({ h: maxY - minY, w: maxX - minX, x: minX, y: minY });
  }, [selectedStoryId, zoomToBounds]);

  // Figma keeps frame labels at constant screen size: mirror the canvas zoom
  // into a CSS variable so labels/badges can counter-scale in pure CSS.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const observer = new MutationObserver(() => applyZoomVar());
    let raf = 0;

    const applyZoomVar = () => {
      const group = queryStoryCanvasElement(stage, 'svg g[transform]');
      const scale = group?.getAttribute('transform')?.match(/scale\(([\d.]+)\)/)?.[1];
      if (scale) {
        stage.style.setProperty('--canvas-zoom', scale);
        // Figma hides names progressively as frames get tiny on screen.
        // Driven by CSS variables so selectors stay single-class (BEM) and
        // no card re-renders on zoom.
        const zoom = Number(scale);
        stage.style.setProperty('--card-label-display', zoom < 0.25 ? 'none' : 'flex');
        stage.style.setProperty('--group-label-display', zoom < 0.1 ? 'none' : 'flex');
      }
      return group;
    };
    // The canvas stage mounts asynchronously — retry until present.
    const attach = () => {
      const group = applyZoomVar();
      if (!group) {
        raf = requestAnimationFrame(attach);
        return;
      }
      observer.observe(group, { attributeFilter: ['transform'], attributes: true });
    };
    attach();
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [canvasKey]);

  const copySelectedSourceReference = useCallback(() => {
    const reference = sourceReferenceForSelection(visibleSelectedElement, selectedStory);
    if (!reference) return false;

    void copyText(reference).then((copied) => {
      setCopyState(copied ? `${reference} copied` : 'Copy failed');
    });
    return true;
  }, [selectedStory, visibleSelectedElement]);

  // Figma's Esc: ascend one level at a time — element → parent element →
  // card → nothing. Registered in the capture phase so canvas shortcuts win
  // over anything inside story previews; only the tool's own panel inputs
  // (search, CSS values, review note) opt out.
  useWindowEvent('keydown', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const inEditor = Boolean(target
      && !closestStoryCanvasElement(target, STORY_CANVAS_PREVIEW_SELECTOR)
      && closestStoryCanvasElement(target, 'input, textarea, select, [contenteditable="true"]'));

    if (event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey && event.code === 'Backslash') {
      event.preventDefault();
      event.stopPropagation();
      setPanelsHidden((hidden) => !hidden);
      return;
    }

    if (event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey && event.code === 'KeyC' && !inEditor) {
      if (copySelectedSourceReference()) {
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }

    if (event.key === 'Escape' && !inEditor) {
      if (elementSelection) {
        const previewRoot = closestStoryCanvasElement(elementSelection.element, STORY_CANVAS_PREVIEW_SELECTOR);
        const parent = previewRoot && elementSelection.element.isConnected
          ? parentAnnotated(elementSelection.element, previewRoot)
          : null;
        handleSelectElement(elementSelection.storyId, parent);
        return;
      }
      if (selectedStoryId) setSelectedStoryId(null);
      return;
    }

    if (event.shiftKey && !inEditor && ['Digit0', 'Digit1', 'Digit2'].includes(event.code)) {
      event.preventDefault();
      handleZoomShortcut(event.code);
    }
  }, true, { capture: true });

  const handleCopy = useCallback(async (value: string, label: string) => {
    const copied = await copyText(value);
    setCopyState(copied ? `${label} copied` : 'Copy failed');
  }, []);
  const handleReviewNoteChange = useCallback((storyId: string, note: string) => {
    setReviewNotes((current) => {
      const next = { ...current };
      if (note) {
        next[storyId] = note;
      } else {
        delete next[storyId];
      }
      return next;
    });
  }, []);
  // Figma's Alt-hover frame distances: with a frame selected, holding Alt
  // over another frame draws the red nearest-edge gaps between them. Rendered
  // in screen space; labels divide by the live zoom to read in canvas px.
  const [frameDistances, setFrameDistances] = useState<{ lines: EdgeDistance[]; zoom: number } | null>(null);
  const handleStageMouseMove = useCallback((event: MouseEvent<HTMLElement>) => {
    if (!event.altKey || !selectedStoryId) {
      setFrameDistances((current) => current ? null : current);
      return;
    }

    const stage = stageRef.current;
    const hoveredCard = event.target instanceof Element ? closestStoryCanvasElement(event.target, '[data-story-id]') : null;
    const selectedCard = stage ? queryStoryCanvasElement(stage, `[data-story-id="${selectedStoryId}"]`) : null;
    if (!stage || !hoveredCard || !selectedCard || hoveredCard === selectedCard) {
      setFrameDistances((current) => current ? null : current);
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    const toStageRect = (rect: DOMRect) => ({
      h: rect.height,
      w: rect.width,
      x: rect.left - stageRect.left,
      y: rect.top - stageRect.top,
    });
    setFrameDistances({
      lines: edgeDistances(toStageRect(selectedCard.getBoundingClientRect()), toStageRect(hoveredCard.getBoundingClientRect())),
      zoom: Number(stage.style.getPropertyValue('--canvas-zoom')) || 1,
    });
  }, [selectedStoryId]);

  return (
    <StoryCanvasShell panelsHidden={panelsHidden}>
      <StoryLayersPanel
        elementVersion={elementSelection?.version ?? 0}
        favoriteCount={favoriteCount}
        favoritesOnly={favoritesOnly}
        filteredCount={filteredStories.length}
        layerTreeKey={canvasKey}
        pages={storyCanvasPages}
        query={query}
        selectedElement={visibleSelectedElement}
        selectedPagePath={selectedPage?.path ?? ''}
        selectedStoryId={selectedStoryId}
        stories={filteredStories}
        text={storyLayersPanelTextForPreset(preset)}
        totalCount={visibleTotalCount}
        onFavoritesOnlyChange={handleFavoritesOnlyChange}
        onHoverLayer={handleHoverLayer}
        onPageChange={handlePageChange}
        onQueryChange={setQuery}
        onSelectElement={handleSelectElement}
        onSelectStory={handleSelectStory}
      />
      <main
        className="story-canvas-stage"
        ref={stageRef}
        onClick={(event) => {
          // Figma: clicking empty canvas deselects. Ignore drags and clicks
          // on any control (cards stop propagation themselves).
          const start = stagePointerRef.current;
          if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4) return;
          if (event.target instanceof Element
            && closestStoryCanvasElement(event.target, 'button, [role="button"], .story-canvas-toolbar, .story-canvas-empty')) return;
          if (selectedStoryId) setSelectedStoryId(null);
        }}
        onMouseLeave={() => setFrameDistances(null)}
        onMouseMove={handleStageMouseMove}
        onPointerDownCapture={(event) => {
          stagePointerRef.current = { x: event.clientX, y: event.clientY };
        }}
      >
        {canvasNode}
        <StoryCanvasToolbar
          favoriteCount={favoriteCount}
          favoritesOnly={favoritesOnly}
          language={canvasLanguage}
          onFavoritesOnlyChange={handleFavoritesOnlyChange}
          onLanguageChange={handleLanguageChange}
        />
        {filteredStories.length === 0 ? <div className="story-canvas-empty">No stories</div> : null}
        <StorySelectionLayer
          canvasKey={canvasKey}
          selectedElement={visibleSelectedElement}
          selectedSnapshot={visibleSelectedSnapshot}
          selectedStoryId={selectedStoryId}
          stageRef={stageRef}
          storyRecordById={storyRecordById}
        />
        {frameDistances && frameDistances.lines.length > 0 ? (
          <div className="story-frame-distances" aria-hidden="true">
            {frameDistances.lines.map((line) => (
              <StoryElementDistanceLine
                key={`${line.axis}-${line.from.x}-${line.from.y}`}
                line={line}
                zoom={frameDistances.zoom}
              />
            ))}
          </div>
        ) : null}
        {unmeasuredStories.length > 0 ? (
          <StoryMeasureLayer stories={unmeasuredStories} onMeasured={handleMeasured} />
        ) : null}
      </main>
      <StoryCanvasInspector
        copyState={copyState}
        favoriteCount={favoriteCount}
        filteredCount={filteredStories.length}
        isSelectedStoryFavorite={selectedStory ? favoriteStoryIds.has(selectedStory.id) : false}
        reviewNote={selectedStoryId ? reviewNotes[selectedStoryId] ?? '' : ''}
        selectedElement={visibleSelectedElement}
        selectedElementInstance={selectedElementInstance}
        selectedClipGeometry={visibleSelectedClipGeometry}
        selectedSnapshot={visibleSelectedSnapshot}
        selectedStory={selectedStoryVisible ? selectedStory : undefined}
        storyRecordById={storyRecordById}
        totalCount={visibleTotalCount}
        onCopy={handleCopy}
        onGoToInstance={handleGoToInstanceSource}
        onReviewNoteChange={handleReviewNoteChange}
        onSelectStory={handleInspectorStorySelect}
        onToggleFavorite={handleToggleFavorite}
      />
    </StoryCanvasShell>
  );
}
