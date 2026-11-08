import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { URLScanner } from './pages/URLScanner';
import { SecurityAssessment } from './pages/SecurityAssessment';
import { SSLInspector } from './pages/SSLInspector';
import { ThreatIntelligence } from './pages/ThreatIntelligence';
import { CommunityReports } from './pages/CommunityReports';
import { ScanHistory } from './pages/ScanHistory';
import { ModelEvaluation } from './pages/ModelEvaluation';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedScan, setSelectedScan] = useState(null);

  const handleOpenScan = (scan) => {
    setSelectedScan(scan);
    setActiveTab('scanner');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onSelectTab={setActiveTab} onOpenScan={handleOpenScan} />;
      case 'scanner':
        return <URLScanner initialResult={selectedScan} />;
      case 'assessment':
        return <SecurityAssessment />;
      case 'ssl':
        return <SSLInspector />;
      case 'threat-intel':
        return <ThreatIntelligence />;
      case 'community':
        return <CommunityReports />;
      case 'history':
        return <ScanHistory onOpenScan={handleOpenScan} />;
      case 'model-evaluation':
        return <ModelEvaluation />;
      case 'settings':
        return <Settings />;
      case 'login':
        return (
          <Login 
            onSwitchToRegister={() => setActiveTab('register')} 
            onSuccess={() => setActiveTab('dashboard')} 
          />
        );
      case 'register':
        return (
          <Register 
            onSwitchToLogin={() => setActiveTab('login')} 
            onSuccess={() => setActiveTab('dashboard')} 
          />
        );
      default:
        return <Dashboard onSelectTab={setActiveTab} onOpenScan={handleOpenScan} />;
    }
  };

  return (
    <AuthProvider>
      <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </MainLayout>
    </AuthProvider>
  );
}

export default App;

