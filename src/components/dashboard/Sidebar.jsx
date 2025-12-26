import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePreferences } from '../../contexts/PreferencesContext';
import { LayoutDashboard, Heart, Pill, Users, Layout } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, className = '' }) => {
    const { t } = useLanguage();
    const { toggleLayoutMode } = usePreferences();

    const menuItems = [
        { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
        { id: 'heartRate', label: t.heartRate, icon: Heart },
        { id: 'medications', label: t.medications, icon: Pill },
        { id: 'contacts', label: t.emergencyContacts, icon: Users },
    ];

    return (
        <aside className={`w-64 glass-panel rounded-2xl flex flex-col h-[calc(100vh-6rem)] sticky top-24 ${className}`}>
            <div className="p-4 space-y-2 flex-1">
                <h3 className="text-xs font-bold text-text-muted uppercase px-4 mb-2">Menu</h3>
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'text-text-muted hover:bg-bg-primary hover:text-text-main'
                            }`}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Layout Toggle at bottom */}
            <div className="p-4 border-t border-glass-border">
                <button
                    onClick={toggleLayoutMode}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:bg-bg-primary hover:text-primary transition-all"
                    title="Switch to Navbar Layout"
                >
                    <Layout size={20} />
                    <span className="text-sm">Switch to Navbar</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
