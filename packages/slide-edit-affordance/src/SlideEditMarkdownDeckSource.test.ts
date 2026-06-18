import { describe, expect, it } from 'vitest'

import {
  getSlideEditMarkdownDeckSource,
  getSlideEditMarkdownDeckSourceFromDataTransfer,
  SLIDE_EDIT_MARKDOWN_DECK_SOURCE_MIME_TYPES,
} from './SlideEditMarkdownDeckSource'
import {
  getSlideEditMarkdownDeckSource as getSlideEditMarkdownDeckSourceFromPackage,
} from './index'

function createDataTransfer(values: Record<string, string>) {
  return {
    getData: (type: string) => values[type] ?? '',
  }
}

describe('SlideEditMarkdownDeckSource', () => {
  it('extracts a deck title and multiple slide sources from # deck and ## slide headings', () => {
    const markdown = [
      '# Product Sync',
      '',
      '## Market update',
      'Opening context',
      '',
      '- Demand up',
      '- Cost down',
      '',
      '1. Confirm owner',
      '',
      'Speaker notes:',
      'Mention the source data.',
      '',
      '## Roadmap',
      'Ship the canvas engine.',
      '',
      'Notes: Keep examples brief.',
    ].join('\n')

    const deckSource = getSlideEditMarkdownDeckSourceFromPackage({
      markdown,
      sourceType: 'text/markdown',
    })

    expect(deckSource).toMatchObject({
      deckTitle: 'Product Sync',
      format: 'markdown',
      hasSpeakerNotes: true,
      mode: 'heading',
      payloadLength: markdown.length,
      slideCount: 2,
      sourceType: 'text/markdown',
      surface: 'markdown-deck-source',
    })
    expect(deckSource?.slides).toEqual([
      {
        body: [
          {
            kind: 'paragraph',
            markdown: 'Opening context',
            text: 'Opening context',
          },
          {
            items: [
              {
                level: 0,
                marker: '-',
                text: 'Demand up',
              },
              {
                level: 0,
                marker: '-',
                text: 'Cost down',
              },
            ],
            kind: 'bullet-list',
            markdown: '- Demand up\n- Cost down',
          },
          {
            items: [
              {
                level: 0,
                marker: '1.',
                text: 'Confirm owner',
              },
            ],
            kind: 'ordered-list',
            markdown: '1. Confirm owner',
          },
        ],
        index: 0,
        notes: [
          {
            kind: 'paragraph',
            markdown: 'Mention the source data.',
            text: 'Mention the source data.',
          },
        ],
        rawMarkdown: [
          'Opening context',
          '',
          '- Demand up',
          '- Cost down',
          '',
          '1. Confirm owner',
          '',
          'Speaker notes:',
          'Mention the source data.',
        ].join('\n'),
        title: 'Market update',
      },
      {
        body: [
          {
            kind: 'paragraph',
            markdown: 'Ship the canvas engine.',
            text: 'Ship the canvas engine.',
          },
        ],
        index: 1,
        notes: [
          {
            kind: 'paragraph',
            markdown: 'Keep examples brief.',
            text: 'Keep examples brief.',
          },
        ],
        rawMarkdown: [
          'Ship the canvas engine.',
          '',
          'Notes: Keep examples brief.',
        ].join('\n'),
        title: 'Roadmap',
      },
    ])
  })

  it('extracts separator based outlines with --- and *** as slide breaks', () => {
    const markdown = [
      'Opening slide',
      '- First point',
      '---',
      'Second slide',
      '1. Decide',
      '2. Ship',
      '***',
      '## Final slide',
      'Presenter notes:',
      'Close with the ask.',
    ].join('\n')

    const deckSource = getSlideEditMarkdownDeckSource({
      markdown,
      sourceType: 'text/plain',
    })

    expect(deckSource).toMatchObject({
      deckTitle: null,
      hasSpeakerNotes: true,
      mode: 'separator',
      slideCount: 3,
      sourceType: 'text/plain',
    })
    expect(deckSource?.slides.map((slide) => slide.title)).toEqual([
      'Opening slide',
      'Second slide',
      'Final slide',
    ])
    expect(deckSource?.slides[0]?.body).toEqual([
      {
        items: [
          {
            level: 0,
            marker: '-',
            text: 'First point',
          },
        ],
        kind: 'bullet-list',
        markdown: '- First point',
      },
    ])
    expect(deckSource?.slides[1]?.body).toEqual([
      {
        items: [
          {
            level: 0,
            marker: '1.',
            text: 'Decide',
          },
          {
            level: 0,
            marker: '2.',
            text: 'Ship',
          },
        ],
        kind: 'ordered-list',
        markdown: '1. Decide\n2. Ship',
      },
    ])
    expect(deckSource?.slides[2]?.notes).toEqual([
      {
        kind: 'paragraph',
        markdown: 'Close with the ask.',
        text: 'Close with the ask.',
      },
    ])
  })

  it('reads the first matching Markdown clipboard source from DataTransfer', () => {
    const markdown = [
      '# Workshop',
      '',
      '## Setup',
      '- Install',
      '',
      '## Exercise',
      '- Build',
    ].join('\n')

    expect(getSlideEditMarkdownDeckSourceFromDataTransfer({
      dataTransfer: createDataTransfer({
        'text/markdown': markdown,
        'text/plain': '# Single\n\nOnly text',
      }),
    })).toMatchObject({
      deckTitle: 'Workshop',
      mode: 'heading',
      slideCount: 2,
      sourceType: 'text/markdown',
    })
    expect(SLIDE_EDIT_MARKDOWN_DECK_SOURCE_MIME_TYPES).toEqual([
      'text/markdown',
      'text/x-markdown',
      'text/plain',
    ])
  })

  it('keeps nested bullet levels and numbered markers in structured blocks', () => {
    const deckSource = getSlideEditMarkdownDeckSource({
      markdown: [
        '# Plan',
        '',
        '## One',
        '- Parent',
        '  - Child',
        '',
        '## Two',
        '1) First',
        '2) Second',
      ].join('\n'),
    })

    expect(deckSource?.slides[0]?.body).toEqual([
      {
        items: [
          {
            level: 0,
            marker: '-',
            text: 'Parent',
          },
          {
            level: 1,
            marker: '-',
            text: 'Child',
          },
        ],
        kind: 'bullet-list',
        markdown: '- Parent\n  - Child',
      },
    ])
    expect(deckSource?.slides[1]?.body).toEqual([
      {
        items: [
          {
            level: 0,
            marker: '1)',
            text: 'First',
          },
          {
            level: 0,
            marker: '2)',
            text: 'Second',
          },
        ],
        kind: 'ordered-list',
        markdown: '1) First\n2) Second',
      },
    ])
  })

  it('does not claim standalone Markdown table paste', () => {
    expect(getSlideEditMarkdownDeckSource({
      markdown: [
        '| Name | Count |',
        '| --- | ---: |',
        '| Alpha | 2 |',
      ].join('\n'),
    })).toBeNull()
  })

  it('does not claim single-slide Markdown rich text paste', () => {
    expect(getSlideEditMarkdownDeckSource({
      markdown: [
        '# Product Notes',
        '',
        '## Only Slide',
        '- One bullet',
      ].join('\n'),
    })).toBeNull()

    expect(getSlideEditMarkdownDeckSource({
      markdown: [
        '# Product Notes',
        '',
        '- One bullet',
        '- Another bullet',
      ].join('\n'),
    })).toBeNull()
  })

  it('does not expose host renderer or product model terms', () => {
    const deckSource = getSlideEditMarkdownDeckSource({
      markdown: [
        '# Deck',
        '',
        '## First',
        'One',
        '',
        '## Second',
        'Two',
      ].join('\n'),
    })
    const publicStrings = JSON.stringify(deckSource).toLowerCase()

    for (const blockedTerm of [
      'canvasitem',
      'p' + 'pt',
      'p' + 'ptx',
      'power' + 'point',
      'fig' + 'slide',
      'slide-store',
      'document-model',
      'svg',
    ]) {
      expect(publicStrings).not.toContain(blockedTerm)
    }
  })
})
