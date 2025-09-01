import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from '../locales/en/translation.json';
import translationKO from '../locales/ko/translation.json';

// the translations
const resources = {
  en: {
    translation: translationEN
  },
  ko: {
    translation: translationKO
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'ko', // default language
    fallbackLng: 'en', // fallback language if the current language is not available

    interpolation: {
      escapeValue: false // react already escapes by default
    }
  });

export default i18n;