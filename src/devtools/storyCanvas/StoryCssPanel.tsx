import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type SyntheticEvent,
} from 'react';
import Icon from '../support/StoryCanvasIcon';
import { postCssEdit } from './bridgeClient';
import {
  collectMatchedCssRules,
  collectThemeTokenNames,
  firstNumberInValue,
  isRawValue,
  isSingleTokenValue,
  replaceFirstNumberInValue,
  type CssDeclaration,
  type CssRuleMatch,
} from './cssRules';
import {
  annotatedLayerTree,
  sourceFilePath,
  STORY_CANVAS_PREVIEW_SELECTOR,
  type LayerNode,
  type LayerElement,
} from './elementSelection';
import {
  queryStoryCanvasElement,
  queryStoryCanvasElements,
} from './storyCanvasDomBoundary';
import {
  collectTokenInspectionGroups,
  type TokenInspectionGroup,
  type TokenInspectionRow,
  type TokenInspectionSource,
  type TokenReference,
} from './tokenInspection';

const REFRESH_AFTER_EDIT_MS = 350;
const DRAG_PX_PER_STEP = 4;
const OPEN_ALL_RULES_THRESHOLD = 5;

export default function StoryCssPanel({
  element,
  storyId,
  storyPath,
}: {
  element?: LayerElement | null;
  storyId?: string | null;
  storyPath?: string;
}) {
  const [rules, setRules] = useState<CssRuleMatch[]>([]);
  const [computedGroups, setComputedGroups] = useState<ComputedCssGroup[]>([]);
  const [tokenGroups, setTokenGroups] = useState<TokenInspectionGroup[]>([]);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [focusedRuleId, setFocusedRuleId] = useState('');
  const [focusedProperty, setFocusedProperty] = useState('');
  const tokenNames = useMemo(() => collectThemeTokenNames(), []);

  const refresh = useCallback(() => {
    const usesStoryFallback = !element?.isConnected;
    const target = element?.isConnected
      ? element
      : storyTargetElement(storyId, storyPath);

    if (target) {
      const includeDescendants = usesStoryFallback;
      const matchedRules = filterRelevantCssRules(
        collectMatchedCssRules(target, !includeDescendants),
        storyPath,
        target,
      );
      setComputedGroups(collectComputedCssGroups(target, matchedRules));
      setTokenGroups(collectTokenInspectionGroups(target, matchedRules));
      setRules(matchedRules.filter((rule) => rule.editable));
      return;
    }
    setComputedGroups([]);
    setTokenGroups([]);
    setRules([]);
  }, [element, storyId, storyPath]);

  // Computed view needs the matched rule list even when Editable CSS is closed.
  useEffect(() => {
    setError('');
    refresh();
  }, [refresh]);

  const commitEdit = useCallback(async (rule: CssRuleMatch, declaration: CssDeclaration, newValue: string) => {
    const trimmed = newValue.trim();
    if (!trimmed || trimmed === declaration.value) return true;

    setError('');
    rule.styleRule.style.setProperty(declaration.property, trimmed, declaration.important ? 'important' : '');

    const result = await postCssEdit({
      file: rule.file,
      context: rule.context,
      newValue: trimmed,
      oldValue: declaration.value,
      property: declaration.property,
      selector: rule.selector,
    });

    if (!result.ok) {
      rule.styleRule.style.setProperty(declaration.property, declaration.value, declaration.important ? 'important' : '');
      setError(result.error ?? 'Edit failed');
      return false;
    }

    window.setTimeout(refresh, REFRESH_AFTER_EDIT_MS);
    return true;
  }, [refresh]);

  const fileGroups = useMemo(() => groupRulesByFile(rules), [rules]);
  const defaultOpen = rules.length <= OPEN_ALL_RULES_THRESHOLD;
  const handleSourceJump = useCallback((source: ComputedCssSource | TokenInspectionSource) => {
    if (!source.ruleId) return;

    setOpen(true);
    setFocusedRuleId(source.ruleId);
    setFocusedProperty(source.property);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const declaration = queryStoryCanvasElements(document, '[data-story-css-decl-property]')
          .find((candidate) =>
            candidate.getAttribute('data-story-css-decl-rule-id') === source.ruleId
            && candidate.getAttribute('data-story-css-decl-property') === source.property);
        const target = declaration
          ?? queryStoryCanvasElements(document, '[data-story-css-rule-id]')
            .find((candidate) => candidate.getAttribute('data-story-css-rule-id') === source.ruleId);

        target?.scrollIntoView({ block: 'nearest' });
        if (declaration) queryStoryCanvasElement<HTMLElement>(declaration, 'input, select')?.focus();
      });
    });
  }, []);

  return (
    <>
      <StoryTokenPanel
        groups={tokenGroups}
        hasTarget={Boolean(element || storyId)}
        onSourceJump={handleSourceJump}
      />

      <details className="story-canvas-computed-panel" open>
        <summary className="story-canvas-summary">
          <h2 className="story-canvas-panel-heading">
            <Icon className="story-canvas-panel-icon" includeBaseClass={false} name="sliders" svgClassName="story-canvas-panel-icon-svg" />
            <span>Computed</span>
          </h2>
        </summary>
        <div className="story-canvas-section__body">
          {computedGroups.length === 0 ? (
            <div className="story-canvas-muted">
              {element || storyId ? '계산된 스타일 없음' : '프레임을 선택하면 계산값이 표시됩니다'}
            </div>
          ) : (
            <div className="story-canvas-computed__groups">
              {computedGroups.map((group) => (
                <div className="story-canvas-computed__group" key={group.title}>
                  <h3 className="story-canvas-computed-title">{group.title}</h3>
                  <div className="story-canvas-computed__rows">
                    {group.rows.map((row) => (
                      <ComputedCssRowView
                        key={row.property}
                        row={row}
                        onSourceJump={handleSourceJump}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </details>

      <details
        className="story-canvas-css-panel"
        open={open}
        onToggle={(event: SyntheticEvent<HTMLDetailsElement>) => setOpen(event.currentTarget.open)}
      >
        <summary className="story-canvas-css__head">
          {createElement('h2', { className: "story-canvas-css__title" }, (
            <>
            <Icon className="story-canvas-panel-icon" includeBaseClass={false} name="code" svgClassName="story-canvas-panel-icon-svg" />
            <span>Editable CSS</span>
            </>
          ))}
          {open && (element || storyId) ? (
            <span className="story-canvas-css__tools">
              <button
                className="story-canvas-iconbtn"
                title="다시 수집"
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  refresh();
                }}
              >
                <span aria-hidden="true">↻</span>
              </button>
            </span>
          ) : null}
        </summary>
        <div className="story-canvas-section__body">
          {error ? <div className="story-canvas-css__error" role="alert">{error}</div> : null}
          {fileGroups.length === 0 ? (
            <div className="story-canvas-muted">
              {element || storyId ? '편집 가능한 룰 없음' : '프레임을 선택하면 CSS가 표시됩니다'}
            </div>
          ) : (
            fileGroups.map((group) => (
              <div className="story-canvas-css__file" key={group.file}>
                <div className="story-canvas-css__filename" title={group.fileLabel}>
                  {group.fileLabel}
                </div>
                {group.rules.map((rule) => createElement('details', {
                    className: `story-canvas-css__rule ${rule.match === 'scoped' ? 'story-canvas-css__rule--scoped' : ''} ${rule.id === focusedRuleId ? 'story-canvas-css__rule--focused' : ''}`,
                    'data-story-css-rule-id': rule.id,
                    key: rule.id,
                    open: defaultOpen || rule.id === focusedRuleId,
                  }, (
                    <>
                    <summary
                      className={rule.match === 'scoped' ? 'story-canvas-css-rule-summary--scoped' : 'story-canvas-css-rule-summary'}
                      title={rule.match === 'scoped' ? `${rule.selector} — 페이지 스코프 룰 (미리보기엔 조상 없음)` : rule.selector}
                    >
                      {rule.context ? `${rule.context} · ` : ''}{rule.selector}
                    </summary>
                    <div className="story-canvas-css__decls">
                      {rule.declarations.map((declaration) => (
                        <CssDeclRow
                          declaration={declaration}
                          focused={rule.id === focusedRuleId && declaration.property === focusedProperty}
                          key={`${rule.id}|${declaration.property}|${declaration.value}`}
                          rule={rule}
                          tokenNames={tokenNames}
                          onCommit={commitEdit}
                        />
                      ))}
                    </div>
                    </>
                  )))}
              </div>
            ))
          )}
        </div>
      </details>
    </>
  );
}

function StoryTokenPanel({
  groups,
  hasTarget,
  onSourceJump,
}: {
  groups: TokenInspectionGroup[];
  hasTarget: boolean;
  onSourceJump: (source: TokenInspectionSource) => void;
}) {
  const rows = groups.flatMap((group) => group.rows);
  const tokenizedCount = rows.filter((row) => row.status === 'tokenized').length;
  const rawCount = rows.filter((row) => row.status === 'raw').length;

  return (
    <details className="story-canvas-token-panel" open>
      <summary className="story-canvas-summary">
        <h2 className="story-canvas-panel-heading">
          <Icon className="story-canvas-panel-icon" includeBaseClass={false} name="code" svgClassName="story-canvas-panel-icon-svg" />
          <span>Tokens</span>
        </h2>
      </summary>
      <div className="story-canvas-section__body">
        {rows.length === 0 ? (
          <div className="story-canvas-muted">
            {hasTarget ? '토큰 연결 없음' : '프레임을 선택하면 토큰 연결이 표시됩니다'}
          </div>
        ) : (
          <>
            <div className="story-canvas-token-summary">
              <span className="story-canvas-token-summary__item">{tokenizedCount} tokenized</span>
              <span className={rawCount > 0 ? 'story-canvas-token-summary__item--raw' : 'story-canvas-token-summary__item'}>{rawCount} raw</span>
            </div>
            <div className="story-canvas-token-groups">
              {groups.map((group) => (
                <StoryTokenGroup
                  group={group}
                  key={group.title}
                  onSourceJump={onSourceJump}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </details>
  );
}

function StoryTokenGroup({
  group,
  onSourceJump,
}: {
  group: TokenInspectionGroup;
  onSourceJump: (source: TokenInspectionSource) => void;
}) {
  return (
    <div className="story-canvas-token-group">
      <h3 className="story-canvas-token-title">{group.title}</h3>
      <div className="story-canvas-token-rows">
        {group.rows.map((row) => (
          <StoryTokenRow
            key={`${row.category}:${row.property}:${row.value}:${row.source.selector}`}
            row={row}
            onSourceJump={onSourceJump}
          />
        ))}
      </div>
    </div>
  );
}

function StoryTokenRow({
  row,
  onSourceJump,
}: {
  row: TokenInspectionRow;
  onSourceJump: (source: TokenInspectionSource) => void;
}) {
  function handleSourceClick() {
    onSourceJump(row.source);
  }

  return (
    <div className={row.status === 'raw' ? 'story-canvas-token-row--raw' : 'story-canvas-token-row'}>
      <div className="story-canvas-token-main">
        <span className="story-canvas-token-prop" title={row.property}>{row.property}</span>
        {row.tokens.length > 0 ? (
          <div className="story-canvas-token-chain">
            {row.tokens.map((token) => (
              <StoryTokenReferenceView key={token.name} token={token} />
            ))}
          </div>
        ) : (
          <div className="story-canvas-token-raw">
            <strong className="story-canvas-token-raw__value" title={row.value}>{row.value}</strong>
            {row.suggestions.length > 0 ? (
              <span className="story-canvas-token-raw__suggestion" title={row.suggestions.join(', ')}>
                → {row.suggestions[0]}
              </span>
            ) : null}
          </div>
        )}
        <small className="story-canvas-token-value" title={row.resolvedValue}>{row.resolvedValue || row.value}</small>
      </div>
      <button
        className={row.source.match === 'scoped' ? 'story-canvas-token-source--scoped' : 'story-canvas-token-source'}
        title={`${row.source.fileLabel}\n${row.source.selector}\n${row.source.property}: ${row.source.value}`}
        type="button"
        onClick={handleSourceClick}
      >
        <Icon
          className="story-canvas-token-source-icon"
          includeBaseClass={false}
          name="link"
          svgClassName="story-canvas-token-source-icon-svg"
        />
        <span className="story-canvas-token-source-label">{row.source.fileLabel}</span>
      </button>
    </div>
  );
}

function StoryTokenReferenceView({ token }: { token: TokenReference }) {
  const chainLabel = token.chain.join(' → ');

  return (
    <span className="story-canvas-token-ref">
      <strong className="story-canvas-token-ref__name" title={chainLabel}>{token.name}</strong>
      {token.chain.length > 1 ? <em className="story-canvas-token-ref__chain">{token.chain.length}</em> : null}
    </span>
  );
}

type ComputedCssGroup = {
  rows: ComputedCssRow[];
  title: string;
};

type ComputedCssRow = {
  property: string;
  source: ComputedCssSource | null;
  value: string;
};

type ComputedCssSource = {
  editable: boolean;
  fileLabel: string;
  match: CssRuleMatch['match'] | 'inline';
  property: string;
  ruleId: string;
  selector: string;
  value: string;
};

type ComputedPropertySpec = {
  aliases?: string[];
  property: string;
  read?: (style: CSSStyleDeclaration) => string;
};

const COMPUTED_PROPERTY_GROUPS: Array<{ properties: ComputedPropertySpec[]; title: string }> = [
  {
    title: 'Layout',
    properties: [
      { property: 'display' },
      { property: 'position' },
      { property: 'width' },
      { property: 'height' },
      { property: 'min-width' },
      { property: 'max-width' },
    ],
  },
  {
    title: 'Spacing',
    properties: [
      {
        aliases: ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
        property: 'margin',
        read: (style) => boxValue(style, 'margin'),
      },
      {
        aliases: ['padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
        property: 'padding',
        read: (style) => boxValue(style, 'padding'),
      },
      { aliases: ['gap', 'row-gap', 'column-gap'], property: 'gap' },
    ],
  },
  {
    title: 'Text',
    properties: [
      { aliases: ['font', 'font-family'], property: 'font-family' },
      { aliases: ['font', 'font-size'], property: 'font-size' },
      { aliases: ['font', 'font-weight'], property: 'font-weight' },
      { aliases: ['font', 'line-height'], property: 'line-height' },
      { property: 'color' },
      { property: 'text-align' },
    ],
  },
  {
    title: 'Appearance',
    properties: [
      { aliases: ['background', 'background-color'], property: 'background-color' },
      { aliases: ['border', 'border-width'], property: 'border-width' },
      { aliases: ['border', 'border-style'], property: 'border-style' },
      { aliases: ['border', 'border-color'], property: 'border-color' },
      {
        aliases: [
          'border-radius',
          'border-top-left-radius',
          'border-top-right-radius',
          'border-bottom-right-radius',
          'border-bottom-left-radius',
        ],
        property: 'border-radius',
        read: (style) => boxCornerValue(style, 'border'),
      },
      { property: 'opacity' },
      { property: 'box-shadow' },
    ],
  },
];

function ComputedCssRowView({
  onSourceJump,
  row,
}: {
  row: ComputedCssRow;
  onSourceJump: (source: ComputedCssSource) => void;
}) {
  return (
    <div className="story-canvas-computed__row">
      <div className="story-canvas-computed__main">
        <span className="story-canvas-computed__prop" title={row.property}>{row.property}</span>
        <strong className="story-canvas-computed__value" title={row.value}>{row.value}</strong>
      </div>
      {row.source ? (
        <button
          className={row.source.match === 'scoped' ? 'story-canvas-computed__source--scoped' : 'story-canvas-computed__source'}
          title={`${row.source.fileLabel}\n${row.source.selector}\n${row.source.property}: ${row.source.value}`}
          type="button"
          onClick={() => onSourceJump(row.source as ComputedCssSource)}
        >
          <Icon
            className="story-canvas-computed__source-icon"
            includeBaseClass={false}
            name="link"
            svgClassName="story-canvas-computed__source-icon-svg"
          />
          <span>{row.source.selector}</span>
          <em>{row.source.fileLabel}</em>
        </button>
      ) : (
        <span className="story-canvas-computed__source-empty">browser</span>
      )}
    </div>
  );
}

function collectComputedCssGroups(target: Element, rules: CssRuleMatch[]): ComputedCssGroup[] {
  const style = target.ownerDocument.defaultView?.getComputedStyle(target);
  if (!style) return [];

  return COMPUTED_PROPERTY_GROUPS
    .map((group) => ({
      title: group.title,
      rows: group.properties
        .map((spec) => computedCssRow(target, style, rules, spec))
        .filter((row): row is ComputedCssRow => Boolean(row)),
    }))
    .filter((group) => group.rows.length > 0);
}

function computedCssRow(
  target: Element,
  style: CSSStyleDeclaration,
  rules: CssRuleMatch[],
  spec: ComputedPropertySpec,
): ComputedCssRow | null {
  const value = (spec.read ? spec.read(style) : style.getPropertyValue(spec.property)).trim();
  if (!value) return null;

  const aliases = spec.aliases ?? [spec.property];

  return {
    property: spec.property,
    source: computedCssSource(target, rules, aliases),
    value,
  };
}

function computedCssSource(
  target: Element,
  rules: CssRuleMatch[],
  properties: string[],
): ComputedCssSource | null {
  const inline = inlineCssSource(target, properties);
  if (inline) return inline;

  const exact: ComputedCssSource[] = [];
  const scoped: ComputedCssSource[] = [];

  rules.forEach((rule) => {
    rule.declarations.forEach((declaration) => {
      if (!properties.includes(declaration.property)) return;
      const source: ComputedCssSource = {
        editable: rule.editable,
        fileLabel: rule.fileLabel,
        match: rule.match,
        property: declaration.property,
        ruleId: rule.id,
        selector: rule.selector,
        value: declaration.value,
      };
      if (rule.match === 'exact') exact.push(source);
      else scoped.push(source);
    });
  });

  return exact.at(-1) ?? scoped.at(-1) ?? null;
}

function inlineCssSource(target: Element, properties: string[]): ComputedCssSource | null {
  if (!('style' in target)) return null;
  const style = (target as HTMLElement | SVGElement).style;

  for (const property of properties) {
    const value = style.getPropertyValue(property);
    if (!value) continue;

    return {
      editable: false,
      fileLabel: 'element.style',
      match: 'inline',
      property,
      ruleId: '',
      selector: 'element.style',
      value,
    };
  }

  return null;
}

function boxValue(style: CSSStyleDeclaration, prefix: 'margin' | 'padding') {
  return collapseBoxValues([
    style.getPropertyValue(`${prefix}-top`),
    style.getPropertyValue(`${prefix}-right`),
    style.getPropertyValue(`${prefix}-bottom`),
    style.getPropertyValue(`${prefix}-left`),
  ]);
}

function boxCornerValue(style: CSSStyleDeclaration, prefix: 'border') {
  return collapseBoxValues([
    style.getPropertyValue(`${prefix}-top-left-radius`),
    style.getPropertyValue(`${prefix}-top-right-radius`),
    style.getPropertyValue(`${prefix}-bottom-right-radius`),
    style.getPropertyValue(`${prefix}-bottom-left-radius`),
  ]);
}

function collapseBoxValues(values: string[]) {
  const [top, right, bottom, left] = values.map((value) => value.trim() || '0px');
  if (top === right && right === bottom && bottom === left) return top;
  if (top === bottom && right === left) return `${top} ${right}`;
  if (right === left) return `${top} ${right} ${bottom}`;
  return `${top} ${right} ${bottom} ${left}`;
}

function storyTargetElement(storyId?: string | null, storyPath?: string) {
  if (!storyId) return null;

  const card = queryStoryCanvasElements(document, '[data-story-id]')
    .find((candidate) => candidate.getAttribute('data-story-id') === storyId);
  const preview = card ? queryStoryCanvasElement(card, STORY_CANVAS_PREVIEW_SELECTOR) : null;
  if (!preview) return null;

  const annotated = flattenLayerNodes(annotatedLayerTree(preview));
  if (storyPath) {
    const normalizedStoryPath = sourceFilePath(storyPath);
    const storyElement = annotated.find((candidate) =>
      sourceFilePath(candidate.getAttribute('data-cstar-source') ?? '') === normalizedStoryPath);
    if (storyElement) return storyElement;
  }

  return annotated[0] ?? null;
}

function flattenLayerNodes(nodes: LayerNode[]): LayerElement[] {
  return nodes.flatMap((node) => [node.element, ...flattenLayerNodes(node.children)]);
}

function filterRelevantCssRules(rules: CssRuleMatch[], storyPath: string | undefined, target: Element) {
  const roots = cssRelevanceRoots(storyPath, target);
  if (roots.length === 0) return rules;

  const filtered = rules.filter((rule) => {
    const filePath = sourceFilePath(rule.file);
    return roots.some((root) => filePath === `${root}.css` || filePath.startsWith(`${root}/`));
  });

  return filtered.length > 0 ? filtered : rules;
}

function cssRelevanceRoots(storyPath: string | undefined, target: Element) {
  const paths = [
    storyPath,
    target.getAttribute('data-cstar-source') ?? undefined,
  ].flatMap((source) => source ? sourceRoots(sourceFilePath(source)) : []);

  return [...new Set(paths)].sort((a, b) => b.length - a.length);
}

function sourceRoots(path: string) {
  const roots: string[] = [];
  const withoutFile = path.replace(/\/[^/]+$/, '');

  if (withoutFile) roots.push(withoutFile);

  const pageRoot = path.match(/^pages\/v2\/[^/]+/)?.[0];
  if (pageRoot) roots.push(pageRoot);

  if (path.startsWith('shared/')) roots.push('shared');
  if (path.startsWith('features/')) roots.push(path.split('/').slice(0, 2).join('/'));
  if (path.startsWith('entities/')) roots.push(path.split('/').slice(0, 2).join('/'));
  if (path.startsWith('widgets/')) roots.push(path.split('/').slice(0, 2).join('/'));

  return roots;
}

function CssDeclRow({
  declaration,
  focused,
  onCommit,
  rule,
  tokenNames,
}: {
  declaration: CssDeclaration;
  focused?: boolean;
  rule: CssRuleMatch;
  tokenNames: string[];
  onCommit: (rule: CssRuleMatch, declaration: CssDeclaration, newValue: string) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState(declaration.value);
  const dragState = useRef<{ pointerId: number; startNumber: number; startX: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const draggable = !isSingleTokenValue(declaration.value) && firstNumberInValue(declaration.value) !== null;

  useEffect(() => {
    setDraft(declaration.value);
  }, [declaration.value]);

  useEffect(() => {
    if (!focused) return;
    const control = inputRef.current ?? selectRef.current;
    control?.focus();
    if (control instanceof HTMLInputElement) control.select();
  }, [focused]);

  const commit = async (value: string) => {
    const committed = await onCommit(rule, declaration, value);
    if (!committed) setDraft(declaration.value);
  };

  const restoreDeclaration = () => {
    setDraft(declaration.value);
    rule.styleRule.style.setProperty(declaration.property, declaration.value, declaration.important ? 'important' : '');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
      return;
    }
    if (event.key === 'Escape') {
      restoreDeclaration();
      return;
    }

    if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && draggable) {
      const current = firstNumberInValue(draft);
      if (current === null) return;
      event.preventDefault();
      const step = (event.key === 'ArrowUp' ? 1 : -1) * (event.shiftKey ? 10 : event.altKey ? 0.1 : 1);
      const next = replaceFirstNumberInValue(draft, current + step);
      setDraft(next);
      rule.styleRule.style.setProperty(declaration.property, next, declaration.important ? 'important' : '');
    }
  };

  const handleDragStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const startNumber = firstNumberInValue(draft);
    if (startNumber === null) return;
    dragState.current = { pointerId: event.pointerId, startNumber, startX: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const steps = Math.round((event.clientX - drag.startX) / DRAG_PX_PER_STEP);
    const scale = event.shiftKey ? 10 : event.altKey ? 0.1 : 1;
    const next = replaceFirstNumberInValue(draft, drag.startNumber + steps * scale);
    setDraft(next);
    rule.styleRule.style.setProperty(declaration.property, next, declaration.important ? 'important' : '');
  };

  const handleDragEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragState.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    void commit(draft);
  };

  return (
    <div
      className={focused ? 'story-canvas-css__decl--focused' : 'story-canvas-css__decl'}
      data-story-css-decl-property={declaration.property}
      data-story-css-decl-rule-id={rule.id}
    >
      <span className="story-canvas-css__prop" title={declaration.property}>{declaration.property}</span>
      {isSingleTokenValue(declaration.value) && tokenNames.length > 0 ? (
        <select
          aria-label={`${declaration.property} 토큰`}
          className="story-canvas-css__value"
          ref={selectRef}
          value={tokenFromValue(draft) ?? ''}
          onChange={(event) => {
            const next = `var(${event.currentTarget.value})`;
            setDraft(next);
            void commit(next);
          }}
        >
          {tokenOptions(tokenNames, tokenFromValue(declaration.value)).map((token) => (
            <option key={token} value={token}>{token}</option>
          ))}
        </select>
      ) : (
        <input
          aria-label={`${declaration.property} 값`}
          className="story-canvas-css__value"
          ref={inputRef}
          type="text"
          value={draft}
          onBlur={() => void commit(draft)}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
        />
      )}
      {draggable ? (
        <button
          aria-label={`${declaration.property} 드래그 조절`}
          className="story-canvas-css__drag"
          title="드래그로 조절 (Shift=10, Alt=0.1)"
          type="button"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
        >
          ↔
        </button>
      ) : null}
      {isRawValue(declaration.value) ? <em className="story-canvas-css__raw" title="토큰이 아닌 raw 값">raw</em> : null}
    </div>
  );
}

function groupRulesByFile(rules: CssRuleMatch[]) {
  const groups = new Map<string, { editable: boolean; file: string; fileLabel: string; rules: CssRuleMatch[] }>();

  for (const rule of rules) {
    const group = groups.get(rule.file)
      ?? { editable: rule.editable, file: rule.file, fileLabel: rule.fileLabel, rules: [] };
    group.rules.push(rule);
    groups.set(rule.file, group);
  }

  for (const group of groups.values()) {
    group.rules.sort((a, b) => Number(a.match === 'scoped') - Number(b.match === 'scoped'));
  }

  // Editable react/src files first — those are the ones the designer can act on.
  return [...groups.values()].sort((a, b) =>
    Number(b.editable) - Number(a.editable) || a.fileLabel.localeCompare(b.fileLabel));
}

function tokenFromValue(value: string) {
  return value.trim().match(/^var\((--[\w-]+)\)$/)?.[1] ?? null;
}

function tokenOptions(tokenNames: string[], currentToken: string | null) {
  if (currentToken && !tokenNames.includes(currentToken)) return [currentToken, ...tokenNames];
  return tokenNames;
}
