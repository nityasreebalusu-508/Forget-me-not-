import React, { createContext, useContext, useState, useEffect } from 'react';
import storageService from '../services/storage';

const PreferencesContext = createContext();

export const usePreferences = () => useContext(PreferencesContext);

export const PreferencesProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    const [layoutMode, setLayoutMode] = useState('navbar'); // 'navbar' or 'sidebar'
    const [loading, setLoading] = useState(true);

    // Initialize
    useEffect(() => {
        const loadPreferences = async () => {
            const savedTheme = await storageService.get('theme');
            const savedLayout = await storageService.get('layoutMode');

            if (savedTheme) setTheme(savedTheme.value);
            if (savedLayout) setLayoutMode(savedLayout.value);

            setLoading(false);
        };
        loadPreferences();
    }, []);

    // Effect to apply theme to document
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = async () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        await storageService.set('theme', newTheme);
    };

    const toggleLayoutMode = async () => {
        const newMode = layoutMode === 'navbar' ? 'sidebar' : 'navbar';
        setLayoutMode(newMode);
        await storageService.set('layoutMode', newMode);
    };

    return (
        <PreferencesContext.Provider value={{
            theme,
            toggleTheme,
            layoutMode,
            toggleLayoutMode,
            loading
        }}>
            {!loading && children}
        </PreferencesContext.Provider>
    );
};
