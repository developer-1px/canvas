import {
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import {
  FIGMA_CLONE_DOM_NODE_BY_ID,
  FigmaCloneDomEditSurface,
  createFigmaCloneDomEditState,
  createFigmaCloneDomTextState,
  type FigmaCloneDomEditState,
  type FigmaCloneDomNodeId,
  type FigmaCloneDomTextState,
  type FigmaCloneSectionFrameMode,
  type FigmaCloneSectionOverflow,
  type FigmaCloneSectionViewport,
} from '@interactive-os/figma-clone/dom-editor'
import '@interactive-os/figma-clone/style.css'
import type {
  CstarStoryParameters,
  StoryComponent,
  StoryObj,
} from '../componentStoryTypes'
import './figmaCloneDomStories.css'

type FigmaCloneHomepageStoryArgs = {
  frameMode: FigmaCloneSectionFrameMode
  h: number
  overflow: FigmaCloneSectionOverflow
  selectedNodeId: FigmaCloneDomNodeId | null
  w: number
}

function FigmaCloneHomepageStory({
  frameMode = 'page',
  h = 900,
  overflow = 'scroll',
  selectedNodeId: initialSelectedNodeId = null,
  w = 1280,
}: Partial<FigmaCloneHomepageStoryArgs>) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [state] = useState<FigmaCloneDomEditState>(() => createFigmaCloneDomEditState())
  const [textState, setTextState] = useState<FigmaCloneDomTextState>(() => createFigmaCloneDomTextState())
  const [selectedNodeId, setSelectedNodeId] = useState<FigmaCloneDomNodeId | null>(initialSelectedNodeId)
  const sectionViewport: FigmaCloneSectionViewport = {
    frameMode,
    h,
    overflow,
    w,
  }

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    for (const element of root.querySelectorAll<HTMLElement>('[data-dom-edit-node]')) {
      const nodeId = element.getAttribute('data-dom-edit-node') as FigmaCloneDomNodeId | null
      if (!nodeId) continue
      element.setAttribute('data-cstar-component', FIGMA_CLONE_DOM_NODE_BY_ID[nodeId]?.label ?? nodeId)
      element.setAttribute('data-cstar-layer', 'dom-edit')
      element.setAttribute('data-cstar-source', `packages/figma-clone/src/dom-edit/FigmaCloneDomEditSurface.tsx#${nodeId}`)
    }
  })

  useLayoutEffect(() => {
    if (!selectedNodeId) return
    const root = rootRef.current
    const target = root?.querySelector<HTMLElement>(`[data-dom-edit-node="${selectedNodeId}"]`)
    target?.scrollIntoView({ block: 'center', inline: 'center' })
  }, [selectedNodeId])

  const handleChangeText = (nodeId: FigmaCloneDomNodeId, value: string) => {
    setTextState((current) => ({
      ...current,
      [nodeId]: value,
    }))
  }

  return (
    <div
      className={frameMode === 'page' ? 'story-figma-dom-home story-figma-dom-home--page' : 'story-figma-dom-home story-figma-dom-home--focus'}
      ref={rootRef}
    >
      <div className="story-figma-dom-home__frame">
        <FigmaCloneDomEditSurface
          interactionMode="preview"
          isSectionSelected={selectedNodeId === 'homePage'}
          rootId="homePage"
          sectionViewport={sectionViewport}
          selectedNodeId={selectedNodeId}
          state={state}
          textState={textState}
          onChangeText={handleChangeText}
          onSelectNode={setSelectedNodeId}
          onSelectSection={() => setSelectedNodeId('homePage')}
        />
      </div>
    </div>
  )
}

const meta = {
  component: FigmaCloneHomepageStory as StoryComponent,
  parameters: {
    cstar: {
      area: 'dom-edit',
      category: 'homepage',
      layer: 'section',
      path: 'pages/editorial-home/PageEditorialHome.tsx',
      previewFrame: 'section',
      role: 'Reusable DOM edit homepage surface',
    },
  },
  title: 'DOM Edit/Editorial Homepage',
} satisfies {
  component: StoryComponent
  parameters: CstarStoryParameters
  title: string
}

const FullPage = {
  args: {
    frameMode: 'mock',
    h: 900,
    selectedNodeId: 'homePage',
    w: 1120,
  },
  name: 'Full page',
} satisfies StoryObj<typeof FigmaCloneHomepageStory>

const Hero = {
  args: {
    frameMode: 'mock',
    h: 760,
    selectedNodeId: 'homeHero',
    w: 1120,
  },
  name: 'Hero section',
  parameters: {
    cstar: {
      path: 'widgets/editorial-home/HomeHero.tsx',
      role: 'Homepage hero section',
    },
  },
} satisfies StoryObj<typeof FigmaCloneHomepageStory>

const ArticleMetaCards = {
  args: {
    frameMode: 'mock',
    h: 620,
    selectedNodeId: 'homeMeta',
    w: 1120,
  },
  name: 'Article meta cards',
  parameters: {
    cstar: {
      layer: 'item',
      path: 'shared/article-meta-card/ArticleMetaCard.tsx',
      previewFrame: 'default',
      role: 'Synced article metadata card group',
    },
  },
} satisfies StoryObj<typeof FigmaCloneHomepageStory>

const ArticleChapters = {
  args: {
    frameMode: 'mock',
    h: 720,
    selectedNodeId: 'homeChapterList',
    w: 1120,
  },
  name: 'Article chapters',
  parameters: {
    cstar: {
      path: 'features/editorial-home/ArticleChapters.tsx',
      role: 'Homepage article chapter list',
    },
  },
} satisfies StoryObj<typeof FigmaCloneHomepageStory>

const EditorsNote = {
  args: {
    frameMode: 'mock',
    h: 720,
    selectedNodeId: 'homeQuote',
    w: 1120,
  },
  name: "Editor's note",
  parameters: {
    cstar: {
      path: 'features/editorial-home/EditorsNote.tsx',
      role: 'Homepage quote section',
    },
  },
} satisfies StoryObj<typeof FigmaCloneHomepageStory>

const Newsletter = {
  args: {
    frameMode: 'mock',
    h: 680,
    selectedNodeId: 'homeNewsletter',
    w: 1120,
  },
  name: 'Newsletter CTA',
  parameters: {
    cstar: {
      path: 'widgets/editorial-home/HomeNewsletter.tsx',
      role: 'Homepage newsletter call to action',
    },
  },
} satisfies StoryObj<typeof FigmaCloneHomepageStory>

export const FIGMA_CLONE_DOM_STORY_MODULES = {
  '/src/devtools/storyCanvas/figmaCloneDomStories.tsx': {
    ArticleChapters,
    ArticleMetaCards,
    EditorsNote,
    FullPage,
    Hero,
    Newsletter,
    default: meta,
  },
}
