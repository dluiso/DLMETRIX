import { useState, useEffect } from 'react';
import { getTranslations, type Translations } from '@/lib/translations';

export function useTranslation() {
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [t, setT] = useState<Translations>(getTranslations('en'));

  useEffect(() => {
    // Get language from localStorage or default to 'en'
    const savedLanguage = localStorage.getItem('language') as 'en' | 'es' || 'en';
    setLanguage(savedLanguage);
    setT(getTranslations(savedLanguage));
  }, []);

  const changeLanguage = (newLanguage: 'en' | 'es') => {
    setLanguage(newLanguage);
    setT(getTranslations(newLanguage));
    localStorage.setItem('language', newLanguage);
  };

  return { t, language, changeLanguage };
}