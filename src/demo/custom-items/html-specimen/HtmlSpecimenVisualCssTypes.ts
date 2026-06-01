import type { HtmlSpecimenData } from './HtmlSpecimenCustomItemModel'

export type HtmlSpecimenVisualCssNode = {
  attributes: Readonly<Record<string, string>>
  classList: readonly string[]
  id: string
  path?: readonly number[]
  tagName: string
}

export type HtmlSpecimenCssMediaContext = {
  viewportHeight: number
  viewportWidth: number
}

export type HtmlSpecimenVisualCssEditIntent = {
  nextValue: string
  nodeId: string
  property: string
}

export type HtmlSpecimenCssDeclarationSource = {
  affectedNodeIds: string[]
  atRule?: string
  declarationIndex: number
  important: boolean
  layer?: CssCascadeLayer
  property: string
  ruleIndex: number
  selector: string
  specificity: [number, number, number]
  value: string
}

export type HtmlSpecimenCssRuleSource = {
  affectedNodeIds: string[]
  atRule?: string
  layer?: CssCascadeLayer
  ruleIndex: number
  selector: string
  specificity: [number, number, number]
}

export type HtmlSpecimenCssScopedRuleSource = {
  affectedNodeIds: string[]
  atRule: string
  declarationIndex: number
  important: boolean
  layer?: CssCascadeLayer
  property: string
  ruleIndex: number
  selector: string
  specificity: [number, number, number]
  value: string
}

export type HtmlSpecimenCssInlineStyleSource = {
  affectedNodeIds: string[]
  important: boolean
  property: string
  value: string
}

export type HtmlSpecimenCssPatchPlan =
  | {
      declarationIndex: number
      kind: 'replace-declaration-value'
      nextValue: string
      previousValue: string
      property: string
      range: {
        end: number
        start: number
      }
      ruleIndex: number
      selector: string
    }
  | {
      kind: 'insert-declaration'
      nextValue: string
      property: string
      range: {
        end: number
        start: number
      }
      replacement: string
      ruleIndex: number
      selector: string
    }

export type HtmlSpecimenVisualCssEditResult =
  | {
      affectedNodeIds: string[]
      ok: false
      reason:
        | 'node-not-found'
        | 'inline-style'
        | 'rule-not-found'
        | 'scoped-rule'
        | 'shorthand-conflict'
        | 'token-value'
        | 'unsupported-value'
        | 'verification-failed'
      specimen: HtmlSpecimenData
    }
  | {
      affectedNodeIds: string[]
      ok: true
      patch: HtmlSpecimenCssPatchPlan
      previousSource: HtmlSpecimenCssDeclarationSource | null
      serializedCss: string
      source: HtmlSpecimenCssDeclarationSource
      specimen: HtmlSpecimenData
      verification: {
        actualValue: string | null
        expectedValue: string
        passed: boolean
        property: string
      }
    }

export type CssRule = {
  atRule: string | null
  blockEnd: number
  layer: CssCascadeLayer | null
  declarations: CssDeclaration[]
  ruleIndex: number
  selector: string
}

export type CssCascadeLayer = {
  name: string
  order: number
}

export type CssDeclaration = {
  declarationIndex: number
  important: boolean
  property: string
  value: string
  valueEnd: number
  valueStart: number
}

export type CssRuleMatch = {
  rule: CssRule
  specificity: [number, number, number]
}

export type CssDeclarationMatch = {
  declaration: CssDeclaration
  rule: CssRule
  specificity: [number, number, number]
}

export type CssScopedDeclarationMatch = CssDeclarationMatch & {
  atRule: string
}

export type CssScannerState = {
  bracketDepth: number
  comment: boolean
  escaped: boolean
  parenDepth: number
  quote: '"' | "'" | null
}

export type CssSupportsEvaluation = boolean | null

export type CssLayerRegistry = {
  createAnonymousLayer(): CssCascadeLayer
  getOrCreateLayer(name: string): CssCascadeLayer
}
