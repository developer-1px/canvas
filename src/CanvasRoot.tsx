import { CanvasEngineDemoApp } from './demo/CanvasEngineDemoApp'
import { DEMO_CANVAS_APP_ASSEMBLY_INPUT } from './demo/CanvasDemoAssembly'
import { FigmaCloneApp } from '../packages/figma-clone/src'

export function CanvasRoot() {
  const demo = new URLSearchParams(window.location.search).get('demo')

  if (demo === 'figma') {
    return <FigmaCloneApp />
  }

  return (
    <CanvasEngineDemoApp assemblyInput={DEMO_CANVAS_APP_ASSEMBLY_INPUT} />
  )
}
