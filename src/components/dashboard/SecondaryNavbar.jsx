import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePreferences } from '../../contexts/PreferencesContext';
import { LayoutDashboard, Heart, Pill, Users, Sidebar as SidebarIcon } from 'lucide-react';

const SecondaryNavbar = ({ activeTab, setActiveTab }) => {
    const { t } = useLanguage();
    const { toggleLayoutMode } = usePreferences();

    const menuItems = [
        { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
        { id: 'heartRate', label: t.heartRate, icon: Heart },
        { id: 'medications', label: t.medications, icon: Pill },
        { id: 'contacts', label: t.emergencyContacts, icon: Users },
    ];

    return (
        <div className="w-full bg-bg-card/50 backdrop-blur-sm border-b border-glass-border">
            <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
                <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-1">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${activeTab === item.id
                                        ? 'border-primary text-primary font-medium'
                                        : 'border-transparent text-text-muted hover:text-text-main hover:border-glass-border'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Layout Toggle */}
                    <button
                        onClick={toggleLayoutMode}
                        className="p-2 rounded-lg text-text-muted hover:bg-bg-primary hover:text-primary transition-colors"
                        title="Switch to Sidebar Layout"
                    >
                        <SidebarIcon size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SecondaryNavbar;
