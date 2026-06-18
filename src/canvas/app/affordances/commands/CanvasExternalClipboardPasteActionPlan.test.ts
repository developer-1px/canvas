import { describe, expect, it, vi } from 'vitest'

import {
  canReadCanvasExternalClipboard,
  createCanvasExternalClipboardImagePasteActionResolver,
  createCanvasExternalClipboardPasteActionPlan,
  getCanvasExternalClipboardPasteCommandRoute,
  type CanvasExternalClipboardPasteActionResolver,
} from './CanvasExternalClipboardPasteActionPlan'

type PasteAction =
  | { kind: 'image'; source: string }
  | { kind: 'text'; source: string }
  | { kind: 'table'; source: string }

describe('CanvasExternalClipboardPasteActionPlan', () => {
  it('returns the first exclusive async action without evaluating later resolvers', async () => {
    const later = vi.fn(() => ({
      kind: 'text',
      source: 'plain',
    } as const))

    await expect(createCanvasExternalClipboardPasteActionPlan<PasteAction>({
      resolvers: [
        createResolver({
          mode: 'append',
          resolve: () => null,
        }),
        createResolver({
          mode: 'exclusive',
          order: 1,
          resolve: async () => ({
            kind: 'image',
            source: 'clipboard.png',
          }),
        }),
        createResolver({
          order: 2,
          resolve: later,
        }),
      ],
    })).resolves.toEqual([
      {
        kind: 'image',
        source: 'clipboard.png',
      },
    ])
    expect(later).not.toHaveBeenCalled()
  })

  it('orders append resolvers and contains permission failures as empty actions', async () => {
    await expect(createCanvasExternalClipboardPasteActionPlan<PasteAction>({
      resolvers: [
        createResolver({
          order: 30,
          resolve: () => {
            throw new Error('permission denied')
          },
        }),
        createResolver({
          order: 10,
          resolve: () => [{
            kind: 'table',
            source: 'html-table',
          }],
        }),
        createResolver({
          order: 20,
          resolve: () => ({
            kind: 'text',
            source: 'plain',
          }),
        }),
      ],
    })).resolves.toEqual([
      {
        kind: 'table',
        source: 'html-table',
      },
      {
        kind: 'text',
        source: 'plain',
      },
    ])
  })

  it('adapts existing clipboard image readers into exclusive paste resolvers', async () => {
    const readImageSource = vi.fn(async () => 'data:image/png;base64,image')

    await expect(createCanvasExternalClipboardPasteActionPlan<PasteAction>({
      resolvers: [
        createCanvasExternalClipboardImagePasteActionResolver({
          createAction: (source) => ({
            kind: 'image',
            source,
          }),
          readImageSource,
        }),
      ],
    })).resolves.toEqual([
      {
        kind: 'image',
        source: 'data:image/png;base64,image',
      },
    ])
    expect(readImageSource).toHaveBeenCalledTimes(1)
  })

  it('returns empty plans for unavailable or empty image clipboard reads', async () => {
    await expect(createCanvasExternalClipboardPasteActionPlan<PasteAction>({
      resolvers: [
        createCanvasExternalClipboardImagePasteActionResolver({
          createAction: (source) => ({
            kind: 'image',
            source,
          }),
          readImageSource: async () => null,
        }),
      ],
    })).resolves.toEqual([])
  })

  it('routes explicit commands separately from keyboard native paste events', () => {
    const readableClipboard = {
      read: vi.fn(async () => []),
    }

    expect(canReadCanvasExternalClipboard({
      clipboard: readableClipboard,
    })).toBe(true)
    expect(getCanvasExternalClipboardPasteCommandRoute({
      clipboard: readableClipboard,
      hasInternalClipboard: false,
    })).toBe('external-clipboard')
    expect(getCanvasExternalClipboardPasteCommandRoute({
      clipboard: readableClipboard,
      hasInternalClipboard: false,
      trigger: 'keyboard-shortcut',
    })).toBe('native-paste-event')
    expect(getCanvasExternalClipboardPasteCommandRoute({
      clipboard: null,
      hasInternalClipboard: true,
    })).toBe('internal-clipboard')
    expect(getCanvasExternalClipboardPasteCommandRoute({
      clipboard: null,
      hasInternalClipboard: false,
    })).toBe('none')
  })
})

function createResolver(
  input: Partial<CanvasExternalClipboardPasteActionResolver<PasteAction>>,
): CanvasExternalClipboardPasteActionResolver<PasteAction> {
  return {
    id: input.id ?? 'resolver',
    mode: 'append',
    resolve: () => null,
    ...input,
  }
}
