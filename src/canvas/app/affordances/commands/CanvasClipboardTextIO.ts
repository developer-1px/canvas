export type CanvasClipboardTextWriteMode =
  | 'unavailable'
  | 'write-failed'
  | 'write-text'

export type CanvasClipboardTextClipboard = {
  writeText?: (text: string) => Promise<void>
}

export type CanvasClipboardTextWriteInput = {
  clipboard?: CanvasClipboardTextClipboard | null
  text: string
}

export async function writeCanvasClipboardText({
  clipboard = getCanvasClipboardTextNavigatorClipboard(),
  text,
}: CanvasClipboardTextWriteInput): Promise<CanvasClipboardTextWriteMode> {
  if (!clipboard?.writeText) {
    return 'unavailable'
  }

  try {
    await clipboard.writeText(text)

    return 'write-text'
  } catch {
    return 'write-failed'
  }
}

function getCanvasClipboardTextNavigatorClipboard():
  CanvasClipboardTextClipboard | null {
  if (typeof navigator === 'undefined') {
    return null
  }

  return navigator.clipboard ?? null
}
