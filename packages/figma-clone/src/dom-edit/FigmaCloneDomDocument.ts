import {
  createJSONDocument,
  type JSONDocument,
} from '@interactive-os/json-document'
import * as z from 'zod'
import {
  createFigmaCloneDomEditState,
  createFigmaCloneDomTextState,
  type FigmaCloneDomEditState,
  type FigmaCloneDomTextState,
} from './FigmaCloneDomEditModel'

export const FIGMA_CLONE_DOM_DOCUMENT_HISTORY_LIMIT = 100

export type FigmaCloneDomDocumentValue = {
  state: FigmaCloneDomEditState
  textState: FigmaCloneDomTextState
}

export type FigmaCloneDomDocument =
  JSONDocument<FigmaCloneDomDocumentValue>

const FigmaCloneLegacyRecordSchema = z.custom<Record<string, unknown>>(
  isRecordLike,
).refine(
  hasNoWorkspaceEntries,
  'Workspace nodes belong to the canonical DesignDocument',
)

export const FIGMA_CLONE_DOM_DOCUMENT_SCHEMA = z.object({
  state: FigmaCloneLegacyRecordSchema as unknown as
    z.ZodType<FigmaCloneDomEditState>,
  textState:
    FigmaCloneLegacyRecordSchema as unknown as
      z.ZodType<FigmaCloneDomTextState>,
}) satisfies z.ZodType<FigmaCloneDomDocumentValue>

export function createFigmaCloneDomDocument(): FigmaCloneDomDocument {
  return createJSONDocument(
    FIGMA_CLONE_DOM_DOCUMENT_SCHEMA,
    createFigmaCloneDomDocumentValue(),
    {
      history: FIGMA_CLONE_DOM_DOCUMENT_HISTORY_LIMIT,
      strict: false,
      trustedInitial: true,
    },
  )
}

export function createFigmaCloneDomDocumentValue(): FigmaCloneDomDocumentValue {
  return {
    state: withoutWorkspaceEntries(createFigmaCloneDomEditState()),
    textState: withoutWorkspaceEntries(createFigmaCloneDomTextState()),
  }
}

function withoutWorkspaceEntries<TValue extends object>(value: TValue): TValue {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => !key.startsWith('workspace')),
  ) as TValue
}

function hasNoWorkspaceEntries(value: Record<string, unknown>) {
  return Object.keys(value).every((key) => !key.startsWith('workspace'))
}

function isRecordLike(value: unknown) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
