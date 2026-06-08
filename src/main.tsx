import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CanvasRoot } from './CanvasRoot'
import './index.css'

const themeMode = new URLSearchParams(window.location.search).get('theme')

if (themeMode === 'dark' || themeMode === 'light') {
  document.documentElement.dataset.theme = themeMode
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CanvasRoot />
  </StrictMode>,
)
