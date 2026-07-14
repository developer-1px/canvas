import type {
  DesignDocumentChange,
  DesignDocumentCommand,
  DesignNode,
  DesignNodeId,
} from '../design-document'

export type ReactDesignComponentInstanceTreeNode = {
  readonly node: Omit<DesignNode, 'children' | 'component'>
  readonly slotId: string
  readonly children?: readonly ReactDesignComponentInstanceTreeNode[]
}

export type CreateReactDesignComponentInstanceInput = {
  readonly instanceId: string
  readonly label: string
  readonly parentId: DesignNodeId | null
  readonly index: number
  readonly root: ReactDesignComponentInstanceTreeNode
}

export type ReactDesignComponentInstance = {
  readonly rootId: DesignNodeId
  readonly definitionId: string
  readonly instanceId: string
  readonly command: DesignDocumentCommand
}

export function createReactDesignComponentInstance({
  instanceId,
  label,
  parentId,
  index,
  root,
}: CreateReactDesignComponentInstanceInput): ReactDesignComponentInstance {
  assertNonEmpty(label, 'React design component command label')
  assertNonEmpty(instanceId, 'React design component instance id')

  if (!Number.isInteger(index) || index < 0) {
    throw new Error(`Invalid React design component insertion index: ${index}`)
  }

  if (root.node.definition.kind !== 'component') {
    throw new Error('React design component instance root must be a component')
  }

  if (root.slotId !== 'root') {
    throw new Error('React design component instance root slot must be root')
  }

  const definitionId = root.node.definition.id
  const nodeIds = new Set<DesignNodeId>()
  const slotIds = new Set<string>()
  const changes: DesignDocumentChange[] = []

  appendTree(root, parentId, index)

  const command = Object.freeze({
    label,
    changes: Object.freeze(changes),
  })

  return Object.freeze({
    rootId: root.node.id,
    definitionId,
    instanceId,
    command,
  })

  function appendTree(
    tree: ReactDesignComponentInstanceTreeNode,
    treeParentId: DesignNodeId | null,
    treeIndex: number,
  ) {
    assertNonEmpty(tree.node.id, 'React design component node id')
    assertNonEmpty(tree.slotId, 'React design component slot id')

    if (nodeIds.has(tree.node.id)) {
      throw new Error(`Duplicate React design component node: ${tree.node.id}`)
    }

    if (slotIds.has(tree.slotId)) {
      throw new Error(
        `Duplicate React design component slot: ` +
        `${definitionId}/${instanceId}/${tree.slotId}`,
      )
    }

    nodeIds.add(tree.node.id)
    slotIds.add(tree.slotId)

    const node = Object.freeze({
      id: tree.node.id,
      label: tree.node.label,
      definition: tree.node.definition,
      children: Object.freeze([]),
      props: tree.node.props,
      text: tree.node.text,
      layout: tree.node.layout,
      style: tree.node.style,
      frame: tree.node.frame,
      component: Object.freeze({
        definitionId,
        instanceId,
        slotId: tree.slotId,
      }),
    }) satisfies DesignNode

    changes.push(Object.freeze({
      type: 'add',
      parentId: treeParentId,
      index: treeIndex,
      node,
    }))

    tree.children?.forEach((child, childIndex) => {
      appendTree(child, tree.node.id, childIndex)
    })
  }
}

function assertNonEmpty(value: string, label: string) {
  if (!value.trim()) {
    throw new Error(`${label} must not be empty`)
  }
}
