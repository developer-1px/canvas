import '@interactive-os/canvas/style.css'
import { CanvasApp, type CanvasAppProps } from '@interactive-os/canvas'

const basicCanvasProps = {
  assemblyInput: {
    initialItems: [],
  },
} satisfies CanvasAppProps

export function BasicCanvas() {
  return <CanvasApp {...basicCanvasProps} />
}
