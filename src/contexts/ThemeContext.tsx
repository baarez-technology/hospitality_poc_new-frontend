import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  // Load theme from localStorage or default to 'light'
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem('glimmora_dashboard_theme');
      return stored || 'light';
    } catch {
      return 'light';
    }
  });

  // Update localStorage and document class when theme changes
  useEffect(() => {
    localStorage.setItem('glimmora_dashboard_theme', theme);

    // Update document root class for global CSS variables
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isDark = theme === 'dark';

  // Theme-specific color values for components
  const colors = {
    // Backgrounds
    pageBg: isDark ? '#0f0f0f' : '#FAFAFA',
    cardBg: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
    cardBgSolid: isDark ? '#1a1a1a' : '#ffffff',
    headerBg: isDark ? '#141414' : '#ffffff',

    // Text
    textPrimary: isDark ? '#ffffff' : '#1a1a1a',
    textSecondary: isDark ? 'rgba(255,255,255,0.7)' : '#6b6560',
    textMuted: isDark ? 'rgba(255,255,255,0.5)' : '#9e9891',

    // Borders
    border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    borderHover: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(165,120,101,0.2)',

    // Accents (stay consistent)
    primary: '#A57865',
    gold: '#CDB261',
    teal: '#5C9BA4',
    green: '#4E5840',

    // Special
    glassBg: isDark
      ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
      : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
    glassBlur: isDark ? 'blur(20px)' : 'blur(10px)',
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
