import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { observeBrowserIntersection } from '../support/browserIntersectionObserver';
import {
  createCanvasViewportHitSnapshot,
  rememberCanvasViewportHitSnapshot,
} from './CanvasViewportBridge';

export type CanvasViewportFrameRenderer = (context: {
  frameDocument: Document;
  iframe: HTMLIFrameElement;
  reportError: (error: unknown) => void;
}) => void | (() => void) | Promise<void | (() => void)>;

type CanvasViewportMessage = {
  error?: string;
  frameId?: string;
  type?: string;
};

const DEFAULT_LAZY_MOUNT_MARGIN = '900px';
const FRAME_MOUSE_EVENTS = [
  'click',
  'mousemove',
  'mousedown',
  'mouseup',
  'pointerdown',
  'pointermove',
  'pointerup',
  'pointercancel',
  'wheel',
] as const;
const BLOCKED_FRAME_EVENTS = new Set(['click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup']);

export default function CanvasViewport({
  autoHeight = false,
  errorAttribute = 'data-canvas-viewport-error',
  frameId,
  lazyMountMargin = DEFAULT_LAZY_MOUNT_MARGIN,
  readyAttribute = 'data-canvas-viewport-ready',
  renderFrame,
  src,
  srcDoc,
  style,
  title,
}: {
  autoHeight?: boolean;
  errorAttribute?: string;
  frameId: string;
  lazyMountMargin?: string;
  readyAttribute?: string;
  renderFrame?: CanvasViewportFrameRenderer;
  src?: string;
  srcDoc?: string;
  style?: CSSProperties;
  title: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [frameHeight, setFrameHeight] = useState(0);

  useEffect(() => {
    if (mounted) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;

    return observeBrowserIntersection(root, (entries, observer) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setMounted(true);
        observer.disconnect();
      }
    }, { rootMargin: lazyMountMargin }, () => setMounted(true));
  }, [lazyMountMargin, mounted]);

  useEffect(() => {
    if (!mounted) return undefined;

    function handleMessage(event: MessageEvent<CanvasViewportMessage>) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.origin !== window.location.origin && event.origin !== 'null') return;
      if (event.data?.frameId !== frameId) return;
      if (event.data.type === 'canvas-viewport-ready') {
        setReady(true);
        setError('');
      }
      if (event.data.type === 'canvas-viewport-error') {
        setReady(true);
        setError(event.data.error ?? 'Frame render failed');
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [frameId, mounted]);

  useEffect(() => {
    if (!mounted) return undefined;
    const iframe = iframeRef.current;
    if (!iframe) return undefined;

    let cleanupFrameEvents: (() => void) | undefined;
    let cleanupFrameHeight: (() => void) | undefined;
    let cleanupFrameRender: (() => void) | undefined;
    let active = true;
    const reportFrameError = (error: unknown) => {
      if (!active) return;
      setReady(true);
      setError(errorMessage(error));
    };
    const bindFrameEvents = () => {
      cleanupFrameEvents?.();
      cleanupFrameHeight?.();
      cleanupFrameRender?.();
      cleanupFrameEvents = undefined;
      cleanupFrameHeight = undefined;
      cleanupFrameRender = undefined;
      const frameDocument = iframe.contentDocument;
      if (!frameDocument) return;
      cleanupFrameEvents = installFrameEventBridge(frameId, iframe, frameDocument);
      if (!renderFrame) {
        if (!import.meta.env.DEV) setReady(true);
        return;
      }
      setReady(false);
      setError('');
      Promise.resolve(renderFrame({ frameDocument, iframe, reportError: reportFrameError }))
        .then((cleanup) => {
          if (!active) {
            if (typeof cleanup === 'function') cleanup();
            return;
          }
          cleanupFrameRender = typeof cleanup === 'function' ? cleanup : undefined;
          cleanupFrameHeight = autoHeight ? installFrameHeightSync(iframe, frameDocument, setFrameHeight) : undefined;
          setReady(true);
        })
        .catch(reportFrameError);
    };

    iframe.addEventListener('load', bindFrameEvents);
    bindFrameEvents();

    return () => {
      active = false;
      iframe.removeEventListener('load', bindFrameEvents);
      cleanupFrameHeight?.();
      cleanupFrameRender?.();
      cleanupFrameEvents?.();
    };
  }, [autoHeight, frameId, mounted, renderFrame, src, srcDoc]);

  const viewportStyle = autoHeight && frameHeight > 0
    ? { ...style, '--story-page-viewport-height': `${frameHeight}px` } as CSSProperties
    : style;

  return (
    <div
      className="story-page-viewport"
      data-canvas-viewport=""
      ref={rootRef}
      style={viewportStyle}
      {...(error ? { [errorAttribute]: error } : {})}
    >
      {mounted ? (
        <iframe
          className="story-page-iframe"
          data-canvas-viewport-frame-id={frameId}
          loading="lazy"
          ref={iframeRef}
          title={title}
          {...(src ? { src } : {})}
          {...(srcDoc ? { srcDoc } : {})}
          {...(ready ? { [readyAttribute]: 'true' } : {})}
        />
      ) : (
        <div className="story-page-iframe-placeholder" aria-hidden="true" />
      )}
    </div>
  );
}

function installFrameHeightSync(
  _iframe: HTMLIFrameElement,
  frameDocument: Document,
  setFrameHeight: (height: number) => void,
) {
  const frameWindow = frameDocument.defaultView;
  const requestFrame = frameWindow?.requestAnimationFrame.bind(frameWindow) ?? window.requestAnimationFrame.bind(window);
  const cancelFrame = frameWindow?.cancelAnimationFrame.bind(frameWindow) ?? window.cancelAnimationFrame.bind(window);
  const ResizeObserverCtor = frameWindow?.ResizeObserver ?? window.ResizeObserver;
  const root = frameDocument.getElementById('root');
  let raf = 0;

  const measure = () => {
    raf = 0;
    const body = frameDocument.body;
    const height = Math.ceil(Math.max(
      body?.scrollHeight ?? 0,
      body?.getBoundingClientRect().height ?? 0,
      root?.scrollHeight ?? 0,
      root?.getBoundingClientRect().height ?? 0,
      1,
    ));
    setFrameHeight(height);
  };

  const schedule = () => {
    if (raf) return;
    raf = requestFrame(measure);
  };

  const observer = ResizeObserverCtor ? new ResizeObserverCtor(schedule) : null;
  observer?.observe(frameDocument.documentElement);
  if (frameDocument.body) observer?.observe(frameDocument.body);
  if (root) observer?.observe(root);
  frameWindow?.addEventListener('resize', schedule);
  schedule();

  return () => {
    if (raf) cancelFrame(raf);
    observer?.disconnect();
    frameWindow?.removeEventListener('resize', schedule);
  };
}

function installFrameEventBridge(frameId: string, iframe: HTMLIFrameElement, frameDocument: Document) {
  const listeners: Array<() => void> = [];

  for (const type of FRAME_MOUSE_EVENTS) {
    const listener = (event: Event) => {
      if (!isFrameMouseEvent(event, frameDocument)) return;
      if (BLOCKED_FRAME_EVENTS.has(event.type)) {
        event.preventDefault();
        event.stopPropagation();
      }
      const parentEvent = toParentMouseEvent(iframe, event);
      rememberCanvasViewportHitSnapshot(parentEvent, createCanvasViewportHitSnapshot(frameId, iframe, event));
      iframe.dispatchEvent(parentEvent);
    };
    frameDocument.addEventListener(type, listener, true);
    listeners.push(() => frameDocument.removeEventListener(type, listener, true));
  }

  const scrollListener = () => {
    iframe.dispatchEvent(new Event('scroll', { bubbles: true }));
  };
  frameDocument.addEventListener('scroll', scrollListener, true);
  listeners.push(() => frameDocument.removeEventListener('scroll', scrollListener, true));

  return () => {
    listeners.forEach((cleanup) => cleanup());
  };
}

function isFrameMouseEvent(event: Event, frameDocument: Document): event is MouseEvent {
  const frameWindow = frameDocument.defaultView;
  return Boolean(frameWindow && event instanceof frameWindow.MouseEvent);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function toParentMouseEvent(iframe: HTMLIFrameElement, event: MouseEvent) {
  const parentWindow = iframe.ownerDocument.defaultView ?? window;
  const iframeRect = iframe.getBoundingClientRect();
  const scaleX = iframe.offsetWidth > 0 ? iframeRect.width / iframe.offsetWidth : 1;
  const scaleY = iframe.offsetHeight > 0 ? iframeRect.height / iframe.offsetHeight : scaleX;
  const clientX = iframeRect.left + event.clientX * (scaleX || 1);
  const clientY = iframeRect.top + event.clientY * (scaleY || 1);
  const common = {
    bubbles: true,
    button: event.button,
    buttons: event.buttons,
    cancelable: true,
    clientX,
    clientY,
    composed: true,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
    screenX: event.screenX,
    screenY: event.screenY,
  };

  if (event.type === 'wheel' && 'deltaY' in event) {
    return new parentWindow.WheelEvent('wheel', {
      ...common,
      deltaMode: (event as WheelEvent).deltaMode,
      deltaX: (event as WheelEvent).deltaX,
      deltaY: (event as WheelEvent).deltaY,
      deltaZ: (event as WheelEvent).deltaZ,
    });
  }

  if (event.type.startsWith('pointer') && parentWindow.PointerEvent) {
    const pointerEvent = event as PointerEvent;
    return new parentWindow.PointerEvent(event.type, {
      ...common,
      pointerId: pointerEvent.pointerId,
      pointerType: pointerEvent.pointerType,
      pressure: pointerEvent.pressure,
    });
  }

  return new parentWindow.MouseEvent(event.type, common);
}
