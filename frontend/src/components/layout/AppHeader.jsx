import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  Plus,
  Server,
  CheckCircle2,
  AlertCircle,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';

export const AppHeader = ({ onToggleMobileSidebar, onOpenQuickAdd }) => {
  const { user, logout } = useAuth();
  const { unreadCount, backendStatus, pingBackend } = useFinance();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Map route path to readable page title
  const getPageTitle = (path) => {
    switch (path) {
      case '/app':
      case '/dashboard':
        return 'Financial Overview';
      case '/transactions':
        return 'Transaction Ledger';
      case '/budgets':
        return 'Budget Planner';
      case '/goals':
        return 'Savings Goals';
      case '/analytics':
        return 'Spending Analytics & Reports';
      case '/notifications':
        return 'Notification Center';
      case '/settings':
        return 'Settings & Preferences';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="app-header">
      <div className="app-header-left">
        <button
          type="button"
          className="app-sidebar-toggle-btn"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle sidebar menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="app-page-title">{getPageTitle(location.pathname)}</h1>
          <p className="app-page-welcome">
            Welcome back, <span className="font-semibold text-primary">{user?.name || 'Explorer'}</span>
          </p>
        </div>
      </div>

      <div className="app-header-right">
        {/* Backend Status Indicator */}
        <div
          className={`backend-status-pill ${backendStatus.online ? 'status-online' : 'status-offline'}`}
          title={
            backendStatus.online
              ? 'Local Express Backend: Connected & healthy (/api)'
              : 'Backend offline: App running smoothly in pure local client-storage mode. Click to recheck.'
          }
          onClick={pingBackend}
        >
          <span className="status-dot" />
          <Server size={13} className="status-icon" />
          <span className="status-label">
            {backendStatus.online ? 'API Online' : 'Client Mode'}
          </span>
        </div>

        {/* Quick Add Transaction Button */}
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={onOpenQuickAdd}
          className="header-quick-add-btn"
        >
          Add Record
        </Button>

        {/* Theme Toggle */}
        <button
          type="button"
          className="header-icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Icon with Badge */}
        <button
          type="button"
          className="header-icon-btn notif-btn"
          onClick={() => navigate('/notifications')}
          aria-label="View notifications"
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="header-badge-count">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Avatar / Menu */}
        <div className="user-profile-menu-container">
          <button
            type="button"
            className="header-user-avatar-btn"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            aria-label="User menu"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
              alt={user?.name}
              className="header-avatar-img"
            />
          </button>

          {profileMenuOpen && (
            <>
              <div className="menu-backdrop" onClick={() => setProfileMenuOpen(false)} />
              <div className="user-dropdown-card animate-scale-up">
                <div className="dropdown-user-header">
                  <p className="dropdown-user-name">{user?.name}</p>
                  <p className="dropdown-user-email">{user?.email}</p>
                  {user?.isDemo && (
                    <span className="dropdown-demo-badge">Demo Account</span>
                  )}
                </div>
                <div className="dropdown-divider" />
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate('/settings');
                  }}
                >
                  <Settings size={16} />
                  <span>Settings & Profile</span>
                </button>
                <button
                  type="button"
                  className="dropdown-item text-danger"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
