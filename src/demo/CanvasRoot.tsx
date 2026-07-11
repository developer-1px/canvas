import { CanvasAppLauncher } from './CanvasAppLauncher'
import { resolveCanvasRootRoute } from './CanvasRootRoutes'
import { CanvasEngineDemoApp } from './CanvasEngineDemoApp'
import { DEMO_CANVAS_APP_ASSEMBLY_INPUT } from './CanvasDemoAssembly'
import { FigmaCloneApp } from '../../packages/figma-clone/src'
import { FigJamCloneApp } from '../../packages/figjam-clone/src'

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

  if (route === 'figjam') {
    return <FigJamCloneApp />
  }

  if (route === 'engine') {
    return (
      <CanvasEngineDemoApp
        assemblyInput={DEMO_CANVAS_APP_ASSEMBLY_INPUT}
      />
    )
  }

  return <CanvasAppLauncher />
}
