'use client';

import { useTranslation } from '@/hooks/useTranslation';

const platforms = [
  { num: '/0.1', key: 'platform1', name: 'FarmersMind' },
  { num: '/0.2', key: 'platform2', name: 'SCM' },
  { num: '/0.3', key: 'platform3', name: 'TmS' },
];

export default function PlatformSection() {
  const { t } = useTranslation();

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'var(--color-light-bg)' }}>
      <div className="container-max px-6">

        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-16" style={{ borderTop: '1px solid var(--color-light-line)', paddingTop: '2rem' }}>
          <span className="type-label" style={{ color: 'var(--color-light-text-sub)' }}>/02</span>
          <span className="w-8 h-px" style={{ background: 'var(--color-light-line)' }} />
          <span className="type-label" style={{ color: 'var(--color-light-text-sub)' }}>PLATFORM</span>
        </div>

        {/* Lead text */}
        <div className="mb-20 max-w-3xl">
          <h2 className="type-heading-l mb-4" style={{ color: 'var(--color-light-text)' }}>
            {t('platformSection.mainTitle')}
            <br />
            <span style={{ color: 'var(--color-light-text-sub)' }}>{t('platformSection.mainSubtitle')}</span>
          </h2>
        </div>

        {/* Platform list */}
        <div>
          {platforms.map(({ num, key, name }, i) => (
            <div
              key={key}
              className="flex flex-col lg:flex-row lg:items-center lg:gap-16 py-10 transition-colors duration-200 group cursor-default"
              style={{
                borderTop: '1px solid var(--color-light-line)',
                borderBottom: i === platforms.length - 1 ? '1px solid var(--color-light-line)' : undefined,
              }}
            >
              {/* 번호 */}
              <div className="w-16 flex-shrink-0 mb-3 lg:mb-0">
                <span className="type-mono" style={{ color: 'var(--color-light-text-sub)' }}>{num}</span>
              </div>

              {/* 플랫폼명 */}
              <div className="flex-1">
                <span
                  className="type-heading-l block transition-colors duration-200"
                  style={{ color: 'var(--color-light-text)', letterSpacing: '-0.04em' }}
                >
                  {name}
                </span>
              </div>

              {/* 설명 */}
              <div className="lg:w-72 mt-3 lg:mt-0">
                <p className="type-body-s" style={{ color: 'var(--color-light-text-sub)' }}>
                  {t(`platformSection.${key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
