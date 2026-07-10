import type {
  ReactDesignDefinition,
} from '../../../../src/canvas/react-design-renderer'
import type {
  FigmaWorkspaceComponentDefinitionId,
} from '../design-document'
import {
  FigmaWorkspaceDealRow,
  FigmaWorkspaceFailingDefinition,
  FigmaWorkspaceStatCard,
} from './FigmaWorkspaceReactDefinitionViews'

export const FIGMA_WORKSPACE_REACT_DEFINITIONS = [
  {
    id: 'workspace-stat-card',
    kind: 'component',
    render: FigmaWorkspaceStatCard,
  },
  {
    id: 'workspace-deal-row',
    kind: 'component',
    render: FigmaWorkspaceDealRow,
  },
] as const satisfies readonly ReactDesignDefinition[]

export function createFigmaWorkspaceReactDefinitions({
  failDefinitionId,
}: {
  readonly failDefinitionId?: FigmaWorkspaceComponentDefinitionId
} = {}): readonly ReactDesignDefinition[] {
  if (!failDefinitionId) {
    return FIGMA_WORKSPACE_REACT_DEFINITIONS
  }

  return FIGMA_WORKSPACE_REACT_DEFINITIONS.map((definition) =>
    definition.id === failDefinitionId
      ? { ...definition, render: FigmaWorkspaceFailingDefinition }
      : definition)
}
