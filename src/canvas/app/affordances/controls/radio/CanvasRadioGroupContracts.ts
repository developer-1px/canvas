export const CANVAS_RADIO_GROUP_MODEL = 'canvas-radio-group'
export const CANVAS_RADIO_GROUP_FOCUS_MODEL = 'roving-tabindex'
export const CANVAS_RADIO_GROUP_KEYBOARD_MODEL = 'arrow-home-end'

export type CanvasRadioGroupItemInput<TId extends string = string> = {
  disabled?: boolean
  id: TId
  radioId?: string
}

export type CanvasRadioGroupRootAttributes = {
  'aria-label': string
  id: string | undefined
  role: 'radiogroup'
}

export type CanvasRadioItemAttributes = {
  'aria-checked': boolean
  'aria-disabled': true | undefined
  id: string
  role: 'radio'
  tabIndex: -1 | 0 | undefined
}

export type CanvasRadioGroupItemDescriptor<
  TId extends string = string,
  TItem extends CanvasRadioGroupItemInput<TId> =
    CanvasRadioGroupItemInput<TId>,
> =
  TItem & {
    attributes: CanvasRadioItemAttributes
    id: TId
    index: number
    isChecked: boolean
    isDisabled: boolean
    isFocusable: boolean
    radioId: string
  }

export type CanvasRadioGroupDescriptor<
  TId extends string = string,
  TItem extends CanvasRadioGroupItemInput<TId> =
    CanvasRadioGroupItemInput<TId>,
> = {
  checkedId: TId | null
  checkedRadioId: string | null
  focusModel: typeof CANVAS_RADIO_GROUP_FOCUS_MODEL
  focusableId: TId | null
  focusableRadioId: string | null
  keyboardModel: typeof CANVAS_RADIO_GROUP_KEYBOARD_MODEL
  model: typeof CANVAS_RADIO_GROUP_MODEL
  items: CanvasRadioGroupItemDescriptor<TId, TItem>[]
  rootAttributes: CanvasRadioGroupRootAttributes
}

export type CanvasRadioGroupDescriptorInput<
  TId extends string = string,
  TItem extends CanvasRadioGroupItemInput<TId> =
    CanvasRadioGroupItemInput<TId>,
> = {
  ariaLabel: string
  checkedId?: TId | null
  focusedId?: TId | null
  getRadioId?: (id: TId, index: number) => string
  groupId?: string
  items: readonly TItem[]
}

export type CanvasRadioGroupRootAttributesInput = {
  ariaLabel: string
  groupId?: string
}

export type CanvasRadioItemAttributesInput = {
  checked: boolean
  disabled: boolean
  focusable: boolean
  radioId: string
}

export type CanvasRadioGroupKeyboardIntentInput = {
  count: number
  currentIndex: number
  key: string
}

export type CanvasRadioGroupKeyboardIntent =
  | {
      kind: 'none'
      preventDefault: false
      stopPropagation: false
    }
  | {
      kind: 'move-radio'
      nextIndex: number
      preventDefault: true
      stopPropagation: true
    }

export type CanvasRadioGroupKeyboardEvent = {
  currentTarget: HTMLElement
  key: string
  preventDefault: () => void
  stopPropagation: () => void
}

export type RunCanvasRadioGroupKeyboardIntentInput = {
  event: CanvasRadioGroupKeyboardEvent
}
