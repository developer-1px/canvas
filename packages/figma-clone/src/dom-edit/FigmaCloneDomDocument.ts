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

export const FIGMA_CLONE_DOM_DOCUMENT_SCHEMA = z.object({
  state: z.custom<FigmaCloneDomEditState>(isRecordLike),
  textState: z.custom<FigmaCloneDomTextState>(isRecordLike),
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
    state: createFigmaCloneDomEditState(),
    textState: createFigmaCloneDomTextState(),
  }
}

function isRecordLike(value: unknown) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
