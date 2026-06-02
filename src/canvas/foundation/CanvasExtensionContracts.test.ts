import { describe, expect, it } from 'vitest'

import {
  defineCanvasExtension,
  type CanvasExtensionDescriptor,
} from './CanvasExtensionContracts'

describe('CanvasExtensionContracts', () => {
  it('defines headless extension descriptors that produce effects', () => {
    const extension = defineCanvasExtension({
      commands: [{
        id: 'group-selection',
        plan: ({ selection }: { selection: string[] }) =>
          selection.length > 1
            ? [{
                patch: [{ op: 'replace', path: '', value: selection }],
                selection: { after: selection, before: [] },
                type: 'document-patch',
              }]
            : [],
        requiredAdapters: ['document', 'scene'],
      }],
      id: 'whiteboard-grouping',
      rendererSlots: [{
        id: 'group-outline',
        surface: 'overlay',
      }],
      requiredAdapters: ['document', 'scene'],
      tools: [{
        id: 'sticky',
        kind: 'creation',
        requiredAdapters: ['creation', 'document'],
      }],
    } satisfies CanvasExtensionDescriptor)

    expect(extension.id).toBe('whiteboard-grouping')
    expect(extension.requiredAdapters).toEqual(['document', 'scene'])
    expect(extension.tools).toEqual([{
      id: 'sticky',
      kind: 'creation',
      requiredAdapters: ['creation', 'document'],
    }])
    expect(extension.commands?.[0].plan({ selection: ['a', 'b'] })).toEqual([{
      patch: [{ op: 'replace', path: '', value: ['a', 'b'] }],
      selection: { after: ['a', 'b'], before: [] },
      type: 'document-patch',
    }])
  })
})
