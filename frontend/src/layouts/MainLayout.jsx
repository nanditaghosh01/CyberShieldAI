import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export const MainLayout = ({ activeTab, setActiveTab, children, onQuickScan }) => {
  const titles = {
    dashboard: "Threat Intelligence Dashboard",
    scanner: "Intelligent URL Security Scanner",
    assessment: "Website Security Posture Assessment",
    ssl: "SSL/TLS Certificate & Chain Inspector",
    'threat-intel': "Threat Intelligence & Domain Reputation",
    community: "Collaborative Community Threat Intelligence",
    history: "Historical Scans & Security Reports",
    'model-evaluation': "Machine Learning Model Evaluation",
    settings: "Platform Configuration & Safeguards",
    login: "Authentication Portal",
    register: "Account Registration"
  };

  return (
    <div className="flex min-h-screen bg-[#0b1523] text-[#f3fbf0]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          title={titles[activeTab] || "CyberShield AI"} 
          onQuickScan={activeTab !== 'scanner' ? () => setActiveTab('scanner') : null} 
        />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
