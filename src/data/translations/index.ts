import { commonTranslations } from './common';
import { homeTranslations } from './home';

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
  homeTranslations
) as const;

export type TranslationKeys = typeof translations.ko;