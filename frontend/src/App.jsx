import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  IxApplication,
  IxApplicationHeader,
  IxMenu,
  IxMenuCategory,
  IxMenuItem,
  IxContent,
  IxIconButton,
  IxTooltip
} from '@siemens/ix-react';
import { iconHome, iconBulb, iconInfo, iconSun, iconMoon } from '@siemens/ix-icons/icons';
import { themeSwitcher } from '@siemens/ix';
import Dashboard from './components/Dashboard/Dashboard';
import ProblemDetail from './components/ProblemDetail/ProblemDetail';

// Siemens iX Temel CSS'leri
import '@siemens/ix/dist/siemens-ix/siemens-ix.css';
import { defineCustomElements } from '@siemens/ix/loader';
import './App.css';

defineCustomElements();

/**
 * Get initial theme from localStorage or system preference
 */
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('ix-theme');
  if (savedTheme) return savedTheme;

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'theme-classic-light';
  }
  return 'theme-classic-dark';
};

/**
 * Application Layout with Siemens IX Framework
 */
const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTheme, setCurrentTheme] = useState(getInitialTheme());

  // Apply theme on mount and change using data attributes
  useEffect(() => {
    const htmlElement = document.documentElement;

    if (currentTheme.includes('light')) {
      htmlElement.setAttribute('data-ix-theme', 'classic');
      htmlElement.setAttribute('data-ix-color-schema', 'light');
      htmlElement.classList.remove('theme-classic-dark');
      htmlElement.classList.add('theme-classic-light');
    } else {
      htmlElement.setAttribute('data-ix-theme', 'classic');
      htmlElement.setAttribute('data-ix-color-schema', 'dark');
      htmlElement.classList.remove('theme-classic-light');
      htmlElement.classList.add('theme-classic-dark');
    }

    // Also try themeSwitcher as backup
    try {
      themeSwitcher.setTheme(currentTheme);
    } catch (e) {
      console.log('Theme switcher fallback:', e);
    }

    localStorage.setItem('ix-theme', currentTheme);
  }, [currentTheme]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = currentTheme.includes('dark')
      ? 'theme-classic-light'
      : 'theme-classic-dark';
    setCurrentTheme(newTheme);
  };

  const isDarkMode = currentTheme.includes('dark');

  return (
    <IxApplication>
      <IxApplicationHeader
        name="8D Problem Solving"
      >
        <img
          slot="logo"
          src="/siemens-ag-logo.svg"
          alt="Siemens Logo"
          style={{ height: '32px' }}
        />

        {/* Theme Toggle Button */}
        <IxIconButton
          id="theme-toggle"
          icon={isDarkMode ? iconMoon : iconSun}
          oval
          variant="secondary"
          onClick={toggleTheme}
          aria-label={isDarkMode ? 'Aydınlık temaya geç' : 'Karanlık temaya geç'}
          style={{ marginRight: '16px' }}
        />
        <IxTooltip for="theme-toggle">
          {isDarkMode ? 'Aydınlık Tema' : 'Karanlık Tema'}
        </IxTooltip>
      </IxApplicationHeader>

      <IxMenu aria-label="Ana navigasyon menüsü">
        <IxMenuItem
          icon={iconHome}
          onClick={() => navigate('/')}
          active={location.pathname === '/'}
          aria-current={location.pathname === '/' ? 'page' : undefined}
        >
          Dashboard
        </IxMenuItem>

        {/* Bottom slot - Menü altında gösterilecek öğeler */}
        <IxMenuCategory label="Yardım" icon={iconInfo} slot="bottom">
          <IxMenuItem icon={iconBulb}>
            5 Neden Analizi
          </IxMenuItem>
        </IxMenuCategory>
      </IxMenu>

      <IxContent>
        <main id="main-content" role="main" aria-label="Ana içerik alanı">
          {children}
        </main>
      </IxContent>
    </IxApplication>
  );
};

/**
 * Main Application Component
 * Handles routing between Dashboard and Problem Detail views
 */
function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/problem/:id" element={<ProblemDetail />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;