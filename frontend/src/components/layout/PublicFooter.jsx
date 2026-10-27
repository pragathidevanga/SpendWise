import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Heart, Shield, Lock, Cpu, Github } from 'lucide-react';

export const PublicFooter = () => {
  return (
    <footer className="public-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-col brand-col">
            <Link to="/" className="brand-logo footer-logo">
              <div className="brand-logo-icon">
                <Wallet size={20} className="text-white" />
              </div>
              <span className="brand-name">Spend<span>Wise</span></span>
            </Link>
            <p className="footer-tagline">
              A private, fast, and intuitive personal finance management application engineered for modern professionals.
            </p>
            <div className="footer-badges">
              <span className="security-pill">
                <Lock size={12} /> Local-First Storage
              </span>
              <span className="security-pill">
                <Shield size={12} /> Zero Cloud Snooping
              </span>
            </div>
          </div>

          {/* Product links */}
          <div className="footer-col">
            <h4 className="footer-heading">Features</h4>
            <ul className="footer-links">
              <li><a href="#features">Expense Tracking</a></li>
              <li><a href="#features">Smart Budgets</a></li>
              <li><a href="#features">Savings Goals</a></li>
              <li><a href="#features">Visual Analytics</a></li>
              <li><a href="#features">CSV & JSON Backup</a></li>
            </ul>
          </div>

          {/* Architecture & Tech */}
          <div className="footer-col">
            <h4 className="footer-heading">Architecture</h4>
            <ul className="footer-links">
              <li><span>React 18 + Vite</span></li>
              <li><span>Express.js Micro-Backend</span></li>
              <li><span>Web Crypto API Hashing</span></li>
              <li><span>Recharts Data Engine</span></li>
              <li><span>Offline Fallback Ready</span></li>
            </ul>
          </div>

          {/* Quick Access */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Access</h4>
            <ul className="footer-links">
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/signup">Create Free Account</Link></li>
              <li><Link to="/forgot-password">Reset Password Demo</Link></li>
              <li><a href="#faq">Frequently Asked Questions</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} SpendWise. Built with clean architecture, responsive CSS, and local data persistence.
          </p>
          <p className="footer-disclaimer">
            Disclaimer: SpendWise runs client-first in your browser. Data is preserved securely in local browser storage and is never uploaded to third-party databases.
          </p>
        </div>
      </div>
    </footer>
  );
};
