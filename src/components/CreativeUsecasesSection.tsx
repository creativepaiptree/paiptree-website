// src/components/CreativeUsecasesSection.tsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';

const CreativeUsecasesSection = () => {
  const { t } = useTranslation();
  
  const usecases = [
    {
      key: 'marketing',
      title: t('creativeUsecases.marketing.title'),
      description: t('creativeUsecases.marketing.description'),
    },
    {
      key: 'entertainment',
      title: t('creativeUsecases.entertainment.title'),
      description: t('creativeUsecases.entertainment.description'),
    },
    {
      key: 'gaming',
      title: t('creativeUsecases.gaming.title'),
      description: t('creativeUsecases.gaming.description'),
    },
  ];

  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-6 text-left max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4 tracking-tight">
          {t('creativeUsecases.title')}
        </h2>
        <p className="text-lg text-gray-400 mb-16 max-w-2xl leading-relaxed">
          {t('creativeUsecases.description')}
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {usecases.map((usecase) => (
            <div key={usecase.key} className="bg-neutral-900/60 p-8 rounded-xl border border-neutral-800 hover:bg-neutral-900/80 transition-all duration-300">
              <h3 className="text-xl font-medium mb-4 text-white">{usecase.title}</h3>
              <p className="text-gray-400 leading-relaxed">{usecase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CreativeUsecasesSection;
