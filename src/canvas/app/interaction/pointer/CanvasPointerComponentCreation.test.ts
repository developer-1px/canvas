import { describe, expect, it, vi } from 'vitest'
import type { CanvasAppComponentLibrary } from '../../workflow/CanvasAppComponentAssemblyContracts'
import { createCanvasAffordanceConfig } from '../../../engine'
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

const sectionTemplate = {
  accent: '#64748b',
  body: 'Workspace',
  fill: 'rgba(241, 245, 249, 0.42)',
  h: 220,
  id: 'section',
  label: 'F',
  presentation: 'section-frame',
  stroke: '#94a3b8',
  title: 'Section',
  w: 340,
}

describe('CanvasPointerComponentCreation', () => {
  it('creates the built-in sticky component centered on the pointer', () => {
    const componentLibrary = createComponentLibrary()
    const result = startCanvasPointerComponentCreation({
      componentLibrary,
      config: createCanvasAffordanceConfig(),
      createId: () => 'component-1',
      input: createPointerInput(),
      pointerGesture: 'create-sticky',
      startScreen: { x: 200, y: 300 },
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

  it('starts section creation with a default square draft', () => {
    const result = startCanvasPointerComponentCreation({
      componentLibrary: createComponentLibrary(),
      config: createCanvasAffordanceConfig(),
      createId: () => 'component-1',
      input: createPointerInput(),
      pointerGesture: 'create-section',
      startScreen: { x: 200, y: 300 },
      startWorld: { x: 200, y: 300 },
    })

    expect(result).toEqual({
      capturePointer: true,
      draftRect: { h: 340, w: 340, x: 30, y: 150 },
      gesture: 'create-section',
      interaction: {
        currentWorld: { x: 200, y: 320 },
        kind: 'create-section',
        moved: false,
        pointerId: 1,
        startScreen: { x: 200, y: 300 },
        startWorld: { x: 200, y: 320 },
      },
      kind: 'interaction',
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
      input: createPointerInput(),
      pointerGesture: 'create-sticky',
      startScreen: { x: 200, y: 300 },
      startWorld: { x: 200, y: 300 },
    })

    expect(result).toEqual({ kind: 'none' })
    expect(componentLibrary.createItem).not.toHaveBeenCalled()
  })

  it('returns none when the section gesture is disabled', () => {
    const componentLibrary = createComponentLibrary()
    const result = startCanvasPointerComponentCreation({
      componentLibrary,
      config: createCanvasAffordanceConfig({
        gestures: { createSection: false },
      }),
      createId: () => 'component-1',
      input: createPointerInput(),
      pointerGesture: 'create-section',
      startScreen: { x: 200, y: 300 },
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
      input: createPointerInput(),
      pointerGesture: 'create-sticky',
      startScreen: { x: 200, y: 300 },
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
      input: createPointerInput(),
      pointerGesture: 'create-text',
      startScreen: { x: 200, y: 300 },
      startWorld: { x: 200, y: 300 },
    })).toBeNull()
  })
})

function createComponentLibrary({
  includeSticky = true,
  includeSection = true,
}: {
  includeSection?: boolean
  includeSticky?: boolean
} = {}): CanvasAppComponentLibrary {
  const fallbackTemplate = {
    ...stickyTemplate,
    id: 'card',
    presentation: 'accent-card',
    title: 'Card',
  }
  const templates = [
    ...(includeSticky ? [stickyTemplate] : []),
    ...(includeSection ? [sectionTemplate] : []),
    fallbackTemplate,
  ]

  return {
    createItem: vi.fn(({ id, point, templateId }) => ({
      accent: getTemplate(templateId, templates).accent,
      body: getTemplate(templateId, templates).body,
      component: templateId,
      fill: getTemplate(templateId, templates).fill,
      h: getTemplate(templateId, templates).h,
      id,
      stroke: getTemplate(templateId, templates).stroke,
      title: getTemplate(templateId, templates).title,
      type: 'component' as const,
      w: getTemplate(templateId, templates).w,
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

function createPointerInput() {
  return {
    altKey: false,
    button: 0,
    clientX: 200,
    clientY: 300,
    ctrlKey: false,
    metaKey: false,
    pointerId: 1,
    preventDefault: vi.fn(),
    shiftKey: false,
    stopPropagation: vi.fn(),
  }
}

function getTemplate(
  id: string,
  templates: readonly (typeof sectionTemplate | typeof stickyTemplate)[],
) {
  return templates.find((template) => template.id === id) ?? templates[0]
}
