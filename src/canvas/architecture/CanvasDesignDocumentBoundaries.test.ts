import { describe, expect, it } from 'vitest'

import {
  getImportReferences,
  getSourceFile,
  getSourceIdentifiers,
  getUnboundSourceIdentifiers,
  sourceFiles,
  type ImportReference,
  type SourceFile,
} from './CanvasArchitectureTestSources'

const DESIGN_DOCUMENT_SOURCE_PREFIX = 'src/canvas/design-document/'

const forbiddenCanvasLayerPrefixes = [
  'src/canvas/app',
  'src/canvas/entities',
  'src/canvas/host',
  'src/canvas/renderer',
  'src/canvas/ui',
  'src/demo',
] as const

const forbiddenCanvasPackageSpecifiers = [
  '@interactive-os/canvas/app',
  '@interactive-os/canvas/entities',
  '@interactive-os/canvas/host',
  '@interactive-os/canvas/renderer',
  '@interactive-os/canvas/ui',
] as const

const forbiddenDesignDocumentIdentifierPatterns = [
  /^(?:ReactNode|ReactElement|JSX|createElement)$/,
  /^(?:HTMLElement|HTML[A-Z][A-Za-z]*Element|SVGElement|SVG[A-Z][A-Za-z]*Element|HTMLCollection|CSSStyleDeclaration|DocumentFragment|DocumentType|NodeList|NodeIterator|TreeWalker|EventTarget|PointerEvent|MouseEvent|KeyboardEvent|FocusEvent|InputEvent|CompositionEvent|DragEvent|ClipboardEvent|DOMRect(?:ReadOnly)?|DOMPoint|DOMMatrix|DOMParser|ResizeObserver|MutationObserver|IntersectionObserver)$/,
  /^(?:Canvas[A-Za-z]*Item[A-Za-z]*|RectItem|TextItem|GroupItem|ArrowItem|PathItem|MarkerItem|HighlightItem)$/,
  /^(?:ReactDesignRenderer|DomProjection|EditorEngine|CanvasApp(?:Shell)?)$/,
  /(?:figma|figjam)/i,
] as const
const forbiddenDesignDocumentGlobalNames = new Set([
  'Blob',
  'File',
  'FormData',
  'URL',
  'URLSearchParams',
  'WebSocket',
  'Worker',
  'addEventListener',
  'cancelAnimationFrame',
  'document',
  'fetch',
  'getComputedStyle',
  'localStorage',
  'navigator',
  'removeEventListener',
  'requestAnimationFrame',
  'sessionStorage',
  'window',
])

describe('Canvas DesignDocument boundaries', () => {
  it('exposes the canonical graph through only the React design facade', () => {
    const packageEntry = getSourceFile('src/canvas/index.ts')
    const privateImports = getImportReferences(packageEntry)
      .filter((reference) =>
        reference.target === 'src/canvas/design-document' ||
        reference.target.startsWith('src/canvas/design-document/'),
      )

    expect(privateImports).toEqual([])
    expect(
      getImportReferences(getSourceFile('src/canvas/react-design/index.ts'))
        .filter((reference) =>
          reference.target === 'src/canvas/design-document' ||
          reference.target.startsWith('src/canvas/design-document/'),
        )
        .map((reference) => reference.target),
    ).toEqual([
      'src/canvas/design-document',
      'src/canvas/design-document',
    ])
  })

  it('keeps the future canonical graph independent from UI, products, renderers, and the legacy item model', () => {
    const designDocumentFiles = getDesignDocumentProductionFiles()
    const importViolations = designDocumentFiles
      .flatMap(getImportReferences)
      .filter(isForbiddenDesignDocumentImport)
    const sourceViolations = designDocumentFiles.flatMap((file) =>
      isForbiddenDesignDocumentSource(file)
        ? [file.path]
        : [],
    )

    expect(importViolations).toEqual([])
    expect(sourceViolations).toEqual([])
  })

  it.each([
    ['React', 'react', 'react'],
    ['React JSX runtime', 'react/jsx-runtime', 'react/jsx-runtime'],
    ['React DOM', 'react-dom/client', 'react-dom/client'],
    ['Figma product', '@interactive-os/figma-clone', '@interactive-os/figma-clone'],
    ['FigJam product', '@interactive-os/figjam-pack', '@interactive-os/figjam-pack'],
    [
      'DOM editor',
      '@interactive-os/dom-edit-affordance',
      '@interactive-os/dom-edit-affordance',
    ],
    ['App Shell', '../app/shell', 'src/canvas/app/shell'],
    ['Renderer', '../renderer', 'src/canvas/renderer'],
    ['Legacy Host', '../host', 'src/canvas/host'],
    ['Legacy entities', '../entities', 'src/canvas/entities'],
    ['Canvas UI', '../ui', 'src/canvas/ui'],
    [
      'CSS side effect',
      './DesignDocument.css',
      'src/canvas/design-document/DesignDocument.css',
    ],
    [
      'queried CSS side effect',
      './DesignDocument.css?inline',
      'src/canvas/design-document/DesignDocument.css?inline',
    ],
  ])('recognizes %s imports as forbidden', (_label, specifier, target) => {
    expect(isForbiddenDesignDocumentImport({ specifier, target })).toBe(true)
  })

  it.each([
    ['dynamic import', "const react = import('react')"],
    ['CommonJS require', "const react = require('react')"],
    ['inline import type', "type View = import('react').ComponentType"],
  ])('recognizes a React %s as forbidden', (_label, source) => {
    const references = getImportReferences({
      path: `${DESIGN_DOCUMENT_SOURCE_PREFIX}Example.ts`,
      source,
    })

    expect(references).toHaveLength(1)
    expect(references[0]?.specifier).toBe('react')
    expect(references.some(isForbiddenDesignDocumentImport)).toBe(true)
  })

  it.each([
    ['comment', "// import('react')"],
    ['string literal', 'const example = "require(\\\'react\\\')"'],
    ['ordinary method', "schema.require('react')"],
  ])('ignores import-shaped %s text', (_label, source) => {
    expect(getImportReferences({
      path: `${DESIGN_DOCUMENT_SOURCE_PREFIX}Example.ts`,
      source,
    })).toEqual([])
  })

  it.each([
    ['React type', 'export type View = ReactNode'],
    ['HTML element', 'declare const element: HTMLDivElement'],
    ['document query', "document.querySelector('main')"],
    ['bare document', 'const browserDocument = document'],
    ['global document', 'const browserDocument = globalThis.document'],
    ['bare window', 'const browserWindow = window'],
    ['DOM event', 'declare const event: PointerEvent'],
    ['browser listener', "addEventListener('click', () => {})"],
    ['navigator', 'navigator.userAgent'],
    ['file', 'declare const file: File'],
    ['blob', 'declare const blob: Blob'],
    ['form data', 'declare const body: FormData'],
    ['URL', "const url = new URL('https://example.com')"],
    ['fetch', "fetch('/document')"],
    ['legacy item', 'declare const item: CanvasItem'],
    ['renderer owner', 'declare const renderer: ReactDesignRenderer'],
    ['product term', 'declare const figmaNode: unknown'],
  ])('recognizes %s source coupling as forbidden', (_label, source) => {
    expect(isForbiddenDesignDocumentSource({
      path: `${DESIGN_DOCUMENT_SOURCE_PREFIX}Example.ts`,
      source,
    })).toBe(true)
  })

  it('allows serializable domain vocabulary and inert prose', () => {
    expect(isForbiddenDesignDocumentSource({
      path: `${DESIGN_DOCUMENT_SOURCE_PREFIX}DesignDocumentNode.ts`,
      source: [
        '// Document nodes contain Event, Range, Window, and DOM prose.',
        'const note = "figma document HTMLDivElement"',
        'export type Event = { name: string }',
        'export type Range = { start: number; end: number }',
        'export type Window = { from: number; to: number }',
        'export type Node = { element: DesignElement }',
        'export function validate(document: DesignDocumentSnapshot) {',
        '  return { document, node: document.root }',
        '}',
        'const schema = { document: "snapshot" }',
        'schema.document',
      ].join('\n'),
    })).toBe(false)
  })

  it.each([
    ['Zod', 'zod', 'zod'],
    [
      'json-document',
      '@interactive-os/json-document',
      '@interactive-os/json-document',
    ],
    ['Canvas Core', '../core', 'src/canvas/core'],
  ])('keeps %s available to the canonical graph', (_label, specifier, target) => {
    expect(isForbiddenDesignDocumentImport({ specifier, target })).toBe(false)
  })
})

function getDesignDocumentProductionFiles() {
  return sourceFiles.filter(
    (file) =>
      file.path.startsWith(DESIGN_DOCUMENT_SOURCE_PREFIX) &&
      !file.path.endsWith('.test.ts') &&
      !file.path.endsWith('.test.tsx'),
  )
}

function isForbiddenDesignDocumentImport(
  reference: Pick<ImportReference, 'specifier' | 'target'>,
) {
  const { specifier, target } = reference

  return (
    isReactRuntimeSpecifier(specifier) ||
    isProductOrEditorSpecifier(specifier) ||
    isStyleImportSpecifier(specifier) ||
    specifier === '@interactive-os/canvas' ||
    forbiddenCanvasPackageSpecifiers.some(
      (prefix) => specifier === prefix || specifier.startsWith(`${prefix}/`),
    ) ||
    forbiddenCanvasLayerPrefixes.some(
      (prefix) => target === prefix || target.startsWith(`${prefix}/`),
    ) ||
    hasRendererImplementationSegment(specifier) ||
    hasRendererImplementationSegment(target)
  )
}

function isForbiddenDesignDocumentSource(file: SourceFile) {
  return (
    file.path.endsWith('.tsx') ||
    file.path.endsWith('.css') ||
    getSourceIdentifiers(file).some((identifier) =>
      forbiddenDesignDocumentIdentifierPatterns.some((pattern) =>
        pattern.test(identifier),
      ),
    ) ||
    getUnboundSourceIdentifiers(file).some((identifier) =>
      forbiddenDesignDocumentGlobalNames.has(identifier),
    )
  )
}

function isStyleImportSpecifier(specifier: string) {
  return /\.(?:css|less|sass|scss)(?:$|\?)/.test(specifier)
}

function isReactRuntimeSpecifier(specifier: string) {
  return (
    specifier === 'react' ||
    specifier.startsWith('react/') ||
    specifier === 'react-dom' ||
    specifier.startsWith('react-dom/') ||
    specifier === 'lucide-react' ||
    specifier === 'react-moveable'
  )
}

function isProductOrEditorSpecifier(specifier: string) {
  return (
    /(?:figma|figjam)/i.test(specifier) ||
    specifier === '@interactive-os/dom-edit-affordance' ||
    specifier.startsWith('@interactive-os/dom-edit-affordance/')
  )
}

function hasRendererImplementationSegment(target: string) {
  return /(?:^|\/)(?:renderer|react-renderer|react-design-renderer)(?:\/|$)/i
    .test(target)
}
