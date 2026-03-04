'use client';

import { useLanguage, type Language } from '@/contexts/LanguageContext';

const translations: Record<Language, Record<string, string>> = {
  ko: {
    // Banner
    'banner.text': 'FarmersMind v3.2 출시 — AI 폐사 예측 정확도 94% 달성',

    // Header nav
    'nav.fm': 'FarmersMind',
    'nav.scm': 'SCM',
    'nav.tms': 'TmS',
    'nav.blog': 'Blog',
    'nav.cta': '시작하기',

    // Hero
    'hero.title': 'AI로 축산을\n운영합니다',
    'hero.sub': '실시간 환경 모니터링, AI 예측 분석, 공급망 추적까지. 데이터 기반의 축산 운영 플랫폼을 제공합니다.',
    'hero.cta1': '데모 요청',
    'hero.cta2': '플랫폼 둘러보기',

    // Platforms
    'platforms.title': 'Platforms',
    'platforms.tagline': '축산 운영의 모든 단계를 하나의 플랫폼으로 연결합니다.',
    'platforms.01.title': 'FarmersMind',
    'platforms.01.desc': 'AI 기반 축사 환경 모니터링 및 예측 분석. 실시간 센서 데이터로 이상 징후를 조기 감지하고, 최적의 사육 환경을 유지합니다.',
    'platforms.01.link': '자세히 보기',
    'platforms.02.title': 'Supply Chain Management',
    'platforms.02.desc': '생산부터 유통까지 전 과정을 추적하는 공급망 관리 솔루션. 이력 관리와 품질 인증을 자동화합니다.',
    'platforms.02.link': '자세히 보기',
    'platforms.03.title': 'TmS (Traceability)',
    'platforms.03.desc': '블록체인 기반 축산물 이력추적 시스템. 소비자 신뢰를 구축하고 식품 안전을 보장합니다.',
    'platforms.03.link': '자세히 보기',

    // Recognition
    'recognition.title': '검증된 성과',
    'recognition.tagline': '데이터가 증명하는 실질적 결과.',
    'recognition.01.stat': '22.63%',
    'recognition.01.desc': '도입 농장 평균 폐사율 감소',
    'recognition.01.link': '리포트 보기',
    'recognition.02.stat': '150+',
    'recognition.02.desc': 'FarmersMind 운영 농장 수',
    'recognition.02.link': '사례 보기',
    'recognition.03.stat': '2.4M+',
    'recognition.03.desc': '누적 수집 데이터 포인트',
    'recognition.03.link': '기술 소개',

    // Consultation
    'consult.title': '축산 운영의 새로운 기준을\n함께 만들어 갑니다',
    'consult.desc': '현장 진단부터 시스템 구축, 운영 최적화까지. paiptree 전문팀이 도입 전 과정을 지원합니다.',
    'consult.cta': '도입 상담 요청',

    // Power Grid
    'power.title': 'paiptree가 강력한 이유',
    'power.a.label': 'A',
    'power.a.title': '실시간 환경 제어',
    'power.a.desc': '온도, 습도, CO₂, 암모니아 등 축사 환경 데이터를 실시간으로 수집하고 자동 제어합니다.',
    'power.a.link': '자세히 보기',
    'power.b.label': 'B',
    'power.b.title': 'AI 예측 분석',
    'power.b.desc': '축적된 데이터를 기반으로 폐사 위험, 질병 발생, 사육 환경 이상을 사전에 예측합니다.',
    'power.b.link': '자세히 보기',
    'power.c.label': 'C',
    'power.c.title': '엔드투엔드 추적',
    'power.c.desc': '생산부터 소비까지 전 과정의 이력을 블록체인으로 기록하고 투명하게 공개합니다.',
    'power.c.link': '자세히 보기',
    'power.d.label': 'D',
    'power.d.title': '현장 중심 설계',
    'power.d.desc': '농업 현장의 실제 요구사항을 바탕으로 설계된 UX. 복잡한 학습 없이 바로 사용할 수 있습니다.',
    'power.d.link': '자세히 보기',

    // Partners
    'partners.caption': 'Trusted by',

    // Demo CTA
    'demo.title': '데모를 요청하세요',
    'demo.sub': 'paiptree 플랫폼이 귀사의 축산 운영을 어떻게 혁신할 수 있는지 직접 확인해 보세요.',
    'demo.cta': '데모 요청',

    // Footer columns
    'footer.col1.title': 'Platform',
    'footer.col1.l1': 'FarmersMind',
    'footer.col1.l2': 'SCM',
    'footer.col1.l3': 'TmS',
    'footer.col2.title': 'Industry',
    'footer.col2.l1': '양계',
    'footer.col2.l2': '양돈',
    'footer.col2.l3': '축산 일반',
    'footer.col3.title': 'Resources',
    'footer.col3.l1': 'Blog',
    'footer.col3.l2': 'Newsroom',
    'footer.col3.l3': 'Documentation',
    'footer.col4.title': 'Company',
    'footer.col4.l1': 'About',
    'footer.col4.l2': 'Careers',
    'footer.col4.l3': 'Contact',
    'footer.copy': '© 2026 paiptree Inc.',
    'footer.privacy': '개인정보처리방침',
    'footer.terms': '이용약관',
  },
  en: {
    // Banner
    'banner.text': 'FarmersMind v3.2 Released — AI Mortality Prediction Accuracy 94%',

    // Header nav
    'nav.fm': 'FarmersMind',
    'nav.scm': 'SCM',
    'nav.tms': 'TmS',
    'nav.blog': 'Blog',
    'nav.cta': 'Get Started',

    // Hero
    'hero.title': 'Get AI Into\nLivestock Operations',
    'hero.sub': 'Real-time environment monitoring, AI predictive analytics, and supply chain traceability. A data-driven platform for modern livestock operations.',
    'hero.cta1': 'Request a Demo',
    'hero.cta2': 'Explore Platforms',

    // Platforms
    'platforms.title': 'Platforms',
    'platforms.tagline': 'Connecting every stage of livestock operations in a single platform.',
    'platforms.01.title': 'FarmersMind',
    'platforms.01.desc': 'AI-powered livestock environment monitoring and predictive analytics. Detects anomalies early with real-time sensor data and maintains optimal conditions.',
    'platforms.01.link': 'Explore',
    'platforms.02.title': 'Supply Chain Management',
    'platforms.02.desc': 'End-to-end supply chain tracking from production to distribution. Automates traceability and quality certification.',
    'platforms.02.link': 'Explore',
    'platforms.03.title': 'TmS (Traceability)',
    'platforms.03.desc': 'Blockchain-based livestock traceability system. Builds consumer trust and ensures food safety.',
    'platforms.03.link': 'Explore',

    // Recognition
    'recognition.title': 'Proven Results',
    'recognition.tagline': 'Real outcomes backed by data.',
    'recognition.01.stat': '22.63%',
    'recognition.01.desc': 'Average mortality rate reduction on partner farms',
    'recognition.01.link': 'View Report',
    'recognition.02.stat': '150+',
    'recognition.02.desc': 'Farms running FarmersMind',
    'recognition.02.link': 'View Cases',
    'recognition.03.stat': '2.4M+',
    'recognition.03.desc': 'Cumulative data points collected',
    'recognition.03.link': 'Learn More',

    // Consultation
    'consult.title': 'Building a new standard\nfor livestock operations',
    'consult.desc': 'From on-site diagnostics to system deployment and optimization. Our team supports every step of adoption.',
    'consult.cta': 'Request Consultation',

    // Power Grid
    'power.title': 'What Makes paiptree Powerful',
    'power.a.label': 'A',
    'power.a.title': 'Real-Time Environment Control',
    'power.a.desc': 'Collect and auto-control temperature, humidity, CO₂, and ammonia data in real time across all barns.',
    'power.a.link': 'Explore',
    'power.b.label': 'B',
    'power.b.title': 'AI Predictive Analytics',
    'power.b.desc': 'Predict mortality risk, disease outbreaks, and environmental anomalies before they happen using accumulated data.',
    'power.b.link': 'Explore',
    'power.c.label': 'C',
    'power.c.title': 'End-to-End Traceability',
    'power.c.desc': 'Record and transparently share the full lifecycle from production to consumption on blockchain.',
    'power.c.link': 'Explore',
    'power.d.label': 'D',
    'power.d.title': 'Field-First Design',
    'power.d.desc': 'UX designed from real on-farm requirements. Intuitive enough to use without training.',
    'power.d.link': 'Explore',

    // Partners
    'partners.caption': 'Trusted by',

    // Demo CTA
    'demo.title': 'Request a Demo',
    'demo.sub': 'See firsthand how paiptree can transform your livestock operations.',
    'demo.cta': 'Request a Demo',

    // Footer columns
    'footer.col1.title': 'Platform',
    'footer.col1.l1': 'FarmersMind',
    'footer.col1.l2': 'SCM',
    'footer.col1.l3': 'TmS',
    'footer.col2.title': 'Industry',
    'footer.col2.l1': 'Poultry',
    'footer.col2.l2': 'Swine',
    'footer.col2.l3': 'General Livestock',
    'footer.col3.title': 'Resources',
    'footer.col3.l1': 'Blog',
    'footer.col3.l2': 'Newsroom',
    'footer.col3.l3': 'Documentation',
    'footer.col4.title': 'Company',
    'footer.col4.l1': 'About',
    'footer.col4.l2': 'Careers',
    'footer.col4.l3': 'Contact',
    'footer.copy': '© 2026 paiptree Inc.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
  },
};

export function useMainTranslation() {
  const { language, toggleLanguage } = useLanguage();

  const t = (key: string): string => {
    return translations[language][key] ?? key;
  };

  return { t, language, toggleLanguage };
}
