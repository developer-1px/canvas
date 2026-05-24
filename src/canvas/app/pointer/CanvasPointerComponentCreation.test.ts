import { describe, expect, it, vi } from 'vitest'
import type { CanvasAppComponentLibrary } from '../workflow/CanvasAppComponentAssemblyContracts'
import { createCanvasAffordanceConfig } from '../../engine'
import { startCanvasPointerComponentCreation } from './CanvasPointerComponentCreation'

const stickyTemplate = {
  accent: '#ca8a04',
  body: 'Decision note',
  fill: '#fef3c7',
  h: 148,
  id: 'sticky',
  label: 'N',
  presentation: 'note-card',
  stroke: '#eab308',
  title: 'Sticky',
  w: 188,
}

describe('CanvasPointerComponentCreation', () => {
  it('creates the built-in sticky component centered on the pointer', () => {
    const componentLibrary = createComponentLibrary()
    const result = startCanvasPointerComponentCreation({
      componentLibrary,
      config: createCanvasAffordanceConfig(),
      createId: () => 'component-1',
      pointerGesture: 'create-sticky',
      startWorld: { x: 200, y: 300 },
    })

    expect(componentLibrary.createItem).toHaveBeenCalledWith({
      id: 'component-1',
      point: { x: 106, y: 226 },
      templateId: 'sticky',
    })
    expect(result).toEqual({
      capturePointer: false,
      edit: { id: 'component-1', value: '' },
      item: {
        accent: '#ca8a04',
        body: '',
        component: 'sticky',
        fill: '#fef3c7',
        h: 148,
        id: 'component-1',
        stroke: '#eab308',
        title: 'Sticky',
        type: 'component',
        w: 188,
        x: 106,
        y: 226,
      },
      kind: 'created-item',
    })
  })

  it('returns none when the sticky gesture is disabled', () => {
    const componentLibrary = createComponentLibrary()
    const result = startCanvasPointerComponentCreation({
      componentLibrary,
      config: createCanvasAffordanceConfig({
        gestures: { createSticky: false },
      }),
      createId: () => 'component-1',
      pointerGesture: 'create-sticky',
      startWorld: { x: 200, y: 300 },
    })

    expect(result).toEqual({ kind: 'none' })
    expect(componentLibrary.createItem).not.toHaveBeenCalled()
  })

  it('returns none when the component library has no sticky template', () => {
    const componentLibrary = createComponentLibrary({ includeSticky: false })
    const result = startCanvasPointerComponentCreation({
      componentLibrary,
      config: createCanvasAffordanceConfig(),
      createId: () => 'component-1',
      pointerGesture: 'create-sticky',
      startWorld: { x: 200, y: 300 },
    })

    expect(result).toEqual({ kind: 'none' })
    expect(componentLibrary.createItem).not.toHaveBeenCalled()
  })

  it('returns null for gestures outside component-backed creation', () => {
    expect(startCanvasPointerComponentCreation({
      componentLibrary: createComponentLibrary(),
      config: createCanvasAffordanceConfig(),
      createId: () => 'component-1',
      pointerGesture: 'create-text',
      startWorld: { x: 200, y: 300 },
    })).toBeNull()
  })
})

function createComponentLibrary({
  includeSticky = true,
}: {
  includeSticky?: boolean
} = {}): CanvasAppComponentLibrary {
  const fallbackTemplate = {
    ...stickyTemplate,
    id: 'card',
    presentation: 'accent-card',
    title: 'Card',
  }
  const templates = includeSticky
    ? [stickyTemplate, fallbackTemplate]
    : [fallbackTemplate]

  return {
    createItem: vi.fn(({ id, point, templateId }) => ({
      accent: stickyTemplate.accent,
      body: stickyTemplate.body,
      component: templateId,
      fill: stickyTemplate.fill,
      h: stickyTemplate.h,
      id,
      stroke: stickyTemplate.stroke,
      title: stickyTemplate.title,
      type: 'component' as const,
      w: stickyTemplate.w,
      x: point.x,
      y: point.y,
    })),
    getPresentation: (id) =>
      templates.find((template) => template.id === id)?.presentation ??
      templates[0].presentation,
    getTemplate: (id) =>
      templates.find((template) => template.id === id) ?? templates[0],
    templates,
  }
}
