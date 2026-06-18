import type {
  CstarStoryParameters,
  StoryComponent,
  StoryObj,
} from '../componentStoryTypes'

function StoryCanvasSeedSurface({
  detail,
  kicker,
  title,
}: {
  detail: string
  kicker: string
  title: string
}) {
  return (
    <section className="story-canvas-seed">
      <span className="story-canvas-seed__kicker">{kicker}</span>
      <strong className="story-canvas-seed__title">{title}</strong>
      <p className="story-canvas-seed__detail">{detail}</p>
    </section>
  )
}

const meta = {
  component: StoryCanvasSeedSurface as StoryComponent,
  parameters: {
    cstar: {
      area: 'canvas',
      category: 'engine',
      layer: 'section',
      path: 'features/story-canvas/StoryCanvasSeedSurface.tsx',
      previewFrame: 'section',
      role: 'Canvas route story seed',
    },
  },
  title: 'Canvas/Story Canvas Seed',
} satisfies {
  component: StoryComponent
  parameters: CstarStoryParameters
  title: string
}

const EngineRoute = {
  args: {
    detail: 'CanvasApp route, feature pack assembly, read-only preview surface.',
    kicker: '/engine',
    title: 'Canvas Engine Demo',
  },
  parameters: {
    cstar: {
      path: 'features/canvas-engine/CanvasEngineDemo.tsx',
      role: 'Canvas engine feature route',
    },
  },
} satisfies StoryObj<typeof StoryCanvasSeedSurface>

const FigmaRoute = {
  args: {
    detail: 'DOM edit surface can be imported as a story-like canvas frame.',
    kicker: '/figma',
    title: 'Figma-like DOM Edit',
  },
  parameters: {
    cstar: {
      path: 'widgets/dom-edit/FigmaCloneWidget.tsx',
      role: 'DOM edit widget route',
    },
  },
} satisfies StoryObj<typeof StoryCanvasSeedSurface>

const StoryCanvasRoute = {
  args: {
    detail: 'Story records are laid out as installable canvas widgets.',
    kicker: '/story-canvas',
    title: 'Story Canvas',
  },
  parameters: {
    cstar: {
      path: 'features/story-canvas/StoryCanvasRoute.tsx',
      role: 'Story canvas feature route',
    },
  },
} satisfies StoryObj<typeof StoryCanvasSeedSurface>

const SharedPart = {
  args: {
    detail: 'Reusable visual primitive shown as a portable story canvas part.',
    kicker: 'shared/ui',
    title: 'Shared Canvas Part',
  },
  parameters: {
    cstar: {
      category: 'library',
      layer: 'primitive',
      path: 'shared/ui/story-canvas/StoryCanvasPart.tsx',
      previewFrame: 'default',
      role: 'Shared primitive',
    },
  },
} satisfies StoryObj<typeof StoryCanvasSeedSurface>

const EntityPart = {
  args: {
    detail: 'Domain-shaped component record that can be reused across apps.',
    kicker: 'entities/story',
    title: 'Story Entity Part',
  },
  parameters: {
    cstar: {
      category: 'entity',
      layer: 'item',
      path: 'entities/story/StoryEntityPart.tsx',
      previewFrame: 'default',
      role: 'Entity component',
    },
  },
} satisfies StoryObj<typeof StoryCanvasSeedSurface>

export const STORY_CANVAS_SEED_STORY_MODULES = {
  '/src/devtools/storyCanvas/storyCanvasSeedStories.tsx': {
    default: meta,
    EntityPart,
    EngineRoute,
    FigmaRoute,
    SharedPart,
    StoryCanvasRoute,
  },
}
