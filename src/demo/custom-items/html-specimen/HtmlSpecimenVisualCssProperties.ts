export const CSS_WIDE_KEYWORDS = new Set([
  'inherit',
  'initial',
  'revert',
  'revert-layer',
  'unset',
])

export function normalizeProperty(property: string) {
  return property.trim().toLowerCase()
}

export function getCssDeclarationSourceProperties(property: string) {
  const normalizedProperty = normalizeProperty(property)

  switch (normalizedProperty) {
    case 'background-color':
      return [normalizedProperty, 'background']
    default:
      return [normalizedProperty]
  }
}

export function getCssTokenGuardProperties(property: string) {
  switch (normalizeProperty(property)) {
    case 'background-color':
      return ['background']
    case 'border-color':
      return [
        'border',
        'border-bottom-color',
        'border-left-color',
        'border-right-color',
        'border-top-color',
      ]
    case 'border-radius':
      return [
        'border-bottom-left-radius',
        'border-bottom-right-radius',
        'border-top-left-radius',
        'border-top-right-radius',
      ]
    case 'font-size':
      return ['font']
    case 'margin':
      return ['margin-bottom', 'margin-left', 'margin-right', 'margin-top']
    case 'padding':
      return ['padding-bottom', 'padding-left', 'padding-right', 'padding-top']
    default:
      return []
  }
}

export function getCssInlineStyleSourceProperties(property: string) {
  return [
    normalizeProperty(property),
    ...getCssDeclarationSourceProperties(property),
    ...getCssTokenGuardProperties(property),
    ...getCssShorthandConflictProperties(property),
  ]
}

export function getCssShorthandConflictProperties(property: string) {
  switch (normalizeProperty(property)) {
    case 'border-color':
      return [
        'border-bottom-color',
        'border-left-color',
        'border-right-color',
        'border-top-color',
      ]
    case 'border-radius':
    case 'margin':
    case 'padding':
      return getCssTokenGuardProperties(property)
    default:
      return []
  }
}

export function countLeadingWhitespace(value: string) {
  return value.length - value.trimStart().length
}

export function countTrailingWhitespace(value: string) {
  return value.length - value.trimEnd().length
}
