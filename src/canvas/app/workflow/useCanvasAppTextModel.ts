import {
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type {
  EditingText,
  Viewport,
} from '../../entities'
import type { CanvasAffordanceConfig } from '../../engine'
import type { CanvasItemReadModel } from '../../host'
import { useCanvasFindReplaceModel } from './useCanvasFindReplaceModel'
import { useCanvasTextEditorModel } from './useCanvasTextEditorModel'
import type {
  CanvasDocumentTextSearch,
  CommitCanvasItemsChange,
} from './CanvasWorkflowContract'

type CanvasAppTextDocumentModel = {
  commitItemsChange: CommitCanvasItemsChange
  findDocumentText: CanvasDocumentTextSearch['findDocumentText']
  replaceDocumentText: CanvasDocumentTextSearch['replaceDocumentText']
}

type UseCanvasAppTextModelArgs = {
  config: CanvasAffordanceConfig
  document: CanvasAppTextDocumentModel
  itemReadModel: CanvasItemReadModel
  selection: string[]
  viewport: Viewport
}

type CanvasAppTextModel = {
  command: {
    setEditing: Dispatch<SetStateAction<EditingText | null>>
  }
  component: {
    interaction: {
      setEditing: Dispatch<SetStateAction<EditingText | null>>
    }
  }
  extension: {
    setEditing: Dispatch<SetStateAction<EditingText | null>>
  }
  keyboard: {
    interaction: {
      setEditing: Dispatch<SetStateAction<EditingText | null>>
    }
    openFindReplace: ReturnType<typeof useCanvasFindReplaceModel>['openFindReplace']
  }
  pointer: {
    workspace: {
      setEditing: Dispatch<SetStateAction<EditingText | null>>
    }
  }
  stage: {
    blurTextEditor: () => void
  }
  view: {
    findReplace: ReturnType<typeof useCanvasFindReplaceModel>['findReplace']
    textEditor: ReturnType<typeof useCanvasTextEditorModel>['textEditor']
  }
}

export function useCanvasAppTextModel({
  config,
  document,
  itemReadModel,
  selection,
  viewport,
}: UseCanvasAppTextModelArgs): CanvasAppTextModel {
  const editorRef = useRef<HTMLTextAreaElement | null>(null)
  const {
    blurTextEditor,
    setEditing,
    textEditor,
  } = useCanvasTextEditorModel({
    commitItemsChange: document.commitItemsChange,
    config,
    editorRef,
    itemReadModel,
    selection,
    viewport,
  })
  const { findReplace, openFindReplace } = useCanvasFindReplaceModel({
    enabled: config.overlays.findReplace,
    findDocumentText: document.findDocumentText,
    replaceDocumentText: document.replaceDocumentText,
  })

  return {
    command: {
      setEditing,
    },
    component: {
      interaction: {
        setEditing,
      },
    },
    extension: {
      setEditing,
    },
    keyboard: {
      interaction: {
        setEditing,
      },
      openFindReplace,
    },
    pointer: {
      workspace: {
        setEditing,
      },
    },
    stage: {
      blurTextEditor,
    },
    view: {
      findReplace,
      textEditor,
    },
  }
}
