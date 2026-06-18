import {
  Component,
  createElement,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createMemoryHistory, createRootRoute, createRouter, RouterContextProvider } from '@tanstack/react-router';
import type { CstarStoryParameters, StoryComponent, StoryObj } from '../componentStoryTypes';
import {
  getV2RouteScopeClass,
  ShellVersionSwitchLayoutProvider,
  useShellVersionSwitchLayoutStyle,
} from '../support/ShellVersionSwitch';
import { BrowserWindowProvider } from '../support/BrowserWindowContext';
import { appBasePath } from '../support/appBasePath';
import { PageMetaEnabledContext } from '../support/pageMeta';
import {
  createStoryCanvasElementWithClass,
  queryStoryCanvasElements,
} from './storyCanvasDomBoundary';
import '../support/storyFrameStyles.css';

export type StoryFrameConfig = {
  frameId: string;
  modulePath: string;
  routePath: string;
  storyExport: string;
  storyPath: string;
  viewportHeight: number;
  viewportWidth: number;
};

type StoryModule = {
  default: {
    component: StoryComponent;
    parameters: CstarStoryParameters;
    title: string;
  };
  [key: string]: unknown;
};

type V2RouteScopeStyle = CSSProperties & {
  '--connector-grid-columns'?: string;
  '--list-page-content-max-width'?: string;
  '--list-page-grid-columns'?: string;
  '--mp-grid-columns'?: string;
  '--shell-main-body-max-width'?: string;
  '--skills-b-detail-max-width'?: string;
  '--version-switch-offset-right'?: string;
};
type StoryFrameLayout = 'original' | 'mid' | 'new';

type FrameStyleSync = {
  cleanup: () => void;
  sync: () => void;
};

const storyRootRoute = createRootRoute();
const pageStoryModuleLoaders = import.meta.glob('/src/pages/**/Page*.stories.tsx') as Record<string, () => Promise<StoryModule>>;

export async function mountStoryPageFrame(
  frameDocument: Document,
  config: StoryFrameConfig,
  {
    onError,
    parentDocument = document,
  }: {
    onError?: (error: unknown) => void;
    parentDocument?: Document;
  } = {},
) {
  prepareFrameDocument(frameDocument, config);
  const styleSync = installFrameStyleSync(parentDocument, frameDocument);

  try {
    const storyModule = await loadStoryModule(config.modulePath);
    const meta = storyModule.default;
    const story = storyModule[config.storyExport];
    if (!meta?.component) throw new Error(`Story component not found: ${config.modulePath}`);
    if (!isStoryObject(story)) throw new Error(`Story export not found: ${config.storyExport}`);

    styleSync.sync();
    const cleanupRoot = await renderStoryRoot(frameDocument, config, meta.component, story, onError);
    return () => {
      cleanupRoot();
      styleSync.cleanup();
    };
  } catch (error) {
    renderError(frameDocument, error);
    onError?.(error);
    return () => styleSync.cleanup();
  }
}

export function isStoryFrameConfig(value: unknown): value is StoryFrameConfig {
  if (typeof value !== 'object' || value === null) return false;
  const config = value as Partial<StoryFrameConfig>;
  return (
    typeof config.frameId === 'string'
    && typeof config.modulePath === 'string'
    && typeof config.routePath === 'string'
    && typeof config.storyExport === 'string'
    && typeof config.storyPath === 'string'
    && typeof config.viewportHeight === 'number'
    && typeof config.viewportWidth === 'number'
  );
}

async function loadStoryModule(modulePath: string) {
  if (!/^\/src\/pages\/.*\/?Page[^/]*\.stories\.tsx$/.test(modulePath)) {
    throw new Error(`Story module not found: ${modulePath}`);
  }
  const loadStoryModule = pageStoryModuleLoaders[modulePath];
  if (!loadStoryModule) throw new Error(`Story module not found: ${modulePath}`);
  return loadStoryModule();
}

function prepareFrameDocument(frameDocument: Document, config: StoryFrameConfig) {
  frameDocument.documentElement.lang = 'ko';
  frameDocument.head.replaceChildren(
    metaElement(frameDocument, { charset: 'UTF-8' }),
    metaElement(frameDocument, { content: 'width=device-width, initial-scale=1.0', name: 'viewport' }),
    titleElement(frameDocument, `${config.storyPath} · Cstar Story Frame`),
  );
  frameDocument.body.replaceChildren(rootElement(frameDocument));
  frameDocument.body.setAttribute('data-v2', '');
  applyViewportSize(frameDocument, config.viewportWidth, config.viewportHeight);
}

function metaElement(frameDocument: Document, attributes: Record<string, string>) {
  const element = frameDocument.createElement('meta');
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  return element;
}

function titleElement(frameDocument: Document, title: string) {
  const element = frameDocument.createElement('title');
  element.textContent = title;
  return element;
}

function rootElement(frameDocument: Document) {
  const root = frameDocument.createElement('div');
  root.id = 'root';
  return root;
}

function renderStoryRoot(
  frameDocument: Document,
  config: StoryFrameConfig,
  StoryComponent: StoryComponent,
  story: StoryObj<StoryComponent>,
  onError?: (error: unknown) => void,
) {
  let root: Root | null = null;
  const frameRouter = createRouter({
    basepath: appBasePath() || '/',
    history: createMemoryHistory({ initialEntries: [config.routePath || '/'] }),
    routeTree: storyRootRoute,
  });
  const handleError = (error: unknown) => {
    onError?.(error);
  };

  root = createRoot(requiredRootElement(frameDocument));
  root.render(
    createElement(
      StoryFrameErrorBoundary,
      {
        children: createElement(
          RouterContextProvider,
          {
            children: createElement(
              BrowserWindowProvider,
              {
                children: createElement(
                  ShellVersionSwitchLayoutProvider,
                  {
                    children: createElement(
                      PageMetaEnabledContext.Provider,
                      {
                        children: createElement(
                          StoryRouteScope,
                          {
                            children: createElement(StoryComponent, story.args ?? {}),
                            routePath: config.routePath,
                          },
                        ),
                        value: false,
                      },
                    ),
                    initialLayout: storyFrameLayout(config.viewportWidth),
                    initialWidthOpen: true,
                  },
                ),
                value: frameDocument.defaultView,
              },
            ),
            router: frameRouter,
          },
        ),
        onError: handleError,
      },
    ),
  );

  return afterFramePaint(frameDocument).then(() => () => root?.unmount());
}

function storyFrameLayout(width: number): StoryFrameLayout {
  if (width >= 1200) return 'original';
  if (width >= 1100) return 'mid';
  return 'new';
}

function StoryRouteScope({ children, routePath }: { children: ReactNode; routePath: string }) {
  const shellVersionStyle = useShellVersionSwitchLayoutStyle() as V2RouteScopeStyle | undefined;
  const scopeClass = getV2RouteScopeClass(routePath);
  if (!scopeClass) return children;
  return createElement('div', { className: scopeClass, style: shellVersionStyle }, children);
}

function requiredRootElement(frameDocument: Document) {
  const root = frameDocument.getElementById('root');
  if (!root) throw new Error('Story frame root is missing');
  return root;
}

function applyViewportSize(frameDocument: Document, width: number, height: number) {
  const root = requiredRootElement(frameDocument);
  if (width > 0) {
    frameDocument.documentElement.style.width = `${width}px`;
    frameDocument.body.style.width = `${width}px`;
    root.style.width = `${width}px`;
  }
  if (height > 0) {
    frameDocument.documentElement.style.minHeight = `${height}px`;
    frameDocument.body.style.minHeight = `${height}px`;
    root.style.minHeight = `${height}px`;
  }
}

function installFrameStyleSync(parentDocument: Document, frameDocument: Document): FrameStyleSync {
  if (parentDocument === frameDocument) {
    return { cleanup: () => {}, sync: () => {} };
  }

  const styleMarker = 'data-story-frame-style';
  const frameWindow = frameDocument.defaultView;
  const requestFrame = frameWindow?.requestAnimationFrame.bind(frameWindow) ?? window.requestAnimationFrame.bind(window);
  const cancelFrame = frameWindow?.cancelAnimationFrame.bind(frameWindow) ?? window.cancelAnimationFrame.bind(window);
  let frameRequest = 0;

  const removeClonedStyles = () => {
    queryStoryCanvasElements(frameDocument.head, `[${styleMarker}]`).forEach((element) => element.remove());
  };
  const sync = () => {
    removeClonedStyles();
    queryStoryCanvasElements(parentDocument.head, 'link[rel="stylesheet"], style').forEach((element) => {
      const clone = element.cloneNode(true) as HTMLElement;
      clone.setAttribute(styleMarker, '');
      if (element.tagName.toLowerCase() === 'link' && clone instanceof HTMLLinkElement && element instanceof HTMLLinkElement) {
        clone.href = element.href;
      }
      frameDocument.head.append(clone);
    });
  };
  const scheduleSync = () => {
    if (frameRequest) cancelFrame(frameRequest);
    frameRequest = requestFrame(() => {
      frameRequest = 0;
      sync();
    });
  };
  const observer = new MutationObserver(scheduleSync);

  observer.observe(parentDocument.head, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  });
  sync();

  return {
    cleanup: () => {
      observer.disconnect();
      if (frameRequest) cancelFrame(frameRequest);
      removeClonedStyles();
    },
    sync,
  };
}

function afterFramePaint(frameDocument: Document) {
  const frameWindow = frameDocument.defaultView;
  return new Promise<void>((resolve) => {
    const requestFrame = frameWindow?.requestAnimationFrame.bind(frameWindow) ?? window.requestAnimationFrame.bind(window);
    requestFrame(() => resolve());
  });
}

function renderError(frameDocument: Document, error: unknown) {
  const root = requiredRootElement(frameDocument);
  root.replaceChildren(renderErrorElement(frameDocument, errorMessage(error)));
}

class StoryFrameErrorBoundary extends Component<{
  children?: ReactNode;
  onError: (error: unknown) => void;
}, { error: string | null }> {
  state = { error: null };

  static getDerivedStateFromError(error: unknown) {
    return { error: errorMessage(error) };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  render() {
    if (this.state.error) {
      return createElement(FrameRenderFailure, { error: this.state.error });
    }

    return this.props.children;
  }
}

function FrameRenderFailure({ error }: { error: string }) {
  return createElement(
    'div',
    { className: 'story-canvas-render-failure', role: 'alert' },
    createElement('strong', null, 'Render error'),
    createElement('span', null, error),
  );
}

function isStoryObject(value: unknown): value is StoryObj<StoryComponent> {
  return typeof value === 'object' && value !== null;
}

function renderErrorElement(frameDocument: Document, error: string) {
  const message = createStoryCanvasElementWithClass(frameDocument, 'div', 'story-canvas-render-failure');
  message.setAttribute('role', 'alert');
  const title = frameDocument.createElement('strong');
  title.textContent = 'Render error';
  const body = frameDocument.createElement('span');
  body.textContent = error;
  message.append(title, body);
  return message;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
