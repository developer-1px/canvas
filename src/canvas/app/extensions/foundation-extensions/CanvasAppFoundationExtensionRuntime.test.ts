import { describe, expect, it, vi } from 'vitest'
import { defineCanvasExtension } from '../../../foundation'
import { compileCanvasAppFoundationExtensions } from './CanvasAppFoundationExtensionRuntime'

describe('CanvasAppFoundationExtensionRuntime', () => {
  it('fails assembly when a descriptor required capability adapter is missing', () => {
    const extension = defineCanvasExtension({
      id: 'canvas.risk-note',
      requiredAdapters: ['capability', 'creation', 'document'],
      tools: [{
        id: 'risk-note',
        kind: 'creation',
        requiredAdapters: ['capability', 'creation', 'document'],
        requiredCapability: 'editDocument',
      }],
    })

    expect(() => compileCanvasAppFoundationExtensions({
      adapters: [{
        can: () => true,
        extensionId: extension.id,
        providedAdapters: ['capability', 'document'],
        toolPlanners: {
          'risk-note': () => [],
        },
      }],
      extensions: [extension],
    })).toThrow(
      'Canvas foundation extension canvas.risk-note is missing creation adapter',
    )
  })

  it('fails assembly when adapters compile duplicate renderer contributions', () => {
    const first = defineCanvasExtension({
      id: 'canvas.risk-note',
      rendererSlots: [{ id: 'canvas.risk-note.item', surface: 'item-layer' }],
      requiredAdapters: ['renderer'],
    })
    const second = defineCanvasExtension({
      id: 'canvas.dependency-note',
      rendererSlots: [{
        id: 'canvas.dependency-note.item',
        surface: 'item-layer',
      }],
      requiredAdapters: ['renderer'],
    })

    expect(() => compileCanvasAppFoundationExtensions({
      adapters: [
        {
          extensionId: first.id,
          providedAdapters: ['renderer'],
          rendererSlots: {
            'canvas.risk-note.item': {
              presentation: 'risk-card',
              render: () => null,
            },
          },
        },
        {
          extensionId: second.id,
          providedAdapters: ['renderer'],
          rendererSlots: {
            'canvas.dependency-note.item': {
              presentation: 'risk-card',
              render: () => null,
            },
          },
        },
      ],
      extensions: [first, second],
    })).toThrow(
      'Duplicate canvas foundation renderer contribution: risk-card',
    )
  })

  it('fails assembly when the same extension adapter is contributed twice', () => {
    const extension = defineCanvasExtension({ id: 'canvas.risk-note' })

    expect(() => compileCanvasAppFoundationExtensions({
      adapters: [
        { extensionId: extension.id, providedAdapters: [] },
        { extensionId: extension.id, providedAdapters: [] },
      ],
      extensions: [extension],
    })).toThrow(
      'Duplicate canvas foundation extension adapter: canvas.risk-note',
    )
  })

  it('compiles a descriptor tool and its capability adapter into a runtime planner', () => {
    const extension = defineCanvasExtension({
      id: 'canvas.risk-note',
      requiredAdapters: ['capability', 'creation', 'document'],
      tools: [{
        id: 'risk-note',
        kind: 'creation',
        requiredAdapters: ['capability', 'creation', 'document'],
        requiredCapability: 'editDocument',
      }],
    })
    const plan = vi.fn(() => [{
      patch: [{ items: [], type: 'add' as const }],
      type: 'document-patch' as const,
    }])
    const runtime = compileCanvasAppFoundationExtensions({
      adapters: [{
        can: () => true,
        extensionId: extension.id,
        providedAdapters: ['capability', 'creation', 'document'],
        toolPlanners: { 'risk-note': plan },
      }],
      extensions: [extension],
    })
    const input = { point: { x: 10, y: 20 } }

    expect(runtime.planTool('risk-note', input)).toEqual([{
      patch: [{ items: [], type: 'add' }],
      type: 'document-patch',
    }])
    expect(plan).toHaveBeenCalledWith(input)
  })

  it('gates compiled command planning with its declared capability', () => {
    const plan = vi.fn(() => [{ selection: ['risk-1'], type: 'selection' as const }])
    const extension = defineCanvasExtension({
      commands: [{
        id: 'select-risk',
        plan,
        requiredAdapters: ['capability'],
        requiredCapability: 'view',
      }],
      id: 'canvas.risk-note',
      requiredAdapters: ['capability'],
    })
    const runtime = compileCanvasAppFoundationExtensions({
      adapters: [{
        can: () => false,
        extensionId: extension.id,
        providedAdapters: ['capability'],
      }],
      extensions: [extension],
    })

    expect(runtime.planCommand('select-risk', {})).toEqual([])
    expect(plan).not.toHaveBeenCalled()
  })

  it('gates compiled tool planning with its declared capability', () => {
    const plan = vi.fn(() => [{ selection: ['risk-1'], type: 'selection' as const }])
    const extension = defineCanvasExtension({
      id: 'canvas.risk-note',
      requiredAdapters: ['capability', 'creation'],
      tools: [{
        id: 'risk-note',
        kind: 'creation',
        requiredAdapters: ['capability', 'creation'],
        requiredCapability: 'editDocument',
      }],
    })
    const runtime = compileCanvasAppFoundationExtensions({
      adapters: [{
        can: () => false,
        extensionId: extension.id,
        providedAdapters: ['capability', 'creation'],
        toolPlanners: { 'risk-note': plan },
      }],
      extensions: [extension],
    })

    expect(runtime.planTool('risk-note', {})).toEqual([])
    expect(plan).not.toHaveBeenCalled()
  })

  it('contains capability adapter failures before planner execution', () => {
    const plan = vi.fn(() => [])
    const extension = defineCanvasExtension({
      id: 'canvas.risk-note',
      requiredAdapters: ['capability', 'creation'],
      tools: [{
        id: 'risk-note',
        kind: 'creation',
        requiredCapability: 'editDocument',
      }],
    })
    const runtime = compileCanvasAppFoundationExtensions({
      adapters: [{
        can: () => {
          throw new Error('capability service unavailable')
        },
        extensionId: extension.id,
        providedAdapters: ['capability', 'creation'],
        toolPlanners: { 'risk-note': plan },
      }],
      extensions: [extension],
    })

    expect(runtime.planTool('risk-note', {})).toEqual([])
    expect(plan).not.toHaveBeenCalled()
  })

  it('compiles declared text-target and renderer capability contributions', () => {
    const extension = defineCanvasExtension({
      id: 'canvas.risk-note',
      rendererSlots: [{ id: 'canvas.risk-note.item', surface: 'item-layer' }],
      requiredAdapters: ['renderer', 'text-target'],
      textTargetSlots: [{ id: 'canvas.risk-note.text' }],
    })
    const textTarget = {
      canEdit: () => true,
      commitsOnEnter: () => true,
      getCommittedValue: ({ value }: { value: string }) => value,
      getEditorBounds: () => null,
      getValue: () => 'Risk',
      planCommitUpdates: () => [],
    }
    const render = () => null
    const runtime = compileCanvasAppFoundationExtensions({
      adapters: [{
        extensionId: extension.id,
        providedAdapters: ['renderer', 'text-target'],
        rendererSlots: {
          'canvas.risk-note.item': { presentation: 'risk-card', render },
        },
        textTargetSlots: {
          'canvas.risk-note.text': textTarget,
        },
      }],
      extensions: [extension],
    })

    expect(runtime.componentPresentationRenderers).toEqual({
      'risk-card': render,
    })
    expect(runtime.textTargets).toEqual([textTarget])
  })
})
