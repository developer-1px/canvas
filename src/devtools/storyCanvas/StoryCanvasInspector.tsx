import type { ChangeEvent, ReactNode } from 'react';
import type { SupportedLanguage } from '../support/storyCanvasLanguage';
import type { CanvasViewportLayerSnapshot } from './CanvasViewportBridge';
import { isBridgeEnabled } from './bridgeClient';
import {
  elementClipGeometry,
  elementDescriptor,
  type LayerElement,
} from './elementSelection';
import StoryCssPanel from './StoryCssPanel';
import StoryElementPanel from './StoryElementPanel';
import {
  sourceReferenceFromSource,
  type ElementInstanceTarget,
} from './storyCanvasModel';
import type { StoryRecord } from './storyData';
import Icon from '../support/StoryCanvasIcon';

export function StoryCanvasToolbar({
  favoriteCount,
  favoritesOnly,
  language,
  onFavoritesOnlyChange,
  onLanguageChange,
}: {
  favoriteCount: number;
  favoritesOnly: boolean;
  language: SupportedLanguage;
  onFavoritesOnlyChange: (value: boolean) => void;
  onLanguageChange: (language: SupportedLanguage) => void;
}) {
  function handleFavoritesOnlyClick() {
    onFavoritesOnlyChange(!favoritesOnly);
  }

  return (
    <div className="story-canvas-toolbar" aria-label="Story canvas tools">
      <StoryCanvasLanguageToggle language={language} onChange={onLanguageChange} />
      <StoryCanvasFavoritesButton
        favoriteCount={favoriteCount}
        favoritesOnly={favoritesOnly}
        onClick={handleFavoritesOnlyClick}
      />
    </div>
  );
}

function StoryCanvasLanguageToggle({
  language,
  onChange,
}: {
  language: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
}) {
  return (
    <div className="story-canvas-language" aria-label="Story language">
      <button
        aria-pressed={language === 'ko-KR'}
        className={language === 'ko-KR' ? 'story-canvas-language-button--active' : 'story-canvas-language-button'}
        title="한국어로 보기"
        type="button"
        onClick={() => onChange('ko-KR')}
      >
        KO
      </button>
      <button
        aria-pressed={language === 'en-US'}
        className={language === 'en-US' ? 'story-canvas-language-button--active' : 'story-canvas-language-button'}
        title="영어로 보기"
        type="button"
        onClick={() => onChange('en-US')}
      >
        EN
      </button>
    </div>
  );
}

function StoryCanvasFavoritesButton({
  favoriteCount,
  favoritesOnly,
  onClick,
}: {
  favoriteCount: number;
  favoritesOnly: boolean;
  onClick: () => void;
}) {
  function handleClick() {
    onClick();
  }

  if (favoritesOnly) {
    return (
      <button
        aria-pressed="true"
        className="story-canvas-toolbtn-active"
        title="Favorites만 보기"
        type="button"
        onClick={handleClick}
      >
        <Icon className="story-canvas-toolbtn-icon" includeBaseClass={false} name="star" svgClassName="story-canvas-toolbtn-icon-svg" />
        <span>Favorites</span>
        <em className="story-canvas-toolbtn-count-active">{favoriteCount}</em>
      </button>
    );
  }

  return (
    <button
      aria-pressed="false"
      className="story-canvas-toolbtn"
      title="Favorites만 보기"
      type="button"
      onClick={handleClick}
    >
      <Icon className="story-canvas-toolbtn-icon" includeBaseClass={false} name="star" svgClassName="story-canvas-toolbtn-icon-svg" />
      <span>Favorites</span>
      <em className="story-canvas-toolbtn-count">{favoriteCount}</em>
    </button>
  );
}

export default function StoryCanvasInspector({
  copyState,
  favoriteCount,
  filteredCount,
  isSelectedStoryFavorite,
  onCopy,
  onGoToInstance,
  onReviewNoteChange,
  onSelectStory,
  onToggleFavorite,
  reviewNote,
  selectedElement,
  selectedElementInstance,
  selectedClipGeometry,
  selectedStory,
  storyRecordById,
  totalCount,
}: {
  copyState: string;
  favoriteCount: number;
  filteredCount: number;
  isSelectedStoryFavorite: boolean;
  reviewNote: string;
  selectedClipGeometry: ReturnType<typeof elementClipGeometry> | null;
  selectedElement: LayerElement | null;
  selectedElementInstance: ElementInstanceTarget | null;
  selectedSnapshot: CanvasViewportLayerSnapshot | null;
  selectedStory?: StoryRecord;
  storyRecordById: Map<string, StoryRecord>;
  totalCount: number;
  onCopy: (value: string, label: string) => void;
  onGoToInstance: (target: ElementInstanceTarget) => void;
  onReviewNoteChange: (storyId: string, note: string) => void;
  onSelectStory: (storyId: string) => void;
  onToggleFavorite: (storyId: string) => void;
}) {
  const instanceStory = selectedElementInstance?.targetStoryId
    ? storyRecordById.get(selectedElementInstance.targetStoryId)
    : undefined;
  const selectedElementDescriptor = selectedElement?.isConnected ? elementDescriptor(selectedElement) : null;
  const selectedTargetLabel = selectedElementDescriptor?.component || selectedElementDescriptor?.tag || selectedStory?.name || '';
  const selectedTargetMeta = selectedElementDescriptor && selectedStory ? selectedStory.name : selectedStory?.path ?? '';

  function handleFavoriteClick() {
    if (!selectedStory) return;
    onToggleFavorite(selectedStory.id);
  }

  function handleReviewNoteInputChange(event: ChangeEvent<HTMLTextAreaElement>) {
    if (!selectedStory) return;
    onReviewNoteChange(selectedStory.id, event.currentTarget.value);
  }

  return (
    <aside className="story-canvas-inspector" aria-label="Story inspector">
      <header className="story-canvas-inspector__head">
        <div className="story-canvas-inspector__title">
          <div className="story-canvas-inspector__copy">
            <h1 className="story-canvas-inspector-heading">Inspector</h1>
            <p className="story-canvas-inspector-count">{filteredCount}/{totalCount} · favorites {favoriteCount}</p>
          </div>
          {selectedStory ? (
            <button
              aria-label={isSelectedStoryFavorite ? `${selectedStory.name} favorite 해제` : `${selectedStory.name} favorite 추가`}
              aria-pressed={isSelectedStoryFavorite}
              className={isSelectedStoryFavorite ? 'story-canvas-favorite--active' : 'story-canvas-favorite'}
              title={isSelectedStoryFavorite ? 'Favorite 해제' : 'Favorite 추가'}
              type="button"
              onClick={handleFavoriteClick}
            >
              <Icon
                className="story-canvas-favorite-icon"
                includeBaseClass={false}
                name="star"
                svgClassName={isSelectedStoryFavorite ? 'story-canvas-favorite-icon-svg--active' : 'story-canvas-favorite-icon-svg'}
              />
            </button>
          ) : null}
        </div>
      </header>

      <div className="story-canvas-inspector__body">
        {copyState ? <div className="story-canvas-copy-state">{copyState}</div> : null}

        {selectedStory ? (
          <>
            <div className="story-canvas-inspector-target">
              <span className="story-canvas-inspector-target__type">{selectedElementDescriptor ? 'Element' : 'Frame'}</span>
              <strong className="story-canvas-inspector-target__name">{selectedTargetLabel}</strong>
              <small className="story-canvas-inspector-target__meta">{selectedTargetMeta}</small>
            </div>
            {selectedElement ? (
              <StoryInspectorSection icon="package" title="Element">
                <StoryElementPanel
                  clipGeometry={selectedClipGeometry}
                  element={selectedElement}
                  instanceInfo={selectedElementInstance}
                />
              </StoryInspectorSection>
            ) : null}
            <StoryInspectorSourceSection
              instanceInfo={selectedElementInstance}
              selectedElement={selectedElement}
              story={selectedStory}
              onCopy={onCopy}
              onGoToInstance={onGoToInstance}
            />
            <StoryPropsPanel
              instanceStory={instanceStory}
              selectedElement={selectedElement}
              story={selectedStory}
              storyRecordById={storyRecordById}
              onSelectStory={onSelectStory}
            />
            {isBridgeEnabled() ? (
              <StoryCssPanel
                element={selectedElement}
                storyId={selectedStory.id}
                storyPath={selectedStory.path}
              />
            ) : null}
            <StoryInspectorSection icon="message-circle" title="Review">
              <textarea
                aria-label="리뷰 메모"
                className="story-canvas-note-input"
                placeholder="Leave note"
                rows={4}
                value={reviewNote}
                onChange={handleReviewNoteInputChange}
              />
            </StoryInspectorSection>
          </>
        ) : (
          <div className="story-canvas-inspector-empty-muted">
            프레임을 선택하면 속성이 표시됩니다.
            <br />Alt+호버 = 거리 측정 · Esc = 한 단계 위로
          </div>
        )}
      </div>
    </aside>
  );
}

function StoryInspectorSection({
  children,
  icon,
  open = true,
  title,
}: {
  children: ReactNode;
  icon: string;
  open?: boolean;
  title: string;
}) {
  return (
    <details className="story-canvas-inspector-section" open={open}>
      <summary className="story-canvas-summary">
        <h2 className="story-canvas-panel-heading">
          <Icon className="story-canvas-panel-icon" includeBaseClass={false} name={icon} svgClassName="story-canvas-panel-icon-svg" />
          <span>{title}</span>
        </h2>
      </summary>
      <div className="story-canvas-section__body">
        {children}
      </div>
    </details>
  );
}

function StoryInspectorSourceSection({
  instanceInfo,
  onCopy,
  onGoToInstance,
  selectedElement,
  story,
}: {
  instanceInfo: ElementInstanceTarget | null;
  selectedElement: LayerElement | null;
  story: StoryRecord;
  onCopy: (value: string, label: string) => void;
  onGoToInstance: (target: ElementInstanceTarget) => void;
}) {
  const source = selectedElement?.isConnected
    ? elementDescriptor(selectedElement).source
    : story.path;
  const sourceReference = sourceReferenceFromSource(source);
  const canGoToInstance = Boolean(instanceInfo?.canGoToTarget);

  function handleSourceCopyClick() {
    onCopy(sourceReference, 'Source reference');
  }

  function handleInstanceSourceClick() {
    if (!canGoToInstance || !instanceInfo) return;
    onGoToInstance(instanceInfo);
  }

  return (
    <StoryInspectorSection icon="code" title="Source">
      <div className="story-canvas-source-list">
        <button
          className="story-canvas-element__source"
          title={`${sourceReference} 복사`}
          type="button"
          onClick={handleSourceCopyClick}
        >
          <Icon
            className="story-canvas-element__source-icon"
            includeBaseClass={false}
            name="code"
            svgClassName="story-canvas-element__source-icon-svg"
          />
          <span className="story-canvas-element__source-label">{sourceReference}</span>
        </button>
        {instanceInfo ? (
          <button
            className="story-canvas-element__source--instance"
            disabled={!canGoToInstance}
            title={canGoToInstance ? `${instanceInfo.sourcePath} 원본으로 이동` : `${instanceInfo.sourcePath} 스토리 없음`}
            type="button"
            onClick={handleInstanceSourceClick}
          >
            <Icon
              className="story-canvas-element__source-icon--instance"
              includeBaseClass={false}
              name="link"
              svgClassName="story-canvas-element__source-icon-svg--instance"
            />
            <span className="story-canvas-element__source-label">
              {instanceInfo.targetLabel}
            </span>
          </button>
        ) : null}
      </div>
    </StoryInspectorSection>
  );
}

function StoryPropsPanel({
  instanceStory,
  onSelectStory,
  selectedElement,
  story,
  storyRecordById,
}: {
  instanceStory?: StoryRecord;
  selectedElement: LayerElement | null;
  story: StoryRecord;
  storyRecordById: Map<string, StoryRecord>;
  onSelectStory: (storyId: string) => void;
}) {
  const targetStory = instanceStory ?? story;
  const targetStoryInfo = storyVariantInfo(targetStory, storyRecordById);
  const elementProps = selectedElement?.isConnected ? elementPropEntries(selectedElement) : [];
  const showElementProps = elementProps.length > 0;

  return (
    <>
      <StoryVariantPanel
        currentStory={story}
        info={targetStoryInfo}
        instanceStory={instanceStory}
        onSelectStory={onSelectStory}
      />
      <StoryInspectorSection icon="sliders" title="Props">
      {showElementProps ? (
        <StoryPropGroup
          label={instanceStory ? 'Instance props' : 'Element props'}
          props={elementProps}
        />
      ) : null}
      <StoryPropGroup
        emptyText="Default와 다른 props 없음"
        label="Changed props"
        props={targetStoryInfo.changedProps}
      />
      {targetStoryInfo.allProps.length > 0 ? (
        <StoryPropDisclosure
          label="All args"
          props={targetStoryInfo.allProps}
        />
      ) : null}
      {!showElementProps && targetStoryInfo.changedProps.length === 0 && targetStoryInfo.allProps.length === 0 ? (
        <div className="story-canvas-muted">No props</div>
      ) : null}
      </StoryInspectorSection>
    </>
  );
}

type StoryVariantInfo = {
  allProps: StoryPropEntry[];
  changedProps: StoryPropEntry[];
  componentName: string;
  defaultStory?: StoryRecord;
  siblingStories: StoryRecord[];
  story: StoryRecord;
  variantLabel: string;
};

function StoryVariantPanel({
  currentStory,
  info,
  instanceStory,
  onSelectStory,
}: {
  currentStory: StoryRecord;
  info: StoryVariantInfo;
  instanceStory?: StoryRecord;
  onSelectStory: (storyId: string) => void;
}) {
  const showUsedIn = Boolean(instanceStory && instanceStory.id !== currentStory.id);

  return (
    <StoryInspectorSection icon="package" title="Story">
      <div className="story-canvas-story-meta">
        <StoryInfoRow label="Component" value={info.componentName} />
        <StoryInfoRow label="Variant" value={info.variantLabel} />
        <StoryInfoRow label="Path" value={sourceReferenceFromSource(info.story.path)} />
      </div>
      {showUsedIn ? (
        <div className="story-canvas-story-context" title={currentStory.storyTitle}>
          Used in {storyComponentName(currentStory)} / {variantLabelForStory(currentStory)}
        </div>
      ) : null}
      {info.siblingStories.length > 1 ? (
        <StoryVariantList
          selectedStoryId={info.story.id}
          stories={info.siblingStories}
          onSelectStory={onSelectStory}
        />
      ) : null}
    </StoryInspectorSection>
  );
}

function StoryInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="story-canvas-story-row">
      <span className="story-canvas-story-label">{label}</span>
      <span className="story-canvas-story-value" title={value}>{value}</span>
    </div>
  );
}

function StoryVariantList({
  onSelectStory,
  selectedStoryId,
  stories,
}: {
  selectedStoryId: string;
  stories: StoryRecord[];
  onSelectStory: (storyId: string) => void;
}) {
  return (
    <div className="story-canvas-variant-list" aria-label="Story variants">
      {stories.map((story) => (
        <StoryVariantButton
          active={story.id === selectedStoryId}
          key={story.id}
          story={story}
          onSelectStory={onSelectStory}
        />
      ))}
    </div>
  );
}

function StoryVariantButton({
  active,
  onSelectStory,
  story,
}: {
  active: boolean;
  story: StoryRecord;
  onSelectStory: (storyId: string) => void;
}) {
  function handleVariantClick() {
    onSelectStory(story.id);
  }

  return (
    <button
      aria-pressed={active}
      className={active ? 'story-canvas-variant-chip--active' : 'story-canvas-variant-chip'}
      title={story.storyTitle}
      type="button"
      onClick={handleVariantClick}
    >
      {variantLabelForStory(story)}
    </button>
  );
}

function StoryPropDisclosure({ label, props }: { label: string; props: StoryPropEntry[] }) {
  return (
    <details className="story-canvas-prop-disclosure">
      <summary className="story-canvas-prop-disclosure-summary">
        <span className="story-canvas-prop-disclosure-label">{label}</span>
        <span className="story-canvas-prop-disclosure-count">{props.length}</span>
      </summary>
      <StoryPropList props={props} />
    </details>
  );
}

function storyVariantInfo(story: StoryRecord, storyRecordById: Map<string, StoryRecord>): StoryVariantInfo {
  const siblingStories = siblingStoriesForStory(story, storyRecordById);
  const defaultStory = defaultStoryForStory(story, siblingStories);
  const allProps = storyArgEntries(story);

  return {
    allProps,
    changedProps: changedStoryArgEntries(story, defaultStory),
    componentName: storyComponentName(story),
    defaultStory,
    siblingStories,
    story,
    variantLabel: variantLabelForStory(story),
  };
}

function siblingStoriesForStory(story: StoryRecord, storyRecordById: Map<string, StoryRecord>) {
  return Array.from(storyRecordById.values())
    .filter((candidate) => candidate.modulePath === story.modulePath)
    .sort(compareStoryVariants);
}

function defaultStoryForStory(story: StoryRecord, siblingStories: StoryRecord[]) {
  const viewportId = story.responsiveViewport?.id;

  return siblingStories.find((candidate) =>
    baseStoryExport(candidate.storyExport) === 'Default'
    && candidate.responsiveViewport?.id === viewportId)
    ?? siblingStories.find((candidate) => baseStoryExport(candidate.storyExport) === 'Default' && !candidate.responsiveViewport)
    ?? siblingStories.find((candidate) => baseStoryExport(candidate.storyExport) === 'Default')
    ?? siblingStories[0];
}

function changedStoryArgEntries(story: StoryRecord, defaultStory?: StoryRecord): StoryPropEntry[] {
  if (!defaultStory || defaultStory.id === story.id) return [];
  const keys = Array.from(new Set([...Object.keys(defaultStory.args), ...Object.keys(story.args)]));

  return keys
    .filter((key) => !propValuesEqual(defaultStory.args[key], story.args[key]))
    .map((name) => ({
      name,
      value: formatPropValue(story.args[name]),
    }));
}

function compareStoryVariants(a: StoryRecord, b: StoryRecord) {
  const defaultOrder = storyDefaultWeight(a) - storyDefaultWeight(b);
  if (defaultOrder !== 0) return defaultOrder;

  const viewportOrder = storyViewportWeight(a) - storyViewportWeight(b);
  if (viewportOrder !== 0) return viewportOrder;

  return variantLabelForStory(a).localeCompare(variantLabelForStory(b));
}

function storyDefaultWeight(story: StoryRecord) {
  return baseStoryExport(story.storyExport) === 'Default' ? 0 : 1;
}

function storyViewportWeight(story: StoryRecord) {
  return story.responsiveViewport?.order ?? -1;
}

function storyComponentName(story: StoryRecord) {
  const titleParts = story.storyTitle.split('/').filter(Boolean);
  const storyExport = baseStoryExport(story.storyExport);
  const storyExportIndex = titleParts.lastIndexOf(storyExport);
  if (storyExportIndex > 0) return titleParts[storyExportIndex - 1] ?? story.name;

  const fileName = story.path.split('/').filter(Boolean).pop();
  if (fileName) return fileName.replace(/\.tsx$/, '');

  return story.name;
}

function variantLabelForStory(story: StoryRecord) {
  const baseLabel = baseStoryExport(story.storyExport);
  if (story.responsiveViewport) return `${baseLabel} · ${story.responsiveViewport.label}`;
  return baseLabel;
}

function baseStoryExport(storyExport: string) {
  return storyExport.replace(/-(desktop|tablet|mobile)$/, '');
}

function propValuesEqual(a: unknown, b: unknown) {
  return propFingerprint(a) === propFingerprint(b);
}

function propFingerprint(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return `${typeof value}:${String(value)}`;
  }
  if (typeof value === 'function') return 'function';
  if (typeof value === 'symbol') return String(value);

  try {
    return JSON.stringify(value, circularSafeReplacer()) ?? String(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
}

function circularSafeReplacer() {
  const seen = new WeakSet<object>();

  return (_key: string, value: unknown) => {
    if (typeof value === 'function') return '[Function]';
    if (typeof value === 'symbol') return String(value);
    if (!value || typeof value !== 'object') return value;
    if (seen.has(value)) return '[Circular]';
    seen.add(value);
    if (isReactElementLike(value)) return `[ReactElement:${reactElementTypeName(value)}]`;
    return value;
  };
}

function isReactElementLike(value: object) {
  return '$$typeof' in value && 'props' in value;
}

function reactElementTypeName(value: object) {
  const type = (value as { type?: unknown }).type;
  if (typeof type === 'string') return type;
  if (typeof type === 'function') {
    const componentType = type as { displayName?: string; name?: string };
    return componentType.displayName || componentType.name || 'Component';
  }
  return 'Node';
}

function StoryPropGroup({
  emptyText = 'No props',
  label,
  props,
}: {
  emptyText?: string;
  label: string;
  props: StoryPropEntry[];
}) {
  return (
    <div className="story-canvas-prop-group">
      <h3 className="story-canvas-prop-title">{label}</h3>
      {props.length > 0 ? (
        <StoryPropList props={props} />
      ) : (
        <div className="story-canvas-muted">{emptyText}</div>
      )}
    </div>
  );
}

function StoryPropList({ props }: { props: StoryPropEntry[] }) {
  return (
    <dl className="story-canvas-prop-list">
      {props.map((prop, index) => (
        <div className="story-canvas-prop" key={`${prop.name}-${index}`}>
          <dt className="story-canvas-prop-name" title={prop.name}>{prop.name}</dt>
          <dd className="story-canvas-prop-value" title={prop.value}>{prop.value}</dd>
        </div>
      ))}
    </dl>
  );
}

type StoryPropEntry = {
  name: string;
  value: string;
};

function elementPropEntries(element: LayerElement): StoryPropEntry[] {
  const raw = element.getAttribute('data-cstar-props');
  if (!raw) return [];

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Array<{ name?: unknown; value?: unknown }>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => ({
        name: typeof entry.name === 'string' ? entry.name : '',
        value: typeof entry.value === 'string' ? entry.value : '',
      }))
      .filter((entry) => entry.name);
  } catch {
    return [];
  }
}

function storyArgEntries(story: StoryRecord): StoryPropEntry[] {
  return Object.entries(story.args).map(([name, value]) => ({
    name,
    value: formatPropValue(value),
  }));
}

function formatPropValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (value.every((item) => ['boolean', 'number', 'string'].includes(typeof item))) {
      return `[${value.map(formatPropValue).join(', ')}]`;
    }
    return `[${value.length} items]`;
  }
  if (typeof value === 'function') return 'ƒ';
  if (typeof value === 'object') {
    if (isReactElementLike(value)) return `<${reactElementTypeName(value)} />`;
    const keys = Object.keys(value);
    if (keys.length > 0) return `{${keys.slice(0, 3).join(', ')}}`;
    return '{}';
  }
  return String(value);
}
