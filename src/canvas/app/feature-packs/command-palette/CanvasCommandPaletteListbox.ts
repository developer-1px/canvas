export type CanvasCommandPaletteListboxItem = {
  disabled?: boolean
  id: string
}

export type CanvasCommandPaletteListboxRootAttributes = {
  'aria-describedby'?: string
  'aria-label': string
  role: 'listbox'
}

export type CanvasCommandPaletteOptionAttributes = {
  'aria-disabled'?: 'true'
  'aria-posinset': number
  'aria-selected': boolean
  'aria-setsize': number
  id: string
  role: 'option'
}

export type CanvasCommandPaletteEmptyAttributes = {
  'aria-live': 'polite'
  id: string
  role: 'status'
}

export type CanvasCommandPaletteListboxOptionDescriptor = {
  attributes: CanvasCommandPaletteOptionAttributes
  index: number
  isActive: boolean
  itemId: string
}

export type CanvasCommandPaletteListboxDescriptor = {
  activeOptionId: string | null
  emptyAttributes?: CanvasCommandPaletteEmptyAttributes
  emptyMessageId: string
  isEmpty: boolean
  options: readonly CanvasCommandPaletteListboxOptionDescriptor[]
  rootAttributes: CanvasCommandPaletteListboxRootAttributes
}

export type CanvasCommandPaletteListboxDescriptorInput = {
  activeIndex: number
  controlId: string
  items: readonly CanvasCommandPaletteListboxItem[]
}

export function createCanvasCommandPaletteListboxDescriptor({
  activeIndex,
  controlId,
  items,
}: CanvasCommandPaletteListboxDescriptorInput):
  CanvasCommandPaletteListboxDescriptor {
  const emptyMessageId = getCanvasCommandPaletteEmptyMessageId(controlId)
  const isEmpty = items.length === 0
  const clampedActiveIndex = getCanvasCommandPaletteListboxActiveIndex({
    activeIndex,
    itemCount: items.length,
  })
  const options = items.map((item, index) => {
    const isActive = index === clampedActiveIndex

    return {
      attributes: {
        ...(item.disabled ? { 'aria-disabled': 'true' as const } : {}),
        'aria-posinset': index + 1,
        'aria-selected': isActive,
        'aria-setsize': items.length,
        id: getCanvasCommandPaletteOptionId(controlId, item.id),
        role: 'option' as const,
      },
      index,
      isActive,
      itemId: item.id,
    }
  })

  return {
    activeOptionId: options[clampedActiveIndex]?.attributes.id ?? null,
    ...(isEmpty
      ? {
          emptyAttributes: {
            'aria-live': 'polite',
            id: emptyMessageId,
            role: 'status' as const,
          },
        }
      : {}),
    emptyMessageId,
    isEmpty,
    rootAttributes: {
      ...(isEmpty ? { 'aria-describedby': emptyMessageId } : {}),
      'aria-label': 'Command results',
      role: 'listbox',
    },
    options,
  }
}

function getCanvasCommandPaletteListboxActiveIndex({
  activeIndex,
  itemCount,
}: {
  activeIndex: number
  itemCount: number
}) {
  if (itemCount <= 0) {
    return 0
  }

  return Math.max(0, Math.min(activeIndex, itemCount - 1))
}

function getCanvasCommandPaletteOptionId(controlId: string, itemId: string) {
  return `${controlId}-option-${itemId.replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

function getCanvasCommandPaletteEmptyMessageId(controlId: string) {
  return `${controlId}-empty`
}
