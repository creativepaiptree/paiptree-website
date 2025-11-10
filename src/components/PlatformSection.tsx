'use client';

import Section from './ui/Section';
import { useTranslation } from '@/hooks/useTranslation';

export default function PlatformSection() {
  const { t } = useTranslation();

  return (
    <Section
      className="py-20 bg-white"
      background="transparent"
      withNoiseOverlay
    >
      <div className="container mx-auto px-1 lg:px-6">
        {/* Main Text */}
        <div className="mb-20">
          <h2 className="text-4xl font-normal text-black mb-4 max-w-[1200px] mx-auto leading-tight">
            {t('platformSection.mainTitle')} <span className="text-gray-400">AI-driven</span> {t('platformSection.mainSubtitle')}
          </h2>
        </div>

        {/* Our Platforms Section */}
        <div className="max-w-[1200px] mx-auto">
          <h3 className="text-3xl font-normal text-black mb-8 lg:mb-12">{t('platformSection.ourPlatforms')}</h3>

          {/* Platform 1 - /0.1 */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-0 px-8 pt-8 pb-24 transition-colors duration-300 hover:bg-gray-200 border-t border-gray-300">
            {/* 데스크톱: 왼쪽 / 모바일: 오른쪽 - 넘버링 + 설명 */}
            <div className="flex-1 order-2 lg:order-1 max-w-[200px]">
              <div className="text-sm text-gray-500 mb-4 text-right lg:text-left">/0.1</div>
              <div className="text-lg text-black leading-tight text-right lg:text-left hidden lg:block">
                <p>{t('platformSection.platform1.description')}</p>
              </div>
            </div>

            {/* 데스크톱: 오른쪽 / 모바일: 왼쪽 - 로고텍스트 */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center order-1 lg:order-2">
              <div>
                <div className="text-6xl lg:text-9xl font-bold text-black">FarmersMind</div>
                <div className="text-sm text-black mt-2 lg:hidden">
                  {t('platformSection.platform1.description')}
                </div>
              </div>
            </div>
          </div>

          {/* Platform 2 - /0.2 */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-0 px-8 pt-8 pb-24 transition-colors duration-300 hover:bg-gray-200 border-t border-gray-300">
            {/* 데스크톱: 왼쪽 / 모바일: 오른쪽 - 넘버링 + 설명 */}
            <div className="flex-1 order-2 lg:order-1 max-w-[200px]">
              <div className="text-sm text-gray-500 mb-4 text-right lg:text-left">/0.2</div>
              <div className="text-lg text-black leading-tight text-right lg:text-left hidden lg:block">
                <p>{t('platformSection.platform2.description')}</p>
              </div>
            </div>

            {/* 데스크톱: 오른쪽 / 모바일: 왼쪽 - 로고텍스트 */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center order-1 lg:order-2">
              <div>
                <div className="text-6xl lg:text-9xl font-bold text-black">SCM</div>
                <div className="text-sm text-black mt-2 lg:hidden">
                  {t('platformSection.platform2.description')}
                </div>
              </div>
            </div>
          </div>

          {/* Platform 3 - /0.3 */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-0 px-8 pt-8 pb-24 transition-colors duration-300 hover:bg-gray-200 border-t border-gray-300">
            {/* 데스크톱: 왼쪽 / 모바일: 오른쪽 - 넘버링 + 설명 */}
            <div className="flex-1 order-2 lg:order-1 max-w-[200px]">
              <div className="text-sm text-gray-500 mb-4 text-right lg:text-left">/0.3</div>
              <div className="text-lg text-black leading-tight text-right lg:text-left hidden lg:block">
                <p>{t('platformSection.platform3.description')}</p>
              </div>
            </div>

            {/* 데스크톱: 오른쪽 / 모바일: 왼쪽 - 로고텍스트 */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center order-1 lg:order-2">
              <div>
                <div className="text-6xl lg:text-9xl font-bold text-black">TmS</div>
                <div className="text-sm text-black mt-2 lg:hidden">
                  {t('platformSection.platform3.description')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
