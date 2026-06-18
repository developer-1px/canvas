import {
  isStoryFrameConfig,
  mountStoryPageFrame,
  type StoryFrameConfig,
} from './storyFrameRenderer';

type RuntimeStoryFrameConfig = StoryFrameConfig & {
  parentOrigin: string;
};

declare global {
  interface Window {
    __CSTAR_STORY_FRAME__?: RuntimeStoryFrameConfig;
  }
}

void renderStoryFrame();

async function renderStoryFrame() {
  const config = readStoryFrameConfig();
  let failed = false;

  await mountStoryPageFrame(document, config, {
    onError: (error) => {
      failed = true;
      postFrameMessage(
        {
          error: error instanceof Error ? error.message : String(error),
          frameId: config.frameId,
          type: 'canvas-viewport-error',
        },
        config.parentOrigin,
      );
    },
  });

  if (!failed) {
    postFrameMessage(
      {
        frameId: config.frameId,
        type: 'canvas-viewport-ready',
      },
      config.parentOrigin,
    );
  }
}

function readStoryFrameConfig(): RuntimeStoryFrameConfig {
  const injectedConfig = window.__CSTAR_STORY_FRAME__;
  if (isRuntimeStoryFrameConfig(injectedConfig)) return injectedConfig;

  const params = new URLSearchParams(window.location.search);
  return {
    frameId: params.get('frameId') ?? '',
    modulePath: params.get('modulePath') ?? '',
    parentOrigin: params.get('parentOrigin') ?? window.location.origin,
    routePath: params.get('routePath') ?? '',
    storyExport: params.get('storyExport') ?? '',
    storyPath: params.get('storyPath') ?? '',
    viewportHeight: Number(params.get('viewportHeight') ?? 0),
    viewportWidth: Number(params.get('viewportWidth') ?? 0),
  };
}

function isRuntimeStoryFrameConfig(value: unknown): value is RuntimeStoryFrameConfig {
  if (!isStoryFrameConfig(value)) return false;
  return typeof (value as Partial<RuntimeStoryFrameConfig>).parentOrigin === 'string';
}

function postFrameMessage(
  message: { error?: string; frameId: string; type: 'canvas-viewport-error' | 'canvas-viewport-ready' },
  parentOrigin: string,
) {
  if (!window.parent || window.parent === window) return;
  window.parent.postMessage(message, parentOrigin);
}
