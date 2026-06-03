import type { TextItem } from '../../entities'
import { CanvasContentEditableText } from '../affordances/editing/text-editor/CanvasContentEditableText'
import { useCanvasInlineTextEditing } from '../affordances/editing/text-editor/CanvasInlineTextEditingContext'
import { getCanvasDemoSvgTextStyle } from './CanvasDemoSvgTextStyle'

export function CanvasDemoSvgTextItem({
  item,
}: {
  item: TextItem
}) {
  const editor = useCanvasInlineTextEditing()

  return (
    <foreignObject
      opacity={item.opacity}
      x={item.x}
      y={item.y}
      width={item.w}
      height={item.h}
    >
      <CanvasContentEditableText
        className="canvas-text"
        editor={editor}
        id={item.id}
        style={getCanvasDemoSvgTextStyle(item)}
        value={item.text}
      />
    </foreignObject>
  )
}
