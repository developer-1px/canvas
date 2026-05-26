import type { CanvasAppTextRuntime } from './CanvasAppTextConsumerContracts'

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
