import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translations, translations } from '../i18n/translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  languages: Array<{ code: Language; name: string; nativeName: string }>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const languages = [
  { code: 'en' as Language, name: 'English', nativeName: 'English' },
  { code: 'hi' as Language, name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'bn' as Language, name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pa' as Language, name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ur' as Language, name: 'Urdu', nativeName: 'اردو' },
  { code: 'mr' as Language, name: 'Marathi', nativeName: 'मराठी' },
];

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('taxcopilot_language');
    return (stored as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('taxcopilot_language', lang);
    document.documentElement.setAttribute('lang', lang);
  };

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t: translations[language], languages }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
};
