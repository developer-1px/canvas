import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CanvasApp from './canvas/app/shell/CanvasApp'
import { DEMO_CANVAS_APP_ASSEMBLY } from './demo/CanvasDemoAssembly'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CanvasApp assembly={DEMO_CANVAS_APP_ASSEMBLY} />
  </StrictMode>,
)
