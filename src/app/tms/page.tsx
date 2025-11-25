'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import PlatformCarousel from '@/components/PlatformCarousel';

export default function TmsPage() {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();

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
    <div className="min-h-screen bg-white">
      {/* Header - Logo and Language Toggle */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo - Top Left */}
          <a href="/tms" className="text-4xl font-bold text-black hover:text-gray-700 transition-colors tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif', letterSpacing: '-0.05em' }}>
            tms
          </a>

          {/* Language Toggle - Top Right */}
          <button
            onClick={toggleLanguage}
            className="px-5 py-1 bg-transparent text-black border border-black rounded text-sm font-medium hover:bg-black hover:text-white transition-all"
          >
            {language === 'ko' ? 'EN' : '한'}
          </button>
        </div>
      </div>

      {/* Hero Section - Full Screen */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden bg-white">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <img
            src="/tms_1_web.png"
            alt="TMS Background"
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
          <h1 className="text-3xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight whitespace-pre-line">
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
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Platform Integration Section with Carousel */}
      <PlatformCarousel />

      {/* Enterprise Features Section - Grid Cards */}
      <section className="bg-white">
        <div className="lg:pt-[140px] lg:pb-[160px] pt-[40px] pb-[60px] flex flex-col items-center px-5">
          {/* Header */}
          <div className="text-center mb-8 lg:mb-[60px]">
            <p className="text-sm font-bold tracking-wide uppercase text-gray-500 mb-4">
              {t('tms.enterprise.badge')}
            </p>
            <h2 className="text-3xl md:text-3xl font-bold text-gray-900">
              {t('tms.enterprise.title')}
            </h2>
          </div>

          {/* Grid Cards */}
          <div className="grid lg:grid-cols-3 grid-cols-2 gap-[24px] max-w-[1200px] w-full justify-center">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
              <div
                key={index}
                className="rounded-xl shadow-[1px_1px_18px_0px_rgba(97,121,148,0.12)] bg-white overflow-hidden hover:shadow-[1px_1px_24px_0px_rgba(97,121,148,0.18)] transition-shadow"
              >
                {/* Image Container with Background */}
                <div className="w-full aspect-[768/488] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <img
                    alt={t(`tms.enterprise.cards.${index}.title`)}
                    src={t(`tms.enterprise.cards.${index}.image`)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="lg:p-5 lg:pb-8 p-4 pb-5 flex flex-col gap-2">
                  <h3 className="lg:text-2xl text-base font-semibold text-[#222] leading-[150%]">
                    {t(`tms.enterprise.cards.${index}.title`)}
                  </h3>
                  <p className="lg:text-lg text-sm font-medium leading-[140%] text-[#4E5968]">
                    {t(`tms.enterprise.cards.${index}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="text-3xl md:text-3xl font-bold text-gray-900 mb-16 text-center">
            {t('tms.features.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="p-8 bg-white rounded-3xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="text-5xl mb-6">{t(`tms.features.list.${index}.icon`)}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {t(`tms.features.list.${index}.title`)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(`tms.features.list.${index}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Stability Section */}
      <section className="min-h-screen flex items-center px-6 py-20 bg-white">
        <div className="max-w-2xl mx-auto w-full">
          <h2 className="text-3xl md:text-3xl font-bold text-gray-900 mb-12 text-center">
            {t('tms.security.title')}
          </h2>
          <div className="space-y-12">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="group"
              >
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                  {t(`tms.security.items.${index}.title`)}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed pl-4 border-l-4 border-gray-200 group-hover:border-green-600 transition-colors">
                  {t(`tms.security.items.${index}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Detailed */}
      <footer className="text-gray-300" style={{ backgroundColor: 'rgb(22, 22, 22)' }}>
        <div className="max-w-[1280px] px-6 pt-7 pb-10 flex flex-col gap-4">
          {/* Logo */}
          <img 
            src="/logo-primary-light.svg" 
            alt="Paiptree Logo" 
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
