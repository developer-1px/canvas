export type SupportedLanguage = 'ko-KR' | 'en-US'

let currentLanguage: SupportedLanguage = 'ko-KR'

export function normalizeLanguage(value: string | undefined): SupportedLanguage {
  return value?.toLowerCase().startsWith('en') ? 'en-US' : 'ko-KR'
}

export async function changeAppLanguage(language: SupportedLanguage) {
  currentLanguage = language
}

export function useTranslation() {
  return {
    i18n: {
      get language() {
        return currentLanguage
      },
      get resolvedLanguage() {
        return currentLanguage
      },
    },
  }
}
