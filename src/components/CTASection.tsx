'use client';

import Button from './ui/Button';
import Section from './ui/Section';
import { useTranslation } from '@/hooks/useTranslation';

export default function CTASection() {
  const { t } = useTranslation();
  
  return (
    <Section background="dark" withMeshGradient padding="lg">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-medium mb-6 text-white leading-tight tracking-tight">
          {t('ctaSection.title')}
        </h2>
        <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
          {t('ctaSection.description')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button variant="primary" size="lg" className="rounded-xl">
            {t('ctaSection.button')}
          </Button>
        </div>
      </div>
    </Section>
  );
}