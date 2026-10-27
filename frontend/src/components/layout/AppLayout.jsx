import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { QuickAddModal } from '../dashboard/QuickAddModal';
import { Loader2 } from 'lucide-react';

export const AppLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // If loading session, show clean splash loader
  if (isLoading) {
    return (
      <div className="app-loading-screen">
        <div className="loading-spinner-box">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="loading-text">Loading SpendWise...</p>
        </div>
      </div>
    );
  }

  // Route protection: redirect unauthenticated visitor to login, preserving intended path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className={`app-root-layout ${sidebarCollapsed ? 'layout-sidebar-collapsed' : ''}`}>
      {/* Sidebar Navigation */}
      <AppSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main-viewport">
        <AppHeader
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenQuickAdd={() => setQuickAddOpen(true)}
        />

        <main className="app-content-container">
          <Outlet />
        </main>
      </div>

      {/* Global Quick Add Transaction Modal */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
      />
    </div>
  );
};
