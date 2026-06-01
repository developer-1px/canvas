export type HtmlSpecimenOutline = {
  content: HtmlSpecimenOutlineContent[]
}

export type HtmlSpecimenOutlineContent =
  | HtmlSpecimenOutlineTextContent
  | HtmlSpecimenOutlineElement

export type HtmlSpecimenOutlineTextContent = {
  kind: 'text'
  text: string
}

export type HtmlSpecimenOutlineElement = {
  attributes: Record<string, string>
  content: HtmlSpecimenOutlineContent[]
  id: string
  kind: 'element'
  path: number[]
  tagName: string
  voidElement: boolean
}

export type HtmlSpecimenOutlineEditResult =
  | {
      nextFocusId: string | null
      ok: true
      outline: HtmlSpecimenOutline
    }
  | {
      ok: false
      reason:
        | 'has-element-children'
        | 'invalid-target'
        | 'missing-parent'
        | 'no-next-sibling'
        | 'no-previous-sibling'
        | 'root-target'
        | 'void-element'
    }

export type HtmlSpecimenOutlineTextEditResult =
  | {
      nextFocusId: string
      ok: true
      outline: HtmlSpecimenOutline
      previousText: string
    }
  | Extract<HtmlSpecimenOutlineEditResult, { ok: false }>

export type HtmlSpecimenOutlineLocation = {
  contentIndex: number
  elementIndex: number
  node: HtmlSpecimenOutlineElement
  parentContent: HtmlSpecimenOutlineContent[]
  parentNode: HtmlSpecimenOutlineElement | null
}
