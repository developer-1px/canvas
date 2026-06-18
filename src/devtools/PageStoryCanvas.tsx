import StoryCanvasPage, {
  type StoryCanvasPreset,
} from './storyCanvas/StoryCanvasPage'

export function PageStoryCanvas({
  preset = 'default',
}: {
  preset?: StoryCanvasPreset
}) {
  return (
    <StoryCanvasPage preset={preset} />
  )
}
