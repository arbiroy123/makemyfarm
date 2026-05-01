import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';
import bn from './locales/bn.json';
import te from './locales/te.json';
import ta from './locales/ta.json';
import kn from './locales/kn.json';
import or_ from './locales/or.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English',    nativeName: 'English' },
  { code: 'es', name: 'Spanish',    nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'hi', name: 'Hindi',      nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi',    nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali',    nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu',     nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil',      nativeName: 'தமிழ்' },
  { code: 'kn', name: 'Kannada',    nativeName: 'ಕನ್ನಡ' },
  { code: 'or', name: 'Odia',       nativeName: 'ଓଡ଼ିଆ' },
];

const SUPPORTED_CODES = SUPPORTED_LANGUAGES.map(l => l.code);
const LANG_STORAGE_KEY = 'appLanguage';

const deviceLang = Localization.getLocales?.()?.[0]?.languageCode ?? 'en';
const initialLang = SUPPORTED_CODES.includes(deviceLang) ? deviceLang : 'en';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    lng: initialLang,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      es: { translation: es },
      pt: { translation: pt },
      hi: { translation: hi },
      mr: { translation: mr },
      bn: { translation: bn },
      te: { translation: te },
      ta: { translation: ta },
      kn: { translation: kn },
      or: { translation: or_ },
    },
    interpolation: { escapeValue: false },
  });

export async function loadSavedLanguage() {
  try {
    const saved = await AsyncStorage.getItem(LANG_STORAGE_KEY);
    if (saved && SUPPORTED_CODES.includes(saved)) {
      await i18n.changeLanguage(saved);
    }
  } catch (_) {}
}

export async function setLanguage(code) {
  await i18n.changeLanguage(code);
  try {
    await AsyncStorage.setItem(LANG_STORAGE_KEY, code);
  } catch (_) {}
}

export default i18n;
