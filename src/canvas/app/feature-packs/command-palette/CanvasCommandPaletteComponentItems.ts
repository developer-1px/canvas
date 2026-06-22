import type {
  CanvasCommandPaletteItem,
  CanvasCommandPaletteItemsInput,
} from './CanvasCommandPaletteItemContracts'

export function getCanvasCommandPaletteComponentItems({
  components,
  onInsertComponent,
}: Pick<
  CanvasCommandPaletteItemsInput,
  'components' | 'onInsertComponent'
>): CanvasCommandPaletteItem[] {
  return components.map((component) => ({
    id: `component:${component.id}`,
    section: 'Create',
    title: `Add ${component.title}`,
    onSelect: () => onInsertComponent(component.id),
  }))
}
