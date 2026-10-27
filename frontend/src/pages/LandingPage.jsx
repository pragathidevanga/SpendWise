import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  PieChart,
  Target,
  BarChart3,
  ArrowLeftRight,
  Lightbulb,
  Download,
  Sliders,
  ChevronDown,
  CheckCircle,
  Shield,
  Zap,
  Lock,
  Wallet,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign
} from 'lucide-react';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { PublicFooter } from '../components/layout/PublicFooter';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(0);

  const features = [
    {
      icon: ArrowLeftRight,
      color: '#6366F1',
      title: 'Expense Tracking',
      desc: 'Log daily expenditures and income effortlessly with categorized tags, payment channels, and timestamps.'
    },
    {
      icon: PieChart,
      color: '#10B981',
      title: 'Smart Budget Planning',
      desc: 'Set category-based monthly spending thresholds. Real-time visual meters warn you before you overspend.'
    },
    {
      icon: Target,
      color: '#F59E0B',
      title: 'Savings Goals',
      desc: 'Establish clear savings targets for vacations, emergency cushions, or gadgets, and monitor progress.'
    },
    {
      icon: BarChart3,
      color: '#8B5CF6',
      title: 'Spending Analytics',
      desc: 'Dynamic interactive charts reveal where your money flows across monthly trends, categories, and channels.'
    },
    {
      icon: Sliders,
      color: '#06B6D4',
      title: 'Transaction Management',
      desc: 'Filter by date, category, type, and search keyword. Edit, paginate, or inspect individual entries instantly.'
    },
    {
      icon: Lightbulb,
      color: '#EC4899',
      title: 'Rule-Based Insights',
      desc: 'Honest, heuristic-driven observations about your savings rate, high-cost categories, and milestone achievements.'
    },
    {
      icon: Download,
      color: '#3B82F6',
      title: 'Data Export & Backup',
      desc: 'Download CSV transaction ledgers for Excel and complete JSON backups you can import and restore anytime.'
    },
    {
      icon: Wallet,
      color: '#14B8A6',
      title: 'Personalized Preferences',
      desc: 'Choose your preferred currency (INR ₹, USD $, EUR €, GBP £), toggle dark/light theme, and customize profiles.'
    }
  ];

  const faqs = [
    {
      q: 'Does SpendWise require paid subscriptions or credit card information?',
      a: 'No. SpendWise is completely free, standalone, and does not require paid subscriptions, credit card verification, or external commercial APIs.'
    },
    {
      q: 'Where is my financial data stored?',
      a: 'All data is stored directly on your machine in your browser localStorage using structured, versioned user-scoped records. Your data never leaves your computer.'
    },
    {
      q: 'Does the application work if the local backend server is offline?',
      a: 'Yes! SpendWise is designed with a resilient client-first architecture. If the local Express backend is unreachable, the application seamlessly calculates all financial summaries and budgets locally.'
    },
    {
      q: 'Can I export my transactions for spreadsheets?',
      a: 'Yes, you can export your entire transaction history to clean CSV format anytime, as well as generate full JSON backup archives.'
    },
    {
      q: 'How does the Google Sign-In button work?',
      a: 'Because real Google OAuth requires a registered Google Cloud client ID and verified redirect URIs, SpendWise provides an honest, interactive Google Sign-In Demonstration mode that lets you test the workflow with pre-configured demo profiles.'
    }
  ];

  return (
    <div className="landing-page-root">
      <PublicNavbar />

      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="hero-glow-blob hero-blob-1" />
        <div className="hero-glow-blob hero-blob-2" />

        <div className="hero-container">
          <div className="hero-badge animate-fade-in">
            <Sparkles size={14} className="text-primary" />
            <span>Smart Personal Finance Manager</span>
          </div>

          <h1 className="hero-headline">
            Take Control of Your Money. <br />
            <span className="gradient-text">Build a Better Financial Future.</span>
          </h1>

          <p className="hero-subtext">
            SpendWise gives you complete clarity over where your money goes. Track daily expenses, plan category budgets, stay accountable to savings goals, and analyze monthly cash flow — private, local, and effortlessly simple.
          </p>

          <div className="hero-cta-group">
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/signup')}
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Features
            </Button>
          </div>

          {/* Trust badges */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <Lock size={16} className="text-primary" />
              <span>100% Client-Side Privacy</span>
            </div>
            <div className="trust-item">
              <Zap size={16} className="text-warning" />
              <span>Instant Local Persistence</span>
            </div>
            <div className="trust-item">
              <Shield size={16} className="text-success" />
              <span>Zero Paid Cloud Locks</span>
            </div>
          </div>

          {/* Hero Mockup Preview Card */}
          <div className="hero-preview-wrapper animate-slide-up">
            <div className="mockup-frame">
              <div className="mockup-header-bar">
                <div className="mockup-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <div className="mockup-url-bar">spendwise.local/app</div>
              </div>

              <div className="mockup-body-preview">
                {/* Mini Stat Cards */}
                <div className="mockup-stats-grid">
                  <div className="mockup-stat-card">
                    <span className="mockup-stat-label">Net Balance</span>
                    <span className="mockup-stat-val text-primary">₹72,400</span>
                    <span className="mockup-stat-sub text-success">
                      <TrendingUp size={12} /> Positive cash flow
                    </span>
                  </div>
                  <div className="mockup-stat-card">
                    <span className="mockup-stat-label">Monthly Income</span>
                    <span className="mockup-stat-val text-success">₹1,06,400</span>
                    <span className="mockup-stat-sub">Salary + Freelance</span>
                  </div>
                  <div className="mockup-stat-card">
                    <span className="mockup-stat-label">Monthly Expenses</span>
                    <span className="mockup-stat-val text-danger">₹34,000</span>
                    <span className="mockup-stat-sub">32% of Income</span>
                  </div>
                  <div className="mockup-stat-card">
                    <span className="mockup-stat-label">Remaining Budget</span>
                    <span className="mockup-stat-val text-warning">₹25,500</span>
                    <span className="mockup-stat-sub">6 Budgets active</span>
                  </div>
                </div>

                {/* Mini Visual Preview */}
                <div className="mockup-split-preview">
                  <div className="mockup-chart-preview">
                    <div className="chart-preview-header">
                      <span>Monthly Spending Trend</span>
                      <span className="badge-preview">Actual Data</span>
                    </div>
                    <div className="mockup-bars">
                      <div className="bar-col"><div className="bar-fill" style={{ height: '45%' }} /><span>W1</span></div>
                      <div className="bar-col"><div className="bar-fill" style={{ height: '70%' }} /><span>W2</span></div>
                      <div className="bar-col"><div className="bar-fill" style={{ height: '55%' }} /><span>W3</span></div>
                      <div className="bar-col"><div className="bar-fill fill-accent" style={{ height: '85%' }} /><span>W4</span></div>
                    </div>
                  </div>

                  <div className="mockup-recent-preview">
                    <div className="chart-preview-header">
                      <span>Recent Ledger</span>
                      <span className="badge-preview">Live</span>
                    </div>
                    <div className="mockup-tx-list">
                      <div className="mockup-tx-item">
                        <div className="tx-icon-pill bg-success-soft"><ArrowDownLeft size={14} className="text-success" /></div>
                        <div className="tx-meta-info">
                          <span className="tx-name">Tech Salary</span>
                          <span className="tx-date">1st of month</span>
                        </div>
                        <span className="tx-amount text-success">+₹85,000</span>
                      </div>
                      <div className="mockup-tx-item">
                        <div className="tx-icon-pill bg-danger-soft"><ArrowUpRight size={14} className="text-danger" /></div>
                        <div className="tx-meta-info">
                          <span className="tx-name">Apartment Rent</span>
                          <span className="tx-date">Housing & Rent</span>
                        </div>
                        <span className="tx-amount text-danger">-₹24,000</span>
                      </div>
                      <div className="mockup-tx-item">
                        <div className="tx-icon-pill bg-danger-soft"><ArrowUpRight size={14} className="text-danger" /></div>
                        <div className="tx-meta-info">
                          <span className="tx-name">Organic Groceries</span>
                          <span className="tx-date">Shopping</span>
                        </div>
                        <span className="tx-amount text-danger">-₹4,850</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">POWERFUL CAPABILITIES</span>
            <h2 className="section-title">Everything You Need to Master Your Money</h2>
            <p className="section-subtitle">
              Engineered with clean architectural principles to give you full visibility into your finances without complexity.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="feature-card">
                  <div className="feature-icon-box" style={{ color: feat.color, backgroundColor: `${feat.color}18` }}>
                    <Icon size={24} />
                  </div>
                  <h3 className="feature-title">{feat.title}</h3>
                  <p className="feature-desc">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">SIMPLE 4-STEP WORKFLOW</span>
            <h2 className="section-title">How SpendWise Empowers Your Financial Life</h2>
            <p className="section-subtitle">
              Get organized in less than two minutes. No bank connections or sensitive credentials needed.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-badge">1</div>
              <h4 className="step-title">Create an Account</h4>
              <p className="step-desc">
                Register a private local account or explore using our transparent Google Sign-In Demo mode.
              </p>
            </div>
            <div className="step-card">
              <div className="step-badge">2</div>
              <h4 className="step-title">Log Transactions</h4>
              <p className="step-desc">
                Add incomes and daily expenses with categories, payment methods, and timestamps in seconds.
              </p>
            </div>
            <div className="step-card">
              <div className="step-badge">3</div>
              <h4 className="step-title">Set Budgets & Goals</h4>
              <p className="step-desc">
                Define spending limits for Dining, Housing, and Shopping, and set targets for savings milestones.
              </p>
            </div>
            <div className="step-card">
              <div className="step-badge">4</div>
              <h4 className="step-title">Analyze & Optimize</h4>
              <p className="step-desc">
                Gain instant clarity through interactive Recharts analytics and rule-based spending summaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Highlight */}
      <section className="benefits-section">
        <div className="section-container">
          <div className="benefits-banner">
            <div className="benefits-left">
              <span className="section-eyebrow text-white-alpha">WHY CHOOSE SPENDWISE</span>
              <h2 className="benefits-title">Your Financial Data Belongs Exclusively to You</h2>
              <p className="benefits-desc">
                Unlike cloud services that monetize user analytics or charge recurring subscription fees, SpendWise stores all records locally on your browser using isolated workspaces.
              </p>
              <ul className="benefits-check-list">
                <li><CheckCircle size={18} className="text-success" /> Completely free and open — no hidden paywalls</li>
                <li><CheckCircle size={18} className="text-success" /> Instant CSV & JSON backups for your archives</li>
                <li><CheckCircle size={18} className="text-success" /> SHA-256 Web Crypto hashing for local passwords</li>
                <li><CheckCircle size={18} className="text-success" /> Light & dark mode with customizable currency formatting</li>
              </ul>
            </div>
            <div className="benefits-right">
              <div className="glass-benefit-card">
                <Shield size={36} className="text-success mb-3" />
                <h3>Zero Cloud Database Required</h3>
                <p>
                  No MongoDB, No Supabase, No Firebase setup required. Open the page and it works instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">GOT QUESTIONS?</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Clear answers on security, storage, offline behavior, and architecture.
            </p>
          </div>

          <div className="faq-accordion-list">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className={`faq-item ${isOpen ? 'faq-item-open' : ''}`}>
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => setActiveFaq(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-question-text">{faq.q}</span>
                    <ChevronDown size={20} className={`faq-chevron ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="faq-answer-pane animate-fade-in">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="cta-final-section">
        <div className="section-container">
          <div className="cta-card">
            <h2 className="cta-title">Ready to Take Control of Your Financial Life?</h2>
            <p className="cta-sub">
              Experience the fast, private, and intuitive personal finance tool built for smart decision making.
            </p>
            <div className="cta-actions">
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/signup')}
              >
                Create Your Account Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
              >
                Sign In to Existing Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
