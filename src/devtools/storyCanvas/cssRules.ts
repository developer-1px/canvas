import {
  matchesStoryCanvasSelector,
  queryStoryCanvasElements,
} from './storyCanvasDomBoundary';

export type CssDeclaration = {
  important: boolean;
  property: string;
  value: string;
};

export type CssRuleMatch = {
  // Condition of the enclosing grouping rule (e.g. `@media (max-width: 1100px)`).
  context: string;
  declarations: CssDeclaration[];
  editable: boolean;
  file: string;
  fileLabel: string;
  id: string;
  // Page CSS in this repo is ancestor-scoped (e.g. `.skills-mp .mp-card-name`).
  // Story previews render without the page wrapper, so those rules match only
  // by their last compound — flagged here as 'scoped'.
  match: 'exact' | 'scoped';
  selector: string;
  styleRule: CSSStyleRule;
};

const MAX_MATCHED_ELEMENTS = 600;

// Canvas chrome stylesheets — these style the inspection tool itself, not the
// components under review, so they are noise in the edit panel.
const CHROME_CSS_FILES = ['StoryCanvasPage.css', 'DevtoolsStoryFixture.css'];

const STRIPPABLE_PSEUDO_CLASSES = /:(hover|focus|focus-visible|focus-within|active|visited|disabled|checked|empty)(?![\w-])/gi;
const PSEUDO_ELEMENTS = /::[a-z-]+(\([^)]*\))?/gi;

export function collectMatchedCssRules(root: Element, selfOnly = false): CssRuleMatch[] {
  const elements = selfOnly
    ? [root]
    : [root, ...queryStoryCanvasElements(root, '*')].slice(0, MAX_MATCHED_ELEMENTS);
  const matches: CssRuleMatch[] = [];
  const seen = new Set<string>();
  const ownerDocument = root.ownerDocument;

  for (const sheet of Array.from(ownerDocument.styleSheets)) {
    const source = stylesheetSource(sheet);
    if (!source) continue;

    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }

    collectFromRuleList(rules, source, elements, matches, seen, '');
  }

  return matches;
}

export function collectThemeTokenNames(): string[] {
  const names = new Set<string>();

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }

    collectTokenNamesFromRules(rules, names);
  }

  return [...names].sort((a, b) => a.localeCompare(b));
}

export function isSingleTokenValue(value: string) {
  return /^var\(--[\w-]+\)$/.test(value.trim());
}

export function isRawValue(value: string) {
  return !value.includes('var(') && /\d/.test(value);
}

export function firstNumberInValue(value: string): number | null {
  const located = locateFirstEditableNumber(value);
  if (!located) return null;
  const parsed = Number(located.text);
  return Number.isFinite(parsed) ? parsed : null;
}

export function replaceFirstNumberInValue(value: string, nextNumber: number) {
  const located = locateFirstEditableNumber(value);
  if (!located) return value;
  const rounded = Math.round(nextNumber * 100) / 100;
  return value.slice(0, located.index) + String(rounded) + value.slice(located.index + located.text.length);
}

// Numbers inside `var(...)` (token names like `--spacing-2` and fallbacks)
// must never be touched by drag/arrow adjustments.
function locateFirstEditableNumber(value: string): { index: number; text: string } | null {
  const masked = maskVarFunctions(value);

  for (const match of masked.matchAll(/-?\d*\.?\d+/g)) {
    const index = match.index ?? 0;
    const before = index > 0 ? masked[index - 1] : '';
    // A letter, '#', or '-' right before means the digits belong to an
    // identifier or hex color (`grid-2`, `#0044ff`) — not an editable number.
    if (before && /[A-Za-z#-]/.test(before)) continue;
    return { index, text: match[0] };
  }

  return null;
}

function maskVarFunctions(value: string) {
  let result = '';
  let depth = 0;
  let index = 0;

  while (index < value.length) {
    if (depth === 0 && value.slice(index, index + 4).toLowerCase() === 'var(') {
      depth = 1;
      result += '____';
      index += 4;
      continue;
    }

    const char = value[index];
    if (depth > 0) {
      if (char === '(') depth += 1;
      if (char === ')') depth -= 1;
      result += '_';
    } else {
      result += char;
    }
    index += 1;
  }

  return result;
}

type StylesheetSource = {
  editable: boolean;
  file: string;
  fileLabel: string;
};

function stylesheetSource(sheet: CSSStyleSheet): StylesheetSource | null {
  const ownerNode = sheet.ownerNode;

  // Vite-served component CSS — these map to writable files under react/src.
  if (ownerNode && isStyleElement(ownerNode)) {
    const file = ownerNode.getAttribute('data-vite-dev-id') ?? '';
    if (!file.endsWith('.css') || !file.includes('/react/src/')) return null;
    if (CHROME_CSS_FILES.some((name) => file.endsWith(`/${name}`))) return null;

    return { editable: true, file, fileLabel: fileLabelFromDevId(file) };
  }

  // Legacy docs CSS bridged through publicDir — shared assets, display only.
  if (ownerNode && isLinkElement(ownerNode)) {
    const href = sheet.href;
    if (!href || !href.endsWith('.css')) return null;

    try {
      const url = new URL(href);
      if (url.origin !== window.location.origin) return null;
      return { editable: false, file: `docs${url.pathname}`, fileLabel: `docs${url.pathname}` };
    } catch {
      return null;
    }
  }

  return null;
}

function collectFromRuleList(
  rules: CSSRuleList,
  source: StylesheetSource,
  elements: Element[],
  matches: CssRuleMatch[],
  seen: Set<string>,
  context: string,
) {
  for (const rule of Array.from(rules)) {
    if (isStyleRule(rule)) {
      const key = `${source.file}|${context}|${rule.selectorText}`;
      if (seen.has(key)) continue;
      const match = matchSelector(rule.selectorText, elements);
      if (!match) continue;

      const declarations = parseDeclarations(rule.style.cssText);
      if (declarations.length === 0) continue;

      seen.add(key);
      matches.push({
        context,
        declarations,
        editable: source.editable,
        file: source.file,
        fileLabel: source.fileLabel,
        id: key,
        match,
        selector: rule.selectorText,
        styleRule: rule,
      });
      continue;
    }

    const nested = (rule as CSSGroupingRule).cssRules as CSSRuleList | undefined;
    if (nested) {
      const condition = 'conditionText' in rule && typeof rule.conditionText === 'string'
        ? `${ruleAtName(rule)} ${rule.conditionText}`
        : context;
      collectFromRuleList(nested, source, elements, matches, seen, condition || context);
    }
  }
}

function ruleAtName(rule: CSSRule) {
  const name = rule.constructor.name;
  if (name === 'CSSMediaRule') return '@media';
  if (name === 'CSSSupportsRule') return '@supports';
  return '@';
}

function collectTokenNamesFromRules(rules: CSSRuleList, names: Set<string>) {
  for (const rule of Array.from(rules)) {
    if (isStyleRule(rule)) {
      for (let index = 0; index < rule.style.length; index += 1) {
        const property = rule.style.item(index);
        if (property.startsWith('--alias-') || property.startsWith('--comp-')) names.add(property);
      }
      continue;
    }

    const nested = (rule as CSSGroupingRule).cssRules as CSSRuleList | undefined;
    if (nested) collectTokenNamesFromRules(nested, names);
  }
}

function isStyleElement(node: Node): node is HTMLStyleElement {
  return node.nodeName.toLowerCase() === 'style';
}

function isLinkElement(node: Node): node is HTMLLinkElement {
  return node.nodeName.toLowerCase() === 'link';
}

function isStyleRule(rule: CSSRule): rule is CSSStyleRule {
  return 'selectorText' in rule && 'style' in rule;
}

function matchSelector(selector: string, elements: Element[]): CssRuleMatch['match'] | null {
  const cleaned = selector
    .replace(PSEUDO_ELEMENTS, '')
    .replace(STRIPPABLE_PSEUDO_CLASSES, '')
    // Stripping can leave `:not()` with an empty argument, which is invalid.
    .replace(/:(not|is|where)\(\s*\)/gi, '');
  const target = cleaned.trim() || selector;

  if (anyElementMatches(target, elements)) return 'exact';

  const lastCompounds = target
    .split(',')
    .map((part) => lastCompoundSelector(part))
    // Bare tag/universal/negation-only compounds (`div`, `*`, `:not(.x)`)
    // match almost everything — only compounds with a positive class/attr/id
    // are meaningful without their ancestor scope.
    .filter((compound) => /[.#[]/.test(compound.replace(/:not\([^)]*\)/gi, '')));

  if (lastCompounds.length > 0 && anyElementMatches(lastCompounds.join(','), elements)) return 'scoped';

  return null;
}

function anyElementMatches(selector: string, elements: Element[]) {
  return elements.some((element) => {
    try {
      return matchesStoryCanvasSelector(element, selector);
    } catch {
      return false;
    }
  });
}

function lastCompoundSelector(selector: string) {
  let depth = 0;
  let lastBoundary = 0;
  const trimmed = selector.trim();

  for (let index = 0; index < trimmed.length; index += 1) {
    const char = trimmed[index];
    if (char === '[' || char === '(') depth += 1;
    if (char === ']' || char === ')') depth -= 1;
    if (depth === 0 && (char === ' ' || char === '>' || char === '+' || char === '~')) {
      lastBoundary = index + 1;
    }
  }

  return trimmed.slice(lastBoundary).trim();
}

function parseDeclarations(styleText: string): CssDeclaration[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of styleText) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === ';' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current);

  return parts.flatMap((part) => {
    const separator = part.indexOf(':');
    if (separator < 0) return [];

    const property = part.slice(0, separator).trim();
    let value = part.slice(separator + 1).trim();
    const important = /!important$/i.test(value);
    if (important) value = value.replace(/\s*!important$/i, '');
    if (!property || !value) return [];

    return [{ important, property, value }];
  });
}

function fileLabelFromDevId(file: string) {
  const marker = file.indexOf('/react/src/');
  return marker >= 0 ? file.slice(marker + '/react/'.length) : file;
}
