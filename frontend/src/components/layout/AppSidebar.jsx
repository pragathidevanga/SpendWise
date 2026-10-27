import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Wallet,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { ConfirmModal } from '../common/ConfirmModal';

export const AppSidebar = ({ isCollapsed, onToggleCollapse, mobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const { unreadCount, loadSampleData, transactions } = useFinance();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { label: 'Budgets', path: '/budgets', icon: PieChart },
    { label: 'Savings Goals', path: '/goals', icon: Target },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div className="sidebar-mobile-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`app-sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="brand-logo" onClick={() => navigate('/app')}>
            <div className="brand-logo-icon">
              <Wallet size={20} className="text-white" />
            </div>
            {!isCollapsed && (
              <span className="brand-name">Spend<span>Wise</span></span>
            )}
          </div>
          <button
            type="button"
            className="sidebar-collapse-toggle desktop-only"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">{!isCollapsed ? 'MAIN MENU' : '•'}</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'nav-item-active' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <div className="nav-item-icon-box">
                  <Icon size={20} />
                  {isCollapsed && item.badge > 0 && (
                    <span className="collapsed-badge-dot" />
                  )}
                </div>
                {!isCollapsed && (
                  <>
                    <span className="nav-item-label">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="nav-item-badge">{item.badge}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Demo Utilities (Shown if zero or few transactions) */}
        {!isCollapsed && transactions.length === 0 && (
          <div className="sidebar-sample-prompt">
            <div className="prompt-header">
              <Database size={16} className="text-primary" />
              <span>Quick Demo</span>
            </div>
            <p className="prompt-text">
              Want to see realistic charts and budgets in action?
            </p>
            <button
              type="button"
              className="btn-seed-sample"
              onClick={loadSampleData}
            >
              <Sparkles size={14} /> Populate Demo Data
            </button>
          </div>
        )}

        {/* User Card & Sign Out at Bottom */}
        <div className="sidebar-footer">
          <div className="sidebar-user-pill">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
              alt={user?.name}
              className="sidebar-user-avatar"
            />
            {!isCollapsed && (
              <div className="sidebar-user-meta">
                <span className="sidebar-user-name">{user?.name}</span>
                <span className="sidebar-user-role">
                  {user?.isDemo ? 'Demo Mode' : 'Personal Account'}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={() => setShowLogoutConfirm(true)}
            title={isCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out of SpendWise?"
        message="Your financial records and preferences are securely saved in this browser. You can sign back in anytime."
        confirmText="Sign Out"
        confirmVariant="danger"
      />
    </>
  );
};
