import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  IxApplication, 
  IxApplicationHeader, 
  IxMenu, 
  IxMenuCategory,
  IxMenuItem,
  IxContent
} from '@siemens/ix-react';
import { iconHome, iconBulb, iconInfo } from '@siemens/ix-icons/icons';
import Dashboard from './components/Dashboard';
import ProblemDetail from './components/ProblemDetail';

// Siemens iX Temel CSS'leri
import '@siemens/ix/dist/siemens-ix/siemens-ix.css';
import { defineCustomElements } from '@siemens/ix/loader';
import './App.css';

defineCustomElements();

/**
 * Application Layout with Siemens IX Framework
 */
const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
      </IxApplicationHeader>

      <IxMenu>
        <IxMenuItem 
          icon={iconHome}
          onClick={() => navigate('/')}
          active={location.pathname === '/'}
        >
          Dashboard
        </IxMenuItem>
        <IxMenuCategory label="Yardım" icon={iconInfo}>
          <IxMenuItem icon={iconBulb}>
            5 Neden Analizi
          </IxMenuItem>
        </IxMenuCategory>
      </IxMenu>

      <IxContent>
        {children}
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