
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from './LanguageSelector';
import { LogOut, Activity } from 'lucide-react';

const Navbar = ({ titleKey }) => {
    const { t } = useLanguage();
    const { logout } = useAuth();

    return (
        <nav className="bg-gradient-to-r from-primary to-accent shadow-md text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Activity className="w-6 h-6" />
                    <span className="font-bold text-lg">{t(titleKey)}</span>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageSelector />
                    <button
                        onClick={logout}
                        className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1 rounded hover:bg-white/20 transition"
                    >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
