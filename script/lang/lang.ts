import { LANG_RU_RU } from './ru_RU.ts';
import { LANG_EN_US } from './en_US.ts';
import { preferedLanguage } from '../constants/index.ts';

export type LANG = 'ru' | 'en';

export const LANG_LABELS: Record<LANG, string> = {
  ru: 'Русский',
  en: 'English',
};

export const LANG_CODES: Record<LANG, string> = {
  ru: 'ru-RU',
  en: 'en-US',
};

export const LANG_FLAGS: Record<LANG, string> = {
  ru: '🇷🇺',
  en: '🇺🇸',
};

export type LangDictionary = Record<
  string,
  | string
  | {
      [key: string]: string | LangDictionary;
    }
>;

export const LANGS: Record<LANG, LangDictionary> = {
  ru: LANG_RU_RU,
  en: LANG_EN_US,
};

export const LANG_DEFAULT: LANG = preferedLanguage.startsWith('ru')
  ? 'ru'
  : 'en';

export function translate(
  key: string,
  params?: { [key: string]: string | number | boolean | null | undefined }
): string {
  const parts = key.split('.');

  const currentLang = (window.__appState().lang as LANG) || LANG_DEFAULT;

  let dict: LangDictionary = LANGS[currentLang];

  let translation: string | undefined;

  for (const part of parts) {
    if (dict && part in dict) {
      if (typeof dict[part] === 'string') {
        translation = dict[part] as string;
      } else if (typeof dict[part] === 'object') {
        dict = dict[part] as LangDictionary;
      } else {
        throw new Error(`Invalid type ${typeof dict[part]} for key '${key}'`);
      }
    }
  }

  if (params && translation) {
    for (const [key, value] of Object.entries(params)) {
      if (value == null) continue;
      translation = translation.replace(`{${key}}`, String(value));
    }
  }

  // fallback to key if translation not found
  return translation || key;
}

export const t = translate;
