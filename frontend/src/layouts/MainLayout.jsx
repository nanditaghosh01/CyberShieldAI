import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export const MainLayout = ({ activeTab, setActiveTab, children, onQuickScan }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const titles = {
    dashboard: "Threat Intelligence Dashboard",
    scanner: "Intelligent URL Security Scanner",
    assessment: "Website Security Posture Assessment",
    ssl: "SSL/TLS Certificate & Chain Inspector",
    'threat-intel': "Threat Intelligence & Domain Reputation",
    community: "Community Threat Watch",
    history: "Inspection History & Audit Reports",
    'model-evaluation': "Detection Engine & Model Benchmarks",
    settings: "Platform Settings & Safeguards",
    login: "Authentication Portal",
    register: "Account Registration"
  };

  return (
    <div className="flex min-h-screen bg-[#0b1523] text-[#f3fbf0] relative">
      {/* Responsive Sidebar (docked on desktop, off-canvas drawer on mobile/tablet) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Navbar 
          title={titles[activeTab] || "CyberShield AI"} 
          onQuickScan={activeTab !== 'scanner' ? () => setActiveTab('scanner') : null} 
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="flex-1 p-3.5 sm:p-5 lg:p-7 max-w-7xl w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
