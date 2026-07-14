import type {
  DesignJSONObject,
  DesignNode,
  DesignNodeComponentBinding,
} from '@interactive-os/canvas/react-design'
import {
  createFigmaDesignNodeLayout,
  createFigmaDesignNodeStyle,
  normalizeFigmaDesignNodeState,
  type FigmaDesignNodeState,
} from './FigmaDesignDocumentSeedTypes'

type MobileTravelNodeSeed<Id extends string = string> = {
  readonly className?: string
  readonly id: Id
  readonly intrinsic: string
  readonly label: string
  readonly parentId: string | null
  readonly state: FigmaDesignNodeState
  readonly text?: string
}

const EMPTY_STATE: FigmaDesignNodeState = {
  align: 'start',
  alignSelf: 'auto',
  direction: 'column',
  distribution: 'start',
  gap: 0,
  h: 0,
  heightMode: 'fixed',
  margin: 0,
  opacity: 1,
  order: 0,
  padding: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  radius: 0,
  rotation: 0,
  w: 0,
  widthMode: 'fixed',
  x: 0,
  y: 0,
}

const layoutClass = (className: string) =>
  `figma-dom-mobile__layout ${className}`

function state(
  overrides: Partial<FigmaDesignNodeState>,
): FigmaDesignNodeState {
  return normalizeFigmaDesignNodeState({ ...EMPTY_STATE, ...overrides })
}

function column({
  align = 'stretch',
  distribution = 'start',
  gap = 0,
  h,
  heightMode = 'fixed',
  padding = 0,
  radius = 0,
  w,
  widthMode = 'fill',
}: {
  readonly align?: FigmaDesignNodeState['align']
  readonly distribution?: FigmaDesignNodeState['distribution']
  readonly gap?: number
  readonly h: number
  readonly heightMode?: FigmaDesignNodeState['heightMode']
  readonly padding?: number
  readonly radius?: number
  readonly w: number
  readonly widthMode?: FigmaDesignNodeState['widthMode']
}) {
  return state({
    align,
    direction: 'column',
    distribution,
    gap,
    h,
    heightMode,
    padding,
    radius,
    w,
    widthMode,
  })
}

function row({
  align = 'center',
  distribution = 'start',
  gap = 0,
  h,
  heightMode = 'fixed',
  padding = 0,
  radius = 0,
  w,
  widthMode = 'fill',
}: {
  readonly align?: FigmaDesignNodeState['align']
  readonly distribution?: FigmaDesignNodeState['distribution']
  readonly gap?: number
  readonly h: number
  readonly heightMode?: FigmaDesignNodeState['heightMode']
  readonly padding?: number
  readonly radius?: number
  readonly w: number
  readonly widthMode?: FigmaDesignNodeState['widthMode']
}) {
  return state({
    align,
    direction: 'row',
    distribution,
    gap,
    h,
    heightMode,
    padding,
    radius,
    w,
    widthMode,
  })
}

function leaf({
  h,
  w,
  widthMode = 'fixed',
}: {
  readonly h: number
  readonly w: number
  readonly widthMode?: FigmaDesignNodeState['widthMode']
}) {
  return state({ h, w, widthMode })
}

function seed<const Id extends string>(
  id: Id,
  parentId: string | null,
  intrinsic: string,
  label: string,
  nodeState: FigmaDesignNodeState,
  options: {
    readonly className?: string
    readonly text?: string
  } = {},
): MobileTravelNodeSeed<Id> {
  return {
    id,
    parentId,
    intrinsic,
    label,
    state: nodeState,
    ...options,
  }
}

const MOBILE_TRAVEL_NODE_SEEDS = [
  seed('mobileExplorePage', null, 'section', 'Mobile travel explore',
    column({ h: 844, w: 390, widthMode: 'fixed' }), {
      className: 'figma-dom-mobile figma-dom-mobile--explore',
    }),
  seed('mobileExploreHeader', 'mobileExplorePage', 'header', 'Explore header',
    row({ distribution: 'space-between', h: 56, padding: 20, w: 390 }), {
      className: layoutClass('figma-dom-mobile__header'),
    }),
  seed('mobileExploreBrand', 'mobileExploreHeader', 'div', 'Travel brand',
    row({ gap: 8, h: 28, w: 132, widthMode: 'hug' }), {
      className: layoutClass('figma-dom-mobile__brand'),
    }),
  seed('mobileExploreBrandMark', 'mobileExploreBrand', 'span', 'Brand mark',
    leaf({ h: 28, w: 28 }), {
      className: 'figma-dom-mobile__brand-mark', text: 'm',
    }),
  seed('mobileExploreBrandText', 'mobileExploreBrand', 'strong', 'Brand name',
    leaf({ h: 28, w: 94 }), { text: 'morrow' }),
  seed('mobileExploreAccount', 'mobileExploreHeader', 'button', 'Account menu',
    leaf({ h: 32, w: 32 }), {
      className: 'figma-dom-mobile__round-button', text: 'YK',
    }),
  seed('mobileExploreMain', 'mobileExplorePage', 'main', 'Explore content',
    column({ gap: 12, h: 724, heightMode: 'fill', padding: 16, w: 390 }), {
      className: layoutClass('figma-dom-mobile__main'),
    }),
  seed('mobileExploreEyebrow', 'mobileExploreMain', 'span', 'Explore eyebrow',
    leaf({ h: 16, w: 358, widthMode: 'fill' }), {
      className: 'figma-dom-mobile__eyebrow', text: 'CURATED STAYS · SOUTH KOREA',
    }),
  seed('mobileExploreTitle', 'mobileExploreMain', 'h1', 'Explore title',
    leaf({ h: 60, w: 358, widthMode: 'fill' }), {
      text: 'Stay somewhere worth remembering',
    }),
  seed('mobileExploreSubtitle', 'mobileExploreMain', 'p', 'Explore subtitle',
    leaf({ h: 32, w: 338, widthMode: 'fill' }), {
      className: 'figma-dom-mobile__muted',
      text: 'Independent homes and small hotels, selected for slower weekends.',
    }),
  seed('mobileExploreSearch', 'mobileExploreMain', 'button', 'Search stays',
    row({ gap: 12, h: 56, padding: 12, radius: 16, w: 358 }), {
      className: layoutClass('figma-dom-mobile__search'),
    }),
  seed('mobileExploreSearchIcon', 'mobileExploreSearch', 'span', 'Search icon',
    leaf({ h: 28, w: 24 }), { text: '⌕' }),
  seed('mobileExploreSearchCopy', 'mobileExploreSearch', 'div', 'Search summary',
    column({ gap: 4, h: 36, w: 274 }), {
      className: layoutClass('figma-dom-mobile__search-copy'),
    }),
  seed('mobileExploreSearchTitle', 'mobileExploreSearchCopy', 'strong',
    'Search destination', leaf({ h: 18, w: 274, widthMode: 'fill' }), {
      text: 'Jeju Island',
    }),
  seed('mobileExploreSearchMeta', 'mobileExploreSearchCopy', 'span',
    'Search dates and guests', leaf({ h: 14, w: 274, widthMode: 'fill' }), {
      text: '19–21 Jul · 2 guests',
    }),
  seed('mobileExploreCategories', 'mobileExploreMain', 'nav', 'Stay categories',
    row({ gap: 8, h: 32, w: 358 }), {
      className: layoutClass('figma-dom-mobile__chips'),
    }),
  seed('mobileExploreCategoryAll', 'mobileExploreCategories', 'button',
    'All stays', leaf({ h: 32, w: 52 }), {
      className: 'figma-dom-mobile__chip figma-dom-mobile__chip--active', text: 'All',
    }),
  seed('mobileExploreCategoryCoast', 'mobileExploreCategories', 'button',
    'Coast stays', leaf({ h: 32, w: 68 }), {
      className: 'figma-dom-mobile__chip', text: 'Coast',
    }),
  seed('mobileExploreCategoryCity', 'mobileExploreCategories', 'button',
    'City stays', leaf({ h: 32, w: 56 }), {
      className: 'figma-dom-mobile__chip', text: 'City',
    }),
  seed('mobileExploreCategoryHanok', 'mobileExploreCategories', 'button',
    'Hanok stays', leaf({ h: 32, w: 68 }), {
      className: 'figma-dom-mobile__chip', text: 'Hanok',
    }),
  seed('mobileExploreFeaturedHeader', 'mobileExploreMain', 'div',
    'Featured heading row', row({ distribution: 'space-between', h: 20, w: 358 }), {
      className: layoutClass('figma-dom-mobile__section-heading'),
    }),
  seed('mobileExploreFeaturedHeading', 'mobileExploreFeaturedHeader', 'h2',
    'Featured heading', leaf({ h: 20, w: 220 }), { text: 'Editor’s pick' }),
  seed('mobileExploreFeaturedCount', 'mobileExploreFeaturedHeader', 'span',
    'Featured result count', leaf({ h: 20, w: 52 }), { text: '12 stays' }),
  seed('mobileExploreFeaturedCard', 'mobileExploreMain', 'article',
    'Featured stay', column({ h: 244, radius: 20, w: 358 }), {
      className: layoutClass('figma-dom-mobile__stay-card'),
    }),
  seed('mobileExploreFeaturedImage', 'mobileExploreFeaturedCard', 'div',
    'Featured stay image', row({ align: 'start', distribution: 'space-between', h: 144, padding: 12, w: 358 }), {
      className: layoutClass('figma-dom-mobile__stay-image figma-dom-mobile__stay-image--jeju'),
    }),
  seed('mobileExploreFeaturedTag', 'mobileExploreFeaturedImage', 'span',
    'Featured stay tag', leaf({ h: 26, w: 92 }), {
      className: 'figma-dom-mobile__image-tag', text: 'Guest favourite',
    }),
  seed('mobileExploreFavorite', 'mobileExploreFeaturedImage', 'button',
    'Save featured stay', leaf({ h: 30, w: 30 }), {
      className: 'figma-dom-mobile__image-action', text: '♡',
    }),
  seed('mobileExploreFeaturedInfo', 'mobileExploreFeaturedCard', 'div',
    'Featured stay details', column({ gap: 4, h: 100, padding: 12, w: 358 }), {
      className: layoutClass('figma-dom-mobile__stay-info'),
    }),
  seed('mobileExploreFeaturedType', 'mobileExploreFeaturedInfo', 'span',
    'Featured stay type', leaf({ h: 14, w: 334, widthMode: 'fill' }), {
      className: 'figma-dom-mobile__eyebrow', text: 'PRIVATE HOUSE · AEWOL',
    }),
  seed('mobileExploreFeaturedTitle', 'mobileExploreFeaturedInfo', 'strong',
    'Featured stay title', leaf({ h: 22, w: 334, widthMode: 'fill' }), {
      text: 'Slow House, Jeju',
    }),
  seed('mobileExploreFeaturedMeta', 'mobileExploreFeaturedInfo', 'span',
    'Featured stay rating', leaf({ h: 16, w: 334, widthMode: 'fill' }), {
      className: 'figma-dom-mobile__muted', text: '4.96 · 128 reviews · 2 beds',
    }),
  seed('mobileExploreFeaturedPriceRow', 'mobileExploreFeaturedInfo', 'div',
    'Featured price row', row({ gap: 4, h: 18, w: 334 }), {
      className: layoutClass('figma-dom-mobile__price-row'),
    }),
  seed('mobileExploreFeaturedPrice', 'mobileExploreFeaturedPriceRow', 'strong',
    'Featured nightly price', leaf({ h: 18, w: 88 }), { text: '₩218,000' }),
  seed('mobileExploreFeaturedPriceNote', 'mobileExploreFeaturedPriceRow', 'span',
    'Featured price note', leaf({ h: 18, w: 78 }), {
      className: 'figma-dom-mobile__muted', text: ' / night',
    }),
  seed('mobileExplorePopularHeader', 'mobileExploreMain', 'div',
    'Popular heading row', row({ distribution: 'space-between', h: 20, w: 358 }), {
      className: layoutClass('figma-dom-mobile__section-heading'),
    }),
  seed('mobileExplorePopularHeading', 'mobileExplorePopularHeader', 'h2',
    'Popular nearby heading', leaf({ h: 20, w: 220 }), { text: 'Popular nearby' }),
  seed('mobileExplorePopularAction', 'mobileExplorePopularHeader', 'button',
    'See all popular stays', leaf({ h: 20, w: 52 }), {
      className: 'figma-dom-mobile__text-action', text: 'See all',
    }),
  seed('mobileExplorePopularRow', 'mobileExploreMain', 'div', 'Popular stays',
    row({ gap: 12, h: 112, w: 358 }), {
      className: layoutClass('figma-dom-mobile__popular-row'),
    }),
  seed('mobileExplorePopularOne', 'mobileExplorePopularRow', 'article',
    'Popular stay Seogwipo', row({ gap: 4, h: 112, padding: 8, radius: 16, w: 174 }), {
      className: layoutClass('figma-dom-mobile__mini-card'),
    }),
  seed('mobileExplorePopularOneImage', 'mobileExplorePopularOne', 'div',
    'Seogwipo stay image', leaf({ h: 96, w: 64 }), {
      className: 'figma-dom-mobile__mini-image figma-dom-mobile__mini-image--stone',
    }),
  seed('mobileExplorePopularOneCopy', 'mobileExplorePopularOne', 'div',
    'Seogwipo stay details', column({ gap: 8, h: 80, w: 84 }), {
      className: layoutClass('figma-dom-mobile__mini-copy'),
    }),
  seed('mobileExplorePopularOneTitle', 'mobileExplorePopularOneCopy', 'strong',
    'Seogwipo stay name', leaf({ h: 40, w: 84 }), { text: 'Stone Stay\nSeogwipo' }),
  seed('mobileExplorePopularOnePrice', 'mobileExplorePopularOneCopy', 'span',
    'Seogwipo stay price', leaf({ h: 18, w: 84 }), { text: '₩164k' }),
  seed('mobileExplorePopularTwo', 'mobileExplorePopularRow', 'article',
    'Popular stay Seoul', row({ gap: 4, h: 112, padding: 8, radius: 16, w: 174 }), {
      className: layoutClass('figma-dom-mobile__mini-card'),
    }),
  seed('mobileExplorePopularTwoImage', 'mobileExplorePopularTwo', 'div',
    'Seoul stay image', leaf({ h: 96, w: 64 }), {
      className: 'figma-dom-mobile__mini-image figma-dom-mobile__mini-image--seoul',
    }),
  seed('mobileExplorePopularTwoCopy', 'mobileExplorePopularTwo', 'div',
    'Seoul stay details', column({ gap: 8, h: 80, w: 84 }), {
      className: layoutClass('figma-dom-mobile__mini-copy'),
    }),
  seed('mobileExplorePopularTwoTitle', 'mobileExplorePopularTwoCopy', 'strong',
    'Seoul stay name', leaf({ h: 40, w: 84 }), { text: 'Chapter\nSeochon' }),
  seed('mobileExplorePopularTwoPrice', 'mobileExplorePopularTwoCopy', 'span',
    'Seoul stay price', leaf({ h: 18, w: 84 }), { text: '₩182k' }),
  seed('mobileExploreNav', 'mobileExplorePage', 'nav', 'Explore navigation',
    row({ distribution: 'space-between', h: 64, padding: 20, w: 390 }), {
      className: layoutClass('figma-dom-mobile__bottom-nav'),
    }),
  seed('mobileExploreNavExplore', 'mobileExploreNav', 'button',
    'Explore tab', leaf({ h: 32, w: 72 }), {
      className: 'figma-dom-mobile__nav-item figma-dom-mobile__nav-item--active', text: 'Explore',
    }),
  seed('mobileExploreNavSaved', 'mobileExploreNav', 'button',
    'Saved tab', leaf({ h: 32, w: 72 }), {
      className: 'figma-dom-mobile__nav-item', text: 'Saved',
    }),
  seed('mobileExploreNavTrips', 'mobileExploreNav', 'button',
    'Trips tab', leaf({ h: 32, w: 72 }), {
      className: 'figma-dom-mobile__nav-item', text: 'Trips',
    }),

  seed('mobileStayPage', null, 'section', 'Mobile stay detail',
    column({ h: 844, w: 390, widthMode: 'fixed' }), {
      className: 'figma-dom-mobile figma-dom-mobile--stay',
    }),
  seed('mobileStayHero', 'mobileStayPage', 'header', 'Stay gallery',
    column({ distribution: 'space-between', h: 300, padding: 16, w: 390 }), {
      className: layoutClass('figma-dom-mobile__detail-hero'),
    }),
  seed('mobileStayHeroControls', 'mobileStayHero', 'div', 'Gallery controls',
    row({ distribution: 'space-between', h: 36, w: 358 }), {
      className: layoutClass('figma-dom-mobile__hero-controls'),
    }),
  seed('mobileStayBack', 'mobileStayHeroControls', 'button', 'Back to explore',
    leaf({ h: 36, w: 36 }), {
      className: 'figma-dom-mobile__image-action', text: '←',
    }),
  seed('mobileStaySave', 'mobileStayHeroControls', 'button', 'Save this stay',
    leaf({ h: 36, w: 36 }), {
      className: 'figma-dom-mobile__image-action', text: '♡',
    }),
  seed('mobileStayGalleryCount', 'mobileStayHero', 'span', 'Gallery image count',
    leaf({ h: 28, w: 52 }), {
      className: 'figma-dom-mobile__gallery-count', text: '1 / 8',
    }),
  seed('mobileStayMain', 'mobileStayPage', 'main', 'Stay details',
    column({ gap: 12, h: 476, heightMode: 'fill', padding: 16, w: 390 }), {
      className: layoutClass('figma-dom-mobile__main figma-dom-mobile__detail-main'),
    }),
  seed('mobileStayTagRow', 'mobileStayMain', 'div', 'Stay badges',
    row({ gap: 8, h: 20, w: 358 }), {
      className: layoutClass('figma-dom-mobile__tag-row'),
    }),
  seed('mobileStayRating', 'mobileStayTagRow', 'strong', 'Stay rating',
    leaf({ h: 20, w: 116 }), { text: '★ 4.96 · 128' }),
  seed('mobileStayGuestFavourite', 'mobileStayTagRow', 'span',
    'Guest favourite badge', leaf({ h: 20, w: 104 }), {
      className: 'figma-dom-mobile__soft-tag', text: 'Guest favourite',
    }),
  seed('mobileStayTitle', 'mobileStayMain', 'h1', 'Stay title',
    leaf({ h: 34, w: 358, widthMode: 'fill' }), { text: 'Slow House, Jeju' }),
  seed('mobileStayLocation', 'mobileStayMain', 'p', 'Stay location',
    leaf({ h: 20, w: 358, widthMode: 'fill' }), {
      className: 'figma-dom-mobile__muted', text: 'Aewol-eup, Jeju · 12 min to the coast',
    }),
  seed('mobileStayHighlights', 'mobileStayMain', 'div', 'Stay highlights',
    row({ distribution: 'space-between', h: 48, padding: 8, radius: 14, w: 358 }), {
      className: layoutClass('figma-dom-mobile__highlights'),
    }),
  seed('mobileStayHighlightGuests', 'mobileStayHighlights', 'span',
    'Guest capacity', leaf({ h: 32, w: 96 }), { text: '2 guests\nPrivate stay' }),
  seed('mobileStayHighlightBeds', 'mobileStayHighlights', 'span',
    'Bed count', leaf({ h: 32, w: 96 }), { text: '2 beds\nLinen included' }),
  seed('mobileStayHighlightBath', 'mobileStayHighlights', 'span',
    'Bathroom count', leaf({ h: 32, w: 96 }), { text: '1 bath\nStone soaking tub' }),
  seed('mobileStayAbout', 'mobileStayMain', 'section', 'About this stay',
    column({ gap: 8, h: 84, w: 358 }), {
      className: layoutClass('figma-dom-mobile__copy-section'),
    }),
  seed('mobileStayAboutTitle', 'mobileStayAbout', 'h2', 'About heading',
    leaf({ h: 22, w: 358, widthMode: 'fill' }), { text: 'A quieter side of Jeju' }),
  seed('mobileStayAboutText', 'mobileStayAbout', 'p', 'About description',
    leaf({ h: 56, w: 358, widthMode: 'fill' }), {
      className: 'figma-dom-mobile__body-copy',
      text: 'A restored stone home with a small citrus garden, morning light and room to do very little.',
    }),
  seed('mobileStayHost', 'mobileStayMain', 'article', 'Host profile',
    row({ gap: 12, h: 64, padding: 12, radius: 16, w: 358 }), {
      className: layoutClass('figma-dom-mobile__host-card'),
    }),
  seed('mobileStayHostAvatar', 'mobileStayHost', 'div', 'Host avatar',
    leaf({ h: 40, w: 40 }), {
      className: 'figma-dom-mobile__host-avatar', text: 'S',
    }),
  seed('mobileStayHostCopy', 'mobileStayHost', 'div', 'Host details',
    column({ gap: 4, h: 38, w: 282 }), {
      className: layoutClass('figma-dom-mobile__host-copy'),
    }),
  seed('mobileStayHostName', 'mobileStayHostCopy', 'strong', 'Host name',
    leaf({ h: 18, w: 282, widthMode: 'fill' }), { text: 'Hosted by Sori' }),
  seed('mobileStayHostNote', 'mobileStayHostCopy', 'span', 'Host note',
    leaf({ h: 16, w: 282, widthMode: 'fill' }), {
      className: 'figma-dom-mobile__muted', text: 'Superhost · replies within an hour',
    }),
  seed('mobileStayReview', 'mobileStayMain', 'article', 'Featured review',
    column({ gap: 8, h: 92, padding: 12, radius: 16, w: 358 }), {
      className: layoutClass('figma-dom-mobile__review-card'),
    }),
  seed('mobileStayReviewTop', 'mobileStayReview', 'div', 'Review summary',
    row({ distribution: 'space-between', h: 18, w: 334 }), {
      className: layoutClass('figma-dom-mobile__review-top'),
    }),
  seed('mobileStayReviewHeading', 'mobileStayReviewTop', 'strong',
    'Review heading', leaf({ h: 18, w: 180 }), { text: 'A recent guest said' }),
  seed('mobileStayReviewScore', 'mobileStayReviewTop', 'span', 'Review score',
    leaf({ h: 18, w: 48 }), { text: '5.0 ★' }),
  seed('mobileStayReviewText', 'mobileStayReview', 'p', 'Review quote',
    leaf({ h: 34, w: 334, widthMode: 'fill' }), {
      className: 'figma-dom-mobile__body-copy',
      text: '“Even the rainy morning felt intentional here.”',
    }),
  seed('mobileStayReviewAuthor', 'mobileStayReview', 'span', 'Review author',
    leaf({ h: 16, w: 334, widthMode: 'fill' }), {
      className: 'figma-dom-mobile__muted', text: 'Minji · Seoul · June 2026',
    }),
  seed('mobileStayBottom', 'mobileStayPage', 'footer', 'Booking bar',
    row({ distribution: 'space-between', h: 68, padding: 16, w: 390 }), {
      className: layoutClass('figma-dom-mobile__booking-bar'),
    }),
  seed('mobileStayBottomPrice', 'mobileStayBottom', 'div', 'Booking price',
    column({ gap: 4, h: 40, w: 148 }), {
      className: layoutClass('figma-dom-mobile__booking-price'),
    }),
  seed('mobileStayBottomPriceValue', 'mobileStayBottomPrice', 'strong',
    'Booking price value', leaf({ h: 22, w: 148 }), { text: '₩218,000 / night' }),
  seed('mobileStayBottomPriceNote', 'mobileStayBottomPrice', 'span',
    'Booking price note', leaf({ h: 16, w: 148 }), {
      className: 'figma-dom-mobile__muted', text: 'Free cancellation until 17 Jul',
    }),
  seed('mobileStayBottomAction', 'mobileStayBottom', 'button', 'Reserve this stay',
    leaf({ h: 44, w: 132 }), {
      className: 'figma-dom-mobile__primary-action', text: 'Reserve',
    }),

  seed('mobileBookingPage', null, 'section', 'Mobile booking checkout',
    column({ h: 844, w: 390, widthMode: 'fixed' }), {
      className: 'figma-dom-mobile figma-dom-mobile--booking',
    }),
  seed('mobileBookingHeader', 'mobileBookingPage', 'header', 'Checkout header',
    row({ distribution: 'space-between', h: 64, padding: 16, w: 390 }), {
      className: layoutClass('figma-dom-mobile__header figma-dom-mobile__checkout-header'),
    }),
  seed('mobileBookingBack', 'mobileBookingHeader', 'button', 'Back to stay',
    leaf({ h: 36, w: 36 }), {
      className: 'figma-dom-mobile__plain-button', text: '←',
    }),
  seed('mobileBookingTitle', 'mobileBookingHeader', 'strong', 'Checkout title',
    leaf({ h: 24, w: 188 }), { text: 'Review and reserve' }),
  seed('mobileBookingSecure', 'mobileBookingHeader', 'span', 'Secure checkout',
    leaf({ h: 24, w: 56 }), {
      className: 'figma-dom-mobile__secure', text: 'Secure',
    }),
  seed('mobileBookingMain', 'mobileBookingPage', 'main', 'Checkout details',
    column({ gap: 12, h: 712, heightMode: 'fill', padding: 20, w: 390 }), {
      className: layoutClass('figma-dom-mobile__main figma-dom-mobile__checkout-main'),
    }),
  seed('mobileBookingStay', 'mobileBookingMain', 'article', 'Selected stay',
    row({ gap: 12, h: 100, padding: 12, radius: 16, w: 350 }), {
      className: layoutClass('figma-dom-mobile__checkout-stay'),
    }),
  seed('mobileBookingStayImage', 'mobileBookingStay', 'div', 'Selected stay image',
    leaf({ h: 76, w: 92 }), {
      className: 'figma-dom-mobile__checkout-image',
    }),
  seed('mobileBookingStayCopy', 'mobileBookingStay', 'div', 'Selected stay details',
    column({ gap: 4, h: 66, w: 226 }), {
      className: layoutClass('figma-dom-mobile__checkout-copy'),
    }),
  seed('mobileBookingStayEyebrow', 'mobileBookingStayCopy', 'span',
    'Selected stay type', leaf({ h: 14, w: 226, widthMode: 'fill' }), {
      className: 'figma-dom-mobile__eyebrow', text: 'PRIVATE HOUSE · JEJU',
    }),
  seed('mobileBookingStayName', 'mobileBookingStayCopy', 'strong',
    'Selected stay name', leaf({ h: 22, w: 226, widthMode: 'fill' }), {
      text: 'Slow House, Jeju',
    }),
  seed('mobileBookingStayMeta', 'mobileBookingStayCopy', 'span',
    'Selected stay rating', leaf({ h: 18, w: 226, widthMode: 'fill' }), {
      className: 'figma-dom-mobile__muted', text: '★ 4.96 · Guest favourite',
    }),
  seed('mobileBookingTripTitle', 'mobileBookingMain', 'h2', 'Trip details heading',
    leaf({ h: 24, w: 350, widthMode: 'fill' }), { text: 'Your trip' }),
  seed('mobileBookingDates', 'mobileBookingMain', 'div', 'Booking dates',
    row({ distribution: 'space-between', h: 56, padding: 12, radius: 12, w: 350 }), {
      className: layoutClass('figma-dom-mobile__detail-row'),
    }),
  seed('mobileBookingDatesCopy', 'mobileBookingDates', 'div', 'Booking date details',
    column({ gap: 4, h: 32, w: 248 }), {
      className: layoutClass('figma-dom-mobile__detail-copy'),
    }),
  seed('mobileBookingDatesLabel', 'mobileBookingDatesCopy', 'strong',
    'Booking dates label', leaf({ h: 16, w: 248, widthMode: 'fill' }), { text: 'Dates' }),
  seed('mobileBookingDatesValue', 'mobileBookingDatesCopy', 'span',
    'Booking dates value', leaf({ h: 16, w: 248, widthMode: 'fill' }), {
      className: 'figma-dom-mobile__muted', text: '19–21 July 2026 · 2 nights',
    }),
  seed('mobileBookingDatesEdit', 'mobileBookingDates', 'button', 'Edit booking dates',
    leaf({ h: 28, w: 48 }), {
      className: 'figma-dom-mobile__text-action', text: 'Edit',
    }),
  seed('mobileBookingGuests', 'mobileBookingMain', 'div', 'Booking guests',
    row({ distribution: 'space-between', h: 56, padding: 12, radius: 12, w: 350 }), {
      className: layoutClass('figma-dom-mobile__detail-row'),
    }),
  seed('mobileBookingGuestsCopy', 'mobileBookingGuests', 'div', 'Booking guest details',
    column({ gap: 4, h: 32, w: 248 }), {
      className: layoutClass('figma-dom-mobile__detail-copy'),
    }),
  seed('mobileBookingGuestsLabel', 'mobileBookingGuestsCopy', 'strong',
    'Booking guests label', leaf({ h: 16, w: 248, widthMode: 'fill' }), { text: 'Guests' }),
  seed('mobileBookingGuestsValue', 'mobileBookingGuestsCopy', 'span',
    'Booking guests value', leaf({ h: 16, w: 248, widthMode: 'fill' }), {
      className: 'figma-dom-mobile__muted', text: '2 adults',
    }),
  seed('mobileBookingGuestsEdit', 'mobileBookingGuests', 'button', 'Edit guests',
    leaf({ h: 28, w: 48 }), {
      className: 'figma-dom-mobile__text-action', text: 'Edit',
    }),
  seed('mobileBookingPriceTitle', 'mobileBookingMain', 'h2', 'Price details heading',
    leaf({ h: 24, w: 350, widthMode: 'fill' }), { text: 'Price details' }),
  seed('mobileBookingNightlyRow', 'mobileBookingMain', 'div', 'Nightly price row',
    row({ distribution: 'space-between', h: 24, w: 350 }), {
      className: layoutClass('figma-dom-mobile__cost-row'),
    }),
  seed('mobileBookingNightlyLabel', 'mobileBookingNightlyRow', 'span',
    'Nightly price label', leaf({ h: 24, w: 240 }), { text: '₩218,000 × 2 nights' }),
  seed('mobileBookingNightlyValue', 'mobileBookingNightlyRow', 'span',
    'Nightly price value', leaf({ h: 24, w: 100 }), { text: '₩436,000' }),
  seed('mobileBookingCleaningRow', 'mobileBookingMain', 'div', 'Cleaning fee row',
    row({ distribution: 'space-between', h: 24, w: 350 }), {
      className: layoutClass('figma-dom-mobile__cost-row'),
    }),
  seed('mobileBookingCleaningLabel', 'mobileBookingCleaningRow', 'span',
    'Cleaning fee label', leaf({ h: 24, w: 240 }), { text: 'Cleaning fee' }),
  seed('mobileBookingCleaningValue', 'mobileBookingCleaningRow', 'span',
    'Cleaning fee value', leaf({ h: 24, w: 100 }), { text: '₩42,000' }),
  seed('mobileBookingServiceRow', 'mobileBookingMain', 'div', 'Service fee row',
    row({ distribution: 'space-between', h: 24, w: 350 }), {
      className: layoutClass('figma-dom-mobile__cost-row'),
    }),
  seed('mobileBookingServiceLabel', 'mobileBookingServiceRow', 'span',
    'Service fee label', leaf({ h: 24, w: 240 }), { text: 'Service fee' }),
  seed('mobileBookingServiceValue', 'mobileBookingServiceRow', 'span',
    'Service fee value', leaf({ h: 24, w: 100 }), { text: '₩26,000' }),
  seed('mobileBookingTotalRow', 'mobileBookingMain', 'div', 'Booking total row',
    row({ distribution: 'space-between', h: 44, w: 350 }), {
      className: layoutClass('figma-dom-mobile__total-row'),
    }),
  seed('mobileBookingTotalLabel', 'mobileBookingTotalRow', 'strong',
    'Booking total label', leaf({ h: 24, w: 180 }), { text: 'Total (KRW)' }),
  seed('mobileBookingTotalValue', 'mobileBookingTotalRow', 'strong',
    'Booking total value', leaf({ h: 24, w: 116 }), { text: '₩504,000' }),
  seed('mobileBookingPaymentTitle', 'mobileBookingMain', 'h2',
    'Payment method heading', leaf({ h: 24, w: 350, widthMode: 'fill' }), {
      text: 'Pay with',
    }),
  seed('mobileBookingPayment', 'mobileBookingMain', 'div', 'Payment method',
    row({ gap: 12, h: 60, padding: 12, radius: 12, w: 350 }), {
      className: layoutClass('figma-dom-mobile__payment-card'),
    }),
  seed('mobileBookingPaymentIcon', 'mobileBookingPayment', 'span',
    'Payment card icon', leaf({ h: 32, w: 44 }), {
      className: 'figma-dom-mobile__card-icon', text: 'VISA',
    }),
  seed('mobileBookingPaymentCopy', 'mobileBookingPayment', 'div',
    'Payment card details', column({ gap: 4, h: 36, w: 250 }), {
      className: layoutClass('figma-dom-mobile__payment-copy'),
    }),
  seed('mobileBookingPaymentLabel', 'mobileBookingPaymentCopy', 'strong',
    'Payment card label', leaf({ h: 18, w: 250, widthMode: 'fill' }), {
      text: 'Visa ending in 2048',
    }),
  seed('mobileBookingPaymentValue', 'mobileBookingPaymentCopy', 'span',
    'Payment card expiry', leaf({ h: 15, w: 250, widthMode: 'fill' }), {
      className: 'figma-dom-mobile__muted', text: 'Expires 08/29',
    }),
  seed('mobileBookingNote', 'mobileBookingMain', 'p', 'Cancellation note',
    leaf({ h: 36, w: 350, widthMode: 'fill' }), {
      className: 'figma-dom-mobile__booking-note',
      text: 'Free cancellation before 6:00 PM on 17 July. After that, the first night is non-refundable.',
    }),
  seed('mobileBookingBottom', 'mobileBookingPage', 'footer', 'Checkout action bar',
    row({ gap: 12, h: 68, padding: 16, w: 390 }), {
      className: layoutClass('figma-dom-mobile__booking-bar'),
    }),
  seed('mobileBookingTerms', 'mobileBookingBottom', 'span', 'Booking terms note',
    leaf({ h: 36, w: 194 }), {
      className: 'figma-dom-mobile__muted', text: 'You won’t be charged until you confirm.',
    }),
  seed('mobileBookingAction', 'mobileBookingBottom', 'button', 'Confirm reservation',
    leaf({ h: 44, w: 152 }), {
      className: 'figma-dom-mobile__primary-action', text: 'Confirm · ₩504k',
    }),
] as const

export type FigmaMobileTravelDesignNodeId =
  typeof MOBILE_TRAVEL_NODE_SEEDS[number]['id']

export type FigmaMobileTravelComponentDefinitionId =
  'mobile-travel-featured-stay-card'

export const FIGMA_MOBILE_TRAVEL_COMPONENT_METADATA = [{
  id: 'mobile-travel-featured-stay-card',
  label: 'Featured stay card',
  syncDescription:
    'Named slots remain selectable while the React component owns their arrangement.',
  instances: [{
    id: 'mobileExploreFeaturedCard',
    label: 'Slow House, Jeju',
    slots: {
      root: 'mobileExploreFeaturedCard',
      image: 'mobileExploreFeaturedImage',
      tag: 'mobileExploreFeaturedTag',
      favorite: 'mobileExploreFavorite',
      content: 'mobileExploreFeaturedInfo',
      type: 'mobileExploreFeaturedType',
      title: 'mobileExploreFeaturedTitle',
      meta: 'mobileExploreFeaturedMeta',
      priceRow: 'mobileExploreFeaturedPriceRow',
      price: 'mobileExploreFeaturedPrice',
      priceNote: 'mobileExploreFeaturedPriceNote',
    },
  }],
}] as const

export const FIGMA_MOBILE_TRAVEL_ROOT_IDS = [
  'mobileExplorePage',
  'mobileStayPage',
  'mobileBookingPage',
] as const satisfies readonly FigmaMobileTravelDesignNodeId[]

const MOBILE_TRAVEL_FRAME_POSITIONS = {
  mobileExplorePage: { x: 3008, y: 76 },
  mobileStayPage: { x: 3430, y: 76 },
  mobileBookingPage: { x: 3852, y: 76 },
} as const

const MOBILE_TRAVEL_COMPONENT_BINDING_BY_NODE_ID = new Map<
  FigmaMobileTravelDesignNodeId,
  DesignNodeComponentBinding
>(
  Object.entries(
    FIGMA_MOBILE_TRAVEL_COMPONENT_METADATA[0].instances[0].slots,
  ).map(([slotId, nodeId]) => [
    nodeId as FigmaMobileTravelDesignNodeId,
    Object.freeze({
      definitionId: FIGMA_MOBILE_TRAVEL_COMPONENT_METADATA[0].id,
      instanceId: FIGMA_MOBILE_TRAVEL_COMPONENT_METADATA[0].instances[0].id,
      slotId,
    }) satisfies DesignNodeComponentBinding,
  ]),
)

export const FIGMA_MOBILE_TRAVEL_DESIGN_DOCUMENT_NODES =
  createMobileTravelNodes()

function createMobileTravelNodes(): readonly DesignNode[] {
  return MOBILE_TRAVEL_NODE_SEEDS.map((nodeSeed) => {
    const props: DesignJSONObject = {
      ...(nodeSeed.className ? { className: nodeSeed.className } : {}),
      ...(nodeSeed.intrinsic === 'button' ? { type: 'button' } : {}),
    }
    const framePosition = nodeSeed.parentId === null
      ? MOBILE_TRAVEL_FRAME_POSITIONS[
          nodeSeed.id as keyof typeof MOBILE_TRAVEL_FRAME_POSITIONS
        ]
      : null
    const component = MOBILE_TRAVEL_COMPONENT_BINDING_BY_NODE_ID.get(
      nodeSeed.id,
    ) ?? null

    return {
      id: nodeSeed.id,
      label: nodeSeed.label,
      definition: component?.slotId === 'root'
        ? { kind: 'component', id: component.definitionId }
        : { kind: 'intrinsic', id: nodeSeed.intrinsic },
      children: MOBILE_TRAVEL_NODE_SEEDS
        .filter((candidate) => candidate.parentId === nodeSeed.id)
        .map((candidate) => candidate.id),
      props,
      text: nodeSeed.text ?? null,
      layout: createFigmaDesignNodeLayout(nodeSeed.state),
      style: createFigmaDesignNodeStyle(nodeSeed.state),
      frame: framePosition
        ? {
            ...framePosition,
            width: 390,
            height: 844,
            rotation: 0,
            widthMode: 'fixed',
            heightMode: 'fixed',
            overflow: 'clip',
          }
        : null,
      component,
    }
  })
}
