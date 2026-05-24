import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CanvasApp } from './canvas'
import {
  DEMO_CANVAS_APP_ASSEMBLY_INPUT,
  DEMO_CANVAS_PRESENCE,
} from './demo/CanvasDemoAssembly'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CanvasApp
      assemblyInput={DEMO_CANVAS_APP_ASSEMBLY_INPUT}
      presence={DEMO_CANVAS_PRESENCE}
    />
  </StrictMode>,
)
