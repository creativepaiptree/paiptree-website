'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="relative w-14 h-6 bg-gray-600 rounded-full transition-colors duration-200 focus:outline-none flex items-center"
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
          language === 'en' ? 'translate-x-8' : 'translate-x-0.5'
        }`}
      />
      {language === 'ko' && (
        <span className="absolute right-2.5 text-xs font-medium text-[#00ABE6]">
          KO
        </span>
      )}
      {language === 'en' && (
        <span className="absolute left-2.5 text-xs font-medium text-[#00ABE6]">
          EN
        </span>
      )}
    </button>
  );
}