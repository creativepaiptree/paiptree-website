// src/components/CaseStudiesSection.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import AboutSectionHeader from '@/components/AboutSectionHeader';
import MarketingSection from '@/components/site/MarketingSection';

const CaseStudiesSection = () => {
  const { t } = useTranslation();

  return (
    <MarketingSection surface="surface">
      <div className="marketing-panel grid md:grid-cols-2 gap-0">
        {/* Left Image */}
        <div className="relative w-full h-80 md:h-[480px] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
            alt="Paiptree team"
            width={2070}
            height={480}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(5,5,5,0.24), rgba(5,5,5,0.5))' }} />
        </div>

        {/* Right Content */}
        <div
          className="marketing-split-panel-content marketing-split-panel-divider p-12 md:p-16 flex flex-col justify-center"
        >
          <AboutSectionHeader
            number="/04"
            label="MISSION"
            title={t('missionSection.title')}
            description={t('missionSection.description')}
            titleSize="m"
            compact
          />
          <Link href="/culture" className="btn-site-link marketing-link-accent">
            {t('missionSection.linkLabel')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </MarketingSection>
  );
};

export default CaseStudiesSection;
