export type HtmlSpecimenCssSelectorNode = {
  attributes: Readonly<Record<string, string>>
  classList: readonly string[]
  id?: string
  path?: readonly number[]
  tagName: string
}

export type CssSelectorRelation =
  | 'adjacent-sibling'
  | 'child'
  | 'descendant'
  | 'subsequent-sibling'

export type CssSelectorSegment = {
  compound: string
  relationToPrevious: CssSelectorRelation
}

export type CssAttributeSelector =
  | {
      caseInsensitive: boolean
      name: string
      operator:
        | 'dash-match'
        | 'equals'
        | 'includes'
        | 'prefix'
        | 'substring'
        | 'suffix'
      value: string
    }
  | {
      name: string
      operator: 'exists'
    }

export type CssPseudoFunctionSelector = {
  args: string
  end: number
  name: 'has' | 'is' | 'not' | 'where'
  start: number
}

export type CssNthFormula = {
  a: number
  b: number
}

export type CssStructuralPseudoClassSelector =
  | {
      end: number
      name:
        | 'first-child'
        | 'first-of-type'
        | 'last-child'
        | 'last-of-type'
        | 'only-child'
        | 'only-of-type'
      start: number
    }
  | {
      end: number
      formula: CssNthFormula
      name:
        | 'nth-child'
        | 'nth-last-child'
        | 'nth-last-of-type'
        | 'nth-of-type'
      start: number
    }

export type CssStatePseudoClassSelector = {
  end: number
  name: 'checked' | 'disabled' | 'enabled'
  start: number
}

export type CssPseudoSelectorRange = {
  end: number
  start: number
}

export type CssPseudoSelectors = {
  functions: CssPseudoFunctionSelector[]
  stateClasses: CssStatePseudoClassSelector[]
  structuralClasses: CssStructuralPseudoClassSelector[]
}

export type CssHasRelativeSelector = {
  relationToScope: CssSelectorRelation
  segments: readonly CssSelectorSegment[]
}
