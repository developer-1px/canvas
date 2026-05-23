import type {
  Dispatch,
  SetStateAction,
} from 'react'
import type { EditingText } from '../../entities'

type CanvasAppTextRuntime<TFindReplace, TTextEditor> = {
  blurTextEditor: () => void
  findReplace: TFindReplace
  openFindReplace: () => void
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  textEditor: TTextEditor
}

export function getCanvasAppTextConsumerModel<TFindReplace, TTextEditor>({
  blurTextEditor,
  findReplace,
  openFindReplace,
  setEditing,
  textEditor,
}: CanvasAppTextRuntime<TFindReplace, TTextEditor>) {
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
