'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import AboutSectionHeader from '@/components/AboutSectionHeader';
import MarketingSection from '@/components/site/MarketingSection';

type EcosystemCardKey = 'farmersmind' | 'scm' | 'tms' | 'aiOps';

const cardMeta: Record<
  EcosystemCardKey,
  {
    href: string;
    layout: string;
    accent?: boolean;
  }
> = {
  farmersmind: {
    href: '/services',
    layout: 'md:col-span-8',
  },
  scm: {
    href: '/services',
    layout: 'md:col-span-4',
  },
  tms: {
    href: '/tms',
    layout: 'md:col-span-4',
  },
  aiOps: {
    href: '/services',
    layout: 'md:col-span-8',
    accent: true,
  },
};

export default function CommandEcosystemSection() {
  const { t } = useTranslation();

  return (
    <MarketingSection surface="base" withContainer={false}>
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 75%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 75%)',
        }}
      />

      <div className="container-max px-6 relative z-10">
        <AboutSectionHeader
          number="/01"
          label={t('ecosystemSection.eyebrow')}
          title={t('ecosystemSection.title')}
          aside={t('ecosystemSection.quote')}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {(Object.keys(cardMeta) as EcosystemCardKey[]).map((key) => {
            const { href, layout, accent } = cardMeta[key];
            const panelClassName = accent
              ? 'marketing-panel-accent'
              : 'marketing-panel marketing-panel-grid marketing-hover-surface';
            const titleClassName = accent ? 'marketing-text-on-accent' : 'marketing-text-primary';
            const textClassName = accent ? 'marketing-text-on-accent-subtle' : 'marketing-text-sub';
            const labelClassName = accent ? 'marketing-label-on-accent' : 'marketing-text-dim';
            const ctaClassName = accent ? 'marketing-text-on-accent' : 'marketing-link-accent';

            return (
              <Link
                key={key}
                href={href}
                className={`group ${layout} ${panelClassName} marketing-interactive relative min-h-[320px] overflow-hidden p-8 md:p-10`}
              >
                {!accent && (
                  <>
                    <div
                      className="absolute -right-12 -bottom-10 h-48 w-48 rounded-full opacity-80"
                      style={{
                        background: 'radial-gradient(circle, rgba(0,171,230,0.18) 0%, rgba(0,171,230,0.03) 60%, transparent 76%)',
                      }}
                    />
                  </>
                )}

                {accent && (
                  <>
                    <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.12), transparent 55%)' }} />
                    <div className="absolute right-8 top-8 hidden md:flex h-28 w-28 items-center justify-center rounded-[1.75rem] border border-white/20 bg-white/10">
                      <div className="h-10 w-10 rounded-full bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.22)]" />
                    </div>
                  </>
                )}

                <div className="relative z-10 flex h-full flex-col justify-between gap-12">
                  <div className="max-w-xl">
                    <span className={`type-label mb-4 block ${labelClassName}`}>
                      {t(`ecosystemSection.cards.${key}.label`)}
                    </span>
                    <h3 className={`marketing-card-title mb-4 ${titleClassName}`}>
                      {t(`ecosystemSection.cards.${key}.title`)}
                    </h3>
                    <p className={`type-body max-w-lg ${textClassName}`}>
                      {t(`ecosystemSection.cards.${key}.description`)}
                    </p>
                  </div>

                  <div className={`marketing-card-link type-label transition-transform duration-300 group-hover:translate-x-1 ${ctaClassName}`}>
                    <span>{t(`ecosystemSection.cards.${key}.cta`)}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </MarketingSection>
  );
}
