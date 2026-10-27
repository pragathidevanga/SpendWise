import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Wallet,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  ArrowLeft,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { GoogleDemoModal } from '../components/common/GoogleDemoModal';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogleDemo } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const destination = location.state?.from?.pathname || '/app';

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errs.password = 'Password is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isLoading) return;

    setIsLoading(true);
    setErrors({});

    try {
      const activeUser = await login({ email, password, rememberMe });
      showToast(`Welcome back, ${activeUser.name}!`, 'success');
      navigate(destination, { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleDemoSelect = async (profile) => {
    setIsLoading(true);
    try {
      const activeUser = await loginWithGoogleDemo(profile);
      showToast(`Signed in as ${activeUser.name} (Demo Mode)`, 'success');
      setShowGoogleModal(false);
      navigate(destination, { replace: true });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Left Branding Showcase Panel */}
      <div className="auth-showcase-panel">
        <div className="showcase-content">
          <Link to="/" className="auth-brand-logo">
            <div className="brand-logo-icon">
              <Wallet size={24} className="text-white" />
            </div>
            <span className="brand-name">Spend<span>Wise</span></span>
          </Link>

          <div className="showcase-main-copy">
            <span className="showcase-badge">
              <Sparkles size={14} /> Smart Financial Clarity
            </span>
            <h2 className="showcase-headline">
              Master your daily spending with total confidence.
            </h2>
            <p className="showcase-subtext">
              Log into your isolated financial dashboard to monitor live budgets, track categorized transactions, and build your savings cushions.
            </p>
          </div>

          <div className="showcase-features-list">
            <div className="showcase-feature-item">
              <CheckCircle2 size={18} className="text-success" />
              <span>User-scoped, private browser storage</span>
            </div>
            <div className="showcase-feature-item">
              <CheckCircle2 size={18} className="text-success" />
              <span>Real-time budget alerts and threshold tracking</span>
            </div>
            <div className="showcase-feature-item">
              <CheckCircle2 size={18} className="text-success" />
              <span>Full CSV and JSON backup export anytime</span>
            </div>
          </div>

          <div className="showcase-footer">
            <div className="privacy-pill">
              <Shield size={14} className="text-primary" />
              <span>SHA-256 Web Crypto Passwords</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Card Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <Link to="/" className="back-link">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Enter your credentials to access your SpendWise ledger.
            </p>
          </div>

          {errors.form && (
            <div className="auth-error-banner animate-shake">
              <span>{errors.form}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              error={errors.email}
              required
              autoFocus
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              error={errors.password}
              required
              rightElement={
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <div className="auth-options-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In
            </Button>
          </form>

          <div className="auth-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          {/* Transparent Google Sign-In Demo Button */}
          <button
            type="button"
            className="btn-google-auth"
            onClick={() => setShowGoogleModal(true)}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google (Demo)</span>
          </button>

          <p className="auth-footer-prompt">
            Don't have an account yet?{' '}
            <Link to="/signup" className="auth-footer-link">
              Create an Account
            </Link>
          </p>
        </div>
      </div>

      {/* Google Sign-In Demo Selection Modal */}
      <GoogleDemoModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSelectProfile={handleGoogleDemoSelect}
        isSubmitting={isLoading}
      />
    </div>
  );
};
