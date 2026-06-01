import {
  getOrCreatePreviewSurfaceRoot,
  type PreviewSurfaceNode,
  renderHtmlPreviewSurface,
} from '@interactive-os/preview-surface'
import {
  memo,
  useEffect,
  useRef,
} from 'react'
import type { HtmlSpecimenData } from './HtmlSpecimenCustomItemModel'
import {
  createHtmlSpecimenShadowPreviewCss,
} from './HtmlSpecimenVisualCssEdit'
import {
  clearHtmlSpecimenPreviewTargetSpacingOverlays,
  ensureHtmlSpecimenPreviewOverlayLayer,
  ensureHtmlSpecimenPreviewToolStyle,
  markHtmlSpecimenPreviewHoverElement,
  markHtmlSpecimenPreviewTargetElement,
  updateHtmlSpecimenPreviewBoundsOverlay,
} from './HtmlSpecimenPreviewOverlay'
import {
  createHtmlSpecimenPreviewTarget,
  reconcileHtmlSpecimenPreviewTarget,
  type HtmlSpecimenPreviewTarget,
} from './HtmlSpecimenPreviewTarget'
import {
  HTML_SPECIMEN_PREVIEW_FOCUS_REQUEST_EVENT,
  isHtmlSpecimenPreviewFocusRequestEvent,
} from './HtmlSpecimenPreviewFocusRequest'
import {
  updateHtmlSpecimenPreviewStyle,
} from './HtmlSpecimenShadowPreviewStyle'
import {
  indexHtmlSpecimenPreviewSurfaceStructure,
  refreshHtmlSpecimenPreviewTargetSnapshot,
} from './HtmlSpecimenShadowPreviewStructure'
import {
  patchHtmlSpecimenPreviewTextOnly,
} from './HtmlSpecimenShadowPreviewTextPatch'
import {
  clearHtmlSpecimenPreviewHoverState,
  clearHtmlSpecimenPreviewTargetState,
  createDefaultHtmlSpecimenPreviewTarget,
  getHtmlSpecimenPreviewTargetFromEvent,
  publishHtmlSpecimenPreviewTarget,
  setHtmlSpecimenPreviewHoverState,
  setHtmlSpecimenPreviewTargetState,
} from './HtmlSpecimenShadowPreviewTargetState'

export const HtmlSpecimenShadowPreview = memo(function HtmlSpecimenShadowPreview({
  itemId,
  specimen,
  title,
}: {
  itemId: string
  specimen: HtmlSpecimenData
  title: string
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const hoverNodeIdRef = useRef<string | null>(null)
  const nodesRef = useRef<readonly PreviewSurfaceNode[]>([])
  const renderedHtmlRef = useRef<string | null>(null)
  const targetNodeIdRef = useRef<string | null>(null)

  useEffect(() => {
    const host = hostRef.current

    if (!host) {
      return
    }

    const root = getOrCreatePreviewSurfaceRoot(host)
    const textPatch = renderedHtmlRef.current &&
      renderedHtmlRef.current !== specimen.html
      ? patchHtmlSpecimenPreviewTextOnly({
          nextHtml: specimen.html,
          nodes: nodesRef.current,
          previousHtml: renderedHtmlRef.current,
          root,
        })
      : null
    const htmlChanged =
      renderedHtmlRef.current !== specimen.html && textPatch === null

    if (htmlChanged || nodesRef.current.length === 0) {
      renderHtmlPreviewSurface(root, {
        css: createHtmlSpecimenShadowPreviewCss({
          css: specimen.css,
          mediaContext: {
            viewportHeight: specimen.viewportHeight,
            viewportWidth: specimen.viewportWidth,
          },
        }),
        html: specimen.html,
      })
      renderedHtmlRef.current = specimen.html
    } else {
      if (textPatch) {
        nodesRef.current = textPatch.nodes
        renderedHtmlRef.current = specimen.html
      }
      updateHtmlSpecimenPreviewStyle({
        css: specimen.css,
        mediaContext: {
          viewportHeight: specimen.viewportHeight,
          viewportWidth: specimen.viewportWidth,
        },
        root,
      })
    }

    ensureHtmlSpecimenPreviewToolStyle(root)
    ensureHtmlSpecimenPreviewOverlayLayer(root)

    let nodes: readonly PreviewSurfaceNode[] =
      htmlChanged || nodesRef.current.length === 0
      ? indexHtmlSpecimenPreviewSurfaceStructure(root)
      : [...nodesRef.current]
    nodesRef.current = nodes
    const previousNodeId = targetNodeIdRef.current
    let retainedTarget = reconcileHtmlSpecimenPreviewTarget({
      itemId,
      nodes,
      previousNodeId,
    }) ?? createDefaultHtmlSpecimenPreviewTarget({ itemId, nodes })

    if (!htmlChanged && retainedTarget) {
      const refreshed = refreshHtmlSpecimenPreviewTargetSnapshot({
        nodes,
        root,
        target: retainedTarget,
      })

      nodes = refreshed.nodes
      retainedTarget = refreshed.target
      nodesRef.current = nodes
    }

    host.dataset.previewNodeCount = String(nodes.length)
    clearHtmlSpecimenPreviewHoverState({
      host,
      hoverNodeIdRef,
      root,
    })
    if (retainedTarget) {
      setHtmlSpecimenPreviewTargetState({
        host,
        nodeId: retainedTarget.nodeId,
        targetNodeIdRef,
      })
      markHtmlSpecimenPreviewTargetElement(root, retainedTarget.node.path)
      updateHtmlSpecimenPreviewBoundsOverlay({
        kind: 'target',
        node: retainedTarget.node,
        root,
      })
      clearHtmlSpecimenPreviewTargetSpacingOverlays(root)
      publishHtmlSpecimenPreviewTarget({
        host,
        itemId,
        nodes,
        target: retainedTarget,
      })
    } else {
      clearHtmlSpecimenPreviewTargetState({
        host,
        itemId,
        previousNodeId,
        root,
        targetNodeIdRef,
      })
    }
    host.dispatchEvent(new CustomEvent('preview-surface:indexed', {
      bubbles: true,
      detail: { nodes },
    }))

    const focusPreviewTarget = (target: HtmlSpecimenPreviewTarget) => {
      if (targetNodeIdRef.current === target.nodeId) {
        return
      }

      const refreshed = refreshHtmlSpecimenPreviewTargetSnapshot({
        nodes,
        root,
        target,
      })

      nodes = refreshed.nodes
      nodesRef.current = nodes

      setHtmlSpecimenPreviewTargetState({
        host,
        nodeId: refreshed.target.nodeId,
        targetNodeIdRef,
      })
      markHtmlSpecimenPreviewTargetElement(root, refreshed.target.node.path)
      updateHtmlSpecimenPreviewBoundsOverlay({
        kind: 'target',
        node: refreshed.target.node,
        root,
      })
      clearHtmlSpecimenPreviewTargetSpacingOverlays(root)
      publishHtmlSpecimenPreviewTarget({
        host,
        itemId,
        nodes,
        target: refreshed.target,
      })
    }

    const handlePointerDown: EventListener = (event) => {
      const target = getHtmlSpecimenPreviewTargetFromEvent({
        eventTarget: event.target,
        itemId,
        nodes,
        root,
      })

      if (target) {
        focusPreviewTarget(target)
      }
    }

    const handleFocusRequest = (event: Event) => {
      if (
        !isHtmlSpecimenPreviewFocusRequestEvent(event) ||
        event.detail.itemId !== itemId
      ) {
        return
      }

      const target = createHtmlSpecimenPreviewTarget({
        itemId,
        nodeId: event.detail.nodeId,
        nodes,
      })

      if (target) {
        focusPreviewTarget(target)
      }
    }

    const handlePointerMove: EventListener = (event) => {
      const target = getHtmlSpecimenPreviewTargetFromEvent({
        eventTarget: event.target,
        itemId,
        nodes,
        root,
      })

      if (!target) {
        if (hoverNodeIdRef.current !== null) {
          clearHtmlSpecimenPreviewHoverState({
            host,
            hoverNodeIdRef,
            root,
          })
        }
        return
      }

      if (hoverNodeIdRef.current === target.nodeId) {
        return
      }

      const refreshed = refreshHtmlSpecimenPreviewTargetSnapshot({
        nodes,
        root,
        target,
      })

      nodes = refreshed.nodes
      nodesRef.current = nodes

      setHtmlSpecimenPreviewHoverState({
        host,
        hoverNodeIdRef,
        nodeId: refreshed.target.nodeId,
      })
      markHtmlSpecimenPreviewHoverElement(root, refreshed.target.node.path)
      updateHtmlSpecimenPreviewBoundsOverlay({
        kind: 'hover',
        node: refreshed.target.node,
        root,
      })
    }

    const handlePointerLeave = () => {
      if (hoverNodeIdRef.current !== null) {
        clearHtmlSpecimenPreviewHoverState({
          host,
          hoverNodeIdRef,
          root,
        })
      }
    }

    root.addEventListener('pointermove', handlePointerMove)
    root.addEventListener('pointerleave', handlePointerLeave)
    root.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener(
      HTML_SPECIMEN_PREVIEW_FOCUS_REQUEST_EVENT,
      handleFocusRequest,
    )

    return () => {
      root.removeEventListener('pointermove', handlePointerMove)
      root.removeEventListener('pointerleave', handlePointerLeave)
      root.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener(
        HTML_SPECIMEN_PREVIEW_FOCUS_REQUEST_EVENT,
        handleFocusRequest,
      )
    }
  }, [
    itemId,
    specimen.css,
    specimen.html,
    specimen.viewportHeight,
    specimen.viewportWidth,
  ])

  return (
    <div
      ref={hostRef}
      className="demo-html-specimen-preview"
      data-html-specimen-item-id={itemId}
      title={title}
    />
  )
})
