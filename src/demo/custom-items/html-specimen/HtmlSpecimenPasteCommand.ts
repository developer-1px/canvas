import type {
  CanvasAppCustomCommand,
  CanvasAppCustomCommandContext,
} from '../../../canvas'
import { createHtmlSpecimenItemFromPastedText } from './HtmlSpecimenPasteItem'

export type HtmlSpecimenClipboardTextReader = () => Promise<string | null>

export function createHtmlSpecimenPasteCommand({
  readText = readNavigatorClipboardText,
}: {
  readText?: HtmlSpecimenClipboardTextReader
} = {}): CanvasAppCustomCommand {
  return {
    id: 'paste-html-specimen',
    isEnabled: () => true,
    label: 'Paste HTML',
    run: (context) => {
      void runHtmlSpecimenPasteCommand({ context, readText })
    },
    title: 'Paste HTML specimen',
  }
}

export async function runHtmlSpecimenPasteCommand({
  context,
  readText = readNavigatorClipboardText,
}: {
  context: CanvasAppCustomCommandContext
  readText?: HtmlSpecimenClipboardTextReader
}) {
  const text = await readText()

  if (!text) {
    return false
  }

  const item = createHtmlSpecimenItemFromPastedText({
    createId: context.createId,
    position: getHtmlSpecimenPastePosition(context),
    text,
  })

  if (!item) {
    return false
  }

  context.commitItemsChange({
    items: [item],
    type: 'add',
  }, {
    after: [item.id],
    before: context.selection,
  })

  return true
}

function getHtmlSpecimenPastePosition(
  context: Pick<CanvasAppCustomCommandContext, 'viewport'>,
) {
  const screenOffset = 80
  const scale = context.viewport.scale || 1

  return {
    x: Math.round((screenOffset - context.viewport.x) / scale),
    y: Math.round((screenOffset - context.viewport.y) / scale),
  }
}

async function readNavigatorClipboardText() {
  const clipboard = globalThis.navigator?.clipboard

  if (!clipboard || typeof clipboard.readText !== 'function') {
    return null
  }

  try {
    return await clipboard.readText()
  } catch {
    return null
  }
}
