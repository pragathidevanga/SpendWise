import React, { useState, useMemo } from 'react';
import {
  Plus,
  PieChart as PieIcon,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sliders,
  DollarSign
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { DEFAULT_CATEGORIES } from '../utils/sampleData';
import { Button } from '../components/common/Button';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { Input } from '../components/common/Input';

export const BudgetsPage = () => {
  const { budgets, transactions, addBudget, updateBudget, deleteBudget, preferences } = useFinance();
  const { showToast } = useToast();
  const currency = preferences.currency || 'INR';

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Form states
  const [category, setCategory] = useState('Food & Dining');
  const [limit, setLimit] = useState('');
  const [errors, setErrors] = useState({});

  // Calculate actual spending per category from transactions
  const categorySpending = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        const cat = t.category || 'Other';
        map[cat] = (map[cat] || 0) + (Number(t.amount) || 0);
      }
    });
    return map;
  }, [transactions]);

  // Overall totals
  const overallStats = useMemo(() => {
    let totalLimit = 0;
    let totalSpent = 0;
    let exceededCount = 0;

    budgets.forEach(b => {
      const bLimit = Number(b.limit) || 0;
      const bSpent = categorySpending[b.category] || 0;
      totalLimit += bLimit;
      totalSpent += bSpent;
      if (bSpent > bLimit) exceededCount++;
    });

    const remaining = Math.max(0, totalLimit - totalSpent);
    const pct = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

    return { totalLimit, totalSpent, remaining, pct, exceededCount };
  }, [budgets, categorySpending]);

  const openAddModal = () => {
    setEditingBudget(null);
    // Suggest first unused category if possible
    const usedCats = new Set(budgets.map(b => b.category));
    const unused = DEFAULT_CATEGORIES.filter(c => c.type === 'expense' && !usedCats.has(c.name));
    setCategory(unused.length > 0 ? unused[0].name : 'Food & Dining');
    setLimit('');
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditingBudget(b);
    setCategory(b.category);
    setLimit(b.limit.toString());
    setErrors({});
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    const numLimit = parseFloat(limit);
    if (!limit || isNaN(numLimit) || numLimit <= 0) {
      errs.limit = 'Please enter a valid positive monthly limit.';
    }

    // Prevent duplicate category budget
    const duplicate = budgets.find(b =>
      b.category.toLowerCase() === category.toLowerCase() &&
      (!editingBudget || b.id !== editingBudget.id)
    );
    if (duplicate) {
      errs.category = `A budget for "${category}" already exists. You can edit it instead.`;
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (editingBudget) {
      updateBudget(editingBudget.id, { category, limit: numLimit });
      showToast(`Updated ${category} budget to ${formatCurrency(numLimit, currency)}`, 'success');
    } else {
      addBudget({ category, limit: numLimit });
      showToast(`Created ${category} budget with limit ${formatCurrency(numLimit, currency)}`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteBudget(deleteTargetId);
      showToast('Budget deleted.', 'info');
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="budgets-page space-y-6">
      {/* Header Row */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Budget Management</h2>
          <p className="page-subtitle">
            Set spending thresholds per category and prevent unexpected month-end surprises.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={openAddModal}
        >
          Add Budget
        </Button>
      </div>

      {/* Overall Budget Overview Banner */}
      <div className="budget-overview-banner">
        <div className="overview-stats-row">
          <div className="overview-item">
            <span className="overview-label">Total Monthly Budget</span>
            <span className="overview-val">{formatCurrency(overallStats.totalLimit, currency)}</span>
          </div>
          <div className="overview-item">
            <span className="overview-label">Actual Spent</span>
            <span className="overview-val text-danger">{formatCurrency(overallStats.totalSpent, currency)}</span>
          </div>
          <div className="overview-item">
            <span className="overview-label">Total Remaining</span>
            <span className={`overview-val ${overallStats.remaining === 0 && overallStats.totalLimit > 0 ? 'text-danger' : 'text-success'}`}>
              {formatCurrency(overallStats.remaining, currency)}
            </span>
          </div>
          <div className="overview-item">
            <span className="overview-label">Overall Utilization</span>
            <span className="overview-val">{overallStats.pct.toFixed(1)}%</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="overall-progress-bar-box">
          <div className="progress-bar-track">
            <div
              className={`progress-bar-fill ${overallStats.pct >= 100 ? 'bg-danger' : overallStats.pct >= 80 ? 'bg-warning' : 'bg-primary'}`}
              style={{ width: `${Math.min(100, overallStats.pct)}%` }}
            />
          </div>
          {overallStats.exceededCount > 0 && (
            <p className="exceeded-warning-msg">
              <AlertTriangle size={14} className="text-danger inline mr-1" />
              {overallStats.exceededCount} {overallStats.exceededCount === 1 ? 'category has' : 'categories have'} exceeded their allotted limit!
            </p>
          )}
        </div>
      </div>

      {/* Budgets Grid */}
      {budgets.length > 0 ? (
        <div className="budgets-grid">
          {budgets.map((b) => {
            const spent = categorySpending[b.category] || 0;
            const limit = Number(b.limit) || 0;
            const remaining = Math.max(0, limit - spent);
            const utilization = limit > 0 ? (spent / limit) * 100 : 0;
            const isExceeded = spent > limit;
            const isWarning = !isExceeded && utilization >= 80;

            return (
              <Card key={b.id} className="budget-item-card">
                <div className="budget-item-header">
                  <div>
                    <h3 className="budget-cat-name">{b.category}</h3>
                    <span className="budget-period-tag">Monthly Allowance</span>
                  </div>
                  <div className="budget-card-actions">
                    <button
                      type="button"
                      className="row-action-btn"
                      title="Edit Budget"
                      onClick={() => openEditModal(b)}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className="row-action-btn text-danger"
                      title="Delete Budget"
                      onClick={() => setDeleteTargetId(b.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="budget-figures">
                  <div>
                    <span className="fig-label">Spent</span>
                    <span className={`fig-value ${isExceeded ? 'text-danger' : 'text-primary'}`}>
                      {formatCurrency(spent, currency)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="fig-label">Limit</span>
                    <span className="fig-value">{formatCurrency(limit, currency)}</span>
                  </div>
                </div>

                {/* Progress Meter */}
                <div className="progress-meter-wrapper">
                  <div className="progress-bar-track">
                    <div
                      className={`progress-bar-fill ${isExceeded ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-success'}`}
                      style={{ width: `${Math.min(100, utilization)}%` }}
                    />
                  </div>
                  <div className="meter-meta">
                    <span className="meter-pct">{utilization.toFixed(1)}% consumed</span>
                    <span className={`meter-remaining ${isExceeded ? 'text-danger font-semibold' : 'text-muted'}`}>
                      {isExceeded
                        ? `Over by ${formatCurrency(spent - limit, currency)}`
                        : `${formatCurrency(remaining, currency)} remaining`}
                    </span>
                  </div>
                </div>

                {/* Status Badge Tag */}
                <div className="budget-status-row">
                  {isExceeded ? (
                    <Badge variant="danger" dot>Exceeded Limit</Badge>
                  ) : isWarning ? (
                    <Badge variant="warning" dot>Approaching Limit</Badge>
                  ) : (
                    <Badge variant="success" dot>Within Budget</Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={PieIcon}
          title="No spending budgets established"
          description="Create your first budget allocation (e.g. Dining, Housing, Utilities) to begin tracking your monthly expenses against defined limits."
          actionText="Create Category Budget"
          onAction={openAddModal}
        />
      )}

      {/* Add / Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? "Update Category Budget" : "New Category Budget"}
        subtitle="Set a monthly ceiling for a specific spending category"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="input-group">
            <label className="input-label">Spending Category *</label>
            <select
              className="select-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {DEFAULT_CATEGORIES.filter(c => c.type === 'expense').map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
              <option value="Other">Other</option>
            </select>
            {errors.category && <p className="input-error-msg">{errors.category}</p>}
          </div>

          <Input
            label={`Monthly Limit (${currency}) *`}
            type="number"
            step="100"
            min="100"
            placeholder="e.g. 15000"
            value={limit}
            onChange={(e) => {
              setLimit(e.target.value);
              if (errors.limit) setErrors({ ...errors, limit: null });
            }}
            error={errors.limit}
            required
            autoFocus
          />

          <div className="modal-actions-bar">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingBudget ? "Save Changes" : "Create Budget"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Budget Allocation?"
        message="This will delete this category's spending limit. Associated transactions in your ledger will not be deleted."
        confirmText="Delete Budget"
        confirmVariant="danger"
      />
    </div>
  );
};
