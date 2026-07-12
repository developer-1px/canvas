import type { DesignDocumentPublication } from '../design-document'
import type { EditorEngine } from './EditorEngine'

/** Coordinates external ready changes with EditorEngine preview ownership. */
export type EditorEngineDocumentHost = {
  ownsPublication(
    publication: DesignDocumentPublication,
  ): false | { readonly sequence: number }
  runReady(request: {
    readonly id: string
    apply(): void
  }):
    | { readonly ok: true }
    | {
        readonly code: 'host_not_ready'
        readonly ok: false
        readonly reason: string
      }
}

const documentHosts = new WeakMap<EditorEngine, EditorEngineDocumentHost>()

export function registerEditorEngineDocumentHost(
  engine: EditorEngine,
  host: EditorEngineDocumentHost,
) {
  documentHosts.set(engine, host)
}

export function getEditorEngineDocumentHost(
  engine: EditorEngine,
): EditorEngineDocumentHost {
  const host = documentHosts.get(engine)

  if (!host) {
    throw new TypeError(
      'The editor document does not expose DesignDocument patch coordination',
    )
  }

  return host
}
