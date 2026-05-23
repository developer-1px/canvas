import { CanvasAppView } from './CanvasAppView'
import { useCanvasAppModel } from '../workflow'
import './CanvasApp.css'

function CanvasApp() {
  const app = useCanvasAppModel()

  return <CanvasAppView {...app} />
}

export default CanvasApp
