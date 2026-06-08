import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', borderRadius: '8px', padding: '4px' }}>
      <button
        onClick={() => setTheme('light')}
        style={{
          padding: '8px',
          background: theme === 'light' ? 'var(--primary)' : 'transparent',
          color: theme === 'light' ? '#fff' : 'var(--text-secondary)',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.2s ease',
        }}
        title="Light Mode"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        style={{
          padding: '8px',
          background: theme === 'dark' ? 'var(--primary)' : 'transparent',
          color: theme === 'dark' ? '#fff' : 'var(--text-secondary)',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.2s ease',
        }}
        title="Dark Mode"
      >
        <Moon size={16} />
      </button>
      <button
        onClick={() => setTheme('auto')}
        style={{
          padding: '8px',
          background: theme === 'auto' ? 'var(--primary)' : 'transparent',
          color: theme === 'auto' ? '#fff' : 'var(--text-secondary)',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.2s ease',
        }}
        title="Auto (System)"
      >
        <Monitor size={16} />
      </button>
    </div>
  );
};
