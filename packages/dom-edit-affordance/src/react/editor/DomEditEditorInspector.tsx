import type {
  EditorEngine,
  EditorEngineNodeEditScope,
} from '@interactive-os/canvas/editor'

import { DomEditInspector } from '../features/content-editing/DomEditInspector'
import {
  executeDomEditEditorAutoLayoutField,
  executeDomEditEditorField,
  executeDomEditEditorText,
  useDomEditEditorModel,
} from './DomEditEditorModel'

export function DomEditEditorInspector({
  editScope,
  editor,
  spacingGridSize,
}: {
  readonly editScope?: EditorEngineNodeEditScope
  readonly editor: EditorEngine
  readonly spacingGridSize?: number
}) {
  const model = useDomEditEditorModel(editor)

  return (
    <DomEditInspector
      adapter={model.adapter}
      canEditText={(nodeId) => editor.read.node(nodeId)?.text !== null}
      getText={(nodeId) => editor.read.node(nodeId)?.text ?? ''}
      selectedNodeId={model.selectedNodeId}
      spacingGridSize={spacingGridSize}
      state={model.state}
      viewport={{ scale: 1, x: 0, y: 0 }}
      onChange={(nodeId, field, value) => {
        executeDomEditEditorField(editor, nodeId, field, value, editScope)
      }}
      onChangeAutoLayout={(nodeId, field, value) => {
        executeDomEditEditorAutoLayoutField(
          editor,
          nodeId,
          field,
          value,
          editScope,
        )
      }}
      onChangeText={(nodeId, value) => {
        executeDomEditEditorText(editor, nodeId, value, editScope)
      }}
    />
  )
}
