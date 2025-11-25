'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TmsPage() {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();

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

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleDownload}
              className="w-full sm:w-[240px] px-8 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl cursor-pointer"
            >
              {t('tms.download.buttons.android')}
            </button>
            <a
              href="#features"
              className="w-full sm:w-[240px] px-8 py-4 bg-white text-black font-semibold rounded-full border-2 border-gray-200 hover:border-gray-400 transition-all text-center"
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

      {/* Features Section - Minimal Cards */}
      <section id="features" className="min-h-screen flex items-center px-6 py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16 text-center">
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

      {/* Benefits Section - Big Typography */}
      <section className="min-h-screen flex items-center px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto w-full">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center">
            {t('tms.benefits.title')}
          </h2>
          <div className="space-y-12">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="group"
              >
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {t(`tms.benefits.items.${index}.title`)}
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed pl-4 border-l-4 border-gray-200 group-hover:border-blue-600 transition-colors">
                  {t(`tms.benefits.items.${index}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section - Dark with Contrast */}
      <section id="download" className="min-h-screen flex items-center px-6 py-20 bg-black text-white">
        <div className="max-w-3xl mx-auto text-center w-full">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('tms.download.title')}
          </h2>
          <p className="text-xl text-gray-400 mb-12 leading-relaxed whitespace-pre-line">
            {t('tms.download.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-4 px-8 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-2xl"
            >
              {t('tms.download.buttons.android')}
            </a>
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-4 px-8 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-2xl"
            >
              {t('tms.download.buttons.ios')}
            </a>
          </div>
          <button className="mt-6 px-8 py-4 bg-transparent text-white font-semibold rounded-full border-2 border-white hover:bg-white hover:text-black transition-all">
            {t('tms.download.buttons.contact')}
          </button>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="px-6 py-12 bg-black text-center text-gray-500 text-sm border-t border-gray-900">
        <p className="font-medium text-gray-400 mb-2">
          {t('tms.footer.company')}
        </p>
        <p>{t('tms.footer.copyright')}</p>
      </footer>
    </div>
  );
}
