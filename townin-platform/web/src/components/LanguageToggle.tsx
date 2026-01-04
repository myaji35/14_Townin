import { useLanguage } from '../contexts/LanguageContext';
import './LanguageToggle.css';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  return (
    <button
      className="language-toggle"
      onClick={toggleLanguage}
      aria-label="Toggle Language"
    >
      <div className="toggle-container">
        <span className={`lang-option ${language === 'ko' ? 'active' : ''}`}>
          한글
        </span>
        <span className={`lang-option ${language === 'en' ? 'active' : ''}`}>
          EN
        </span>
        <div
          className="toggle-slider"
          style={{
            transform: language === 'en' ? 'translateX(100%)' : 'translateX(0)',
          }}
        />
      </div>
    </button>
  );
}
