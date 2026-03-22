import { aboutContent, homeContent, productLayers } from '@/content/siteContent';

export type FeaturedRailVisual = 'ai' | 'ems' | 'tms' | 'proof' | 'global';

export type FeaturedRailStat = {
  value: string;
  label: string;
};

export type FeaturedRailItem = {
  id: string;
  tabLabel: string;
  label: string;
  title: string;
  summary: string;
  kicker?: string;
  href: string;
  visual: FeaturedRailVisual;
  stats?: readonly FeaturedRailStat[];
  imageSrc?: string;
};

export type HomeEvidenceItem = {
  id: string;
  kind: 'stat' | 'detail';
  label: string;
  title: string;
  body?: string;
};

const productHrefMap: Record<string, string> = {
  'farmers-mind-ai': '/services#farmers-mind-ai',
  'farmers-mind-ems': '/services#farmers-mind-ems',
  'farmers-mind-tms': '/tms',
};

export const homePresentation = {
  heroPanels: homeContent.hero.sideItems.map((label, index) => ({
    id: `hero-panel-${index + 1}`,
    number: `0${index + 1}`,
    label,
  })),
  featuredIntro: homeContent.problem,
  bigStatement: {
    title: homeContent.thesis.title,
    body: homeContent.thesis.body,
  },
  featuredRail: [
    {
      id: productLayers[0].id,
      tabLabel: 'AI',
      label: productLayers[0].tagline,
      title: productLayers[0].name,
      summary: productLayers[0].description,
      kicker: productLayers[0].detail,
      href: productHrefMap[productLayers[0].id],
      visual: 'ai',
    },
    {
      id: productLayers[1].id,
      tabLabel: 'EMS',
      label: productLayers[1].tagline,
      title: productLayers[1].name,
      summary: productLayers[1].description,
      kicker: productLayers[1].detail,
      href: productHrefMap[productLayers[1].id],
      visual: 'ems',
    },
    {
      id: productLayers[2].id,
      tabLabel: 'TMS',
      label: productLayers[2].tagline,
      title: productLayers[2].name,
      summary: productLayers[2].description,
      kicker: productLayers[2].detail,
      href: productHrefMap[productLayers[2].id],
      visual: 'tms',
      imageSrc: '/tms_1_web.png',
    },
    {
      id: 'proof',
      tabLabel: 'PROOF',
      label: '실제 운영 구조',
      title: homeContent.proof.title,
      summary: homeContent.proof.body,
      kicker: homeContent.proof.items[0].body,
      href: '#proof-wall',
      visual: 'proof',
      stats: homeContent.proofBar,
    },
    {
      id: 'global',
      tabLabel: 'GLOBAL',
      label: '글로벌 확장 모델',
      title: homeContent.globalExpansion.title,
      summary: homeContent.globalExpansion.body,
      kicker: homeContent.globalExpansion.markers[0].label,
      href: '#proof-wall',
      visual: 'global',
      stats: homeContent.globalExpansion.markers,
    },
  ] satisfies FeaturedRailItem[],
  newsIntro: aboutContent.newsroom,
  offeringsIntro: homeContent.thesis,
  offerings: productLayers.map((layer) => ({
    ...layer,
    href: productHrefMap[layer.id],
  })),
  impact: homeContent.impact,
  manifesto: homeContent.longTermVision,
  quickLinksIntro: homeContent.longTermVision,
  quickLinks: [
    {
      label: '회사소개',
      href: '/about',
      body: aboutContent.hero.body,
    },
    {
      label: '플랫폼',
      href: '/services',
      body: homeContent.thesis.body,
    },
    {
      label: '뉴스룸',
      href: '/newsroom',
      body: aboutContent.newsroom.body,
    },
    {
      label: '인재영입',
      href: '/careers',
      body: aboutContent.finalCta.cards[1].body,
    },
  ],
  proofWall: {
    intro: homeContent.proof,
    featured: homeContent.globalExpansion,
    cards: homeContent.proof.items,
    metrics: homeContent.proofBar,
    partnerIntro: aboutContent.partners,
  },
  evidenceGrid: [
    ...homeContent.proofBar.map((item) => ({
      id: `proof-stat-${item.label}`,
      kind: 'stat' as const,
      label: item.label,
      title: item.value,
    })),
    ...homeContent.globalExpansion.markers.map((item) => ({
      id: `global-stat-${item.label}`,
      kind: 'stat' as const,
      label: item.label,
      title: item.value,
    })),
    ...homeContent.proof.items.map((item) => ({
      id: `proof-detail-${item.title}`,
      kind: 'detail' as const,
      label: item.title,
      title: item.title,
      body: item.body,
    })),
    ...homeContent.impact.items.map((item) => ({
      id: `impact-detail-${item.title}`,
      kind: 'detail' as const,
      label: item.title,
      title: item.title,
      body: item.body,
    })),
  ] satisfies HomeEvidenceItem[],
} as const;
