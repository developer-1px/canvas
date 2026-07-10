import {
  ChevronDown,
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
import type {
  DesignNode,
} from '../../../../src/canvas/design-document'

const DIRECT_DOM_LAYER_BUTTON_SELECTOR =
  '[data-direct-dom-layer-tree-button]'

type DirectDomVisibleNode = {
  readonly children: readonly DirectDomVisibleNode[]
  readonly node: DesignNode
}

export function FigmaCloneDirectDomLayers({
  editor,
  snapshot,
}: {
  readonly editor: EditorEngine
  readonly snapshot: EditorEngineSnapshot
}) {
  const [query, setQuery] = useState('')
  const normalizedQuery = normalizeLayerQuery(query)
  const visibleRoots = editor.read.roots().flatMap((root) => {
    const visible = getVisibleNode(editor, root, normalizedQuery)

    return visible ? [visible] : []
  })
  const selectedNodeId = snapshot.selection.primaryNodeId
  const selectedVisible = visibleRoots.some((root) =>
    containsVisibleNode(root, selectedNodeId))
  const tabbableNodeId = selectedVisible
    ? selectedNodeId
    : visibleRoots[0]?.node.id ?? null

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
        {visibleRoots.map((root, index) => (
          <FigmaCloneDirectDomLayerNode
            key={root.node.id}
            depth={0}
            editor={editor}
            node={root}
            parentTreeId={null}
            posInSet={index + 1}
            selectedNodeId={selectedNodeId}
            setSize={visibleRoots.length}
            tabbableNodeId={tabbableNodeId}
          />
        ))}
      </div>
    </aside>
  )
}

function FigmaCloneDirectDomLayerNode({
  depth,
  editor,
  node,
  parentTreeId,
  posInSet,
  selectedNodeId,
  setSize,
  tabbableNodeId,
}: {
  readonly depth: number
  readonly editor: EditorEngine
  readonly node: DirectDomVisibleNode
  readonly parentTreeId: string | null
  readonly posInSet: number
  readonly selectedNodeId: string | null
  readonly setSize: number
  readonly tabbableNodeId: string | null
}) {
  const hasChildren = node.children.length > 0
  const treeId = `direct-node:${node.node.id}`

  return (
    <div
      aria-expanded={hasChildren ? true : undefined}
      aria-level={depth + 1}
      aria-posinset={posInSet}
      aria-selected={selectedNodeId === node.node.id}
      aria-setsize={setSize}
      role="treeitem"
      aria-label={node.node.label}
    >
      <button
        aria-label={`Select layer ${node.node.label}`}
        className={[
          'figma-layer-row',
          'figma-layer-row--node',
          selectedNodeId === node.node.id ? 'figma-layer-row--selected' : '',
        ].filter(Boolean).join(' ')}
        data-direct-dom-layer-node-id={node.node.id}
        data-direct-dom-layer-parent-tree-id={parentTreeId ?? undefined}
        data-direct-dom-layer-tree-button
        data-direct-dom-layer-tree-id={treeId}
        style={{ paddingLeft: 12 + depth * 12 }}
        tabIndex={tabbableNodeId === node.node.id ? 0 : -1}
        type="button"
        onClick={() => {
          editor.commands.execute({
            type: 'selection.replace',
            nodeId: node.node.id,
          })
        }}
        onKeyDown={handleLayerTreeKeyDown}
      >
        {hasChildren ? (
          <ChevronDown aria-hidden="true" size={12} />
        ) : (
          <span className="figma-layer-dot" />
        )}
        <span>{node.node.label}</span>
      </button>
      {hasChildren ? (
        <div className="figma-layer-tree" role="group">
          {node.children.map((child, index) => (
            <FigmaCloneDirectDomLayerNode
              key={child.node.id}
              depth={depth + 1}
              editor={editor}
              node={child}
              parentTreeId={treeId}
              posInSet={index + 1}
              selectedNodeId={selectedNodeId}
              setSize={node.children.length}
              tabbableNodeId={tabbableNodeId}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function getVisibleNode(
  editor: EditorEngine,
  node: DesignNode,
  query: string,
): DirectDomVisibleNode | null {
  const children = editor.read.children(node.id)

  if (!query || normalizeLayerQuery(`${node.label} ${node.id}`).includes(query)) {
    return {
      node,
      children: children.map((child) => getCompleteNode(editor, child)),
    }
  }

  const visibleChildren = children.flatMap((child) => {
    const visible = getVisibleNode(editor, child, query)

    return visible ? [visible] : []
  })

  return visibleChildren.length > 0
    ? { node, children: visibleChildren }
    : null
}

function getCompleteNode(
  editor: EditorEngine,
  node: DesignNode,
): DirectDomVisibleNode {
  return {
    node,
    children: editor.read.children(node.id).map((child) =>
      getCompleteNode(editor, child)),
  }
}

function containsVisibleNode(
  node: DirectDomVisibleNode,
  nodeId: string | null,
): boolean {
  return node.node.id === nodeId || node.children.some((child) =>
    containsVisibleNode(child, nodeId))
}

function normalizeLayerQuery(value: string) {
  return value.trim().toLowerCase()
}

function handleLayerTreeKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return
  }

  const tree = event.currentTarget.closest('[role="tree"]')
  const buttons = tree
    ? Array.from(tree.querySelectorAll<HTMLButtonElement>(
        DIRECT_DOM_LAYER_BUTTON_SELECTOR,
      ))
    : []
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
    const treeId = event.currentTarget.dataset.directDomLayerTreeId
    const childIndex = buttons.findIndex((button) =>
      button.dataset.directDomLayerParentTreeId === treeId)

    if (childIndex >= 0) {
      event.preventDefault()
      focusLayerButton(buttons, childIndex)
    }
    return
  }

  if (event.key === 'ArrowLeft') {
    const parentTreeId =
      event.currentTarget.dataset.directDomLayerParentTreeId
    const parentIndex = buttons.findIndex((button) =>
      button.dataset.directDomLayerTreeId === parentTreeId)

    if (parentIndex >= 0) {
      event.preventDefault()
      focusLayerButton(buttons, parentIndex)
    }
  }
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
