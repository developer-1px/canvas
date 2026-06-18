import {
  type ChangeEvent,
  type CSSProperties,
  type MouseEvent,
  type MouseEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { appPath } from "../support/appBasePath";
import Icon from "../support/StoryCanvasIcon";
import {
  annotatedLayerTree,
  elementDescriptor,
  isInstanceElementForStory,
  STORY_CANVAS_PREVIEW_SELECTOR,
  type LayerElement,
  type LayerNode,
} from "./elementSelection";
import {
  type StoryRecord,
} from "./storyData";
import {
  closestStoryCanvasElement,
  queryStoryCanvasElement,
} from "./storyCanvasDomBoundary";

export type StoryCanvasPage = {
  count: number;
  kind?: "overview" | "route";
  label: string;
  path: string;
};

export type StoryLayersPanelText = {
  currentTitle: string;
  overviewLabel: string;
  overviewTitle: string;
  pagesTitle: string;
  panelTitle: string;
  searchPlaceholder: string;
};

export const DEFAULT_STORY_LAYERS_PANEL_TEXT: StoryLayersPanelText = {
  currentTitle: "Current Page",
  overviewLabel: "All Stories",
  overviewTitle: "Overview",
  pagesTitle: "Pages by Route",
  panelTitle: "Canvas Map",
  searchPlaceholder: "Route, component, file",
};

type StructureLayer = "page" | "widgets" | "features" | "entities" | "shared";

const STRUCTURE_LAYERS: Array<{ key: StructureLayer; label: string }> = [
  { key: "page", label: "page" },
  { key: "widgets", label: "widgets" },
  { key: "features", label: "features" },
  { key: "entities", label: "entities" },
  { key: "shared", label: "shared" },
];

// Structure map panel: overview → route groups → selected page responsibility
// layers. Story rows still reveal the live DOM tree for precise AI context.
export default function StoryLayersPanel({
  elementVersion,
  favoriteCount,
  favoritesOnly,
  filteredCount,
  layerTreeKey,
  onFavoritesOnlyChange,
  onHoverLayer,
  onPageChange,
  onQueryChange,
  onSelectElement,
  onSelectStory,
  pages = [],
  query,
  selectedElement,
  selectedPagePath,
  selectedStoryId,
  stories,
  text = DEFAULT_STORY_LAYERS_PANEL_TEXT,
  totalCount,
}: {
  elementVersion: number;
  favoriteCount: number;
  favoritesOnly: boolean;
  filteredCount: number;
  layerTreeKey: string;
  pages?: StoryCanvasPage[];
  query: string;
  selectedElement: LayerElement | null;
  selectedPagePath?: string;
  selectedStoryId: string | null;
  stories: StoryRecord[];
  text?: StoryLayersPanelText;
  totalCount: number;
  onFavoritesOnlyChange: (value: boolean) => void;
  onHoverLayer: (
    target: { element: LayerElement | null; storyId: string } | null,
  ) => void;
  onPageChange?: (value: string) => void;
  onQueryChange: (value: string) => void;
  onSelectElement: (storyId: string, element: LayerElement | null) => void;
  onSelectStory: (storyId: string, options?: { focusCamera?: boolean }) => void;
}) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => new Set(),
  );
  const [collapsedLayerNodes, setCollapsedLayerNodes] = useState<Set<string>>(
    () => new Set(),
  );
  const treeRef = useRef<HTMLDivElement>(null);
  const hasPages = pages.length > 0;
  const overviewPage = pages.find((page) => page.kind === "overview");
  const routePages = pages.filter((page) => page.kind !== "overview");
  const selectedPage = pages.find((page) => page.path === selectedPagePath);
  const isOverviewSelected = selectedPage?.kind === "overview";

  const structureSections = useMemo(() => {
    const groups = new Map<StructureLayer, StoryRecord[]>();
    for (const story of stories) {
      const layer = structureLayerFromPath(story.path);
      if (!layer) continue;
      groups.set(layer, [...(groups.get(layer) ?? []), story]);
    }

    return STRUCTURE_LAYERS.map(({ key, label }) => {
      const entries = groups.get(key) ?? [];
      const byComponent = new Map<string, StoryRecord[]>();
      for (const story of entries) {
        byComponent.set(story.modulePath, [
          ...(byComponent.get(story.modulePath) ?? []),
          story,
        ]);
      }
      const components = [...byComponent.values()].map((variants) => ({
        label: (variants[0].path.split("/").pop() ?? variants[0].path).replace(
          /\.tsx$/,
          "",
        ),
        variants: [...variants].sort(
          (a, b) => storyVariantOrder(a) - storyVariantOrder(b) ||
            a.name.localeCompare(b.name),
        ),
      }));
      return { components, count: entries.length, key, label };
    });
  }, [stories]);

  // The selected story's layer tree comes from the live preview DOM. Derived
  // in an effect (after commit) — during a keyed canvas remount the render
  // phase still sees the OLD, about-to-unmount DOM, which would leave the
  // tree holding disconnected elements.
  const [layerTree, setLayerTree] = useState<LayerNode[]>([]);
  useEffect(() => {
    if (!selectedStoryId) {
      setLayerTree([]);
      return;
    }
    const previewRoot = queryStoryCanvasElement(
      document,
      `[data-story-id="${selectedStoryId}"] ${STORY_CANVAS_PREVIEW_SELECTOR}`,
    );
    setLayerTree(previewRoot ? annotatedLayerTree(previewRoot) : []);
    // layerTreeKey invalidates when the canvas remounts; elementVersion
    // re-reads after picks so the tree stays in sync with the DOM.
  }, [elementVersion, layerTreeKey, selectedStoryId]);

  useEffect(() => {
    setCollapsedLayerNodes(new Set());
  }, [layerTreeKey, selectedStoryId]);

  // Figma reveals the selection in the layers panel.
  useEffect(() => {
    if (!selectedStoryId) return;
    const tree = treeRef.current;
    if (!tree) return;
    queryStoryCanvasElement(tree, `[data-layer-story="${selectedStoryId}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selectedStoryId]);

  const toggleSection = (key: string) => {
    setCollapsedSections((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleLayerNode = (key: string) => {
    setCollapsedLayerNodes((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  function handleFavoritesOnlyChange() {
    onFavoritesOnlyChange(!favoritesOnly);
  }

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    onQueryChange(event.currentTarget.value);
  }

  function handleLayerBodyMouseLeave() {
    onHoverLayer(null);
  }

  function handlePageChange(value: string) {
    onPageChange?.(value);
  }

  return (
    <aside className="story-layers" aria-label="Layers">
      <header className="story-layers__head">
        <h1>{text.panelTitle}</h1>
        <span>
          {filteredCount}/{totalCount}
        </span>
      </header>

      <div className="story-layers__top-view">
        <StoryLayersFocusAction
          active={favoritesOnly}
          count={favoriteCount}
          onClick={handleFavoritesOnlyChange}
        />
      </div>

      <label className="story-layers__search">
        <Icon
          className="story-layers__search-icon"
          includeBaseClass={false}
          name="search"
          svgClassName="story-layers__search-icon-svg"
        />
        <input
          aria-label="스토리 검색"
          className="story-layers__search-input"
          placeholder={text.searchPlaceholder}
          type="search"
          value={query}
          onChange={handleQueryChange}
        />
      </label>

      <div
        className="story-layers__body"
        ref={treeRef}
        onMouseLeave={handleLayerBodyMouseLeave}
      >
        {favoritesOnly ? (
          <section className="story-layers__block" aria-label="Favorites">
            <div className="story-layers__block-head">
              <h2>Favorites</h2>
              <span>{favoriteCount}</span>
            </div>
            <div className="story-layers__tree">
              {stories.map((story) => (
                <StoryLayerRow
                  indent={false}
                  isSelected={story.id === selectedStoryId}
                  key={story.id}
                  collapsedLayerNodes={collapsedLayerNodes}
                  layerTree={story.id === selectedStoryId ? layerTree : null}
                  selectedElement={selectedElement}
                  story={story}
                  onHoverLayer={onHoverLayer}
                  onToggleLayerNode={toggleLayerNode}
                  onSelectElement={onSelectElement}
                  onSelectStory={onSelectStory}
                />
              ))}
              {stories.length === 0 ? (
                <div className="story-layers__empty">
                  No favorites
                </div>
              ) : null}
            </div>
          </section>
        ) : (
          <>
            {hasPages && overviewPage ? (
              <section className="story-layers__block" aria-label="Overview">
                <div className="story-layers__block-head">
                  <h2>{text.overviewTitle}</h2>
                </div>
                <StoryLayerPageButton
                  count={overviewPage.count}
                  label={text.overviewLabel}
                  pagePath={overviewPage.path}
                  selected={overviewPage.path === selectedPagePath}
                  onPageChange={handlePageChange}
                />
              </section>
            ) : null}

            {hasPages ? (
              <section className="story-layers__block" aria-label={text.pagesTitle}>
                <div className="story-layers__block-head">
                  <h2>{text.pagesTitle}</h2>
                  <span>{routePages.length}</span>
                </div>
                <div className="story-layers__pages">
                  {routePages.map((page) => (
                    <StoryLayerPageButton
                      count={page.count}
                      displayPath={routeDisplayPath(page.path)}
                      key={page.path}
                      label={routeDisplayLabel(page)}
                      pagePath={page.path}
                      routeHref={routeHrefFromPagePath(page.path)}
                      selected={page.path === selectedPagePath}
                      onPageChange={handlePageChange}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {isOverviewSelected ? null : (
              <section
                className="story-layers__block"
                aria-label="Current Page Structure"
              >
                <div className="story-layers__block-head">
                  <h2>{text.currentTitle}</h2>
                  <span>
                    {selectedPage ? routeDisplayPath(selectedPage.path) : ""}
                  </span>
                </div>
                <div className="story-layers__tree">
                  {structureSections.map((section) => {
                    const collapsed = collapsedSections.has(section.key);
                    return (
                      <div key={section.key}>
                        <button
                          className="story-layers__section"
                          type="button"
                          onClick={() => toggleSection(section.key)}
                        >
                          <span className="story-layers__caret">
                            <TreeChevron expanded={!collapsed} />
                          </span>
                          <span className="story-layers__section-name">
                            {section.label}
                          </span>
                          <em>{section.count}</em>
                        </button>
                        {collapsed
                          ? null
                          : section.components.map((component) => {
                              const componentKey = `component:${component.variants[0].modulePath}`;
                              const componentCollapsed =
                                collapsedSections.has(componentKey);
                              return (
                                <div
                                  className="story-layers__component-tree"
                                  key={component.variants[0].modulePath}
                                >
                                  {component.variants.length > 1 ? (
                                    <button
                                      className="story-layers__row--component"
                                      title={component.variants[0].path}
                                      type="button"
                                      aria-expanded={!componentCollapsed}
                                      onClick={() => toggleSection(componentKey)}
                                    >
                                      <span className="story-layers__twisty">
                                        <TreeChevron
                                          expanded={!componentCollapsed}
                                        />
                                      </span>
                                      <span className="story-layers__icon--component">
                                        <Icon
                                          className="story-layers__row-icon"
                                          includeBaseClass={false}
                                          name="package"
                                          svgClassName="story-layers__row-icon-svg"
                                        />
                                      </span>
                                      <span className="story-layers__name">
                                        {component.label}
                                      </span>
                                      <em className="story-layers__row-meta">
                                        {component.variants.length}
                                      </em>
                                    </button>
                                  ) : null}
                                  {componentCollapsed
                                    ? null
                                    : component.variants.map((story) => (
                                        <StoryLayerRow
                                          indent={component.variants.length > 1}
                                          isSelected={story.id === selectedStoryId}
                                          key={story.id}
                                          collapsedLayerNodes={collapsedLayerNodes}
                                          layerTree={
                                            story.id === selectedStoryId
                                              ? layerTree
                                              : null
                                          }
                                          selectedElement={selectedElement}
                                          story={story}
                                          onHoverLayer={onHoverLayer}
                                          onToggleLayerNode={toggleLayerNode}
                                          onSelectElement={onSelectElement}
                                          onSelectStory={onSelectStory}
                                        />
                                      ))}
                                </div>
                              );
                            })}
                      </div>
                    );
                  })}
                  {stories.length === 0 ? (
                    <div className="story-layers__empty">
                      No stories
                    </div>
                  ) : null}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

function structureLayerFromPath(path: string): StructureLayer | null {
  const parts = path.split("/").filter(Boolean);
  const direct = parts[0];
  if (
    direct === "widgets" ||
    direct === "features" ||
    direct === "entities" ||
    direct === "shared"
  )
    return direct;
  const pageLayer = parts.find(
    (part): part is StructureLayer =>
      part === "widgets" ||
      part === "features" ||
      part === "entities" ||
      part === "shared",
  );
  return pageLayer ?? "page";
}

function storyVariantOrder(story: StoryRecord) {
  if (story.responsiveViewport) return story.responsiveViewport.order;
  if (story.storyExport === "Default") return -1;
  return 999;
}

function routeDisplayLabel(page: StoryCanvasPage) {
  if (page.path === "pages/v2/root") return "/v2";
  return page.label;
}

function routeDisplayPath(path: string) {
  if (path.startsWith("__")) return "overview";
  if (path === "pages/v2/root") return "/v2";
  if (path.startsWith("pages/")) return `/${path.replace(/^pages\//, "")}`;
  return path;
}

function routeHrefFromPagePath(path: string) {
  return path.startsWith("/") ? appPath(path) : undefined;
}

function StoryLayerPageButton({
  count,
  displayPath,
  label,
  onPageChange,
  pagePath,
  routeHref,
  selected,
}: {
  count: number;
  displayPath?: string;
  label: string;
  pagePath: string;
  routeHref?: string;
  selected: boolean;
  onPageChange: (value: string) => void;
}) {
  function handleClick() {
    onPageChange(pagePath);
  }

  const content = (
    <>
      <span className="story-layers__page-text">
        {displayPath ? (
          <>
            <strong className="story-layers__page-title">{label}</strong>
            <small className="story-layers__page-path">{displayPath}</small>
          </>
        ) : (
          <span className="story-layers__page-label">{label}</span>
        )}
      </span>
      <em className="story-layers__page-count">{count}</em>
    </>
  );

  if (routeHref) {
    return (
      <div className={selected ? "story-layers__page-route--selected" : "story-layers__page-route"}>
        <button
          className="story-layers__page-route-button"
          type="button"
          onClick={handleClick}
        >
          {content}
        </button>
        <a
          aria-label={`${label} route 새창으로 열기`}
          className={selected ? "story-layers__page-route-link--selected" : "story-layers__page-route-link"}
          href={routeHref}
          rel="noreferrer"
          target="_blank"
          title={`${displayPath ?? label} 새창으로 열기`}
        >
          <Icon
            className="story-layers__page-open-icon"
            includeBaseClass={false}
            name="external-link"
            svgClassName="story-layers__page-open-icon-svg"
          />
        </a>
      </div>
    );
  }

  if (selected) {
    return (
      <button
        className="story-layers__page--selected"
        type="button"
        onClick={handleClick}
      >
        {content}
      </button>
    );
  }

  return (
    <button
      className="story-layers__page"
      type="button"
      onClick={handleClick}
    >
      {content}
    </button>
  );
}

function StoryLayersFocusAction({
  active,
  count,
  onClick,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  function handleClick() {
    onClick();
  }

  const content = (
    <>
      <Icon
        className="story-layers__focus-icon"
        includeBaseClass={false}
        name="star"
        svgClassName="story-layers__focus-icon-svg"
      />
      <span className="story-layers__focus-label">Favorites</span>
      <em className="story-layers__focus-value">{count}</em>
    </>
  );

  if (active) {
    return (
      <button
        className="story-layers__focus-action--active"
        type="button"
        onClick={handleClick}
      >
        {content}
      </button>
    );
  }

  return (
    <button
      className="story-layers__focus-action"
      type="button"
      onClick={handleClick}
    >
      {content}
    </button>
  );
}

function StoryLayerRow({
  collapsedLayerNodes,
  indent,
  isSelected,
  layerTree,
  onHoverLayer,
  onSelectElement,
  onSelectStory,
  onToggleLayerNode,
  selectedElement,
  story,
}: {
  collapsedLayerNodes: Set<string>;
  indent: boolean;
  isSelected: boolean;
  layerTree: LayerNode[] | null;
  selectedElement: LayerElement | null;
  story: StoryRecord;
  onHoverLayer: (
    target: { element: LayerElement | null; storyId: string } | null,
  ) => void;
  onSelectElement: (storyId: string, element: LayerElement | null) => void;
  onSelectStory: (storyId: string, options?: { focusCamera?: boolean }) => void;
  onToggleLayerNode: (key: string) => void;
}) {
  const hasLayerTree = isSelected && layerTree !== null && layerTree.length > 0;
  const storyTreeKey = `story:${story.id}`;
  const storyTreeCollapsed = collapsedLayerNodes.has(storyTreeKey);
  const storyButtonContent = (
    <>
      <StoryLayerTreeTwisty
        expanded={hasLayerTree && !storyTreeCollapsed}
        enabled={hasLayerTree}
        onClick={(event) => {
          if (!hasLayerTree) return;
          event.stopPropagation();
          onToggleLayerNode(storyTreeKey);
        }}
      />
      <span className="story-layers__icon">
        <Icon
          className="story-layers__row-icon"
          includeBaseClass={false}
          name="layout"
          svgClassName="story-layers__row-icon-svg"
        />
      </span>
      <span className="story-layers__name">{story.name}</span>
    </>
  );

  return (
    <>
      {isSelected && !selectedElement ? (
        indent ? (
          <button
            className="story-layers__row--story-variant-selected"
            data-layer-story={story.id}
            title={story.path}
            type="button"
            aria-expanded={hasLayerTree ? !storyTreeCollapsed : undefined}
            onClick={() => {
              onSelectStory(story.id, { focusCamera: true });
              if (selectedElement) onSelectElement(story.id, null);
            }}
            onMouseEnter={() => onHoverLayer({ element: null, storyId: story.id })}
          >
            {storyButtonContent}
          </button>
        ) : (
          <button
            className="story-layers__row--story-selected"
            data-layer-story={story.id}
            title={story.path}
            type="button"
            aria-expanded={hasLayerTree ? !storyTreeCollapsed : undefined}
            onClick={() => {
              onSelectStory(story.id, { focusCamera: true });
              if (selectedElement) onSelectElement(story.id, null);
            }}
            onMouseEnter={() => onHoverLayer({ element: null, storyId: story.id })}
          >
            {storyButtonContent}
          </button>
        )
      ) : indent ? (
        <button
          className="story-layers__row--story-variant"
          data-layer-story={story.id}
          title={story.path}
          type="button"
          aria-expanded={hasLayerTree ? !storyTreeCollapsed : undefined}
          onClick={() => {
            onSelectStory(story.id, { focusCamera: true });
            if (selectedElement) onSelectElement(story.id, null);
          }}
          onMouseEnter={() => onHoverLayer({ element: null, storyId: story.id })}
        >
          {storyButtonContent}
        </button>
      ) : (
        <button
          className="story-layers__row--story"
          data-layer-story={story.id}
          title={story.path}
          type="button"
          aria-expanded={hasLayerTree ? !storyTreeCollapsed : undefined}
          onClick={() => {
            onSelectStory(story.id, { focusCamera: true });
            if (selectedElement) onSelectElement(story.id, null);
          }}
          onMouseEnter={() => onHoverLayer({ element: null, storyId: story.id })}
        >
          {storyButtonContent}
        </button>
      )}
      {hasLayerTree && !storyTreeCollapsed ? (
        <LayerNodeRows
          collapsedLayerNodes={collapsedLayerNodes}
          depth={1}
          nodes={layerTree}
          parentKey={storyTreeKey}
          selectedElement={selectedElement}
          storyId={story.id}
          storyPath={story.path}
          onHoverLayer={onHoverLayer}
          onSelectElement={onSelectElement}
          onToggleLayerNode={onToggleLayerNode}
        />
      ) : null}
    </>
  );
}

function StoryLayerTreeTwisty({
  enabled,
  expanded,
  onClick,
}: {
  enabled: boolean;
  expanded: boolean;
  onClick: MouseEventHandler<HTMLSpanElement>;
}) {
  if (enabled) {
    return (
      <span
        className="story-layers__twisty"
        data-story-layer-twisty="true"
        onClick={onClick}
      >
        <TreeChevron expanded={expanded} />
      </span>
    );
  }

  return (
    <span
      className="story-layers__twisty--idle"
      data-story-layer-twisty="true"
      onClick={onClick}
    >
      <TreeChevron expanded={expanded} />
    </span>
  );
}

function StoryLayerElementTwisty({
  collapsed,
  hasChildren,
}: {
  collapsed: boolean;
  hasChildren: boolean;
}) {
  if (hasChildren) {
    return (
      <span
        className="story-layers__twisty--element"
        data-story-layer-twisty="true"
      >
        <TreeChevron expanded={!collapsed} />
      </span>
    );
  }

  return (
    <span
      className="story-layers__twisty--element-empty"
      data-story-layer-twisty="true"
    />
  );
}

function TreeChevron({ expanded }: { expanded: boolean }) {
  return (
    <Icon
      className="story-layers__chevron"
      includeBaseClass={false}
      name={expanded ? "chevron-down" : "chevron-right"}
      svgClassName="story-layers__chevron-svg"
    />
  );
}

const TEXT_TAGS = new Set([
  "a",
  "dd",
  "dt",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "label",
  "li",
  "p",
  "small",
  "span",
  "strong",
  "td",
  "th",
]);
const GRAPHIC_TAGS = new Set([
  "canvas",
  "circle",
  "g",
  "image",
  "img",
  "path",
  "picture",
  "rect",
  "svg",
  "video",
]);

function layerTypeIconName(tag: string) {
  if (TEXT_TAGS.has(tag)) return "hcds-docs";
  if (GRAPHIC_TAGS.has(tag)) return "image";
  return "package";
}

function layerRowStyle(depth: number): CSSProperties {
  const visualDepth = Math.min(depth, 5);
  const compressedDepth = Math.min(Math.max(depth - 5, 0), 4);
  const paddingLeft = 12 + visualDepth * 12 + compressedDepth * 3;
  return {
    "--layer-branch-left": `${paddingLeft + 7}px`,
    paddingLeft,
  } as CSSProperties;
}

function LayerNodeRows({
  collapsedLayerNodes,
  depth,
  nodes,
  onHoverLayer,
  onSelectElement,
  onToggleLayerNode,
  parentKey,
  selectedElement,
  storyId,
  storyPath,
}: {
  collapsedLayerNodes: Set<string>;
  depth: number;
  nodes: LayerNode[];
  parentKey: string;
  selectedElement: LayerElement | null;
  storyId: string;
  storyPath: string;
  onHoverLayer: (
    target: { element: LayerElement | null; storyId: string } | null,
  ) => void;
  onSelectElement: (storyId: string, element: LayerElement | null) => void;
  onToggleLayerNode: (key: string) => void;
}) {
  return (
    <>
      {nodes.map((node, index) => {
        const descriptor = elementDescriptor(node.element);
        const label = descriptor.component || descriptor.tag;
        const isInstance = isInstanceElementForStory(node.element, storyPath);
        const hasChildren = node.children.length > 0;
        const nodeKey =
          `${parentKey}/${index}:${descriptor.source || descriptor.component || descriptor.tag}`;
        const collapsed = collapsedLayerNodes.has(nodeKey);
        const selected = node.element === selectedElement;
        const rowContent = (
          <>
            <StoryLayerElementTwisty
              collapsed={collapsed}
              hasChildren={hasChildren}
            />
            {isInstance ? (
              <span className="story-layers__icon--instance">
                <Icon
                  className="story-layers__row-icon"
                  includeBaseClass={false}
                  name={layerTypeIconName(descriptor.tag)}
                  svgClassName="story-layers__row-icon-svg"
                />
              </span>
            ) : (
              <span className="story-layers__icon">
                <Icon
                  className="story-layers__row-icon"
                  includeBaseClass={false}
                  name={layerTypeIconName(descriptor.tag)}
                  svgClassName="story-layers__row-icon-svg"
                />
              </span>
            )}
            <span className="story-layers__name">{label}</span>
            {isInstance ? (
              <em className="story-layers__row-meta--instance">인스턴스</em>
            ) : (
              <em className="story-layers__row-meta--element">
                {descriptor.tag}
              </em>
            )}
          </>
        );
        const rowProps = {
          "aria-expanded": hasChildren ? !collapsed : undefined,
          onClick: (event: MouseEvent<HTMLButtonElement>) => {
            const target = event.target as HTMLElement;
            if (hasChildren && closestStoryCanvasElement(target, "[data-story-layer-twisty]")) {
              onToggleLayerNode(nodeKey);
              return;
            }
            onSelectElement(storyId, node.element);
          },
          onMouseEnter: () =>
            onHoverLayer({ element: node.element, storyId }),
          style: layerRowStyle(depth),
          title: descriptor.source,
          type: "button" as const,
        };
        const rowButton = selected ? (
          isInstance ? (
            <button
              className="story-layers__row--element-instance-selected"
              {...rowProps}
            >
              {rowContent}
            </button>
          ) : (
            <button
              className="story-layers__row--element-selected"
              {...rowProps}
            >
              {rowContent}
            </button>
          )
        ) : isInstance ? (
          <button
            className="story-layers__row--element-instance"
            {...rowProps}
          >
            {rowContent}
          </button>
        ) : (
          <button
            className="story-layers__row--element"
            {...rowProps}
          >
            {rowContent}
          </button>
        );
        const childrenRows = hasChildren && !collapsed ? (
          <LayerNodeRows
            collapsedLayerNodes={collapsedLayerNodes}
            depth={depth + 1}
            nodes={node.children}
            parentKey={nodeKey}
            selectedElement={selectedElement}
            storyId={storyId}
            storyPath={storyPath}
            onHoverLayer={onHoverLayer}
            onSelectElement={onSelectElement}
            onToggleLayerNode={onToggleLayerNode}
          />
        ) : null;

        if (hasChildren) {
          return (
            <div className="story-layers__layer-node--branch" key={nodeKey}>
              {rowButton}
              {childrenRows}
            </div>
          );
        }

        return (
          <div className="story-layers__layer-node" key={nodeKey}>
            {rowButton}
            {childrenRows}
          </div>
        );
      })}
    </>
  );
}
