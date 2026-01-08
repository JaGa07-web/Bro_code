
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState(localStorage.getItem('userLang') || 'en');

    useEffect(() => {
        localStorage.setItem('userLang', language);
    }, [language]);

    const t = (key) => {
        return translations[language][key] || key;
    };

    const setLanguage = (lang) => {
        setLanguageState(lang);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
