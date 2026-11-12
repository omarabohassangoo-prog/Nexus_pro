import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { publicApi } from '../api/public.api';

interface LanguageState {
  lang: string;
  dir: 'rtl' | 'ltr';
  t: (key: string, fallback?: string) => string;
  setLang: (code: string) => void;
}

const LanguageContext = createContext<LanguageState | null>(null);
const LANG_KEY = 'nexus.lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<string>(() => localStorage.getItem(LANG_KEY) ?? 'ar');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const dir: 'rtl' | 'ltr' = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem(LANG_KEY, lang);
    publicApi.translations(lang).then(setTranslations).catch(() => {});
  }, [lang, dir]);

  const setLang = (code: string) => setLangState(code);
  const t = (key: string, fallback?: string) => translations[key] ?? fallback ?? key;

  const value = useMemo<LanguageState>(() => ({ lang, dir, t, setLang }), [lang, dir, translations]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
