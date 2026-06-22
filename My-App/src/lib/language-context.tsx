import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiGet, apiPut } from './api-client';
import { API } from './endpoints';
import { getTranslation } from './translations';

type Language = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
};

type LanguageContextType = {
  lang: string;
  setLang: (code: string) => Promise<void>;
  t: (key: string) => string;
  loading: boolean;
  availableLanguages: Language[];
};

const LANGUAGES: Language[] = [
  { code: 'id', name: 'Bahasa Indonesia', nativeName: 'Bahasa Indonesia', flag: '\u{1F1EE}\u{1F1E9}' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: 'ar', name: 'Arabic', nativeName: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629', flag: '\u{1F1F8}\u{1F1E6}' },
  { code: 'zh', name: 'Chinese', nativeName: '\u4E2D\u6587', flag: '\u{1F1E8}\u{1F1F3}' },
  { code: 'ja', name: 'Japanese', nativeName: '\u65E5\u672C\u8A9E', flag: '\u{1F1EF}\u{1F1F5}' },
  { code: 'ko', name: 'Korean', nativeName: '\uD55C\uAD6D\uC5B4', flag: '\u{1F1F0}\u{1F1F7}' },
  { code: 'fr', name: 'French', nativeName: 'Fran\u00E7ais', flag: '\u{1F1EB}\u{1F1F7}' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '\u{1F1E9}\u{1F1EA}' },
  { code: 'es', name: 'Spanish', nativeName: 'Espa\u00F1ol', flag: '\u{1F1EA}\u{1F1F8}' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Portugu\u00EAs', flag: '\u{1F1F5}\u{1F1F9}' },
  { code: 'ru', name: 'Russian', nativeName: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439', flag: '\u{1F1F7}\u{1F1FA}' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '\u{1F1F3}\u{1F1F1}' },
];

const LANG_STORAGE_KEY = 'user_language';

const LanguageContext = createContext<LanguageContextType>({
  lang: 'id',
  setLang: async () => {},
  t: (key: string) => key,
  loading: false,
  availableLanguages: LANGUAGES,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState('id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(LANG_STORAGE_KEY);
        if (stored) {
          setLangState(stored);
        }
        try {
          const res: any = await apiGet(API.USER_LANGUAGE);
          const serverLang = res.data?.lang;
          if (serverLang) {
            setLangState(serverLang);
            await SecureStore.setItemAsync(LANG_STORAGE_KEY, serverLang);
          }
        } catch {
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setLang = useCallback(async (code: string) => {
    setLangState(code);
    await SecureStore.setItemAsync(LANG_STORAGE_KEY, code);
    try {
      await apiPut(API.USER_LANGUAGE, { lang: code });
    } catch {
    }
  }, []);

  const t = useCallback((key: string) => getTranslation(key, lang), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, loading, availableLanguages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
