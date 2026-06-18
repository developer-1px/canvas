import type {
  CSSProperties,
  ReactNode,
} from 'react'

export function getV2RouteScopeClass(routePath: string) {
  void routePath
  return ''
}

export function ShellVersionSwitchLayoutProvider({
  children,
}: {
  children: ReactNode
  initialLayout?: 'original' | 'mid' | 'new'
  initialWidthOpen?: boolean
}) {
  return children
}

export function useShellVersionSwitchLayoutStyle(): CSSProperties | undefined {
  return undefined
}
