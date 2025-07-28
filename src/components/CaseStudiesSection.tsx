// src/components/CaseStudiesSection.tsx
'use client';

import Button from './ui/Button';
import { useTranslation } from '@/hooks/useTranslation';

const CaseStudiesSection = () => {
  const { t } = useTranslation();
  
  const studies = [
    {
      key: 'enterprise',
      title: t('caseStudies.enterprise.title'),
      description: t('caseStudies.enterprise.description'),
      imageUrl: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?q=80&w=2070&auto=format&fit=crop',
      imageLeft: true,
    },
    {
      key: 'brands',
      title: t('caseStudies.brands.title'),
      description: t('caseStudies.brands.description'),
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1974&auto=format&fit=crop',
      imageLeft: false,
    },
  ];

  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-6 max-w-6xl space-y-20">
        {studies.map((study, index) => (
          <div key={study.key} className={`grid md:grid-cols-2 gap-12 md:gap-20 items-center ${study.imageLeft ? '' : 'md:grid-flow-col-dense'}`}>
            <div className={`w-full h-72 rounded-xl overflow-hidden ${study.imageLeft ? 'md:order-1' : 'md:order-2'}`}>
              <img src={study.imageUrl} alt={study.title} className="w-full h-full object-cover" />
            </div>
            <div className={`text-left ${study.imageLeft ? 'md:order-2' : 'md:order-1'}`}>
              <h3 className="text-2xl md:text-3xl font-medium mb-5 tracking-tight leading-tight">{study.title}</h3>
              <p className="text-gray-400 mb-8 leading-relaxed text-lg">{study.description}</p>
              <Button variant="secondary">{t('caseStudies.learnMore')}</Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CaseStudiesSection;
