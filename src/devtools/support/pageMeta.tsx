import {
  createContext,
  useEffect,
  type ReactNode,
} from 'react'

export const PageMetaEnabledContext = createContext(true)

export function usePageMeta(title: string) {
  useEffect(() => {
    const previousTitle = document.title

    document.title = title

    return () => {
      document.title = previousTitle
    }
  }, [title])
}

export function PageMetaProvider({ children }: { children: ReactNode }) {
  return (
    <PageMetaEnabledContext.Provider value>
      {children}
    </PageMetaEnabledContext.Provider>
  )
}
