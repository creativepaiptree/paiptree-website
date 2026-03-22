'use client';

// src/components/CTACardsSection.tsx
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import AboutSectionHeader from '@/components/AboutSectionHeader';
import MarketingSection from '@/components/site/MarketingSection';

const ctas = [
  {
    href: '/services',
    label: '서비스 살펴보기',
    cardClassName: 'marketing-cta-card--surface',
    arrowClassName: 'marketing-text-primary',
  },
  {
    href: '/careers',
    label: '함께 만들어가기',
    cardClassName: 'marketing-cta-card--highlight',
    arrowClassName: 'marketing-text-accent',
  },
];

const CTACardsSection = () => {
  const { t } = useTranslation();

  return (
    <MarketingSection surface="base">
      <AboutSectionHeader
        number="/07"
        label="GET STARTED"
        title={t('ctaSection.title')}
        description={t('ctaSection.description')}
      />
      <div className="marketing-panel grid grid-cols-1 md:grid-cols-2 gap-0">
        {ctas.map(({ href, label, cardClassName, arrowClassName }, index) => (
          <Link
            key={href}
            href={href}
            className={[
              'marketing-cta-card',
              cardClassName,
              'marketing-interactive',
              'marketing-hover-surface',
              'group',
              index === 1 ? 'marketing-split-panel-divider' : '',
            ].filter(Boolean).join(' ')}
          >
            <h3 className="type-heading-m marketing-text-primary leading-none">{label}</h3>
            <svg
              className={`flex-shrink-0 ml-4 transition-transform duration-200 group-hover:translate-x-1 ${arrowClassName}`}
              width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="square" strokeWidth={1.5} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </MarketingSection>
  );
};

export default CTACardsSection;
