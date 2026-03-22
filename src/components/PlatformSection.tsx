'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import AboutSectionHeader from '@/components/AboutSectionHeader';
import MarketingSection from '@/components/site/MarketingSection';

const platforms = [
  { num: '/0.1', key: 'platform1', name: 'FarmersMind', href: '/services' },
  { num: '/0.2', key: 'platform2', name: 'SCM',         href: '/services' },
  { num: '/0.3', key: 'platform3', name: 'TmS',         href: '/tms'      },
];

export default function PlatformSection() {
  const { t } = useTranslation();

  return (
    <MarketingSection surface="base">
      <AboutSectionHeader
        number="/03"
        label="PLATFORM"
        title={t('platformSection.mainTitle')}
        description={t('platformSection.mainSubtitle')}
      />

      {/* Platform list */}
      <div>
        {platforms.map(({ num, key, name, href }, i) => (
          <Link
            key={key}
            href={href}
            className={[
              'marketing-interactive',
              'marketing-hover-surface',
              'marketing-border-line',
              'flex flex-col lg:flex-row lg:items-center lg:gap-16 py-10 group',
              'border-t',
              i === platforms.length - 1 ? 'border-b' : '',
            ].filter(Boolean).join(' ')}
          >
            {/* 번호 */}
            <div className="w-16 flex-shrink-0 mb-3 lg:mb-0">
              <span className="type-mono marketing-text-dim">{num}</span>
            </div>

            {/* 플랫폼명 */}
            <div className="flex-1">
              <span className="type-heading-l marketing-text-primary block transition-colors duration-200 group-hover:opacity-70">
                {name}
              </span>
            </div>

            {/* 설명 */}
            <div className="lg:w-72 mt-3 lg:mt-0">
              <p className="type-body-s marketing-text-sub">
                {t(`platformSection.${key}.description`)}
              </p>
            </div>

            {/* 화살표 */}
            <div className="hidden lg:block flex-shrink-0">
              <svg
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="marketing-text-sub transition-transform duration-200 group-hover:translate-x-1"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </MarketingSection>
  );
}
