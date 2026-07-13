import { useLayoutEffect } from 'react'

import { ReactDesignRenderer } from '../react-design-renderer'
import type { ReactDesignEditorRuntime } from './ReactDesignEditorRuntime'
import {
  acknowledgeReactDesignEditorRender,
  getReactDesignEditorExternalChangeHost,
} from './ReactDesignEditorExternalChanges'

export function ReactDesignEditorRenderer({
  runtime,
}: {
  readonly runtime: ReactDesignEditorRuntime
}) {
  const documentSnapshot = runtime.document.snapshot
  const editorSnapshot = runtime.snapshot
  const externalChanges = getReactDesignEditorExternalChangeHost(runtime)

  useLayoutEffect(() => acknowledgeReactDesignEditorRender(
    externalChanges,
    documentSnapshot,
    editorSnapshot,
  ), [documentSnapshot, editorSnapshot, externalChanges])

  return (
    <ReactDesignRenderer
      projection={runtime.projection}
      read={runtime.editor.read}
      registry={runtime.registry}
    />
  )
}
