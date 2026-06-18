export const SLIDE_EDIT_TEXT_JSON_PASTE_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)

export type SlideEditTextJSONPasteType =
  (typeof SLIDE_EDIT_TEXT_JSON_PASTE_TYPES)[number]
