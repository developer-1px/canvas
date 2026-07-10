import type { FigmaCloneDomNodeId } from '../dom-edit/FigmaCloneDomEditModel'

export type FigmaWorkspaceDesignNodeId = Extract<
  FigmaCloneDomNodeId,
  `workspace${string}`
>

export type FigmaWorkspaceComponentDefinitionId =
  | 'workspace-deal-row'
  | 'workspace-stat-card'

export type FigmaWorkspaceComponentSource = {
  readonly exportName: string
  readonly importPath: string
  readonly layer: 'features' | 'widgets'
}

export type FigmaWorkspaceComponentInstanceMetadata = {
  readonly id: string
  readonly label: string
  readonly slots: Readonly<Record<string, FigmaWorkspaceDesignNodeId>>
}

export type FigmaWorkspaceComponentMetadata = {
  readonly id: FigmaWorkspaceComponentDefinitionId
  readonly instances: readonly FigmaWorkspaceComponentInstanceMetadata[]
  readonly label: string
  readonly source: FigmaWorkspaceComponentSource
  readonly syncDescription: string
}

/** Product labels and source-code locations intentionally stay outside the document. */
export const FIGMA_WORKSPACE_COMPONENT_METADATA = [
  {
    id: 'workspace-stat-card',
    label: 'Stat card',
    source: {
      exportName: 'WorkspaceStatCard',
      importPath: 'src/widgets/workspace-stat-card',
      layer: 'widgets',
    },
    syncDescription: 'Layout and style edits sync across stat instances.',
    instances: [
      {
        id: 'workspaceStatRevenue',
        label: 'Revenue',
        slots: {
          delta: 'workspaceStatRevenueDelta',
          label: 'workspaceStatRevenueLabel',
          root: 'workspaceStatRevenue',
          value: 'workspaceStatRevenueValue',
        },
      },
      {
        id: 'workspaceStatConversion',
        label: 'Conversion',
        slots: {
          delta: 'workspaceStatConversionDelta',
          label: 'workspaceStatConversionLabel',
          root: 'workspaceStatConversion',
          value: 'workspaceStatConversionValue',
        },
      },
      {
        id: 'workspaceStatTickets',
        label: 'Tickets',
        slots: {
          delta: 'workspaceStatTicketsDelta',
          label: 'workspaceStatTicketsLabel',
          root: 'workspaceStatTickets',
          value: 'workspaceStatTicketsValue',
        },
      },
    ],
  },
  {
    id: 'workspace-deal-row',
    label: 'Deal row',
    source: {
      exportName: 'WorkspaceDealRow',
      importPath: 'src/features/pipeline/deal-row',
      layer: 'features',
    },
    syncDescription: 'Layout and style edits sync across deal row instances.',
    instances: [
      {
        id: 'workspaceDealOne',
        label: 'Deal 1',
        slots: {
          root: 'workspaceDealOne',
          title: 'workspaceDealOneTitle',
          value: 'workspaceDealOneValue',
        },
      },
      {
        id: 'workspaceDealTwo',
        label: 'Deal 2',
        slots: {
          root: 'workspaceDealTwo',
          title: 'workspaceDealTwoTitle',
          value: 'workspaceDealTwoValue',
        },
      },
      {
        id: 'workspaceDealThree',
        label: 'Deal 3',
        slots: {
          root: 'workspaceDealThree',
          title: 'workspaceDealThreeTitle',
          value: 'workspaceDealThreeValue',
        },
      },
    ],
  },
] as const satisfies readonly FigmaWorkspaceComponentMetadata[]

export function getFigmaWorkspaceComponentMetadata(
  definitionId: string,
): FigmaWorkspaceComponentMetadata | null {
  return FIGMA_WORKSPACE_COMPONENT_METADATA.find(
    (definition) => definition.id === definitionId,
  ) ?? null
}
