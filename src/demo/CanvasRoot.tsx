import { CanvasAppLauncher } from './CanvasAppLauncher'
import { resolveCanvasRootRoute } from './CanvasRootRoutes'
import { CanvasEngineDemoApp } from './CanvasEngineDemoApp'
import { DEMO_CANVAS_APP_ASSEMBLY_INPUT } from './CanvasDemoAssembly'
import { FigmaCloneApp } from '../../packages/figma-clone/src'

export function CanvasRoot() {
  const route = typeof window === 'undefined'
    ? 'launcher'
    : resolveCanvasRootRoute({
      pathname: window.location.pathname,
      search: window.location.search,
    })

  if (route === 'figma') {
    return <FigmaCloneApp />
  }

  if (route === 'engine' || route === 'figjam') {
    return (
      <CanvasEngineDemoApp
        assemblyInput={DEMO_CANVAS_APP_ASSEMBLY_INPUT}
        variant={route}
      />
    )
  }

  return <CanvasAppLauncher />
}
