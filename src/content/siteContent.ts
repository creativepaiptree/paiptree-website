export const navigationItems = [
  { label: '회사소개', href: '/about' },
  { label: '플랫폼', href: '/services' },
  { label: '제품', href: '/services#product-layers' },
  { label: '조직문화', href: '/culture' },
  { label: '뉴스룸', href: '/newsroom' },
  { label: '인재영입', href: '/careers' },
] as const;

export const footerColumns = [
  {
    title: 'COMPANY',
    links: [
      { label: '회사소개', href: '/about' },
      { label: '조직문화', href: '/culture' },
      { label: '인재영입', href: '/careers' },
      { label: '뉴스룸', href: '/newsroom' },
    ],
  },
  {
    title: 'PLATFORM',
    links: [
      { label: '플랫폼 개요', href: '/services' },
      { label: 'Farmers Mind AI', href: '/services#farmers-mind-ai' },
      { label: 'Farmers Mind EMS', href: '/services#farmers-mind-ems' },
      { label: 'Farmers Mind TMS', href: '/tms' },
    ],
  },
  {
    title: 'THESIS',
    links: [
      { label: '운영 가시화', href: '/#featured' },
      { label: '제품 시스템', href: '/#offerings' },
      { label: '운영 임팩트', href: '/#impact' },
      { label: '글로벌 확장', href: '/#proof-wall' },
    ],
  },
  {
    title: 'CONTACT',
    links: [
      { label: '도입 문의', href: 'mailto:hello@paiptree.com', external: true },
      { label: '채용 문의', href: 'mailto:team@paiptree.com', external: true },
      { label: '미디어 문의', href: 'mailto:press@paiptree.com', external: true },
    ],
  },
] as const;

export const partnerLogos = [
  { name: '디캠프', src: '/partners/1.디캠프.png', width: 240 },
  { name: '아산나눔재단', src: '/partners/2.아산나눔재단.png', width: 280 },
  { name: '건국대학교', src: '/partners/3.건국대학교.png', width: 260 },
  { name: 'KCAV', src: '/partners/4.kcav.png', width: 200 },
  { name: 'CJ', src: '/partners/5.씨제이.png', width: 240 },
  { name: 'SK', src: '/partners/6.sk.png', width: 210 },
  { name: '체리부로', src: '/partners/7.체리부로.png', width: 240 },
  { name: 'KGB', src: '/partners/8.KGB.png', width: 200 },
  { name: '신우F&S', src: '/partners/9.신우.png', width: 200 },
  { name: '금화', src: '/partners/10.금화.png', width: 220 },
  { name: '아임닭', src: '/partners/11.아임닭.png', width: 200 },
  { name: '한라씨에프엔', src: '/partners/12.한라씨에프엔.png', width: 280 },
  { name: '아프', src: '/partners/13.아프.png', width: 180 },
  { name: '창젠', src: '/partners/14.창젠.png', width: 200 },
  { name: '니폰산소', src: '/partners/15.니폰산소.png', width: 240 },
  { name: '크라운', src: '/partners/16.크라운.png', width: 220 },
  { name: '인비소', src: '/partners/17.인비소.png', width: 200 },
  { name: '동서', src: '/partners/18.동서.png', width: 180 },
  { name: '에임비랩', src: '/partners/19.에임비랩.png', width: 240 },
  { name: '금계', src: '/partners/20.금계.png', width: 200 },
] as const;

export const productLayers = [
  {
    id: 'farmers-mind-ai',
    name: 'Farmers Mind AI',
    tagline: '현장을 실시간으로 보는 레이어',
    description:
      'CCTV와 센서, 현장 입력 데이터를 바탕으로 농장의 상태를 가시화하고 운영자가 더 빠르게 판단하게 만듭니다.',
    detail:
      '평균 중량, 환경, 생존율, 출하 준비 상태를 한 흐름으로 읽게 하는 농장 운영 플랫폼입니다.',
  },
  {
    id: 'farmers-mind-ems',
    name: 'Farmers Mind EMS',
    tagline: '기업 운영을 통합하는 레이어',
    description:
      '여러 농장의 상태를 본사 관점에서 통합하고, 생산관리, 출하 판단, 정산, 영상 관제, 품질 관리까지 운영 콘솔로 연결합니다.',
    detail:
      '현장 데이터를 기업의 생산관리 언어로 바꾸는 본사 운영 플랫폼입니다.',
  },
  {
    id: 'farmers-mind-tms',
    name: 'Farmers Mind TMS',
    tagline: '공급망 실행을 움직이는 레이어',
    description:
      '주문 등록, 자동 배차, 실시간 차량 관제, ETA, 기사 증빙 업로드를 연결해 출하와 운송을 실제로 움직이는 시스템으로 만듭니다.',
    detail:
      '출하와 이동 실행을 실제 운영 체계로 묶는 독립 상용 TMS입니다.',
  },
] as const;

export const fallbackNewsItems = [
  {
    id: 'fallback-1',
    title: '파이프트리는 물류 자동화와 공급망 실행까지 제품 범위를 확장하고 있습니다.',
    description:
      '농장 내부 데이터에서 끝나지 않고 출하와 배차, 이동 실행까지 연결하는 방향으로 제품 포트폴리오를 확장하고 있습니다.',
    category: 'PRODUCT',
    upload_date: '2026-03-08',
    original_url: '/newsroom',
  },
  {
    id: 'fallback-2',
    title: '한국에서 검증한 운영 구조를 글로벌 양계 가치사슬로 확장하고 있습니다.',
    description:
      '단순 설비 수출이 아니라 농장 데이터 연결 구조와 운영 플랫폼을 다른 국가의 양계 가치사슬에 이식하는 모델을 추진합니다.',
    category: 'GLOBAL',
    upload_date: '2026-03-08',
    original_url: '/newsroom',
  },
  {
    id: 'fallback-3',
    title: '파이프트리는 실제 운영과 계약, 해외 실증 위에서 제품을 고도화해 왔습니다.',
    description:
      '개념 검증이 아니라 국내 운영 농장, 기업 계약, 해외 실증과 공급망 자료 위에서 운영 인프라를 다듬고 있습니다.',
    category: 'PROOF',
    upload_date: '2026-03-08',
    original_url: '/newsroom',
  },
] as const;

export const homeContent = {
  hero: {
    eyebrow: 'AI OPERATING INFRASTRUCTURE FOR POULTRY',
    title: '양계 산업의 불확실성을\n운영 가능한 데이터로 바꿉니다',
    body:
      '파이프트리는 카메라, 영상, 센서, 운영 데이터를 기반으로 농장의 성장 상태를 실시간으로 가시화하고, 기업의 생산관리와 출하 판단, 물류 실행까지 연결하는 AI 운영 인프라를 만듭니다.',
    primaryCta: { label: '플랫폼 보기', href: '/services' },
    secondaryCta: { label: '도입 문의하기', href: 'mailto:hello@paiptree.com', external: true },
    sideLabel: 'OPERATING STACK',
    sideItems: [
      '현장 가시화',
      '기업 운영 판단',
      '출하·배차 실행',
      '글로벌 확장 모델',
    ],
  },
  proofBar: [
    { value: '360개', label: '국내 운영 농장' },
    { value: '30억+', label: '누적 데이터' },
    { value: '92%+', label: '중량예측 정확도' },
    { value: '6개국', label: '기술이전' },
  ],
  problem: {
    title: '양계 산업의 문제는 생산보다\n운영 흐름이 보이지 않는다는 데 있습니다',
    body:
      '농장 운영자는 지금 닭이 얼마나 자랐는지, 언제 출하 준비가 끝나는지, 어떤 이상 신호가 있는지를 늦게 알게 됩니다. 기업은 여러 농장의 상태를 한 번에 보지 못해 생산 계획과 출하 계획이 뒤로 밀리고, 공급망은 그 늦은 정보를 바탕으로 배차와 도계 일정을 맞추느라 더 큰 비효율을 감수하게 됩니다.',
  },
  thesis: {
    title: '한 농장을 더 잘 보는 기술에서 시작해\n양계 산업 전체의 운영 판단을 바꾸고 있습니다',
    body:
      '파이프트리는 실시간 중량예측과 이상감지로 현장을 가시화하고, 그 데이터를 기업 운영 언어로 바꾸며, 출하와 배차 같은 실행 단계까지 연결합니다. 농장, 본사, 도계장, 운수업체, 유통 파트너가 각자 다른 도구와 늦은 정보로 움직이는 구조를 하나의 운영 시스템으로 바꾸는 것이 파이프트리의 방향입니다.',
  },
  impact: {
    title: '파이프트리가 만드는 것은 리포트가 아니라\n더 빠르고 정확한 운영 판단입니다',
    items: [
      {
        title: 'For Farms',
        body:
          '운영자는 지금 농장에서 무슨 일이 일어나고 있는지 더 빠르게 파악하고, 출하 판단과 일상 운영의 불확실성을 줄일 수 있습니다.',
      },
      {
        title: 'For Headquarters',
        body:
          '기업은 여러 농장을 하나의 운영 시야로 통합해 보고, 생산 계획과 품질 관리, 출하 준비를 더 체계적으로 운영할 수 있습니다.',
      },
      {
        title: 'For Supply Chain',
        body:
          '배차와 운송, 이동 상태, 증빙과 정산 전 데이터 흐름이 연결되면서 공급망 실행의 지연과 비효율을 줄일 수 있습니다.',
      },
    ],
  },
  proof: {
    title: '이미 운영되고 있는 시스템 위에서\n더 큰 비전을 확장하고 있습니다',
    body:
      '파이프트리는 개념 수준의 실험이 아니라, 실제 농장 운영, 실제 기업 계약, 실제 공급망 확장, 실제 해외 실증 위에서 제품을 고도화해 왔습니다.',
    items: [
      {
        title: '국내 운영',
        body:
          '국내 360개 농장에서 시스템이 운영되고 있으며, 체리부로와 신우F&S 같은 FMG 계약 운영 사례가 확인됩니다.',
      },
      {
        title: '해외 확장',
        body:
          '마다가스카르에서는 12,000수 규모 스마트팜 구축과 18개월 독립 운영 구조가 확인됩니다.',
      },
      {
        title: '공급망 실행',
        body:
          'TMS 운영 자료와 물류 협력 사례를 통해 파이프트리가 생산 이후의 실행 문제까지 실제 제품으로 다루고 있음을 보여 줍니다.',
      },
    ],
  },
  globalExpansion: {
    title: '한국에서 검증한 운영 구조를\n글로벌 양계 가치사슬로 확장합니다',
    body:
      '파이프트리의 글로벌 전략은 단순 설비 수출이 아닙니다. 한국에서 검증한 농장 데이터 연결 구조와 운영 플랫폼을 다른 국가의 양계 가치사슬에 이식하는 것입니다. 생산성 향상만이 아니라 품질 표준화, 출하 예측, 공급망 연계, 운영 전문성 보완까지 함께 수출하는 모델입니다.',
    markers: [
      { value: '6개국', label: '기술이전 국가' },
      { value: '12,000수', label: '마다가스카르 구축 규모' },
      { value: '18개월', label: '독립 운영 구조' },
    ],
  },
  longTermVision: {
    title: 'From farm visibility to food intelligence',
    body:
      '파이프트리의 장기 목표는 농장 단위의 평균 중량을 맞히는 데 있지 않습니다. 병아리 수요, 성장 완료 시점, 출하량, 도계 일정, 차량 배차, 수율, 유통 흐름까지 예측 가능한 체계를 만드는 것이 목표입니다.',
  },
  finalCta: {
    title: '양계 산업의 운영을\n더 투명하고 예측 가능하게',
    cards: [
      {
        label: '도입 문의하기',
        href: 'mailto:hello@paiptree.com',
        external: true,
        tone: 'dark',
        body: '농장, 본사, 공급망을 어떻게 연결할지 현재 운영 구조에 맞춰 함께 검토합니다.',
      },
      {
        label: '서비스 자세히 보기',
        href: '/services',
        tone: 'light',
        body: '세 개의 제품 레이어가 어떤 흐름으로 연결되는지 플랫폼 관점에서 확인해보세요.',
      },
    ],
  },
} as const;

export const aboutContent = {
  hero: {
    eyebrow: 'AI Operating Infrastructure for Poultry',
    title: '양계 산업의 불확실성을\n운영 가능한 데이터로 바꿉니다',
    body:
      '파이프트리는 농장의 상태를 실시간으로 가시화하고, 기업의 생산관리와 출하 판단, 공급망 실행까지 연결하는 AI 운영 인프라를 만듭니다. Farmers Mind AI, Farmers Mind EMS, Farmers Mind TMS를 통해 현장, 본사, 공급망이 하나의 시스템처럼 이어집니다.',
    primaryCta: { label: '플랫폼 보기', href: '/services' },
    secondaryCta: { label: '더 알아보기', href: '/about#capabilities' },
  },
  stats: [
    { value: '22.63%', label: 'DOMESTIC FARM COVERAGE' },
    { value: '20+', label: 'PARTNERS & CLIENTS' },
    { value: '4', label: 'ACTIVE COUNTRIES' },
    { value: '3', label: 'CORE PRODUCT LAYERS' },
  ],
  capabilities: {
    title: '파이프트리는 양계 운영의 핵심 의사결정을\n더 빠르고 더 정확하게 만듭니다',
    lead:
      '중량 예측, 사료 운영, 공급 계획, 실행 관제, 추적 가능성까지. 파이프트리는 개별 기능을 나열하는 대신 양계 산업의 운영 흐름 전체를 더 예측 가능하게 만드는 방향으로 제품을 설계합니다.',
    items: [
      {
        title: 'WEIGHT FORECAST',
        subtitle: 'AI가 일령별 체중과 출하량을 예측',
        body:
          '카메라와 운영 데이터를 기반으로 평균 중량과 성장 추세를 예측해 운영자가 출하 준비 시점과 관리 우선순위를 더 빠르게 판단하게 합니다.',
      },
      {
        title: 'ANOMALY & FCR',
        subtitle: '이상 신호와 사료 효율을 함께 읽어 운영 리스크를 줄임',
        body:
          '환경 변화와 이상 징후를 더 빠르게 포착하고, 사료 운영 효율을 함께 해석해 농장과 본사가 더 이른 시점에 대응할 수 있도록 돕습니다.',
      },
      {
        title: 'FEED WATCH',
        subtitle: '사료 흐름을 운영 데이터와 연결해 부족과 지연을 줄임',
        body:
          '사료 입출고와 사용 흐름을 운영 데이터와 연결해 재고 부족, 공급 지연, 계획 오류를 줄이고 더 안정적인 운영을 지원합니다.',
      },
      {
        title: 'SUPPLY COMMAND',
        subtitle: '생산, 출하, 배차 흐름을 하나의 운영 체계로 연결',
        body:
          '농장의 성장 상태와 본사 계획, 배차 실행 데이터를 연결해 생산과 공급망이 뒤늦은 정보가 아니라 연결된 판단 위에서 움직이게 만듭니다.',
      },
      {
        title: 'TRACE & TRUST',
        subtitle: '품질·이력·보고 흐름을 더 투명하게 관리',
        body:
          '운영 이력과 품질 데이터를 구조화해 추적 가능성과 보고 체계를 강화하고, 파트너와 고객에게 더 신뢰 가능한 운영 흐름을 제공합니다.',
      },
    ],
  },
  mission: {
    title: '양계 산업에는\n아직 연결되지 않은 운영 흐름이 많습니다',
    body:
      '양계 산업의 비효율은 농장 내부의 가시성 부족에서 시작해 기업 운영의 지연과 공급망 실행의 비효율로 이어집니다. 파이프트리는 이 단절을 데이터로 연결해 산업 전체의 의사결정을 더 정확하고 투명하게 만드는 회사를 지향합니다.',
  },
  partners: {
    title: '함께 운영 구조를 바꾸는\n산업 파트너 생태계',
    body:
      '파이프트리는 농장, 기업, 물류, 연구, 투자, 글로벌 파트너와 함께 실제 운영 현장에서 제품을 검증하고 확장해 왔습니다.',
  },
  newsroom: {
    title: '제품과 사업이 실제로 확장되는 흐름',
    body:
      '파트너십, 실증, 공급망 확장, 해외 프로젝트 등 파이프트리의 진행 상황을 확인할 수 있는 채널입니다.',
  },
  finalCta: {
    cards: [
      {
        label: '플랫폼 살펴보기',
        href: '/services',
        body: '현장, 본사, 공급망을 어떻게 연결하는지 더 자세히 확인해보세요.',
      },
      {
        label: '함께 만들어가기',
        href: '/careers',
        body: '양계 산업의 운영 체계를 다시 설계하는 일에 함께할 인재를 찾고 있습니다.',
      },
    ],
  },
} as const;

export const servicesContent = {
  hero: {
    eyebrow: 'PAIPTREE PLATFORM',
    title: '양계 밸류체인을 연결하는\nAI 운영 플랫폼',
    body:
      '파이프트리는 농장, 기업 운영, 공급망 실행을 단일 데이터 흐름으로 연결합니다. 세 개의 제품 레이어가 협력해 양계 산업의 의사결정을 더 빠르고 더 정확하게 만듭니다.',
  },
  overview: {
    title: 'Three products. One operating system for poultry.',
    body:
      '현장에서는 농장의 상태를 실시간으로 보고, 본사에서는 여러 농장의 운영을 통합해 판단하며, 공급망에서는 실제 출하와 배차, 이동을 실행합니다. 파이프트리는 이 세 단계를 하나의 데이터 흐름으로 연결합니다.',
  },
  finalCta: {
    cards: [
      {
        label: '도입 상담 요청',
        href: 'mailto:hello@paiptree.com',
        external: true,
        body: '전문 팀이 농장 환경과 운영 구조에 맞는 최적의 플랫폼 구성을 제안합니다.',
      },
      {
        label: '함께 만들어가기',
        href: '/careers',
        body: '현장, 본사, 공급망을 하나의 시스템으로 연결하는 문제를 함께 풀 인재를 찾고 있습니다.',
      },
    ],
  },
} as const;

export const cultureContent = {
  hero: {
    eyebrow: 'PAIPTREE CULTURE',
    title: '우리는 농업 기능을 만드는 팀이 아니라\n산업 운영 체계를 다시 설계하는 팀입니다',
    body:
      '파이프트리는 농장, 본사, 공급망이 서로 다른 정보로 움직이는 구조를 연결된 시스템으로 바꾸고 있습니다. 이 팀에서의 일은 기능 구현보다 산업의 운영 문제를 더 정확하게 정의하고 해결하는 일에 가깝습니다.',
  },
  principles: [
    {
      title: '기능보다 운영 구조를 본다',
      body:
        '개별 기능의 화려함보다 농장과 본사, 공급망 사이에 어떤 단절이 있는지 먼저 정의합니다.',
    },
    {
      title: '도구보다 시스템을 만든다',
      body:
        '현장 가시화, 기업 운영, 공급망 실행이 따로 놀지 않도록 하나의 흐름으로 연결하는 방식을 우선합니다.',
    },
    {
      title: '개념보다 실제 운영을 중시한다',
      body:
        '실제 농장 운영, 실제 기업 계약, 실제 해외 실증과 같은 현실의 문제 위에서 제품을 고도화합니다.',
    },
  ],
  workTracks: [
    {
      title: '현장을 이해하는 일',
      body:
        '농장 내부의 상태를 더 정확하게 읽고 예측하는 문제를 기술과 데이터로 다룹니다.',
    },
    {
      title: '운영을 연결하는 일',
      body:
        '본사의 생산관리, 출하 판단, 품질 관리를 현장 데이터와 이어 운영 콘솔로 바꿉니다.',
    },
    {
      title: '실행을 움직이는 일',
      body:
        '출하와 배차, 차량 이동, 증빙과 정산 전 단계가 연결되도록 실행 시스템을 설계합니다.',
    },
  ],
  finalCta: {
    label: '채용 공고 보기',
    href: '/careers',
    body: '산업 운영 인프라를 함께 만드는 팀에서 일하고 싶다면 채용 페이지를 확인해보세요.',
  },
} as const;

export const careersContent = {
  hero: {
    eyebrow: 'PAIPTREE CAREERS',
    title: '양계 산업의 운영을 다시 설계하는 일에\n함께할 사람을 찾습니다',
    body:
      '파이프트리는 현장 가시화, 기업 운영, 공급망 실행을 하나의 시스템으로 연결하고 있습니다. 스마트팜을 넘어 산업 운영 인프라를 만드는 일에 관심 있는 사람에게 이 회사는 더 큰 문제를 풀 수 있는 환경이 됩니다.',
  },
  tracks: [
    {
      title: 'AI / Data',
      body:
        '실시간 중량예측, 이상감지, 품질 판정, 운영 예측 모델을 더 정교하게 만드는 역할이 필요합니다.',
    },
    {
      title: 'Product / Operations',
      body:
        '농장, 본사, 운수업체가 실제로 어떻게 일하는지 이해하고 운영 흐름을 제품 구조로 바꾸는 역할이 필요합니다.',
    },
    {
      title: 'Platform Engineering',
      body:
        '모바일, 웹 콘솔, 데이터 파이프라인, 실행 시스템을 안정적인 서비스 구조로 묶는 역할이 필요합니다.',
    },
  ],
  finalCta: {
    primary: { label: '이력서 보내기', href: 'mailto:team@paiptree.com', external: true },
    secondary: { label: '조직문화 보기', href: '/culture' },
  },
} as const;

export const newsroomContent = {
  hero: {
    eyebrow: 'PAIPTREE NEWSROOM',
    title: '보도자료 모음이 아니라\n회사의 진행 상황을 보여 주는 proof channel',
    body:
      '파트너십, 제품 확장, 공급망 실행, 글로벌 프로젝트 등 파이프트리가 실제로 어디까지 진행되고 있는지 확인할 수 있는 채널입니다.',
  },
  contacts: [
    {
      title: '미디어 문의',
      body: '보도자료, 인터뷰, 행사 협업 등 미디어 관련 문의를 받습니다.',
      href: 'mailto:press@paiptree.com',
      label: 'press@paiptree.com',
    },
    {
      title: '일반 문의',
      body: '도입 상담, 파트너십, 사업 협력 관련 문의를 받습니다.',
      href: 'mailto:hello@paiptree.com',
      label: 'hello@paiptree.com',
    },
  ],
} as const;
