import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ServiceDesk } from './components/ServiceDesk';
import { LoginPage } from './components/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AssetManagement } from './components/AssetManagement';
import { SoftwareManagement } from './components/SoftwareManagement';
import { NetworkManagement } from './components/NetworkManagement';
import { Infrastructure } from './components/Infrastructure';
import { CloudServices } from './components/CloudServices';
import { DatabaseManagement } from './components/DatabaseManagement';
import { DomainHosting } from './components/DomainHosting';
import { VendorManagement } from './components/VendorManagement';
import { ITProcurement } from './components/ITProcurement';
import { Security } from './components/Security';
import { SystemAdmin } from './components/SystemAdmin';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    // Handle Service Desk routes
    if (currentPage === 'service-desk' || 
        currentPage === 'service-desk-home' ||
        currentPage === 'create-ticket' || 
        currentPage === 'tickets' || 
        currentPage === 'knowledge-base') {
      return (
        <ServiceDesk 
          view={currentPage === 'service-desk' ? 'service-desk-home' : currentPage}
          onViewChange={(view) => setCurrentPage(view)}
        />
      );
    }

    // Handle Asset Management routes
    if (currentPage === 'asset-management' ||
        currentPage === 'hardware' ||
        currentPage === 'mobile-devices' ||
        currentPage === 'network-devices') {
      return <AssetManagement />;
    }

    // Handle Software Management route
    if (currentPage === 'software-management') {
      return <SoftwareManagement />;
    }

    // Handle Network Management route
    if (currentPage === 'network-management') {
      return <NetworkManagement />;
    }

    // Handle Infrastructure routes
    if (currentPage === 'infrastructure' ||
        currentPage === 'servers' ||
        currentPage === 'storage' ||
        currentPage === 'network') {
      return <Infrastructure />;
    }

    // Handle Database Management route
    if (currentPage === 'database-management' ||
        currentPage === 'database-instances' ||
        currentPage === 'backup-management' ||
        currentPage === 'performance-monitoring') {
      return <DatabaseManagement />;
    }

    // Handle Domain & Hosting routes
    if (currentPage === 'domain-hosting' ||
        currentPage === 'domain-management' ||
        currentPage === 'hosting-services' ||
        currentPage === 'ssl-certificates') {
      return <DomainHosting />;
    }

    // Handle Cloud Services route
    if (currentPage === 'cloud-services') {
      return <CloudServices />;
    }

    // Handle Security routes
    if (currentPage === 'security' ||
        currentPage === 'access-control' ||
        currentPage === 'security-monitoring' ||
        currentPage === 'incidents' ||
        currentPage === 'compliance') {
      return <Security />;
    }

    // Handle System Admin routes
    if (currentPage === 'system-admin' ||
        currentPage === 'users' ||
        currentPage === 'roles' ||
        currentPage === 'system-settings' ||
        currentPage === 'system-logs') {
      return <SystemAdmin />;
    }

    // Handle Vendor Management routes
    if (currentPage === 'vendor-management' ||
        currentPage === 'contracts' ||
        currentPage === 'agreements' ||
        currentPage === 'performance' ||
        currentPage === 'contacts') {
      return <VendorManagement />;
    }

    // Handle IT Procurement routes
    if (currentPage === 'it-procurement' ||
        currentPage === 'purchase-requests' ||
        currentPage === 'purchase-orders' ||
        currentPage === 'budget' ||
        currentPage === 'approvals') {
      return <ITProcurement />;
    }

    // Handle other routes
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      default:
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <p className="text-gray-500">Content for {currentPage} will be displayed here</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-800/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Main layout */}
      <div className="flex">
        {/* Sidebar - Fixed position on desktop */}
        <div className="hidden lg:block lg:w-64 lg:fixed lg:inset-y-0">
          <Sidebar 
            currentPage={currentPage} 
            onPageChange={setCurrentPage} 
            isOpen={true}
            onClose={() => {}}
          />
        </div>

        {/* Mobile sidebar - Absolute position */}
        <div className="lg:hidden">
          <div className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <Sidebar 
              currentPage={currentPage} 
              onPageChange={(page) => {
                setCurrentPage(page);
                setSidebarOpen(false);
              }}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 min-w-0 lg:pl-64">
          {/* Fixed header */}
          <Header 
            onMenuClick={() => setSidebarOpen(true)} 
            currentPage={currentPage}
          />
          
          {/* Main content with proper padding */}
          <main className="pt-16">
            {renderPage()}
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;