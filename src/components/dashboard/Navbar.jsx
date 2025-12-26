import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePreferences } from '../../contexts/PreferencesContext';
import {
    Heart, Menu, X, Globe, Bell, ChevronDown, User, Settings, Sun, Moon, Layout, Sidebar as SidebarIcon, LayoutDashboard, LogOut
} from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const { logout, user } = useAuth();
    const { t, language, setLanguage, availableLanguages } = useLanguage();
    const { theme, toggleTheme, layoutMode, toggleLayoutMode } = usePreferences();

    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isUserOpen, setIsUserOpen] = useState(false);

    const langRef = useRef(null);
    const userRef = useRef(null);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langRef.current && !langRef.current.contains(event.target)) {
                setIsLangOpen(false);
            }
            if (userRef.current && !userRef.current.contains(event.target)) {
                setIsUserOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleLanguage = (lang) => {
        setLanguage(lang);
        setIsLangOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 w-full px-4 py-3 glass-panel border-b border-glass-border/50 bg-bg-card/90 backdrop-blur-md rounded-none mb-0">
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                {/* Left: Logo */}
                <div className="flex items-center gap-4">
                    <button
                        className="md:hidden p-2 text-text-muted hover:text-text-main"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                            <Heart size={18} fill="currentColor" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:block">
                            {t.appName}
                        </span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-text-muted hover:bg-bg-primary hover:text-warning transition-colors"
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Layout Toggle (Desktop Only) 
                    <button
                        onClick={toggleLayoutMode}
                        className="hidden md:block p-2 rounded-lg text-text-muted hover:bg-bg-primary hover:text-primary transition-colors"
                        title="Switch Layout (Navbar/Sidebar)"
                    >
                        {layoutMode === 'navbar' ? <SidebarIcon size={20} /> : <Layout size={20} />}
                    </button>*/}

                    {/* Language Dropdown */}
                    <div className="relative" ref={langRef}>
                        <button
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="p-2 rounded-lg text-text-muted hover:bg-bg-primary hover:text-text-main transition-colors flex items-center gap-1"
                        >
                            <Globe size={20} />
                            <span className="uppercase text-sm font-bold">{language}</span>
                        </button>

                        {isLangOpen && (
                            <div className="absolute right-0 mt-2 w-32 glass-panel rounded-xl py-2 shadow-xl animate-fade-in z-50">
                                {availableLanguages.map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => toggleLanguage(lang)}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-bg-primary flex items-center justify-between ${language === lang ? 'text-primary font-bold' : 'text-text-muted'
                                            }`}
                                    >
                                        {lang.toUpperCase()}
                                        {language === lang && <Heart size={12} fill="currentColor" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-px h-6 bg-glass-border mx-1 hidden sm:block"></div>

                    {/* User Profile Dropdown */}
                    <div className="relative" ref={userRef}>
                        <button
                            onClick={() => setIsUserOpen(!isUserOpen)}
                            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-bg-primary transition-colors border border-transparent hover:border-glass-border"
                        >
                            <div className="hidden sm:flex flex-col items-end mr-1">
                                <span className="text-xs font-medium text-text-main">{user?.email?.split('@')[0]}</span>
                                <span className="text-[10px] text-text-muted">{t.userRole || 'User'}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-white shadow-lg">
                                <User size={16} />
                            </div>
                            <ChevronDown size={14} className={`text-text-muted transition-transform ${isUserOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isUserOpen && (
                            <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl py-2 shadow-xl animate-fade-in border border-glass-border z-50">
                                <div className="px-4 py-3 border-b border-glass-border mb-2">
                                    <p className="text-sm font-bold text-text-main">{t.signedInAs || 'Signed in as'}</p>
                                    <p className="text-xs text-text-muted truncate">{user?.email}</p>
                                </div>

                                <button
                                    onClick={() => { setActiveTab('dashboard'); setIsUserOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-text-muted hover:text-primary hover:bg-bg-primary flex items-center gap-2"
                                >
                                    <LayoutDashboard size={16} />
                                    {t.dashboard || 'Dashboard'}
                                </button>

                                <button
                                    className="w-full text-left px-4 py-2 text-sm text-text-muted hover:text-primary hover:bg-bg-primary flex items-center gap-2"
                                >
                                    <Settings size={16} />
                                    {t.settings || 'Settings'}
                                </button>

                                <div className="h-px bg-glass-border my-2"></div>

                                <button
                                    onClick={logout}
                                    className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center gap-2"
                                >
                                    <LogOut size={16} />
                                    {t.logout}
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;
