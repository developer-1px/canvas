import { matchesStoryCanvasSelector } from './storyCanvasDomBoundary';
import type { CssDeclaration, CssRuleMatch } from './cssRules';

export type TokenInspectionGroup = {
  rows: TokenInspectionRow[];
  title: string;
};

export type TokenInspectionRow = {
  category: TokenUsageCategory;
  property: string;
  resolvedValue: string;
  source: TokenInspectionSource;
  status: 'raw' | 'tokenized';
  suggestions: string[];
  tokens: TokenReference[];
  value: string;
};

export type TokenInspectionSource = {
  editable: boolean;
  fileLabel: string;
  match: CssRuleMatch['match'] | 'inline';
  property: string;
  ruleId: string;
  selector: string;
  value: string;
};

export type TokenReference = {
  chain: string[];
  name: string;
  resolvedValue: string;
};

type TokenUsageCategory = 'Color' | 'Effect' | 'Shape' | 'Spacing' | 'Typography';

type TokenDefinition = {
  name: string;
  value: string;
};

const TOKEN_ROW_LIMIT = 32;
const TOKEN_NAME_PATTERN = /var\(\s*(--[A-Za-z0-9_-]+)/g;
const TOKEN_PREFIX_PATTERN = /^--(?:alias|base|color|comp|font|letter-spacing|line-height|radius|shadow|spacing)-/;
const RAW_SUGGESTION_LIMIT = 3;

const PROPERTY_CATEGORY_MATCHERS: Array<{ category: TokenUsageCategory; pattern: RegExp }> = [
  { category: 'Color', pattern: /(?:^|-)color$|^color$|^background$|^background-color$|^fill$|^stroke$|^caret-color$/ },
  { category: 'Typography', pattern: /^font|^line-height$|^letter-spacing$/ },
  { category: 'Spacing', pattern: /^(?:margin|padding)(?:-|$)|^(?:gap|row-gap|column-gap|inset|top|right|bottom|left)$/ },
  { category: 'Shape', pattern: /^border-radius$|^border-.*-radius$/ },
  { category: 'Effect', pattern: /shadow|opacity/ },
];

export function collectTokenInspectionGroups(target: Element, rules: CssRuleMatch[]): TokenInspectionGroup[] {
  const view = target.ownerDocument.defaultView;
  const computedStyle = view?.getComputedStyle(target);
  if (!computedStyle) return [];

  const registry = collectTokenRegistry(target);
  const rows = [
    ...collectInlineRows(target, computedStyle, registry),
    ...collectRuleRows(rules, computedStyle, registry),
  ];
  const uniqueRows = uniqueTokenRows(rows)
    .sort(tokenRowSort)
    .slice(0, TOKEN_ROW_LIMIT);

  return groupTokenRows(uniqueRows);
}

function collectInlineRows(
  target: Element,
  computedStyle: CSSStyleDeclaration,
  registry: Map<string, TokenDefinition>,
) {
  if (!('style' in target)) return [];
  const style = (target as HTMLElement | SVGElement).style;
  const rows: TokenInspectionRow[] = [];

  for (let index = 0; index < style.length; index += 1) {
    const property = style.item(index);
    const value = style.getPropertyValue(property).trim();
    const row = tokenInspectionRow({
      computedStyle,
      declaration: { important: false, property, value },
      registry,
      source: {
        editable: false,
        fileLabel: 'element.style',
        match: 'inline',
        property,
        ruleId: '',
        selector: 'element.style',
        value,
      },
    });
    if (row) rows.push(row);
  }

  return rows;
}

function collectRuleRows(
  rules: CssRuleMatch[],
  computedStyle: CSSStyleDeclaration,
  registry: Map<string, TokenDefinition>,
) {
  const rows: TokenInspectionRow[] = [];

  for (const rule of rules) {
    for (const declaration of rule.declarations) {
      const row = tokenInspectionRow({
        computedStyle,
        declaration,
        registry,
        source: {
          editable: rule.editable,
          fileLabel: rule.fileLabel,
          match: rule.match,
          property: declaration.property,
          ruleId: rule.id,
          selector: rule.selector,
          value: declaration.value,
        },
      });
      if (row) rows.push(row);
    }
  }

  return rows;
}

function tokenInspectionRow({
  computedStyle,
  declaration,
  registry,
  source,
}: {
  computedStyle: CSSStyleDeclaration;
  declaration: CssDeclaration;
  registry: Map<string, TokenDefinition>;
  source: TokenInspectionSource;
}): TokenInspectionRow | null {
  const category = categoryFromProperty(declaration.property);
  if (!category) return null;

  const tokenNames = tokenNamesFromValue(declaration.value).filter(isDesignTokenName);

  if (tokenNames.length > 0) {
    const tokens = tokenNames.map((name) => tokenReference(name, registry, computedStyle));

    return {
      category,
      property: declaration.property,
      resolvedValue: resolvedTokenizedDeclarationValue(tokens),
      source,
      status: 'tokenized',
      suggestions: [],
      tokens,
      value: declaration.value,
    };
  }

  if (!isInspectableRawValue(declaration.value)) return null;

  return {
    category,
    property: declaration.property,
    resolvedValue: declaration.value,
    source,
    status: 'raw',
    suggestions: suggestTokenNames(declaration.value, registry),
    tokens: [],
    value: declaration.value,
  };
}

function tokenReference(
  tokenName: string,
  registry: Map<string, TokenDefinition>,
  computedStyle: CSSStyleDeclaration,
): TokenReference {
  const chain = tokenChain(tokenName, registry);

  return {
    chain,
    name: tokenName,
    resolvedValue: resolvedTokenValue(chain, registry, computedStyle),
  };
}

function resolvedTokenValue(
  chain: string[],
  registry: Map<string, TokenDefinition>,
  computedStyle: CSSStyleDeclaration,
) {
  for (const tokenName of [...chain].reverse()) {
    const value = registry.get(tokenName)?.value ?? computedStyle.getPropertyValue(tokenName).trim();
    if (value && tokenNamesFromValue(value).filter(isDesignTokenName).length === 0) return value;
  }

  const rootTokenName = chain[0];
  if (!rootTokenName) return '';
  return computedStyle.getPropertyValue(rootTokenName).trim() || (registry.get(rootTokenName)?.value ?? '');
}

function resolvedTokenizedDeclarationValue(tokens: TokenReference[]) {
  return Array.from(new Set(tokens.map((token) => token.resolvedValue || token.name).filter(Boolean))).join(' · ');
}

function tokenChain(tokenName: string, registry: Map<string, TokenDefinition>) {
  const chain: string[] = [];
  const visited = new Set<string>();
  let current = tokenName;

  while (current && !visited.has(current)) {
    chain.push(current);
    visited.add(current);
    const next = tokenNamesFromValue(registry.get(current)?.value ?? '').find(isDesignTokenName);
    if (!next) break;
    current = next;
  }

  return chain;
}

function collectTokenRegistry(target: Element) {
  const registry = new Map<string, TokenDefinition>();
  const elements = inheritedElements(target);

  for (const sheet of Array.from(target.ownerDocument.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }

    collectTokenDefinitionsFromRules(rules, elements, registry);
  }

  return registry;
}

function collectTokenDefinitionsFromRules(
  rules: CSSRuleList,
  elements: Element[],
  registry: Map<string, TokenDefinition>,
) {
  for (const rule of Array.from(rules)) {
    if (isStyleRule(rule)) {
      if (!ruleAppliesToAnyElement(rule.selectorText, elements)) continue;

      for (let index = 0; index < rule.style.length; index += 1) {
        const name = rule.style.item(index);
        if (!isDesignTokenName(name)) continue;
        registry.set(name, {
          name,
          value: rule.style.getPropertyValue(name).trim(),
        });
      }
      continue;
    }

    const nested = (rule as CSSGroupingRule).cssRules as CSSRuleList | undefined;
    if (nested) collectTokenDefinitionsFromRules(nested, elements, registry);
  }
}

function inheritedElements(target: Element) {
  const elements: Element[] = [];
  const root = target.ownerDocument.documentElement;
  if (root) elements.push(root);
  if (target.ownerDocument.body && target.ownerDocument.body !== root) elements.push(target.ownerDocument.body);

  let current: Element | null = target;
  const ancestors: Element[] = [];
  while (current) {
    ancestors.unshift(current);
    current = current.parentElement;
  }

  for (const ancestor of ancestors) {
    if (!elements.includes(ancestor)) elements.push(ancestor);
  }

  return elements;
}

function ruleAppliesToAnyElement(selector: string, elements: Element[]) {
  return selector
    .split(',')
    .some((part) => {
      const selectorPart = part.trim();
      if (!selectorPart) return false;

      return elements.some((element) => {
        try {
          return matchesStoryCanvasSelector(element, selectorPart);
        } catch {
          return false;
        }
      });
    });
}

function tokenNamesFromValue(value: string) {
  const names: string[] = [];
  for (const match of value.matchAll(TOKEN_NAME_PATTERN)) {
    const name = match[1];
    if (name) names.push(name);
  }
  return names;
}

function isDesignTokenName(value: string) {
  return TOKEN_PREFIX_PATTERN.test(value);
}

function categoryFromProperty(property: string): TokenUsageCategory | null {
  const normalized = property.toLowerCase();
  return PROPERTY_CATEGORY_MATCHERS.find((entry) => entry.pattern.test(normalized))?.category ?? null;
}

function isInspectableRawValue(value: string) {
  return !value.includes('var(') && /[#\d]/.test(value);
}

function suggestTokenNames(value: string, registry: Map<string, TokenDefinition>) {
  const normalized = normalizeComparableValue(value);
  if (!normalized) return [];

  return Array.from(registry.values())
    .filter((definition) => normalizeComparableValue(definition.value) === normalized)
    .map((definition) => definition.name)
    .slice(0, RAW_SUGGESTION_LIMIT);
}

function normalizeComparableValue(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/,\s+/g, ', ')
    .trim()
    .toLowerCase();
}

function uniqueTokenRows(rows: TokenInspectionRow[]) {
  const seen = new Set<string>();
  const unique: TokenInspectionRow[] = [];

  for (const row of rows) {
    const key = [
      row.category,
      row.property,
      row.value,
      row.source.fileLabel,
      row.source.selector,
    ].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
  }

  return unique;
}

function tokenRowSort(a: TokenInspectionRow, b: TokenInspectionRow) {
  return Number(a.status === 'raw') - Number(b.status === 'raw')
    || categorySortKey(a.category) - categorySortKey(b.category)
    || Number(b.source.match === 'exact') - Number(a.source.match === 'exact')
    || a.property.localeCompare(b.property);
}

function categorySortKey(category: TokenUsageCategory) {
  return ['Color', 'Typography', 'Spacing', 'Shape', 'Effect'].indexOf(category);
}

function groupTokenRows(rows: TokenInspectionRow[]) {
  const groups = new Map<TokenUsageCategory, TokenInspectionRow[]>();
  for (const row of rows) groups.set(row.category, [...(groups.get(row.category) ?? []), row]);

  return Array.from(groups, ([title, groupRows]) => ({
    rows: groupRows,
    title,
  })).sort((a, b) => categorySortKey(a.title) - categorySortKey(b.title));
}

function isStyleRule(rule: CSSRule): rule is CSSStyleRule {
  return 'selectorText' in rule && 'style' in rule;
}
