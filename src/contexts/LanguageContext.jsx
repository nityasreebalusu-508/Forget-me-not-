import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';
import storageService from '../services/storage';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [t, setT] = useState(translations.en);

    useEffect(() => {
        // Load saved language
        const loadLanguage = async () => {
            const savedLang = await storageService.get('app_language');
            if (savedLang && translations[savedLang.value]) {
                setLanguage(savedLang.value);
            }
        };
        loadLanguage();
    }, []);

    useEffect(() => {
        setT(translations[language]);
        storageService.set('app_language', language);
    }, [language]);

    const value = {
        language,
        setLanguage,
        t,
        availableLanguages: Object.keys(translations)
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
