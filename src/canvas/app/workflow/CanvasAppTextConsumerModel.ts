import type { CanvasAppTextRuntime } from './CanvasAppTextConsumerContracts'

export function getCanvasAppTextConsumerModel<
  TFindReplace,
  TTextEditor,
  TInlineTextEditor,
>({
  blurTextEditor,
  findReplace,
  inlineTextEditor,
  openFindReplace,
  setEditing,
  textEditor,
}: CanvasAppTextRuntime<TFindReplace, TTextEditor, TInlineTextEditor>) {
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
      inlineTextEditor,
    },
    view: {
      findReplace,
      textEditor,
    },
  }
}
