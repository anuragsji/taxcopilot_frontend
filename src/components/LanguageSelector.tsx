import React from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, languages } = useI18n();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLang = languages.find(l => l.code === language);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '13px',
          transition: 'all 0.2s ease',
        }}
      >
        <Globe size={16} />
        <span>{currentLang?.nativeName}</span>
      </button>

      {isOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
            }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              minWidth: '180px',
              zIndex: 1000,
              overflow: 'hidden',
            }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: language === lang.code ? 'var(--primary-glow)' : 'transparent',
                  color: language === lang.code ? 'var(--primary)' : 'var(--text-primary)',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (language !== lang.code) {
                    e.currentTarget.style.background = 'var(--surface-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (language !== lang.code) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span>{lang.nativeName}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
