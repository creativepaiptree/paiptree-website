'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

import { featureIcons } from '@/components/FeatureIcons';

export default function TmsPage() {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const openDataInsights = () => {
    if (typeof window !== 'undefined') {
      window.open('/tms/tms-schedule.html', '_blank', 'noopener,noreferrer');
    }
  };

  const footerLinks = {
    product: language === 'ko' 
      ? ["TMS 소개", "주요 기능", "요금제", "고객 사례"]
      : ["About TMS", "Features", "Pricing", "Case Studies"],
    company: language === 'ko'
      ? ["회사 소개", "팀", "채용", "파트너십"]
      : ["About Us", "Team", "Careers", "Partnership"],
    support: language === 'ko'
      ? ["고객 지원", "문서", "FAQ", "문의하기"]
      : ["Customer Support", "Documentation", "FAQ", "Contact"]
  };

  const handleDownload = async () => {
    try {
      const response = await fetch('http://paipddns.iptime.org:8100/tms/app/deploy/get/apk/gps');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tms.apk';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      // 직접 링크로 시도
      window.open('http://paipddns.iptime.org:8100/tms/app/deploy/get/apk/gps', '_blank');
    }
  };

  return (
    <div data-theme="showcase" data-surface="product" className="min-h-screen bg-white">
      {/* Header - Logo and Language Toggle */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo - Top Left */}
          <a href="/tms" className="flex items-center">
            <Image src="/logo_tms_nb.svg" alt="TMS Logo" width={120} height={20} className="h-5 w-auto" />
          </a>

          {/* Right Side - Language Toggle & Hamburger Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="px-5 py-1 bg-transparent text-black border border-black rounded text-sm font-medium hover:bg-black hover:text-white transition-all"
            >
              {language === 'ko' ? 'KO' : 'EN'}
            </button>
            
            {/* Hamburger Menu Button */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2"
              >
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px]">
                  <a
                    href="https://drive.google.com/file/d/1UQfjyRRMhnVtp395De5Q3V9yCUriRlH7/view?usp=drive_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {language === 'ko' ? '📖 메뉴얼 보기' : '📖 View Manual'}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Full Screen */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden bg-white">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <Image
            src="/tms_1_web.png"
            alt="TMS Background"
            width={1600}
            height={900}
            className="max-w-full max-h-full object-contain opacity-80"
            style={{
              transform: 'scale(1.5)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
            }}
          />
        </div>

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="mb-8 text-base font-bold tracking-wide uppercase text-gray-500">
            {t('tms.hero.badge')}
          </div>
          <h1 className="lg:text-[40px] text-[28px] font-bold text-gray-900 mb-6 leading-[140%] whitespace-pre-line">
            {t('tms.hero.title').replace(', ', ',\n')}
          </h1>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed whitespace-pre-line">
            {t('tms.hero.subtitle')}
          </p>

          {/* Spacer for background image */}
          <div className="h-80 md:h-[30rem]"></div>
        </div>

        {/* CTA Buttons - Independent Container */}
        <div className="w-full max-w-2xl mx-auto px-6 relative z-10">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch">
            <button
              onClick={handleDownload}
              className="flex-1 sm:max-w-[300px] px-8 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl cursor-pointer whitespace-nowrap"
            >
              {t('tms.download.buttons.android')}
            </button>
            <a
              href="#features"
              className="flex-1 sm:max-w-[300px] px-8 py-4 bg-white text-black font-semibold rounded-full border-2 border-gray-200 hover:border-gray-400 transition-all text-center whitespace-nowrap"
            >
              {t('tms.download.buttons.learnMore')}
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-bounce z-10">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>



      {/* Enterprise Features Section - Grid Cards */}
      <section className="bg-white">
        <div className="lg:pt-[140px] lg:pb-[160px] pt-[40px] pb-[60px] flex flex-col items-center px-5">
          {/* Header */}
          <div className="text-center mb-8 lg:mb-[60px]">
            <p className="text-sm font-bold tracking-wide uppercase text-gray-500 mb-4">
              {t('tms.enterprise.badge')}
            </p>
            <h2 className="lg:text-[40px] text-[28px] font-bold text-gray-900 leading-[140%]">
              {t('tms.enterprise.title')}
            </h2>
          </div>

          {/* Grid Cards */}
          <div className="grid lg:grid-cols-3 grid-cols-2 gap-[24px] max-w-[1200px] w-full justify-center">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
              const title = t(`tms.enterprise.cards.${index}.title`);
              const description = t(`tms.enterprise.cards.${index}.description`);
              const image = t(`tms.enterprise.cards.${index}.image`);
              const isDataInsightsCard = index === 5;

              return (
                <div
                  key={index}
                  className={`rounded-xl shadow-[1px_1px_18px_0px_rgba(97,121,148,0.12)] bg-white overflow-hidden hover:shadow-[1px_1px_24px_0px_rgba(97,121,148,0.18)] transition-shadow ${
                    isDataInsightsCard ? 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black' : ''
                  }`}
                  onClick={isDataInsightsCard ? openDataInsights : undefined}
                  onKeyDown={
                    isDataInsightsCard
                      ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openDataInsights();
                          }
                        }
                      : undefined
                  }
                  role={isDataInsightsCard ? 'button' : undefined}
                  tabIndex={isDataInsightsCard ? 0 : undefined}
                  aria-label={isDataInsightsCard ? `${title} - ${description}` : undefined}
                >
                  {/* Image Container with Background */}
                  <div className="w-full aspect-[768/488] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Image
                      alt={title}
                      src={image}
                      width={768}
                      height={488}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="lg:p-5 lg:pb-8 p-4 pb-5 flex flex-col gap-2">
                    <h3 className="lg:text-2xl text-base font-semibold text-[#222] leading-[150%]">
                      {title}
                    </h3>
                    <p className="lg:text-lg text-sm font-medium leading-[140%] text-[#4E5968]">
                      {description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Features Section - TMS 사용법 */}
      <section id="features" className="bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="lg:pt-[140px] lg:pb-[160px] pt-[40px] pb-[60px] flex flex-col items-center px-5">
          {/* Header */}
          <div className="text-center mb-8 lg:mb-[60px]">
            <p className="text-sm font-bold tracking-wide uppercase text-gray-500 mb-4">
              {t('tms.features.badge')}
            </p>
            <h2 className="lg:text-[40px] text-[28px] font-bold text-gray-900 leading-[140%]">
              {t('tms.features.title')}
            </h2>
          </div>

          {/* Features Blocks - Alternating Layout */}
          <div className="lg:mt-[80px] mt-[52px] flex flex-col lg:gap-[140px] gap-[80px] max-w-[1232px] w-full mx-4">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`flex justify-between whitespace-pre-line break-keep lg:gap-0 gap-5 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
                } flex-col`}
              >
                {/* Text Content */}
                <div className="flex flex-col lg:gap-[60px] gap-[20px]">
                  <div className={`flex flex-col lg:gap-5 gap-2.5 ${index % 2 === 1 ? 'lg:items-end lg:text-end' : 'lg:items-start lg:text-start'} items-start text-start`}>
                    <h3 className="lg:text-[36px] text-[24px] font-bold leading-[140%] text-black">
                      <span className="text-black">{t(`tms.features.blocks.${index}.keyword`)}</span> {t(`tms.features.blocks.${index}.title`)}
                    </h3>
                    <div className="h-[3px] w-full bg-black"></div>
                    <p className="lg:text-xl text-base font-medium leading-[140%] text-[#4E5968] whitespace-pre-line">
                      {t(`tms.features.blocks.${index}.description`)}
                    </p>
                  </div>

                  {/* Feature Cards - 2개씩 */}
                  <div className="flex flex-col lg:gap-[32px] gap-3">
                    {[0, 1].map((cardIndex) => {
                      const iconKey = t(`tms.features.blocks.${index}.cards.${cardIndex}.icon`);
                      const IconComponent = featureIcons[iconKey];
                      return (
                        <div key={cardIndex} className="lg:w-[452px] w-full lg:rounded-xl rounded-lg border border-[#D8DDEA] lg:py-4 lg:px-5 py-3 px-4 bg-white flex flex-col justify-center">
                          <div className="flex lg:gap-3 gap-2 items-center">
                            <div className="w-6 h-6 flex-shrink-0">
                              {IconComponent ? <IconComponent /> : <span className="text-2xl">{iconKey}</span>}
                            </div>
                            <h4 className="lg:text-lg text-base font-semibold leading-[35px] text-[#2B2C2E]">
                              {t(`tms.features.blocks.${index}.cards.${cardIndex}.title`)}
                            </h4>
                          </div>
                          <p className="lg:text-base text-sm font-normal leading-[24px] text-[#494949] mt-1 lg:ml-[36px] whitespace-pre-line">
                            {t(`tms.features.blocks.${index}.cards.${cardIndex}.description`)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Image */}
                <div className="lg:w-[52%] w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                  <Image
                    alt={t(`tms.features.blocks.${index}.keyword`)}
                    src={t(`tms.features.blocks.${index}.image`)}
                    width={1200}
                    height={900}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-[#f4f9ff]">
        <div className="lg:pt-[140px] lg:pb-[160px] pt-[40px] pb-[60px] flex flex-col items-center px-5 gap-[60px]">
          {/* Header */}
          <div className="flex flex-col items-center">
            <p className="text-sm font-bold tracking-wide uppercase text-gray-500 mb-4">
              {t('tms.security.badge')}
            </p>
            <h2 className="lg:text-[40px] text-[28px] font-bold text-gray-900 leading-[140%]">
              {t('tms.security.title')} <span className="text-[#4A7CFF]">{t('tms.security.highlight')}</span>
            </h2>
          </div>

          {/* Cards */}
          <div className="flex w-full justify-center lg:flex-row flex-col gap-6 max-w-[1200px]">
            {/* Card 1 - Cloud 24/7 */}
            <div className="flex flex-col items-center rounded-xl gap-4 bg-white lg:w-[384px] w-full pt-[40px] pb-[40px] px-[20px] shadow-sm relative overflow-hidden">
              <div className="absolute right-0 pointer-events-none" style={{ top: '28px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="181" height="163" viewBox="0 0 181 163" fill="none">
                  <path opacity="0.05" d="M145 81.5C145 60.789 128.211 44 107.5 44C91.789 44 78.5 53.789 73 67.5C54.789 67.5 40 82.289 40 100.5C40 118.711 54.789 133.5 73 133.5H140C155.464 133.5 168 120.964 168 105.5C168 91.536 157.964 80.036 145 78.5V81.5Z" fill="#222222"/>
                </svg>
              </div>
              <div className="flex flex-col items-center relative z-10 gap-2">
                <h3 className="lg:text-2xl text-lg font-semibold text-[#222] leading-[150%] text-center">
                  {t('tms.security.cards.0.title')}
                </h3>
                <p className="lg:text-base text-sm text-[#4E5968] text-center">
                  {t('tms.security.cards.0.description')}
                </p>
              </div>
            </div>

            {/* Card 2 - Encryption */}
            <div className="flex flex-col items-center rounded-xl gap-4 bg-white lg:w-[384px] w-full pt-[40px] pb-[40px] px-[20px] shadow-sm relative overflow-hidden">
              <div className="absolute right-0 pointer-events-none" style={{ top: '20px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="148" height="172" viewBox="0 0 148 172" fill="none">
                  <path opacity="0.05" d="M74 10C47.5 10 26 31.5 26 58V78H18C12.477 78 8 82.477 8 88V152C8 157.523 12.477 162 18 162H130C135.523 162 140 157.523 140 152V88C140 82.477 135.523 78 130 78H122V58C122 31.5 100.5 10 74 10ZM46 58C46 42.536 58.536 30 74 30C89.464 30 102 42.536 102 58V78H46V58ZM82 120V140H66V120C60.477 120 56 115.523 56 110C56 104.477 60.477 100 66 100H82C87.523 100 92 104.477 92 110C92 115.523 87.523 120 82 120Z" fill="#222222"/>
                </svg>
              </div>
              <div className="flex flex-col items-center relative z-10 gap-2">
                <h3 className="lg:text-2xl text-lg font-semibold text-[#222] leading-[150%] text-center">
                  {t('tms.security.cards.1.title')}
                </h3>
                <p className="lg:text-base text-sm text-[#4E5968] text-center">
                  {t('tms.security.cards.1.description')}
                </p>
              </div>
            </div>

            {/* Card 3 - Standard Process */}
            <div className="flex flex-col items-center rounded-xl gap-4 bg-white lg:w-[384px] w-full pt-[40px] pb-[40px] px-[20px] shadow-sm relative overflow-hidden">
              <div className="absolute right-0 pointer-events-none" style={{ top: '-4px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="178" height="225" viewBox="0 0 178 225" fill="none">
                  <path opacity="0.05" d="M89 20L20 50V100C20 147.5 48.5 191.5 89 205C129.5 191.5 158 147.5 158 100V50L89 20ZM79 155L49 125L60.5 113.5L79 132L117.5 93.5L129 105L79 155Z" fill="#222222"/>
                </svg>
              </div>
              <div className="flex flex-col items-center relative z-10 gap-2">
                <h3 className="lg:text-2xl text-lg font-semibold text-[#222] leading-[150%] text-center">
                  {t('tms.security.cards.2.title')}
                </h3>
                <p className="lg:text-base text-sm text-[#4E5968] text-center">
                  {t('tms.security.cards.2.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Detailed */}
      <footer className="text-gray-300" style={{ backgroundColor: 'rgb(22, 22, 22)' }}>
        <div className="max-w-[1280px] px-6 pt-7 pb-10 flex flex-col gap-4">
          {/* Logo */}
          <Image
            src="/logo-primary-light.svg"
            alt="Paiptree Logo"
            width={132}
            height={24}
            className="h-6 w-auto brightness-0 invert self-start"
          />

          {/* Desktop Layout */}
          <div className="hidden xl:flex flex-col gap-6">
            {/* Company Info Row 1 */}
            <div className="flex items-center gap-5 text-sm leading-[150%] text-[#C7C7C7]">
              <p className="font-semibold">{t('tms.footer.company')}</p>
              <div className="w-[1px] h-3 bg-[#494949]"></div>
              <p>{t('tms.footer.ceo')}</p>
              <div className="w-[1px] h-3 bg-[#494949]"></div>
              <p>{t('tms.footer.businessNumber')}</p>
              <div className="w-[1px] h-3 bg-[#494949]"></div>
              <p>{t('tms.footer.corporateNumber')}</p>
            </div>

            {/* Company Info Row 2 */}
            <div className="flex items-center gap-5 text-sm leading-[150%] text-[#C7C7C7]">
              <p>{t('tms.footer.addressSeoul')}</p>
              <div className="w-[1px] h-3 bg-[#494949]"></div>
              <p>{t('tms.footer.address')}</p>
            </div>

            {/* Copyright */}
            <div className="flex w-full justify-end">
              <p className="text-xs text-[#8b8b8b]">{t('tms.footer.copyright')}</p>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex xl:hidden flex-col gap-6">
            {/* Company Info */}
            <div className="flex flex-col gap-1 text-[13px] leading-[140%] text-[#C7C7C7]">
              <p className="font-semibold">{t('tms.footer.company')}</p>
              <p>{t('tms.footer.ceo')}</p>
              <p>{t('tms.footer.businessNumber')}</p>
              <p>{t('tms.footer.corporateNumber')}</p>
              <p>{t('tms.footer.addressSeoul')}</p>
              <p>{t('tms.footer.address')}</p>
            </div>

            {/* Copyright Mobile */}
            <p className="text-xs text-[#8b8b8b]">{t('tms.footer.copyright')}</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
