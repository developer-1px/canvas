import { createContext, type ReactNode } from 'react'

export const BrowserWindowContext = createContext<Window | null>(window)

export function BrowserWindowProvider({
  children,
  value,
}: {
  children: ReactNode
  value: Window | null | undefined
}) {
  return (
    <BrowserWindowContext.Provider value={value ?? null}>
      {children}
    </BrowserWindowContext.Provider>
  )
}
