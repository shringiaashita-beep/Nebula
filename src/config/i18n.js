import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from '../locales/en/translation.json';
import translationHI from '../locales/hi/translation.json';
import translationHINGLISH from '../locales/hinglish/translation.json';

const resources = {
  en: { translation: translationEN },
  hi: { translation: translationHI },
  hinglish: { translation: translationHINGLISH }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });

export default i18n;
