
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
    const { language, setLanguage, t } = useLanguage();

    return (
        <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
            >
                <option value="en">English</option>
                <option value="ta">தமிழ்</option>
                <option value="hi">हिंदी</option>
            </select>
        </div>
    );
};

export default LanguageSelector;
