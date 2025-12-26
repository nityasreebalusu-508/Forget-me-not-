import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePreferences } from '../../contexts/PreferencesContext';
import Navbar from './Navbar';
import SecondaryNavbar from './SecondaryNavbar';
import Sidebar from './Sidebar';
import {
    Heart, Pill, Users, LayoutDashboard
} from 'lucide-react';

const DashboardLayout = ({ children, activeTab, setActiveTab }) => {
    const { t } = useLanguage();
    const { layoutMode } = usePreferences();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
        { id: 'heartRate', label: t.heartRate, icon: Heart },
        { id: 'medications', label: t.medications, icon: Pill },
        { id: 'contacts', label: t.emergencyContacts, icon: Users },
    ];

    return (
        <div className="min-h-screen bg-bg-primary text-text-main flex flex-col transition-colors duration-300">
            <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

            {/* Layout Wrapper */}
            <div className={`flex flex-1 w-full max-w-7xl mx-auto ${layoutMode === 'sidebar' ? 'flex-row gap-6 px-4 pt-6' : 'flex-col'}`}>

                {/* Desktop Navigation */}
                <div className="hidden md:block">
                    {layoutMode === 'navbar' ? (
                        <SecondaryNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
                    ) : (
                        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                    )}
                </div>

                {/* Main Content Area */}
                <main className={`flex-1 w-full px-4 pb-6 overflow-x-hidden ${layoutMode === 'navbar' ? 'pt-0' : 'pt-6'}`}>

                    {/* Mobile Navigation Drawer (Visible only when menu open on mobile) */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden glass-panel rounded-xl p-2 mb-6 animate-fade-in border border-glass-border">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === item.id
                                        ? 'bg-primary text-white shadow-lg'
                                        : 'text-text-muted hover:bg-bg-primary hover:text-text-main'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
