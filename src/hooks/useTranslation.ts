'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { translations, TranslationKeys } from '@/data/translations/index';

export function useTranslation() {
  const { language } = useLanguage();
  
  const t = (key: string, variables?: Record<string, any>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key} for language: ${language}`);
        return key;
      }
    }
    
    let result = typeof value === 'string' ? value : key;
    
    // Replace variables in the string
    if (variables && typeof result === 'string') {
      Object.entries(variables).forEach(([varKey, varValue]) => {
        result = result.replace(new RegExp(`{${varKey}}`, 'g'), String(varValue));
      });
    }
    
    return result;
  };

  return { t, language };
}