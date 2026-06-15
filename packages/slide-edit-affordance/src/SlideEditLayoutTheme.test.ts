import { describe, expect, it } from 'vitest'

import {
  createSlideEditLayoutApplyCommandEffect,
  createSlideEditLayoutDescriptor,
  createSlideEditThemeTokenSet,
  getSlideEditLayoutPlaceholderDescriptors,
  resolveSlideEditLayoutPlaceholderStyle,
} from './SlideEditLayoutTheme'

describe('SlideEditLayoutTheme', () => {
  const theme = createSlideEditThemeTokenSet({
    colors: [
      {
        id: 'color-background',
        label: 'Background',
        role: 'background',
        value: '#ffffff',
      },
      {
        id: 'color-title',
        label: 'Title',
        role: 'text',
        value: '#111827',
      },
    ],
    fonts: [
      {
        family: 'Inter',
        id: 'font-title',
        label: 'Title',
        role: 'title',
        weight: 700,
      },
      {
        family: 'Inter',
        id: 'font-body',
        label: 'Body',
        role: 'body',
        weight: 500,
      },
    ],
    spacing: [
      {
        id: 'space-slide-margin',
        label: 'Slide margin',
        value: 48,
      },
    ],
    themeId: 'theme-default',
  })
  const layout = createSlideEditLayoutDescriptor({
    defaultStyle: {
      colorTokenId: 'color-background',
      fontTokenId: 'font-body',
      spacingTokenId: 'space-slide-margin',
    },
    layoutId: 'layout-title-body',
    masterId: 'master-main',
    placeholders: [
      {
        bounds: { h: 96, w: 960, x: 120, y: 72 },
        inheritedStyle: {
          colorTokenId: 'color-title',
          fontTokenId: 'font-title',
        },
        isLocked: true,
        placeholderId: 'title-slot',
        role: 'title',
        slideId: 'slide-a',
        title: 'Title',
      },
      {
        bounds: { h: 360, w: 960, x: 120, y: 196 },
        placeholderId: 'body-slot',
        role: 'body',
        slideId: 'slide-a',
        title: 'Body',
      },
    ],
    title: 'Title and body',
  })

  it('represents theme color, font, and spacing tokens without product model fields', () => {
    expect(theme).toEqual({
      colors: [
        {
          id: 'color-background',
          label: 'Background',
          role: 'background',
          value: '#ffffff',
        },
        {
          id: 'color-title',
          label: 'Title',
          role: 'text',
          value: '#111827',
        },
      ],
      fonts: [
        {
          family: 'Inter',
          id: 'font-title',
          label: 'Title',
          role: 'title',
          weight: 700,
        },
        {
          family: 'Inter',
          id: 'font-body',
          label: 'Body',
          role: 'body',
          weight: 500,
        },
      ],
      spacing: [
        {
          id: 'space-slide-margin',
          label: 'Slide margin',
          value: 48,
        },
      ],
      themeId: 'theme-default',
    })
  })

  it('defines slide layout, master, placeholder role, inherited style, and default bounds', () => {
    expect(layout).toMatchObject({
      defaultStyle: {
        colorTokenId: 'color-background',
        fontTokenId: 'font-body',
        spacingTokenId: 'space-slide-margin',
      },
      layoutId: 'layout-title-body',
      masterId: 'master-main',
      title: 'Title and body',
    })
    expect(layout.placeholders).toEqual([
      {
        bounds: { h: 96, w: 960, x: 120, y: 72 },
        defaultBounds: { h: 96, w: 960, x: 120, y: 72 },
        inheritedStyle: {
          colorTokenId: 'color-title',
          fontTokenId: 'font-title',
        },
        isLocked: true,
        isVisible: true,
        placeholderId: 'title-slot',
        role: 'title',
        slideId: 'slide-a',
        title: 'Title',
      },
      {
        bounds: { h: 360, w: 960, x: 120, y: 196 },
        defaultBounds: { h: 360, w: 960, x: 120, y: 196 },
        inheritedStyle: undefined,
        isLocked: false,
        isVisible: true,
        placeholderId: 'body-slot',
        role: 'body',
        slideId: 'slide-a',
        title: 'Body',
      },
    ])
  })

  it('reuses placeholder descriptor fields from placeholder visibility affordance', () => {
    expect(getSlideEditLayoutPlaceholderDescriptors(layout)).toEqual([
      {
        bounds: { h: 96, w: 960, x: 120, y: 72 },
        isLocked: true,
        isVisible: true,
        placeholderId: 'title-slot',
        role: 'title',
        slideId: 'slide-a',
        title: 'Title',
      },
      {
        bounds: { h: 360, w: 960, x: 120, y: 196 },
        isLocked: false,
        isVisible: true,
        placeholderId: 'body-slot',
        role: 'body',
        slideId: 'slide-a',
        title: 'Body',
      },
    ])
  })

  it('resolves placeholder style from layout defaults and inherited tokens', () => {
    expect(resolveSlideEditLayoutPlaceholderStyle({
      layout,
      placeholderId: 'title-slot',
      theme,
    })).toEqual({
      color: {
        id: 'color-title',
        label: 'Title',
        role: 'text',
        value: '#111827',
      },
      font: {
        family: 'Inter',
        id: 'font-title',
        label: 'Title',
        role: 'title',
        weight: 700,
      },
      spacing: {
        id: 'space-slide-margin',
        label: 'Slide margin',
        value: 48,
      },
    })
  })

  it('lets host choose preserve or reflow policy when applying a layout', () => {
    expect(createSlideEditLayoutApplyCommandEffect({
      layout,
      policy: 'preserve-existing-objects',
      slideId: 'slide-a',
    })).toEqual({
      payload: {
        id: 'apply-slide-layout',
        layoutId: 'layout-title-body',
        masterId: 'master-main',
        placeholderIds: ['title-slot', 'body-slot'],
        policy: 'preserve-existing-objects',
      },
      selection: {
        objectIds: [],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
    expect(createSlideEditLayoutApplyCommandEffect({
      layout,
      policy: 'reflow-objects-to-placeholders',
      slideId: 'slide-a',
    })).toMatchObject({
      payload: {
        policy: 'reflow-objects-to-placeholders',
      },
    })
  })

  it('keeps layout and theme contracts product-neutral', () => {
    const publicStrings = JSON.stringify({
      layout,
      theme,
    }).toLowerCase()

    expect(publicStrings).not.toContain('ppt')
    expect(publicStrings).not.toContain('powerpoint')
    expect(publicStrings).not.toContain('google slides')
    expect(publicStrings).not.toContain('figslide')
  })
})
