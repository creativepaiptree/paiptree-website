import { commonTranslations } from './common';
import { aboutTranslations } from './about';
import { servicesTranslations } from './services';
import { cultureTranslations } from './culture';
import { blogTranslations } from './blog';
import { newsroomTranslations } from './newsroom';

// 모든 번역을 합치는 헬퍼 함수
function mergeTranslations(...translationObjects: any[]) {
  const merged = { ko: {}, en: {} };
  
  translationObjects.forEach(translations => {
    Object.assign(merged.ko, translations.ko);
    Object.assign(merged.en, translations.en);
  });
  
  return merged;
}

// 모든 번역 데이터를 합침
export const translations = mergeTranslations(
  commonTranslations,
  aboutTranslations,
  servicesTranslations,
  cultureTranslations,
  blogTranslations,
  newsroomTranslations
);

export type TranslationKeys = typeof translations.ko;