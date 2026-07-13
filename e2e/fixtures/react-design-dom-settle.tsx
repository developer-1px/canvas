import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createCausalPatchInbox } from '@interactive-os/json-document-causal-patch-inbox'
import type { EditorEnginePreviewSession } from '@interactive-os/canvas/editor'
import {
  ReactDesignEditorRenderer,
  createDesignDocument,
  createReactDesignDefinitionRegistry,
  createReactDesignTextSelection,
  getDesignDocumentPatchPort,
  getReactDesignEditorExternalChangeHost,
  useReactDesignEditorRuntime,
  type DesignNodeId,
  type ReactDesignTextSelectionBookmark,
  type ReactDesignTextSelectionOwnership,
} from '@interactive-os/canvas/react-design'

const STABLE_ID_SCOPES = [{
  scope: 'design-node',
  query: '$.nodes[*]',
  readId(value: unknown) {
    if (!value || typeof value !== 'object' || !('id' in value)) {
      return undefined
    }

    return typeof value.id === 'string' ? value.id : undefined
  },
}]

type ActiveEdit = {
  readonly draft: string
  readonly session: EditorEnginePreviewSession | null
}

export function DomSettleTracer() {
  const runtime = useReactDesignEditorRuntime({
    createDocument: createTracerDocument,
    createRegistry: () => createReactDesignDefinitionRegistry({
      intrinsics: ['div'],
    }),
    viewport: { initial: { scale: 1, x: 0, y: 0 } },
  })
  const externalChanges = getReactDesignEditorExternalChangeHost(runtime)
  const [inbox] = useState(() => createCausalPatchInbox(
    getDesignDocumentPatchPort(runtime.document),
    {
      host: externalChanges,
      stableIdScopes: STABLE_ID_SCOPES,
    },
  ))
  const [selection] = useState(() =>
    createReactDesignTextSelection({ document }))
  const [edit, setEdit] = useState<ActiveEdit | null>(null)
  const [status, setStatus] = useState('idle')
  const editorRef = useRef<HTMLTextAreaElement | null>(null)
  const ownershipRef = useRef<ReactDesignTextSelectionOwnership | null>(null)
  const bookmarkRef = useRef<ReactDesignTextSelectionBookmark | null>(null)
  const noteA = runtime.editor.read.node('note-a')?.text ?? ''
  const noteB = runtime.editor.read.node('note-b')?.text ?? ''

  useEffect(() => externalChanges.subscribeReady(() => {
    const hasReadyRemote = inbox.current().queued.some((entry) =>
      entry.missing.length === 0)

    if (hasReadyRemote) {
      const result = inbox.ingest([])

      setStatus(result.ok ? 'remote-applied' : result.code)
      return
    }

    const ownership = ownershipRef.current
    const bookmark = bookmarkRef.current

    if (!ownership || !bookmark) {
      return
    }

    bookmarkRef.current = null
    setStatus(ownership.restore(bookmark)
      ? 'selection-restored'
      : 'selection-stale')
  }), [externalChanges, inbox])

  useEffect(() => () => {
    ownershipRef.current?.release()
    selection.dispose()
    inbox.dispose()
  }, [inbox, selection])

  const beginEdit = () => {
    const session = runtime.editor.commands.beginPreview({
      label: 'Edit note A',
      nodeId: 'note-a',
    })

    if (!session) {
      setStatus('preview-unavailable')
      return
    }

    ownershipRef.current?.release()
    ownershipRef.current = selection.claim({
      nodeId: 'note-a',
      readElement: () => editorRef.current,
    })
    setEdit({ draft: noteA, session })
    setStatus('editing')
  }

  const updateEdit = (value: string) => {
    if (!edit?.session) {
      return
    }

    const result = edit.session.update([{ target: 'text', value }])

    setStatus(result.ok ? 'previewing' : result.code)
    if (result.ok) {
      setEdit({ ...edit, draft: value })
    }
  }

  const commitEdit = () => {
    if (!edit?.session) {
      return
    }

    bookmarkRef.current = ownershipRef.current?.capture() ?? null
    const result = edit.session.commit()

    setStatus(result.ok ? 'local-committed' : result.code)
    if (result.ok) {
      setEdit({ ...edit, session: null })
    }
  }

  const queueRemote = () => {
    const result = inbox.ingest({
      id: 'remote-note-b',
      dependsOn: [],
      intent: {
        kind: 'stable-id-replace',
        target: { scope: 'design-node', id: 'note-b' },
        relativePath: '/text',
        expected: 'Draft B',
        value: 'Remote B',
      },
    })

    setStatus(result.ok ? 'remote-applied' : result.code)
  }

  return (
    <main
      data-note-a={noteA}
      data-note-b={noteB}
      data-preview-node-id={runtime.snapshot.preview?.nodeId ?? undefined}
      data-status={status}
    >
      <ReactDesignEditorRenderer runtime={runtime} />
      <button type="button" onClick={beginEdit}>Start edit</button>
      <button type="button" onClick={queueRemote}>Queue remote</button>
      {edit ? (
        <textarea
          autoFocus
          key={`${noteA}:${noteB}`}
          ref={editorRef}
          aria-label="Note A editor"
          value={edit.draft}
          onChange={(event) => updateEdit(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault()
              commitEdit()
            }
          }}
        />
      ) : null}
    </main>
  )
}

function createTracerDocument() {
  return createDesignDocument({
    schemaVersion: 1,
    roots: ['root'],
    nodes: [
      createNode('root', ['note-a', 'note-b']),
      { ...createNode('note-a'), text: 'Draft A' },
      { ...createNode('note-b'), text: 'Draft B' },
    ],
  })
}

function createNode(id: DesignNodeId, children: readonly DesignNodeId[] = []) {
  return {
    id,
    label: id,
    definition: { kind: 'intrinsic' as const, id: 'div' },
    children,
    props: {},
    text: null,
    layout: {},
    style: {},
    frame: null,
    component: null,
  }
}

createRoot(document.getElementById('root')!).render(<DomSettleTracer />)
