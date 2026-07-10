import type {
  DesignDocumentRead,
  DesignDocumentSnapshot,
  DesignNode,
  DesignNodeComponentBinding,
  DesignNodeDefinition,
  DesignNodeFrame,
} from '../../../../src/canvas/design-document'
import type {
  FigmaCloneDomComponentBinding,
  FigmaCloneDomEditNodeState,
  FigmaCloneDomNode,
  FigmaCloneDomNodeId,
} from '../dom-edit/FigmaCloneDomEditModel'
import type {
  FigmaCloneSectionViewport,
} from '../dom-editor/section'
import {
  getFigmaWorkspaceComponentMetadata,
  type FigmaWorkspaceDesignNodeId,
} from './FigmaWorkspaceComponentMetadata'
import { FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT } from './FigmaWorkspaceDesignDocumentSeed'

export type FigmaWorkspaceDesignDocumentProjection = {
  readonly componentBindingByNodeId: Readonly<Record<
    FigmaWorkspaceDesignNodeId,
    DesignNodeComponentBinding | null
  >>
  readonly depthByNodeId: Readonly<Record<FigmaWorkspaceDesignNodeId, number>>
  readonly definitionByNodeId: Readonly<Record<
    FigmaWorkspaceDesignNodeId,
    DesignNodeDefinition
  >>
  readonly frame: DesignNodeFrame
  readonly nodeById: Readonly<Record<
    FigmaWorkspaceDesignNodeId,
    FigmaCloneDomNode
  >>
  readonly parentIdByNodeId: Readonly<Record<
    FigmaWorkspaceDesignNodeId,
    FigmaWorkspaceDesignNodeId | null
  >>
  readonly rootId: 'workspacePage'
  readonly rootIdByNodeId: Readonly<Record<
    FigmaWorkspaceDesignNodeId,
    'workspacePage'
  >>
  readonly sectionViewport: Readonly<FigmaCloneSectionViewport>
  readonly state: Readonly<Record<
    FigmaWorkspaceDesignNodeId,
    Readonly<FigmaCloneDomEditNodeState>
  >>
  readonly textState: Readonly<Partial<Record<
    FigmaWorkspaceDesignNodeId,
    string
  >>>
  readonly tree: readonly FigmaCloneDomNode[]
}

export type FigmaWorkspaceProjectionSource =
  | DesignDocumentRead
  | DesignDocumentSnapshot

const EXPECTED_WORKSPACE_NODE_IDS = new Set(
  FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT.nodes.map((node) => node.id),
)

/** One-way compatibility view. It deliberately accepts only a read seam or snapshot. */
export function projectFigmaWorkspaceDesignDocument(
  source: FigmaWorkspaceProjectionSource,
): FigmaWorkspaceDesignDocumentProjection {
  const designNodeById = collectWorkspaceNodes(source)

  assertCompleteWorkspace(designNodeById)

  const nodeById: Partial<Record<
    FigmaWorkspaceDesignNodeId,
    FigmaCloneDomNode
  >> = {}
  const parentIdByNodeId: Partial<Record<
    FigmaWorkspaceDesignNodeId,
    FigmaWorkspaceDesignNodeId | null
  >> = {}
  const depthByNodeId: Partial<Record<FigmaWorkspaceDesignNodeId, number>> = {}
  const definitionByNodeId: Partial<Record<
    FigmaWorkspaceDesignNodeId,
    DesignNodeDefinition
  >> = {}
  const rootIdByNodeId: Partial<Record<
    FigmaWorkspaceDesignNodeId,
    'workspacePage'
  >> = {}
  const componentBindingByNodeId: Partial<Record<
    FigmaWorkspaceDesignNodeId,
    DesignNodeComponentBinding | null
  >> = {}
  const state: Partial<Record<
    FigmaWorkspaceDesignNodeId,
    FigmaCloneDomEditNodeState
  >> = {}
  const textState: Partial<Record<FigmaWorkspaceDesignNodeId, string>> = {}

  const rootNode = requireWorkspaceNode(designNodeById, 'workspacePage')
  const tree = [projectTreeNode(rootNode, null, 0)]

  function projectTreeNode(
    node: DesignNode,
    parentId: FigmaWorkspaceDesignNodeId | null,
    depth: number,
  ): FigmaCloneDomNode {
    const nodeId = requireWorkspaceNodeId(node.id)
    const children = node.children.map((childId) =>
      projectTreeNode(
        requireWorkspaceNode(designNodeById, childId),
        nodeId,
        depth + 1,
      ))
    const projectedNode: FigmaCloneDomNode = {
      id: nodeId,
      label: node.label,
      ...(children.length > 0 ? { children } : {}),
    }

    nodeById[nodeId] = projectedNode
    parentIdByNodeId[nodeId] = parentId
    depthByNodeId[nodeId] = depth
    definitionByNodeId[nodeId] = { ...node.definition }
    rootIdByNodeId[nodeId] = 'workspacePage'
    componentBindingByNodeId[nodeId] = node.component
      ? { ...node.component }
      : null
    state[nodeId] = projectLegacyNodeState(node)

    if (node.text !== null) {
      textState[nodeId] = node.text
    }

    return projectedNode
  }

  const frame = requireWorkspaceFrame(rootNode)
  const projection: FigmaWorkspaceDesignDocumentProjection = {
    componentBindingByNodeId: requireCompleteRecord(
      componentBindingByNodeId,
      'component binding',
    ),
    depthByNodeId: requireCompleteRecord(depthByNodeId, 'depth'),
    definitionByNodeId: requireCompleteRecord(
      definitionByNodeId,
      'definition',
    ),
    frame,
    nodeById: requireCompleteRecord(nodeById, 'legacy node'),
    parentIdByNodeId: requireCompleteRecord(parentIdByNodeId, 'parent'),
    rootId: 'workspacePage',
    rootIdByNodeId: requireCompleteRecord(rootIdByNodeId, 'root'),
    sectionViewport: projectSectionViewport(frame),
    state: requireCompleteRecord(state, 'legacy state'),
    textState,
    tree,
  }

  return deepFreeze(projection)
}

export function getFigmaWorkspaceLegacyComponentBinding(
  projection: FigmaWorkspaceDesignDocumentProjection,
  nodeId: FigmaCloneDomNodeId,
): FigmaCloneDomComponentBinding | null {
  if (!EXPECTED_WORKSPACE_NODE_IDS.has(nodeId)) {
    return null
  }

  const workspaceNodeId = nodeId as FigmaWorkspaceDesignNodeId
  const binding = projection.componentBindingByNodeId[workspaceNodeId]

  if (!binding) {
    return null
  }

  const metadata = getFigmaWorkspaceComponentMetadata(binding.definitionId)
  const instance = metadata?.instances.find(
    (candidate) => candidate.id === binding.instanceId,
  )

  if (!metadata || !instance) {
    throw new Error(`Missing Figma workspace component metadata: ${nodeId}`)
  }

  const slotNodeIds = Object.entries(projection.componentBindingByNodeId)
    .filter(([, candidate]) =>
      candidate?.definitionId === binding.definitionId &&
      candidate.slotId === binding.slotId)
    .map(([candidateId]) => candidateId as FigmaWorkspaceDesignNodeId)

  return {
    componentId: metadata.id,
    componentLabel: metadata.label,
    currentNodeId: workspaceNodeId,
    instanceCount: metadata.instances.length,
    instanceLabel: instance.label,
    slotLabel: binding.slotId,
    slotNodeIds,
    syncDescription: metadata.syncDescription,
  }
}

function collectWorkspaceNodes(
  source: FigmaWorkspaceProjectionSource,
): ReadonlyMap<string, DesignNode> {
  const nodeById = new Map<string, DesignNode>()

  if (isDesignDocumentRead(source)) {
    const read = source
    const root = read.node('workspacePage')

    if (!root) {
      throw new Error('Missing Figma workspace root: workspacePage')
    }

    visitReadNode(root)

    return nodeById

    function visitReadNode(node: DesignNode) {
      if (nodeById.has(node.id)) {
        throw new Error(`Duplicate Figma workspace node: ${node.id}`)
      }

      nodeById.set(node.id, node)

      for (const child of read.children(node.id)) {
        visitReadNode(child)
      }
    }
  }

  for (const node of source.nodes) {
    if (nodeById.has(node.id)) {
      throw new Error(`Duplicate design node: ${node.id}`)
    }

    nodeById.set(node.id, node)
  }

  const workspaceNodes = new Map<string, DesignNode>()
  const root = nodeById.get('workspacePage')

  if (!root) {
    throw new Error('Missing Figma workspace root: workspacePage')
  }

  visitSnapshotNode(root)

  return workspaceNodes

  function visitSnapshotNode(node: DesignNode) {
    if (workspaceNodes.has(node.id)) {
      throw new Error(`Duplicate Figma workspace placement: ${node.id}`)
    }

    workspaceNodes.set(node.id, node)

    for (const childId of node.children) {
      const child = nodeById.get(childId)

      if (!child) {
        throw new Error(`Missing Figma workspace child: ${childId}`)
      }

      visitSnapshotNode(child)
    }
  }
}

function isDesignDocumentRead(
  source: FigmaWorkspaceProjectionSource,
): source is DesignDocumentRead {
  return 'node' in source &&
    typeof source.node === 'function' &&
    'children' in source &&
    typeof source.children === 'function'
}

function assertCompleteWorkspace(nodeById: ReadonlyMap<string, DesignNode>) {
  for (const nodeId of EXPECTED_WORKSPACE_NODE_IDS) {
    if (!nodeById.has(nodeId)) {
      throw new Error(`Missing Figma workspace node: ${nodeId}`)
    }
  }

  for (const nodeId of nodeById.keys()) {
    if (!EXPECTED_WORKSPACE_NODE_IDS.has(nodeId)) {
      throw new Error(`Unknown Figma workspace node: ${nodeId}`)
    }
  }
}

function projectLegacyNodeState(node: DesignNode): FigmaCloneDomEditNodeState {
  return {
    align: readChoice(node.layout, 'align', [
      'auto',
      'center',
      'end',
      'start',
      'stretch',
    ]),
    alignSelf: readChoice(node.layout, 'alignSelf', [
      'auto',
      'center',
      'end',
      'start',
      'stretch',
    ]),
    direction: readChoice(node.layout, 'direction', ['column', 'row']),
    distribution: readChoice(node.layout, 'distribution', [
      'center',
      'end',
      'packed',
      'start',
      'space-between',
    ]),
    gap: readNumber(node.layout, 'gap'),
    h: readNumber(node.layout, 'h'),
    heightMode: readChoice(node.layout, 'heightMode', [
      'fill',
      'fixed',
      'hug',
    ]),
    margin: readNumber(node.layout, 'margin'),
    opacity: readNumber(node.style, 'opacity'),
    order: readNumber(node.layout, 'order'),
    padding: readNumber(node.layout, 'padding'),
    paddingBottom: readNumber(node.layout, 'paddingBottom'),
    paddingLeft: readNumber(node.layout, 'paddingLeft'),
    paddingRight: readNumber(node.layout, 'paddingRight'),
    paddingTop: readNumber(node.layout, 'paddingTop'),
    radius: readNumber(node.style, 'radius'),
    rotation: readNumber(node.style, 'rotation'),
    w: readNumber(node.layout, 'w'),
    widthMode: readChoice(node.layout, 'widthMode', [
      'fill',
      'fixed',
      'hug',
    ]),
    x: readNumber(node.layout, 'x'),
    y: readNumber(node.layout, 'y'),
  }
}

function projectSectionViewport(
  frame: DesignNodeFrame,
): FigmaCloneSectionViewport {
  if (frame.overflow === 'visible') {
    throw new Error('Figma workspace frame does not support visible overflow')
  }

  return {
    frameMode: frame.heightMode === 'content' ? 'page' : 'mock',
    h: frame.height,
    overflow: frame.overflow,
    w: frame.width,
  }
}

function readNumber(
  values: DesignNode['layout'] | DesignNode['style'],
  field: string,
): number {
  const value = values[field]

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Invalid Figma workspace numeric field: ${field}`)
  }

  return value
}

function readChoice<T extends string>(
  values: DesignNode['layout'],
  field: string,
  choices: readonly T[],
): T {
  const value = values[field]

  if (typeof value !== 'string' || !choices.includes(value as T)) {
    throw new Error(`Invalid Figma workspace layout field: ${field}`)
  }

  return value as T
}

function requireWorkspaceNode(
  nodeById: ReadonlyMap<string, DesignNode>,
  nodeId: string,
): DesignNode {
  const node = nodeById.get(nodeId)

  if (!node) {
    throw new Error(`Missing Figma workspace node: ${nodeId}`)
  }

  return node
}

function requireWorkspaceNodeId(nodeId: string): FigmaWorkspaceDesignNodeId {
  if (!EXPECTED_WORKSPACE_NODE_IDS.has(nodeId)) {
    throw new Error(`Unknown Figma workspace node: ${nodeId}`)
  }

  return nodeId as FigmaWorkspaceDesignNodeId
}

function requireWorkspaceFrame(node: DesignNode): DesignNodeFrame {
  if (!node.frame) {
    throw new Error('Missing Figma workspace frame')
  }

  return { ...node.frame }
}

function requireCompleteRecord<T>(
  values: Partial<Record<FigmaWorkspaceDesignNodeId, T>>,
  label: string,
): Record<FigmaWorkspaceDesignNodeId, T> {
  for (const nodeId of EXPECTED_WORKSPACE_NODE_IDS) {
    if (!Object.prototype.hasOwnProperty.call(values, nodeId)) {
      throw new Error(`Missing Figma workspace ${label}: ${nodeId}`)
    }
  }

  return values as Record<FigmaWorkspaceDesignNodeId, T>
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value
  }

  Object.freeze(value)

  for (const child of Object.values(value)) {
    deepFreeze(child)
  }

  return value
}
