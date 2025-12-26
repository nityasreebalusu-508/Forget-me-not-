import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePreferences } from '../../contexts/PreferencesContext';
import Navbar from './Navbar';
import SecondaryNavbar from './SecondaryNavbar';
import Sidebar from './Sidebar';
import {
    Heart, Pill, Users, LayoutDashboard, Home
} from 'lucide-react';

const DashboardLayout = ({ children, activeTab, setActiveTab }) => {
    const { t } = useLanguage();
    const { layoutMode } = usePreferences();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: t.dashboard || 'Dashboard', icon: LayoutDashboard },
        { id: 'heartRate', label: t.heartRate || 'Heart Rate', icon: Heart },
        { id: 'medications', label: t.medications || 'Medications', icon: Pill },
        { id: 'contacts', label: t.emergencyContacts || 'Emergency Contacts', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-bg-primary text-text-main flex flex-col transition-all duration-300">
            <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

            {/* Layout Wrapper */}
            <div className={`flex flex-1 w-full ${layoutMode === 'sidebar' ? 'flex-row gap-6 px-4 md:px-6 pt-4 md:pt-6' : 'flex-col px-4 md:px-6'}`}>

                {/* Desktop Navigation */}
                {layoutMode === 'sidebar' && (
                    <div className="hidden md:block w-64 flex-shrink-0">
                        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                )}

                {/* Main Content Area */}
                <main className={`flex-1 w-full overflow-x-hidden ${layoutMode === 'navbar' ? 'pt-0' : 'pt-4 md:pt-6'}`}>

                    {/* Secondary Navbar for navbar layout mode */}
                    {layoutMode === 'navbar' && (
                        <div className="hidden md:block mb-6">
                            <SecondaryNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
                        </div>
                    )}

                    {/* Mobile Navigation Drawer (Visible only when menu open on mobile) */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden glass-panel rounded-xl p-3 mb-6 animate-fade-in border border-glass-border shadow-lg">
                            <div className="space-y-1">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveTab(item.id);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all ${activeTab === item.id
                                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                                            : 'text-text-muted hover:bg-bg-primary hover:text-text-main hover:bg-opacity-50'
                                            }`}
                                    >
                                        <item.icon size={20} />
                                        <span className="font-medium">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Content Container */}
                    <div className="animate-fade-in">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;