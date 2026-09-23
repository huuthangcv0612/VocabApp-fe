import React from 'react';
import { useTranslation } from 'react-i18next';
import './languageSwitcher.css';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'vi';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`floating-lang-toggle ${className}`}
      title={currentLang === 'vi' ? 'Chuyển sang Tiếng Anh (Switch to English)' : 'Chuyển sang Tiếng Việt (Switch to Vietnamese)'}
      aria-label={currentLang === 'vi' ? 'Chuyển sang Tiếng Anh' : 'Switch to Vietnamese'}
    >
      <span className="lang-toggle-flag">
        {currentLang === 'vi' ? '🇻🇳' : '🇬🇧'}
      </span>
      <span className="lang-toggle-text">
        {currentLang === 'vi' ? 'VI' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
