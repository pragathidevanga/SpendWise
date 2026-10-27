import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { resetPasswordDemo } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Enter a valid email address.';
    }

    if (!newPassword) {
      errs.newPassword = 'New password is required.';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters.';
    }

    if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await resetPasswordDemo({ email, newPassword });
      setIsSuccess(true);
      showToast('Password reset successful! You may now sign in with your new password.', 'success');
    } catch (err) {
      setErrors({ form: err.message });
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Showcase Panel */}
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
              <KeyRound size={14} /> Password Recovery Demo
            </span>
            <h2 className="showcase-headline">
              Instant local credential recovery for your account.
            </h2>
            <p className="showcase-subtext">
              Because SpendWise operates without an external SMTP mail relay or cloud email database, this local demonstration securely resets the SHA-256 hashed password for any registered account in this browser.
            </p>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <Link to="/login" className="back-link">
              <ArrowLeft size={16} /> Return to Sign In
            </Link>
            <h1 className="auth-title">Reset Your Password</h1>
            <p className="auth-subtitle">
              Enter your registered email and choose a new password.
            </p>
          </div>

          {/* Transparent demo explanation notice */}
          <div className="demo-notice-banner mb-6">
            <AlertCircle className="demo-notice-icon" size={20} />
            <div className="demo-notice-text">
              <strong>Local Reset Demonstration:</strong>
              <p>
                No email is sent. Enter your existing registered account email to update the locally stored password hash directly.
              </p>
            </div>
          </div>

          {errors.form && (
            <div className="auth-error-banner animate-shake">
              <AlertCircle size={18} />
              <span>{errors.form}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="password-reset-success animate-fade-in">
              <div className="success-icon-wrapper">
                <CheckCircle2 size={40} className="text-success" />
              </div>
              <h3 className="success-title">Password Successfully Updated!</h3>
              <p className="success-message">
                Your new password has been hashed and stored locally. You can now log into your account using your updated credentials.
              </p>
              <Button
                variant="primary"
                size="lg"
                className="w-full mt-4"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/login')}
              >
                Proceed to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <Input
                label="Registered Email Address"
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
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                icon={Lock}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors({ ...errors, newPassword: null });
                }}
                error={errors.newPassword}
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

              <Input
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-type new password"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                }}
                error={errors.confirmPassword}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoading}
                icon={KeyRound}
              >
                Reset Password
              </Button>
            </form>
          )}

          <p className="auth-footer-prompt mt-6">
            Remembered your credentials?{' '}
            <Link to="/login" className="auth-footer-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
