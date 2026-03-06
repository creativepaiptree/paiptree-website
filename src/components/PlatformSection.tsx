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
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="container-max px-6">
        {/* Main Text */}
        <div className="mb-20">
          <h2 className="text-4xl font-normal text-black mb-4 leading-tight">
            {t('platformSection.mainTitle')}{' '}
            <span className="text-gray-400">AI-driven</span>{' '}
            {t('platformSection.mainSubtitle')}
          </h2>
        </div>

        {/* Platform List */}
        <div>
          <h3 className="text-3xl font-normal text-black mb-8 lg:mb-12">
            {t('platformSection.ourPlatforms')}
          </h3>

          {platforms.map(({ num, key, name }, i) => (
            <div
              key={key}
              className={`flex flex-col lg:flex-row lg:justify-between lg:items-center px-8 pt-8 pb-24 transition-colors duration-300 hover:bg-gray-100 border-t border-gray-200 ${
                i === platforms.length - 1 ? 'border-b' : ''
              }`}
            >
              {/* 번호 + 설명 */}
              <div className="flex-1 order-2 lg:order-1 max-w-[200px]">
                <div className="text-sm text-gray-400 mb-4 text-right lg:text-left">{num}</div>
                <p className="text-base text-gray-600 leading-snug text-right lg:text-left hidden lg:block">
                  {t(`platformSection.${key}.description`)}
                </p>
              </div>

              {/* 플랫폼명 */}
              <div className="order-1 lg:order-2">
                <div className="text-6xl lg:text-9xl font-bold text-black">{name}</div>
                <p className="text-sm text-gray-600 mt-2 lg:hidden">
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
