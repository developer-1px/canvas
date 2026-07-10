import * as ts from 'typescript'

export type SourceFile = {
  path: string
  source: string
}

export type ImportReference = {
  from: string
  specifier: string
  target: string
}

const modules = import.meta.glob('../**/*.{ts,tsx,css}', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const demoModules = import.meta.glob('../../demo/**/*.{ts,tsx,css}', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const appEntryModules = import.meta.glob([
  '../../*.{ts,tsx}',
], {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const canvasPackModules = import.meta.glob(
  '../../../packages/canvas-pack-*/src/**/*.{ts,tsx,css}',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  },
) as Record<string, string>

const canvasDevtoolsAffordanceModules = import.meta.glob(
  '../../../packages/canvas-devtools-affordance/src/**/*.{ts,tsx,css}',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  },
) as Record<string, string>

export const sourceFiles = [
  ...Object.entries(modules).map(([path, source]) => ({
    path: normalizeCanvasSourcePath(path),
    source,
  })),
  ...Object.entries(demoModules).map(([path, source]) => ({
    path: path.replace(/^\.\.\/\.\.\/demo\//, 'src/demo/'),
    source,
  })),
  ...Object.entries(appEntryModules).map(([path, source]) => ({
    path: path.replace(/^\.\.\/\.\.\//, 'src/'),
    source,
  })),
  ...Object.entries(canvasPackModules).map(([path, source]) => ({
    path: path.replace(/^\.\.\/\.\.\/\.\.\//, ''),
    source,
  })),
  ...Object.entries(canvasDevtoolsAffordanceModules).map(([path, source]) => ({
    path: path.replace(/^\.\.\/\.\.\/\.\.\//, ''),
    source,
  })),
]

function normalizeCanvasSourcePath(path: string) {
  if (path.startsWith('./')) {
    return path.replace(/^\.\//, 'src/canvas/architecture/')
  }

  return path.replace(/^\.\.\//, 'src/canvas/')
}

export function getImportsFrom(pathPrefix: string) {
  return sourceFiles
    .filter((file) => file.path.startsWith(pathPrefix))
    .flatMap(getImportReferences)
}

export function getImportsFromOutside(pathPrefix: string) {
  return sourceFiles
    .filter((file) => !file.path.startsWith(pathPrefix))
    .flatMap(getImportReferences)
}

export function getSourceFile(path: string) {
  const sourceFile = sourceFiles.find((file) => file.path === path)

  if (!sourceFile) {
    throw new Error(`Missing source file: ${path}`)
  }

  return sourceFile
}

export function getImportReferences(file: SourceFile): ImportReference[] {
  const specifiers: string[] = []

  visitSourceNodes(file, (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text)
      return
    }

    if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression &&
      ts.isStringLiteralLike(node.moduleReference.expression)
    ) {
      specifiers.push(node.moduleReference.expression.text)
      return
    }

    if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteralLike(node.argument.literal)
    ) {
      specifiers.push(node.argument.literal.text)
      return
    }

    if (!ts.isCallExpression(node)) {
      return
    }

    const argument = node.arguments[0]
    const isDynamicImport = node.expression.kind === ts.SyntaxKind.ImportKeyword
    const isCommonJsRequire = ts.isIdentifier(node.expression) &&
      node.expression.text === 'require'

    if (
      argument &&
      ts.isStringLiteralLike(argument) &&
      (isDynamicImport || isCommonJsRequire)
    ) {
      specifiers.push(argument.text)
    }
  })

  return specifiers
    .map((specifier) => ({
      from: file.path,
      specifier,
      target: resolveImportTarget(file.path, specifier),
    }))
}

export function getSourceIdentifiers(file: SourceFile) {
  const identifiers: string[] = []

  visitSourceNodes(file, (node) => {
    if (ts.isIdentifier(node)) {
      identifiers.push(node.text)
    }
  })

  return identifiers
}

export function getUnboundSourceIdentifiers(file: SourceFile) {
  const sourceFile = createParsedSourceFile(file)
  const rootScope: LexicalScope = {
    bindings: new Set(),
    parent: null,
  }
  const scopeByNode = new WeakMap<ts.Node, LexicalScope>()
  const identifiers: string[] = []

  assignLexicalScopes(sourceFile, rootScope, scopeByNode)

  function collect(node: ts.Node) {
    if (ts.isIdentifier(node)) {
      const scope = scopeByNode.get(node) ?? rootScope

      if (
        isUnshadowedGlobalThisProperty(node, scope) ||
        (isIdentifierReference(node) && !hasBinding(scope, node.text))
      ) {
        identifiers.push(node.text)
      }
    }

    ts.forEachChild(node, collect)
  }

  collect(sourceFile)

  return identifiers
}

export function targetsAnyLayer(
  reference: ImportReference,
  layers: readonly string[],
) {
  return layers.some((layer) =>
    reference.target === `src/canvas/${layer}` ||
    reference.target.startsWith(`src/canvas/${layer}/`),
  )
}

function resolveImportTarget(from: string, specifier: string) {
  if (!specifier.startsWith('.')) {
    return specifier
  }

  const segments = from.split('/').slice(0, -1)

  for (const segment of specifier.split('/')) {
    if (segment === '.' || segment === '') {
      continue
    }

    if (segment === '..') {
      segments.pop()
      continue
    }

    segments.push(segment)
  }

  return segments.join('/').replace(/\.(ts|tsx)$/, '')
}

function visitSourceNodes(
  file: SourceFile,
  visit: (node: ts.Node) => void,
) {
  const sourceFile = createParsedSourceFile(file)

  function walk(node: ts.Node) {
    visit(node)
    ts.forEachChild(node, walk)
  }

  walk(sourceFile)
}

type LexicalScope = {
  bindings: Set<string>
  parent: LexicalScope | null
}

function createParsedSourceFile(file: SourceFile) {
  return ts.createSourceFile(
    file.path,
    file.source,
    ts.ScriptTarget.Latest,
    true,
    file.path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
}

function assignLexicalScopes(
  node: ts.Node,
  outerScope: LexicalScope,
  scopeByNode: WeakMap<ts.Node, LexicalScope>,
) {
  const scope = createsLexicalScope(node)
    ? { bindings: new Set<string>(), parent: outerScope }
    : outerScope

  scopeByNode.set(node, scope)
  registerDeclarationBinding(node, scope, outerScope)
  ts.forEachChild(node, (child) =>
    assignLexicalScopes(child, scope, scopeByNode))
}

function createsLexicalScope(node: ts.Node) {
  return (
    !ts.isSourceFile(node) &&
    (
      ts.isFunctionLike(node) ||
      ts.isBlock(node) ||
      ts.isModuleBlock(node) ||
      ts.isCatchClause(node) ||
      ts.isClassDeclaration(node) ||
      ts.isClassExpression(node)
    )
  )
}

function registerDeclarationBinding(
  node: ts.Node,
  scope: LexicalScope,
  outerScope: LexicalScope,
) {
  if (
    (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) &&
    node.name
  ) {
    outerScope.bindings.add(node.name.text)
    return
  }

  if (
    (ts.isFunctionExpression(node) || ts.isClassExpression(node)) &&
    node.name
  ) {
    scope.bindings.add(node.name.text)
    return
  }

  if (ts.isVariableDeclaration(node) || ts.isParameter(node)) {
    addBindingName(node.name, scope)
    return
  }

  if (
    ts.isInterfaceDeclaration(node) ||
    ts.isTypeAliasDeclaration(node) ||
    ts.isEnumDeclaration(node) ||
    ts.isModuleDeclaration(node) ||
    ts.isTypeParameterDeclaration(node)
  ) {
    scope.bindings.add(node.name.text)
    return
  }

  if (ts.isImportClause(node) && node.name) {
    scope.bindings.add(node.name.text)
    return
  }

  if (
    ts.isNamespaceImport(node) ||
    ts.isImportSpecifier(node) ||
    ts.isImportEqualsDeclaration(node)
  ) {
    scope.bindings.add(node.name.text)
  }
}

function addBindingName(name: ts.BindingName, scope: LexicalScope) {
  if (ts.isIdentifier(name)) {
    scope.bindings.add(name.text)
    return
  }

  for (const element of name.elements) {
    if (!ts.isOmittedExpression(element)) {
      addBindingName(element.name, scope)
    }
  }
}

function isIdentifierReference(node: ts.Identifier) {
  if (ts.isShorthandPropertyAssignment(node.parent)) {
    return true
  }

  if (isNonReferenceName(node)) {
    return false
  }

  return true
}

function isNonReferenceName(node: ts.Identifier) {
  const parent = node.parent

  return (
    (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
    (ts.isQualifiedName(parent) && parent.right === node) ||
    (ts.isPropertyAssignment(parent) && parent.name === node) ||
    (ts.isPropertyDeclaration(parent) && parent.name === node) ||
    (ts.isPropertySignature(parent) && parent.name === node) ||
    (ts.isMethodDeclaration(parent) && parent.name === node) ||
    (ts.isMethodSignature(parent) && parent.name === node) ||
    (ts.isGetAccessorDeclaration(parent) && parent.name === node) ||
    (ts.isSetAccessorDeclaration(parent) && parent.name === node) ||
    (ts.isEnumMember(parent) && parent.name === node) ||
    (ts.isBindingElement(parent) && parent.propertyName === node) ||
    ts.isImportSpecifier(parent) ||
    ts.isExportSpecifier(parent) ||
    (ts.isLabeledStatement(parent) && parent.label === node) ||
    (
      (ts.isBreakStatement(parent) || ts.isContinueStatement(parent)) &&
      parent.label === node
    )
  )
}

function isUnshadowedGlobalThisProperty(
  node: ts.Identifier,
  scope: LexicalScope,
) {
  return (
    ts.isPropertyAccessExpression(node.parent) &&
    node.parent.name === node &&
    ts.isIdentifier(node.parent.expression) &&
    node.parent.expression.text === 'globalThis' &&
    !hasBinding(scope, 'globalThis')
  )
}

function hasBinding(scope: LexicalScope, name: string): boolean {
  return scope.bindings.has(name) ||
    (scope.parent !== null && hasBinding(scope.parent, name))
}
