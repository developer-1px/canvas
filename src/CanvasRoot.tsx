import { CanvasDevToolsDemoApp } from './demo/CanvasDevToolsDemoApp'
import { DEMO_CANVAS_APP_ASSEMBLY_INPUT } from './demo/CanvasDemoAssembly'

export function CanvasRoot() {
  return (
    <CanvasDevToolsDemoApp assemblyInput={DEMO_CANVAS_APP_ASSEMBLY_INPUT} />
  )
}
