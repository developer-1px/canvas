import type {
  CanvasShortcutHelpSection,
} from './CanvasShortcutHelpItems'

export type CanvasShortcutHelpDialogRootAttributes = {
  'aria-labelledby': string
  'aria-modal': true
  role: 'dialog'
}

export type CanvasShortcutHelpDialogHeadingAttributes = {
  id: string
}

export type CanvasShortcutHelpSectionRootAttributes = {
  'aria-labelledby': string
}

export type CanvasShortcutHelpSectionDescriptor = {
  headingAttributes: CanvasShortcutHelpDialogHeadingAttributes
  rootAttributes: CanvasShortcutHelpSectionRootAttributes
  section: CanvasShortcutHelpSection
}

export type CanvasShortcutHelpDialogDescriptor = {
  headingAttributes: CanvasShortcutHelpDialogHeadingAttributes
  rootAttributes: CanvasShortcutHelpDialogRootAttributes
  sectionDescriptors: readonly CanvasShortcutHelpSectionDescriptor[]
}

export type CanvasShortcutHelpDialogDescriptorInput = {
  controlId: string
  sections: readonly CanvasShortcutHelpSection[]
}

export function createCanvasShortcutHelpDialogDescriptor({
  controlId,
  sections,
}: CanvasShortcutHelpDialogDescriptorInput):
  CanvasShortcutHelpDialogDescriptor {
  const headingId = `${controlId}-heading`

  return {
    headingAttributes: {
      id: headingId,
    },
    rootAttributes: {
      'aria-labelledby': headingId,
      'aria-modal': true,
      role: 'dialog',
    },
    sectionDescriptors: sections.map((section) => {
      const sectionHeadingId =
        `${controlId}-section-${getCanvasShortcutHelpSectionId(section)}-heading`

      return {
        headingAttributes: {
          id: sectionHeadingId,
        },
        rootAttributes: {
          'aria-labelledby': sectionHeadingId,
        },
        section,
      }
    }),
  }
}

function getCanvasShortcutHelpSectionId(section: CanvasShortcutHelpSection) {
  return section.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase()
}
