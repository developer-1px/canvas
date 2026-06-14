import { CanvasDevToolsDemoApp } from './demo/CanvasDevToolsDemoApp'
import { DEMO_CANVAS_APP_ASSEMBLY_INPUT } from './demo/CanvasDemoAssembly'
import { FigmaCloneApp } from '../packages/figma-clone/src'

export function CanvasRoot() {
  const demo = new URLSearchParams(window.location.search).get('demo')

  if (demo === 'engine') {
    return (
      <CanvasDevToolsDemoApp assemblyInput={DEMO_CANVAS_APP_ASSEMBLY_INPUT} />
    )
  }

  return (
    <FigmaCloneApp />
  )
}
