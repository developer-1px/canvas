import {
  ChevronDown,
  ChevronRight,
  Layers,
  Search,
} from 'lucide-react'
import {
  useState,
  type KeyboardEvent,
} from 'react'
import type {
  EditorEngine,
  EditorEngineSnapshot,
} from '@interactive-os/canvas/editor'
import type { DesignNode } from '../../../../src/canvas/design-document'

const FIGMA_LAYER_BUTTON_SELECTOR = '[data-figma-layer-tree-button]'

type VisibleLayerNode = {
  readonly children: readonly VisibleLayerNode[]
  readonly node: DesignNode
}

type VisibleLayerRoot = {
  readonly node: VisibleLayerNode
  readonly rootId: string
}

export function FigmaCloneDirectDomLayers({
  editor,
  snapshot,
}: {
  readonly editor: EditorEngine
  readonly snapshot: EditorEngineSnapshot
}) {
  const initialSectionRootId = editor.read.roots().find((root) =>
    root.definition.kind !== 'widget')?.id ?? null
  const [query, setQuery] = useState('')
  const [activeSectionRootId, setActiveSectionRootId] =
    useState<string | null>(initialSectionRootId)
  const [expandedSectionRootIds, setExpandedSectionRootIds] = useState(
    () => new Set(initialSectionRootId ? [initialSectionRootId] : []),
  )
  const [expandedNodeIds, setExpandedNodeIds] = useState(() => new Set<string>())
  const normalizedQuery = normalizeLayerQuery(query)
  const visibleRoots = getVisibleRoots(editor, normalizedQuery)
  const selectedNodeId = snapshot.selection.primaryNodeId
  const selectedRootId = selectedNodeId
    ? editor.read.ancestry(selectedNodeId)[0]?.id ?? null
    : null
  const selectedTreeId = getSelectedTreeId({
    activeSectionRootId,
    selectedNodeId,
  })
  const firstTreeId = visibleRoots[0]?.node.node.definition.kind === 'widget'
    ? `widget:${visibleRoots[0].rootId}`
    : visibleRoots[0] ? `section:${visibleRoots[0].rootId}` : null
  const selectedTreeVisible = selectedNodeId
    ? visibleRoots.some((root) => containsVisibleNode(root.node, selectedNodeId))
    : visibleRoots.some((root) => root.rootId === activeSectionRootId)
  const tabbableTreeId = selectedTreeVisible
    ? selectedTreeId
    : firstTreeId

  const selectSection = (rootId: string) => {
    setActiveSectionRootId(rootId)
    setExpandedSectionRootIds((current) => withSetValue(current, rootId, true))
    setExpandedNodeIds((current) => withSetValue(current, rootId, false))
    editor.commands.execute({ type: 'selection.replace', nodeId: rootId })
  }
  const selectNode = (nodeId: string, rootId: string, hasChildren: boolean) => {
    setActiveSectionRootId(null)
    setExpandedSectionRootIds((current) => withSetValue(current, rootId, true))
    setExpandedNodeIds((current) => hasChildren
      ? withSetValue(current, nodeId, true)
      : current)
    editor.commands.execute({ type: 'selection.replace', nodeId })
  }
  const toggleNode = (nodeId: string, expanded: boolean) => {
    setExpandedNodeIds((current) => withSetValue(current, nodeId, !expanded))
  }
  const toggleSection = (rootId: string, expanded: boolean) => {
    setExpandedSectionRootIds((current) =>
      withSetValue(current, rootId, !expanded))
  }

  return (
    <aside className="figma-layers" aria-label="Layers">
      <header>
        <Layers aria-hidden="true" size={14} />
        <h1>Layers</h1>
      </header>
      <div className="figma-layer-tools">
        <label className="figma-layer-search">
          <Search aria-hidden="true" size={13} />
          <input
            aria-label="Search layers"
            placeholder="Search DOM nodes"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
        </label>
      </div>
      <div className="figma-layer-list" role="tree" aria-label="Layers">
        {visibleRoots.length === 0 ? (
          <div className="figma-layer-empty">No layers</div>
        ) : null}
        {visibleRoots.map((root, index) => {
          const isWidget = root.node.node.definition.kind === 'widget'

          if (isWidget) {
            return (
              <FigmaWidgetLayer
                key={root.rootId}
                editor={editor}
                node={root.node.node}
                posInSet={index + 1}
                selectedNodeId={selectedNodeId}
                setSize={visibleRoots.length}
                tabbableTreeId={tabbableTreeId}
                onSelect={() => setActiveSectionRootId(null)}
              />
            )
          }

          const sectionExpanded = normalizedQuery.length > 0 ||
            expandedSectionRootIds.has(root.rootId)
          const sectionSelected = activeSectionRootId === root.rootId &&
            (selectedNodeId === root.rootId || selectedNodeId === null)

          return (
            <div
              key={root.rootId}
              aria-expanded={sectionExpanded}
              aria-level={1}
              aria-posinset={index + 1}
              aria-selected={sectionSelected}
              aria-setsize={visibleRoots.length}
              aria-label={`${root.node.node.label} section`}
              role="treeitem"
            >
              <button
                aria-label={`Select ${root.node.node.label} section`}
                className={layerRowClassName('section', sectionSelected)}
                data-figma-layer-expanded={sectionExpanded}
                data-figma-layer-has-children="true"
                data-figma-layer-kind="section"
                data-figma-layer-root-id={root.rootId}
                data-figma-layer-section-root-id={root.rootId}
                data-figma-layer-tree-button
                data-figma-layer-tree-id={`section:${root.rootId}`}
                style={{ paddingLeft: 12 }}
                tabIndex={tabbableTreeId === `section:${root.rootId}` ? 0 : -1}
                type="button"
                onClick={() => selectSection(root.rootId)}
                onKeyDown={(event) => handleLayerTreeKeyDown(event, {
                  collapse: () => toggleSection(root.rootId, true),
                  expand: () => toggleSection(root.rootId, false),
                })}
              >
                {sectionExpanded
                  ? <ChevronDown aria-hidden="true" size={12} />
                  : <ChevronRight aria-hidden="true" size={12} />}
                <span>{root.node.node.label}</span>
              </button>
              {sectionExpanded ? (
                <div className="figma-layer-tree" role="group">
                  <FigmaNodeLayer
                    activeSectionRootId={activeSectionRootId}
                    depth={0}
                    expandedNodeIds={expandedNodeIds}
                    forceExpanded={normalizedQuery.length > 0}
                    node={root.node}
                    parentTreeId={`section:${root.rootId}`}
                    posInSet={1}
                    rootId={root.rootId}
                    rootActive={
                      selectedRootId === root.rootId &&
                      (
                        selectedNodeId !== root.rootId ||
                        activeSectionRootId !== root.rootId
                      )
                    }
                    selectedNodeId={selectedNodeId}
                    setSize={1}
                    tabbableTreeId={tabbableTreeId}
                    onCollapseToSection={() => selectSection(root.rootId)}
                    onSelectNode={selectNode}
                    onToggleNode={toggleNode}
                  />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

function FigmaWidgetLayer({
  editor,
  node,
  posInSet,
  selectedNodeId,
  setSize,
  tabbableTreeId,
  onSelect,
}: {
  readonly editor: EditorEngine
  readonly node: DesignNode
  readonly posInSet: number
  readonly selectedNodeId: string | null
  readonly setSize: number
  readonly tabbableTreeId: string | null
  readonly onSelect: () => void
}) {
  const selected = selectedNodeId === node.id
  const treeId = `widget:${node.id}`

  return (
    <div
      aria-level={1}
      aria-posinset={posInSet}
      aria-selected={selected}
      aria-setsize={setSize}
      aria-label={node.label}
      role="treeitem"
    >
      <button
        aria-label={`Select ${node.label} frame`}
        className={layerRowClassName('widget', selected)}
        data-figma-layer-has-children="false"
        data-figma-layer-kind="widget"
        data-figma-layer-node-id={node.id}
        data-figma-layer-root-id={node.id}
        data-figma-layer-tree-button
        data-figma-layer-tree-id={treeId}
        style={{ paddingLeft: 12 }}
        tabIndex={tabbableTreeId === treeId ? 0 : -1}
        type="button"
        onClick={() => {
          onSelect()
          editor.commands.execute({ type: 'selection.replace', nodeId: node.id })
        }}
        onKeyDown={(event) => handleLayerTreeKeyDown(event, {})}
      >
        <span className="figma-layer-dot" />
        <span>{node.label}</span>
      </button>
    </div>
  )
}

function FigmaNodeLayer({
  activeSectionRootId,
  depth,
  expandedNodeIds,
  forceExpanded,
  node,
  parentTreeId,
  posInSet,
  rootId,
  rootActive,
  selectedNodeId,
  setSize,
  tabbableTreeId,
  onCollapseToSection,
  onSelectNode,
  onToggleNode,
}: {
  readonly activeSectionRootId: string | null
  readonly depth: number
  readonly expandedNodeIds: ReadonlySet<string>
  readonly forceExpanded: boolean
  readonly node: VisibleLayerNode
  readonly parentTreeId: string
  readonly posInSet: number
  readonly rootId: string
  readonly rootActive: boolean
  readonly selectedNodeId: string | null
  readonly setSize: number
  readonly tabbableTreeId: string | null
  readonly onCollapseToSection: () => void
  readonly onSelectNode: (
    nodeId: string,
    rootId: string,
    hasChildren: boolean,
  ) => void
  readonly onToggleNode: (nodeId: string, expanded: boolean) => void
}) {
  const hasChildren = node.children.length > 0
  const expanded = hasChildren && (
    forceExpanded ||
    depth > 0 ||
    (depth === 0 && rootActive) ||
    expandedNodeIds.has(node.node.id)
  )
  const selected = selectedNodeId === node.node.id && (
    node.node.id !== rootId || activeSectionRootId !== rootId
  )
  const treeId = `node:${node.node.id}`

  return (
    <div
      aria-expanded={hasChildren ? expanded : undefined}
      aria-level={depth + 2}
      aria-posinset={posInSet}
      aria-selected={selected}
      aria-setsize={setSize}
      aria-label={node.node.label}
      role="treeitem"
    >
      <button
        aria-label={`Select layer ${node.node.label}`}
        className={layerRowClassName('node', selected)}
        data-figma-layer-depth={depth}
        data-figma-layer-expanded={expanded}
        data-figma-layer-has-children={hasChildren}
        data-figma-layer-kind="node"
        data-figma-layer-node-id={node.node.id}
        data-figma-layer-parent-tree-id={parentTreeId}
        data-figma-layer-root-id={rootId}
        data-figma-layer-tree-button
        data-figma-layer-tree-id={treeId}
        style={{ paddingLeft: 24 + depth * 12 }}
        tabIndex={tabbableTreeId === treeId ? 0 : -1}
        type="button"
        onClick={() => onSelectNode(node.node.id, rootId, hasChildren)}
        onKeyDown={(event) => handleLayerTreeKeyDown(event, {
          collapse: depth === 0 ? onCollapseToSection : undefined,
          expand: () => onSelectNode(node.node.id, rootId, hasChildren),
        })}
      >
        {hasChildren ? (
          expanded
            ? <ChevronDown aria-hidden="true" size={12} />
            : <ChevronRight aria-hidden="true" size={12} />
        ) : (
          <span className="figma-layer-dot" />
        )}
        <span>{node.node.label}</span>
      </button>
      {expanded ? (
        <div className="figma-layer-tree" role="group">
          {node.children.map((child, index) => (
            <FigmaNodeLayer
              key={child.node.id}
              activeSectionRootId={activeSectionRootId}
              depth={depth + 1}
              expandedNodeIds={expandedNodeIds}
              forceExpanded={forceExpanded}
              node={child}
              parentTreeId={treeId}
              posInSet={index + 1}
              rootId={rootId}
              rootActive={rootActive}
              selectedNodeId={selectedNodeId}
              setSize={node.children.length}
              tabbableTreeId={tabbableTreeId}
              onCollapseToSection={onCollapseToSection}
              onSelectNode={onSelectNode}
              onToggleNode={onToggleNode}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function getVisibleRoots(
  editor: EditorEngine,
  query: string,
): readonly VisibleLayerRoot[] {
  return editor.read.roots().flatMap((root) => {
    if (root.definition.kind === 'widget') {
      return matchesLayerQuery(root, query)
        ? [{ rootId: root.id, node: completeNode(editor, root) }]
        : []
    }

    const sectionMatches = matchesSearchText(`${root.label} section`, query)
    const node = !query || sectionMatches
      ? completeNode(editor, root)
      : visibleNode(editor, root, query)

    return node ? [{ rootId: root.id, node }] : []
  })
}

function visibleNode(
  editor: EditorEngine,
  node: DesignNode,
  query: string,
): VisibleLayerNode | null {
  if (matchesLayerQuery(node, query)) {
    return completeNode(editor, node)
  }

  const children = editor.read.children(node.id).flatMap((child) => {
    const visible = visibleNode(editor, child, query)

    return visible ? [visible] : []
  })

  return children.length > 0 ? { children, node } : null
}

function completeNode(editor: EditorEngine, node: DesignNode): VisibleLayerNode {
  return {
    node,
    children: editor.read.children(node.id).map((child) =>
      completeNode(editor, child)),
  }
}

function matchesLayerQuery(node: DesignNode, query: string) {
  return matchesSearchText([
    node.label,
    node.id,
    node.definition.id,
    node.definition.kind,
    node.component?.definitionId,
    node.component?.instanceId,
    node.component?.slotId,
  ].filter(Boolean).join(' '), query)
}

function matchesSearchText(value: string, query: string) {
  if (!query) {
    return true
  }

  const haystack = normalizeLayerQuery(value).replaceAll('-', ' ')

  return query.split(' ').every((term) => haystack.includes(term))
}

function containsVisibleNode(node: VisibleLayerNode, nodeId: string | null): boolean {
  return node.node.id === nodeId || node.children.some((child) =>
    containsVisibleNode(child, nodeId))
}

function normalizeLayerQuery(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function getSelectedTreeId({
  activeSectionRootId,
  selectedNodeId,
}: {
  readonly activeSectionRootId: string | null
  readonly selectedNodeId: string | null
}) {
  if (!selectedNodeId) {
    return activeSectionRootId ? `section:${activeSectionRootId}` : null
  }

  return activeSectionRootId === selectedNodeId
    ? `section:${selectedNodeId}`
    : `node:${selectedNodeId}`
}

function withSetValue(
  values: ReadonlySet<string>,
  value: string,
  included: boolean,
) {
  const next = new Set(values)

  if (included) {
    next.add(value)
  } else {
    next.delete(value)
  }

  return next
}

function layerRowClassName(
  kind: 'node' | 'section' | 'widget',
  selected: boolean,
) {
  return [
    'figma-layer-row',
    `figma-layer-row--${kind}`,
    selected ? 'figma-layer-row--selected' : '',
  ].filter(Boolean).join(' ')
}

function handleLayerTreeKeyDown(
  event: KeyboardEvent<HTMLButtonElement>,
  actions: {
    readonly collapse?: () => void
    readonly expand?: () => void
  },
) {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return
  }

  const buttons = getLayerButtons(event.currentTarget)
  const currentIndex = buttons.indexOf(event.currentTarget)

  if (currentIndex < 0) {
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    focusLayerButton(
      buttons,
      currentIndex + (event.key === 'ArrowDown' ? 1 : -1),
    )
    return
  }

  if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    focusLayerButton(buttons, event.key === 'Home' ? 0 : buttons.length - 1)
    return
  }

  if (event.key === 'ArrowRight') {
    if (event.currentTarget.dataset.figmaLayerHasChildren !== 'true') {
      return
    }

    event.preventDefault()

    if (event.currentTarget.dataset.figmaLayerExpanded !== 'true') {
      actions.expand?.()
      return
    }

    const treeId = event.currentTarget.dataset.figmaLayerTreeId
    const childIndex = buttons.findIndex((button) =>
      button.dataset.figmaLayerParentTreeId === treeId ||
      (
        event.currentTarget.dataset.figmaLayerKind === 'section' &&
        button.dataset.figmaLayerRootId ===
          event.currentTarget.dataset.figmaLayerSectionRootId &&
        button.dataset.figmaLayerDepth === '0'
      ))

    if (childIndex >= 0) {
      focusLayerButton(buttons, childIndex)
    }
    return
  }

  if (event.key !== 'ArrowLeft') {
    return
  }

  event.preventDefault()

  if (
    event.currentTarget.dataset.figmaLayerExpanded === 'true' &&
    actions.collapse
  ) {
    actions.collapse?.()
    return
  }

  const parentTreeId = event.currentTarget.dataset.figmaLayerParentTreeId
  const parentIndex = buttons.findIndex((button) =>
    button.dataset.figmaLayerTreeId === parentTreeId)

  if (parentIndex >= 0) {
    focusLayerButton(buttons, parentIndex)
  }
}

function getLayerButtons(button: HTMLButtonElement) {
  const tree = button.closest('[role="tree"]')

  return tree
    ? Array.from(tree.querySelectorAll<HTMLButtonElement>(
        FIGMA_LAYER_BUTTON_SELECTOR,
      ))
    : []
}

function focusLayerButton(
  buttons: readonly HTMLButtonElement[],
  index: number,
) {
  const target = buttons[Math.max(0, Math.min(buttons.length - 1, index))]

  if (!target) {
    return
  }

  buttons.forEach((button) => {
    button.tabIndex = button === target ? 0 : -1
  })
  target.focus()
}
