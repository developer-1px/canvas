import type {
  ReactDesignDefinitionRenderProps,
} from '../../../../src/canvas/react-design-renderer'

export function FigmaWorkspaceStatCard({
  children,
  rootProps,
}: ReactDesignDefinitionRenderProps) {
  return <div {...rootProps}>{children}</div>
}

export function FigmaWorkspaceDealRow({
  children,
  rootProps,
}: ReactDesignDefinitionRenderProps) {
  return <article {...rootProps}>{children}</article>
}

export function FigmaWorkspaceFailingDefinition(): never {
  throw new Error('Intentional Figma workspace definition failure')
}
