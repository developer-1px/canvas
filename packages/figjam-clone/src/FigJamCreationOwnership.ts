import type {
  DesignNode,
  ReactDesignDefinitionRegistry,
} from '@interactive-os/canvas/react-design'

import type { FigJamDocumentPlan } from './FigJamDocumentOperations'

export function ownFigJamDocumentPlanCreatedNodes(
  plan: FigJamDocumentPlan,
  registry: ReactDesignDefinitionRegistry,
): FigJamDocumentPlan {
  return {
    ...plan,
    changes: plan.changes.map((change) => change.type === 'add'
      ? { ...change, node: ownFigJamCreatedNode(change.node, registry) }
      : change),
  }
}

export function ownFigJamCreatedNode(
  node: DesignNode,
  registry: ReactDesignDefinitionRegistry,
): DesignNode {
  if (node.definition.kind === 'intrinsic') {
    return node
  }

  const definition = registry.resolveRegistered(node.definition)

  if (!definition) {
    throw new Error(
      `Unknown FigJam design definition: ${node.definition.kind}:${node.definition.id}`,
    )
  }

  return definition.ownCreatedNode({
    nodeId: node.id,
    x: readFigJamCreationCoordinate(node, 'x'),
    y: readFigJamCreationCoordinate(node, 'y'),
  }, () => node)
}

function readFigJamCreationCoordinate(
  node: DesignNode,
  field: 'x' | 'y',
) {
  const layoutValue = node.layout[field]

  if (typeof layoutValue === 'number' && Number.isFinite(layoutValue)) {
    return layoutValue
  }

  return node.frame?.[field] ?? 0
}
