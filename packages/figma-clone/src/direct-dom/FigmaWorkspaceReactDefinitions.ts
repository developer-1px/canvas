import type {
  ReactDesignDefinition,
  ReactDesignIntrinsicTag,
} from '../../../../src/canvas/react-design-renderer'
import type {
  FigmaWorkspaceComponentDefinitionId,
} from '../design-document/FigmaWorkspaceComponentMetadata'
import {
  FIGMA_WIDGET_DEFINITION_ID,
} from '../design-document/FigmaWidgetDesignDocumentSeed'
import {
  FigmaHomeMetaCard,
  FigmaReactWidget,
  FigmaWorkspaceDealRow,
  FigmaWorkspaceFailingDefinition,
  FigmaWorkspaceStatCard,
} from './FigmaWorkspaceReactDefinitionViews'

export const FIGMA_REACT_INTRINSICS = [
  'article',
  'aside',
  'button',
  'div',
  'em',
  'footer',
  'h1',
  'h2',
  'header',
  'main',
  'nav',
  'p',
  'section',
  'span',
  'strong',
] as const satisfies readonly ReactDesignIntrinsicTag[]

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

export const FIGMA_REACT_DEFINITIONS = [
  ...FIGMA_WORKSPACE_REACT_DEFINITIONS,
  {
    id: 'home-meta-card',
    kind: 'component',
    render: FigmaHomeMetaCard,
  },
  {
    id: FIGMA_WIDGET_DEFINITION_ID,
    kind: 'widget',
    render: FigmaReactWidget,
  },
] as const satisfies readonly ReactDesignDefinition[]

export function createFigmaReactDefinitions({
  failDefinitionId,
}: {
  readonly failDefinitionId?: FigmaWorkspaceComponentDefinitionId
} = {}): readonly ReactDesignDefinition[] {
  if (!failDefinitionId) {
    return FIGMA_REACT_DEFINITIONS
  }

  return FIGMA_REACT_DEFINITIONS.map((definition) =>
    definition.id === failDefinitionId
      ? { ...definition, render: FigmaWorkspaceFailingDefinition }
      : definition)
}
