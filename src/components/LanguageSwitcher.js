import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="language-switcher">
            <button
                onClick={() => changeLanguage('tr')}
                style={{ fontWeight: i18n.language === 'tr' ? 'bold' : 'normal' }}
            >
                TR
            </button>
            <span style={{ margin: '0 5px' }}>|</span>
            <button
                onClick={() => changeLanguage('en')}
                style={{ fontWeight: i18n.language === 'en' ? 'bold' : 'normal' }}
            >
                EN
            </button>
        </div>
    );
};

export default LanguageSwitcher;
