import type { FigmaCloneDomNodeId } from '../dom-edit/FigmaCloneDomEditModel'
import type {
  FigmaCloneDomSectionRootId,
} from '../dom-editor/section'
import type {
  FigmaWorkspaceDesignDocumentProjection,
} from './FigmaWorkspaceDesignDocumentProjection'
import type {
  FigmaWorkspaceDesignNodeId,
} from './FigmaWorkspaceComponentMetadata'

export function routeFigmaWorkspaceOwnedEdit<TResult>({
  nodeId,
  projection,
  writeLegacy,
  writeWorkspace,
}: {
  readonly nodeId: FigmaCloneDomNodeId
  readonly projection: FigmaWorkspaceDesignDocumentProjection
  readonly writeLegacy: (nodeId: FigmaCloneDomNodeId) => TResult
  readonly writeWorkspace: (nodeId: FigmaWorkspaceDesignNodeId) => TResult
}): TResult {
  return Object.hasOwn(projection.nodeById, nodeId)
    ? writeWorkspace(nodeId as FigmaWorkspaceDesignNodeId)
    : writeLegacy(nodeId)
}

export function routeFigmaWorkspaceOwnedSectionEdit<TResult>({
  rootId,
  writeLegacy,
  writeWorkspace,
}: {
  readonly rootId: FigmaCloneDomSectionRootId | null
  readonly writeLegacy: () => TResult
  readonly writeWorkspace: () => TResult
}): TResult {
  return rootId === 'workspacePage' ? writeWorkspace() : writeLegacy()
}
