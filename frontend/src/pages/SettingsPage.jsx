import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Sliders,
  Sun,
  Moon,
  Download,
  Upload,
  Trash2,
  LogOut,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Info,
  Save,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { CURRENCIES, formatCurrency } from '../utils/formatters';
import { exportUserBackupJSON, validateAndParseBackupJSON } from '../utils/exportImport';
import { Button } from '../components/common/Button';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const {
    transactions,
    budgets,
    goals,
    notifications,
    preferences,
    savePreferences,
    clearAllUserData,
    importBackupData
  } = useFinance();
  const { theme, setTheme, isDark } = useTheme();
  const { showToast } = useToast();

  const fileInputRef = useRef(null);

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Preferences form
  const [currency, setCurrency] = useState(preferences.currency || 'INR');
  const [monthlyBudget, setMonthlyBudget] = useState(preferences.monthlyBudget?.toString() || '');

  // Modal confirmations
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }
    updateProfile({ name: name.trim() });
    showToast('Profile information saved!', 'success');
  };

  const handlePreferencesSave = (e) => {
    e.preventDefault();
    const updated = {
      ...preferences,
      currency,
      monthlyBudget: Math.abs(parseFloat(monthlyBudget) || 0)
    };
    savePreferences(updated);
    showToast('Preferences updated successfully!', 'success');
  };

  const handleExportJSON = () => {
    try {
      const filename = exportUserBackupJSON({
        ...user,
        preferences,
        transactions,
        budgets,
        goals,
        notifications
      });
      showToast(`Saved full backup to ${filename}`, 'success');
    } catch (e) {
      showToast('Failed to export backup: ' + e.message, 'error');
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = validateAndParseBackupJSON(event.target.result);
        importBackupData(parsed);
        showToast(
          `Backup restored! (${parsed.transactions.length} transactions, ${parsed.budgets.length} budgets, ${parsed.goals.length} goals)`,
          'success'
        );
      } catch (err) {
        showToast(`Import rejected: ${err.message}`, 'error');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      showToast('Failed to read the selected file.', 'error');
    };
    reader.readAsText(file);
  };

  const handleClearDataConfirm = () => {
    clearAllUserData();
    setShowClearConfirm(false);
    showToast('All your financial records have been reset.', 'info');
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/');
  };

  return (
    <div className="settings-page space-y-6">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Settings & Preferences</h2>
          <p className="page-subtitle">
            Configure profile, currency, theme, and local data persistence.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Profile Details */}
        <Card>
          <CardHeader
            title="Profile Information"
            subtitle="Your active identity and display name"
          />
          <CardBody>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <Input
                label="Display Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                disabled
                helperText="Email is bound to your local authentication identity."
              />
              {user?.isDemo && (
                <div className="demo-pill-notice">
                  <Shield size={14} className="text-primary" />
                  <span>Logged in as Local Demo User</span>
                </div>
              )}
              <Button type="submit" variant="primary" icon={Save}>
                Save Profile
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Currency & Financial Preferences */}
        <Card>
          <CardHeader
            title="Financial Preferences"
            subtitle="Currency symbols and target thresholds"
          />
          <CardBody>
            <form onSubmit={handlePreferencesSave} className="space-y-4">
              <div className="input-group">
                <label className="input-label">Primary Currency</label>
                <select
                  className="select-field"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {Object.keys(CURRENCIES).map((k) => (
                    <option key={k} value={k}>
                      {CURRENCIES[k].label}
                    </option>
                  ))}
                </select>
                <p className="input-helper-msg">
                  Formats all balances, transaction tables, and Recharts charts.
                </p>
              </div>

              <Input
                label={`Baseline Monthly Budget (${CURRENCIES[currency]?.symbol || '₹'})`}
                type="number"
                step="500"
                min="0"
                placeholder="e.g. 50000"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                helperText="Used for baseline calculations when no custom category budgets exist."
              />

              <Button type="submit" variant="primary" icon={Save}>
                Save Preferences
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Theme & Appearance */}
        <Card>
          <CardHeader
            title="Appearance & Theme"
            subtitle="Choose between light or dark visual interface"
          />
          <CardBody>
            <div className="theme-selector-grid">
              <div
                className={`theme-card ${!isDark ? 'theme-card-selected' : ''}`}
                onClick={() => setTheme('light')}
              >
                <div className="theme-preview-box bg-slate-100 border border-slate-300">
                  <Sun size={24} className="text-amber-500" />
                  <span className="font-semibold text-slate-800 text-sm mt-2">Light Theme</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium">Clean & Crisp</span>
                  {!isDark && <CheckCircle2 size={16} className="text-primary" />}
                </div>
              </div>

              <div
                className={`theme-card ${isDark ? 'theme-card-selected' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <div className="theme-preview-box bg-slate-900 border border-slate-700">
                  <Moon size={24} className="text-indigo-400" />
                  <span className="font-semibold text-white text-sm mt-2">Dark Theme</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium">Deep Navy SaaS</span>
                  {isDark && <CheckCircle2 size={16} className="text-primary" />}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Backup & Data Management */}
        <Card>
          <CardHeader
            title="Data Management & Backup"
            subtitle="Import, export, or reset your local workspace records"
          />
          <CardBody className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                icon={Download}
                onClick={handleExportJSON}
                className="flex-1"
              >
                Export JSON Backup
              </Button>

              <Button
                variant="outline"
                icon={Upload}
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                Import JSON Backup
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleImportFile}
              />
            </div>

            <p className="text-xs text-muted">
              JSON backups are cryptographically validated to safeguard your records against corruption.
            </p>

            <div className="danger-zone-box mt-4">
              <div>
                <h4 className="text-danger font-semibold text-sm">Reset Workspace Data</h4>
                <p className="text-xs text-muted">
                  Wipes your saved transactions, budgets, goals, and notifications for this account. Other accounts on this device are unaffected.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setShowClearConfirm(true)}
              >
                Reset Data
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Account & Disclaimers */}
        <Card className="col-span-full">
          <CardHeader
            title="Session & Security Notice"
            subtitle="Client-side architecture disclosure"
          />
          <CardBody className="space-y-4">
            <div className="bg-muted-soft p-4 rounded-lg flex items-start gap-3">
              <Shield size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <strong>Local Persistence Architecture:</strong>
                <p className="text-muted text-xs">
                  SpendWise executes client-first. All passwords are hashed with browser-native SHA-256 Web Crypto before storage. Data is stored in your browser's localStorage and is never uploaded to third-party databases.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-muted">Finished your session?</span>
              <Button
                variant="danger"
                icon={LogOut}
                onClick={() => setShowLogoutConfirm(true)}
              >
                Sign Out
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Clear Data Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearDataConfirm}
        title="Reset All Financial Records?"
        message="This action will delete all transactions, budgets, and savings goals saved for this user profile. We recommend downloading a JSON backup first."
        confirmText="Yes, Reset Data"
        confirmVariant="danger"
      />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Sign Out"
        message="Your financial records remain preserved in this browser. You can sign back in anytime."
        confirmText="Sign Out"
        confirmVariant="danger"
      />
    </div>
  );
};
