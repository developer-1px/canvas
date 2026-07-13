import type {
  DesignDocument,
  DesignDocumentSnapshot,
} from '../design-document'
import {
  getEditorEngineDocumentHost,
  type EditorEngine,
  type EditorEngineDocumentHost,
  type EditorEngineSnapshot,
} from '../editor-engine'

export type ReactDesignEditorExternalChangeHost =
  EditorEngineDocumentHost & {
    subscribeReady(listener: () => void): () => void
  }

type ReactDesignEditorRuntimeOwner = {
  readonly document: DesignDocument
  readonly editor: EditorEngine
}

type RenderCommitToken = {
  readonly documentSnapshot: DesignDocumentSnapshot
  readonly editorSnapshot: EditorEngineSnapshot
}

type ReadySubscription = {
  readonly notify: () => void
}

type ExternalChangeHostState = {
  acknowledge(token: RenderCommitToken): () => void
  dispose(): void
}

const hosts = new WeakMap<EditorEngine, ReactDesignEditorExternalChangeHost>()
const states = new WeakMap<
  ReactDesignEditorExternalChangeHost,
  ExternalChangeHostState
>()

export function getReactDesignEditorExternalChangeHost(
  runtime: ReactDesignEditorRuntimeOwner,
): ReactDesignEditorExternalChangeHost {
  const existing = hosts.get(runtime.editor)

  if (existing) {
    return existing
  }

  return createReactDesignEditorExternalChangeHost(runtime)
}

function createReactDesignEditorExternalChangeHost({
  document,
  editor,
}: ReactDesignEditorRuntimeOwner): ReactDesignEditorExternalChangeHost {
  const editorHost = getEditorEngineDocumentHost(editor)
  const listeners = new Set<ReadySubscription>()
  const renderLeases = new Map<object, RenderCommitToken>()
  let disposed = false
  let notificationGeneration = 0
  let overlappingRenderers = false

  const isCurrentRender = () => {
    if (
      disposed ||
      overlappingRenderers ||
      renderLeases.size !== 1
    ) {
      return false
    }

    const documentSnapshot = document.snapshot
    const editorSnapshot = editor.snapshot()

    if (editorSnapshot.preview !== null) {
      return false
    }

    for (const token of renderLeases.values()) {
      if (
        token.documentSnapshot !== documentSnapshot ||
        token.editorSnapshot !== editorSnapshot
      ) {
        return false
      }
    }

    return true
  }

  const scheduleReadyNotification = () => {
    notificationGeneration += 1
    const generation = notificationGeneration

    if (!isCurrentRender()) {
      return
    }

    queueMicrotask(() => {
      if (
        disposed ||
        notificationGeneration !== generation ||
        !isCurrentRender()
      ) {
        return
      }

      notifyListeners(listeners, () =>
        !disposed &&
        notificationGeneration === generation &&
        isCurrentRender()
      )
    })
  }

  const host: ReactDesignEditorExternalChangeHost = {
    ownsPublication: editorHost.ownsPublication,
    runReady(request) {
      if (disposed) {
        return notReady('The React design editor runtime is disposed')
      }

      if (!isCurrentRender()) {
        return notReady(
          'The current editor state has not committed to React DOM',
        )
      }

      return editorHost.runReady(request)
    },
    subscribeReady(listener) {
      if (disposed) {
        return () => undefined
      }

      const subscription = { notify: listener }

      listeners.add(subscription)
      return () => listeners.delete(subscription)
    },
  }

  hosts.set(editor, host)
  states.set(host, {
    acknowledge(token) {
      if (disposed) {
        return () => undefined
      }

      const lease = {}

      if (renderLeases.size > 0) {
        overlappingRenderers = true
      }

      renderLeases.set(lease, token)
      scheduleReadyNotification()

      return () => {
        if (disposed || !renderLeases.delete(lease)) {
          return
        }

        scheduleReadyNotification()
      }
    },
    dispose() {
      if (disposed) {
        return
      }

      disposed = true
      notificationGeneration += 1
      overlappingRenderers = false
      renderLeases.clear()
      listeners.clear()
      states.delete(host)
    },
  })

  return host
}

export function acknowledgeReactDesignEditorRender(
  host: ReactDesignEditorExternalChangeHost,
  documentSnapshot: DesignDocumentSnapshot,
  editorSnapshot: EditorEngineSnapshot,
) {
  return states.get(host)?.acknowledge({
    documentSnapshot,
    editorSnapshot,
  }) ?? (() => undefined)
}

export function disposeReactDesignEditorExternalChangeHost(editor: EditorEngine) {
  const host = hosts.get(editor)

  if (host) {
    states.get(host)?.dispose()
  }
}

function notReady(reason: string) {
  return {
    code: 'host_not_ready',
    ok: false,
    reason,
  } as const
}

function notifyListeners(
  listeners: ReadonlySet<ReadySubscription>,
  isCurrent: () => boolean,
) {
  for (const subscription of [...listeners]) {
    if (!isCurrent()) {
      return
    }

    if (!listeners.has(subscription)) {
      continue
    }

    try {
      subscription.notify()
    } catch {
      // One retry policy cannot starve remaining external-change consumers.
    }
  }
}
