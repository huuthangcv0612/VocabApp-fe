import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import viCommon from './locales/vi/common.json';
import enCommon from './locales/en/common.json';

import viAuth from './locales/vi/auth.json';
import enAuth from './locales/en/auth.json';

import viLearning from './locales/vi/learning.json';
import enLearning from './locales/en/learning.json';

import viSubscription from './locales/vi/subscription.json';
import enSubscription from './locales/en/subscription.json';

import viPayment from './locales/vi/payment.json';
import enPayment from './locales/en/payment.json';

import viAi from './locales/vi/ai.json';
import enAi from './locales/en/ai.json';

export const LANGUAGE_STORAGE_KEY = 'vocabapp_language';

const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
const initialLanguage = savedLanguage === 'en' || savedLanguage === 'vi' ? savedLanguage : 'vi';

export const resources = {
  vi: {
    common: viCommon,
    auth: viAuth,
    learning: viLearning,
    subscription: viSubscription,
    payment: viPayment,
    ai: viAi,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    learning: enLearning,
    subscription: enSubscription,
    payment: enPayment,
    ai: enAi,
  },
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'vi',
    defaultNS: 'common',
    ns: ['common', 'auth', 'learning', 'subscription', 'payment', 'ai'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
    },
  });

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    document.documentElement.lang = lng;
  } catch {
    // ignore storage errors
  }
});

// Set initial html lang attribute
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
}

export default i18n;
