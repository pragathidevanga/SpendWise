import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  ArrowRight,
  ArrowLeft,
  Check,
  DollarSign,
  TrendingUp,
  Target,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { CURRENCIES } from '../utils/formatters';

const GOAL_OPTIONS = [
  { id: 'emergency', label: 'Build Emergency Fund', desc: 'Secure 3-6 months of essential living expenses' },
  { id: 'debt', label: 'Eliminate High-Interest Debt', desc: 'Pay down credit cards and personal loans' },
  { id: 'save', label: 'Save for Major Purchase', desc: 'Car, home down-payment, or travel vacation' },
  { id: 'invest', label: 'Grow Investments & Wealth', desc: 'Consistent SIPs, stocks, and mutual funds' },
  { id: 'budget', label: 'Master Daily Budgeting', desc: 'Gain clarity and cut unnecessary expenditures' }
];

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { preferences, savePreferences, addGoal, addBudget } = useFinance();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [displayName, setDisplayName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(preferences.currency || 'INR');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('emergency');

  const handleFinish = () => {
    // Save profile display name
    if (displayName.trim() && displayName !== user?.name) {
      updateProfile({ name: displayName.trim() });
    }

    // Save preferences
    const updatedPrefs = {
      ...preferences,
      currency,
      monthlyIncome: Math.abs(parseFloat(monthlyIncome) || 0),
      monthlyBudget: Math.abs(parseFloat(monthlyBudget) || 0),
      financialGoal: selectedGoal,
      onboardingCompleted: true
    };
    savePreferences(updatedPrefs);

    // If user provided a monthly budget, create a baseline general budget
    if (parseFloat(monthlyBudget) > 0) {
      addBudget({
        category: 'Food & Dining',
        limit: Math.round(parseFloat(monthlyBudget) * 0.35)
      });
      addBudget({
        category: 'Housing & Rent',
        limit: Math.round(parseFloat(monthlyBudget) * 0.40)
      });
      addBudget({
        category: 'Shopping & Groceries',
        limit: Math.round(parseFloat(monthlyBudget) * 0.25)
      });
    }

    // If user selected a goal, seed that savings goal
    const goalMeta = GOAL_OPTIONS.find(g => g.id === selectedGoal);
    if (goalMeta) {
      addGoal({
        name: goalMeta.label,
        targetAmount: parseFloat(monthlyIncome) > 0 ? parseFloat(monthlyIncome) * 3 : 100000,
        currentAmount: 0,
        category: 'Safety',
        notes: goalMeta.desc
      });
    }

    showToast('Preferences configured! Welcome to your SpendWise dashboard.', 'success');
    navigate('/app');
  };

  return (
    <div className="onboarding-root">
      <div className="onboarding-card animate-scale-up">
        {/* Progress Header */}
        <div className="onboarding-header">
          <div className="brand-logo mb-4">
            <div className="brand-logo-icon">
              <Wallet size={20} className="text-white" />
            </div>
            <span className="brand-name">Spend<span>Wise</span></span>
          </div>

          {/* Stepper Dots & Line */}
          <div className="onboarding-stepper">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div className={`step-dot ${step === s ? 'step-active' : step > s ? 'step-completed' : ''}`}>
                  {step > s ? <Check size={14} /> : s}
                </div>
                {s < totalSteps && <div className={`step-connector ${step > s ? 'connector-filled' : ''}`} />}
              </React.Fragment>
            ))}
          </div>
          <span className="step-counter-text">Step {step} of {totalSteps}</span>
        </div>

        {/* Step 1: Display Name */}
        {step === 1 && (
          <div className="onboarding-step-body animate-fade-in">
            <h2 className="step-heading">How should we address you?</h2>
            <p className="step-subheading">
              Personalize your dashboard greeting and profile identity.
            </p>
            <div className="mt-6">
              <Input
                label="Preferred Display Name"
                type="text"
                placeholder="e.g. Alex Morgan"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Step 2: Currency Selection */}
        {step === 2 && (
          <div className="onboarding-step-body animate-fade-in">
            <h2 className="step-heading">Choose your primary currency</h2>
            <p className="step-subheading">
              All transaction totals, budgets, and savings reports will be formatted in this currency.
            </p>
            <div className="currency-grid mt-6">
              {Object.keys(CURRENCIES).map((key) => {
                const item = CURRENCIES[key];
                const isSelected = currency === item.code;
                return (
                  <div
                    key={item.code}
                    className={`currency-card ${isSelected ? 'currency-card-selected' : ''}`}
                    onClick={() => setCurrency(item.code)}
                  >
                    <span className="currency-symbol">{item.symbol}</span>
                    <span className="currency-code">{item.code}</span>
                    <span className="currency-label">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Monthly Income & Budget Baseline */}
        {step === 3 && (
          <div className="onboarding-step-body animate-fade-in">
            <h2 className="step-heading">Monthly Financial Targets</h2>
            <p className="step-subheading">
              Optional estimates to help calculate your initial savings rate and budget caps.
            </p>
            <div className="mt-6 space-y-4">
              <Input
                label={`Estimated Monthly Income (${CURRENCIES[currency]?.symbol || '₹'})`}
                type="number"
                placeholder="e.g. 75000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                helperText="Optional: You can log exact salary transactions anytime."
              />
              <Input
                label={`Target Monthly Budget (${CURRENCIES[currency]?.symbol || '₹'})`}
                type="number"
                placeholder="e.g. 45000"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                helperText="Optional: We will generate starter category allocations for you."
              />
            </div>
          </div>
        )}

        {/* Step 4: Primary Financial Goal */}
        {step === 4 && (
          <div className="onboarding-step-body animate-fade-in">
            <h2 className="step-heading">What is your primary financial goal?</h2>
            <p className="step-subheading">
              Select what matters most right now. We'll set up a milestone tracker for you.
            </p>
            <div className="goals-options-list mt-6">
              {GOAL_OPTIONS.map((g) => {
                const isSelected = selectedGoal === g.id;
                return (
                  <div
                    key={g.id}
                    className={`goal-option-card ${isSelected ? 'goal-option-selected' : ''}`}
                    onClick={() => setSelectedGoal(g.id)}
                  >
                    <div className="goal-check-circle">
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                    <div className="goal-meta">
                      <span className="goal-option-label">{g.label}</span>
                      <span className="goal-option-desc">{g.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Navigation Bar */}
        <div className="onboarding-footer">
          {step > 1 ? (
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleFinish}>
              Skip Setup
            </Button>
          )}

          <div className="ml-auto flex items-center gap-3">
            {step < totalSteps && (
              <Button variant="ghost" onClick={() => setStep(step + 1)}>
                Skip Step
              </Button>
            )}

            {step < totalSteps ? (
              <Button
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => setStep(step + 1)}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="success"
                icon={Sparkles}
                iconPosition="right"
                onClick={handleFinish}
              >
                Finish & Open Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
