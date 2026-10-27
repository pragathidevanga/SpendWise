import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { GoogleDemoModal } from '../components/common/GoogleDemoModal';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, loginWithGoogleDemo } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Compute password strength score (0-4)
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(password);
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#059669'];

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required.';
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please provide a valid email format.';
    }
    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    if (!agreeTerms) {
      errs.terms = 'You must accept the terms to proceed.';
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
      const newUser = await signup({ name, email, password });
      showToast(`Account created for ${newUser.name}! Let's set up your profile.`, 'success');
      navigate('/onboarding');
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
      showToast(`Welcome ${activeUser.name}! (Demo Mode)`, 'success');
      setShowGoogleModal(false);
      navigate('/onboarding');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Left Showcase Panel */}
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
              <Shield size={14} /> 100% Client-Side Privacy
            </span>
            <h2 className="showcase-headline">
              Begin your path to financial freedom today.
            </h2>
            <p className="showcase-subtext">
              Create your private local account to configure your first monthly budget, track transactions with zero latency, and visualize your cash flow.
            </p>
          </div>

          <div className="showcase-features-list">
            <div className="showcase-feature-item">
              <CheckCircle2 size={18} className="text-success" />
              <span>Zero external database dependencies</span>
            </div>
            <div className="showcase-feature-item">
              <CheckCircle2 size={18} className="text-success" />
              <span>Default currency formatted in Indian Rupees (₹)</span>
            </div>
            <div className="showcase-feature-item">
              <CheckCircle2 size={18} className="text-success" />
              <span>Integrated savings goal progress tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <Link to="/" className="back-link">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <h1 className="auth-title">Create Your Account</h1>
            <p className="auth-subtitle">
              Get started with SpendWise in less than 30 seconds.
            </p>
          </div>

          {errors.form && (
            <div className="auth-error-banner animate-shake">
              <AlertCircle size={18} />
              <span>{errors.form}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. John Doe"
              icon={User}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: null });
              }}
              error={errors.name}
              required
              autoFocus
            />

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
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
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

            {/* Password strength meter */}
            {password.length > 0 && (
              <div className="password-strength-box">
                <div className="strength-bars">
                  {[0, 1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className="strength-segment"
                      style={{
                        backgroundColor: step < strengthScore ? strengthColors[strengthScore] : 'var(--border-color)'
                      }}
                    />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthColors[strengthScore] }}>
                  Strength: {strengthLabels[strengthScore]}
                </span>
              </div>
            )}

            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-type your password"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
              }}
              error={errors.confirmPassword}
              required
              rightElement={
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <div className="auth-terms-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (errors.terms) setErrors({ ...errors, terms: null });
                  }}
                />
                <span>
                  I understand that data is stored locally in this browser and agree to the demo guidelines.
                </span>
              </label>
              {errors.terms && <p className="input-error-msg mt-1">{errors.terms}</p>}
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
              Create Account
            </Button>
          </form>

          <div className="auth-divider">
            <span>OR SIGN UP WITH</span>
          </div>

          <button
            type="button"
            className="btn-google-auth"
            onClick={() => setShowGoogleModal(true)}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google (Demo)</span>
          </button>

          <p className="auth-footer-prompt">
            Already registered?{' '}
            <Link to="/login" className="auth-footer-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <GoogleDemoModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSelectProfile={handleGoogleDemoSelect}
        isSubmitting={isLoading}
      />
    </div>
  );
};
