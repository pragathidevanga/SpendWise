import React, { useState } from 'react';
import {
  Plus,
  Target,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Sparkles,
  Info,
  ShieldCheck
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { Input } from '../components/common/Input';

export const GoalsPage = () => {
  const { goals, addGoal, updateGoal, deleteGoal, addFundsToGoal, withdrawFromGoal, preferences } = useFinance();
  const { showToast } = useToast();
  const currency = preferences.currency || 'INR';

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Fund contribution modal
  const [fundModalGoal, setFundModalGoal] = useState(null);
  const [fundActionType, setFundActionType] = useState('add'); // 'add' | 'withdraw'
  const [fundAmount, setFundAmount] = useState('');
  const [fundError, setFundError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Safety');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const openAddModal = () => {
    setEditingGoal(null);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setCategory('Safety');
    setNotes('');
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (g) => {
    setEditingGoal(g);
    setName(g.name);
    setTargetAmount(g.targetAmount.toString());
    setCurrentAmount(g.currentAmount.toString());
    setTargetDate(g.targetDate || '');
    setCategory(g.category || 'Safety');
    setNotes(g.notes || '');
    setErrors({});
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = 'Goal title is required.';
    const numTarget = parseFloat(targetAmount);
    if (!targetAmount || isNaN(numTarget) || numTarget <= 0) {
      errs.targetAmount = 'Please enter a valid target amount.';
    }

    const numCurrent = parseFloat(currentAmount) || 0;
    if (numCurrent < 0) {
      errs.currentAmount = 'Current savings cannot be negative.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      name: name.trim(),
      targetAmount: numTarget,
      currentAmount: numCurrent,
      targetDate: targetDate || '',
      category,
      notes: notes.trim()
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, payload);
      showToast('Savings goal updated.', 'success');
    } else {
      addGoal(payload);
      showToast(`Created savings goal: "${name.trim()}"`, 'success');
    }

    setIsModalOpen(false);
  };

  const openFundModal = (g, action = 'add') => {
    setFundModalGoal(g);
    setFundActionType(action);
    setFundAmount('');
    setFundError('');
  };

  const handleFundSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(fundAmount);
    if (!fundAmount || isNaN(amt) || amt <= 0) {
      setFundError('Please enter a valid positive amount.');
      return;
    }

    if (fundActionType === 'withdraw' && amt > fundModalGoal.currentAmount) {
      setFundError(`Cannot withdraw more than current savings (${formatCurrency(fundModalGoal.currentAmount, currency)})`);
      return;
    }

    if (fundActionType === 'add') {
      addFundsToGoal(fundModalGoal.id, amt);
      showToast(`Added ${formatCurrency(amt, currency)} to "${fundModalGoal.name}"`, 'success');
    } else {
      withdrawFromGoal(fundModalGoal.id, amt);
      showToast(`Withdrew ${formatCurrency(amt, currency)} from "${fundModalGoal.name}"`, 'info');
    }

    setFundModalGoal(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteGoal(deleteTargetId);
      showToast('Savings goal deleted.', 'info');
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="goals-page space-y-6">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Savings Goals</h2>
          <p className="page-subtitle">
            Track milestones for emergency funds, travel, electronics, or investments.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={openAddModal}
        >
          Create Goal
        </Button>
      </div>

      {/* Honest Disclaimer Banner */}
      <div className="goal-disclaimer-banner">
        <Info size={18} className="text-primary flex-shrink-0" />
        <p className="text-sm">
          <strong>Tracking Notice:</strong> SpendWise records and visualizes your savings milestones locally. Adding funds updates your virtual target progress; no actual bank wires or transfers take place.
        </p>
      </div>

      {/* Goals Grid */}
      {goals.length > 0 ? (
        <div className="goals-cards-grid">
          {goals.map((g) => {
            const pct = g.targetAmount > 0
              ? Math.min(100, Number(((g.currentAmount / g.targetAmount) * 100).toFixed(1)))
              : 0;
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);
            const isCompleted = g.currentAmount >= g.targetAmount;

            return (
              <Card key={g.id} className="goal-card">
                <div className="goal-card-top">
                  <div className="goal-title-group">
                    <span className="goal-category-tag">{g.category || 'Milestone'}</span>
                    <h3 className="goal-name">{g.name}</h3>
                  </div>
                  <div className="goal-actions-group">
                    <button
                      type="button"
                      className="row-action-btn"
                      title="Edit Goal"
                      onClick={() => openEditModal(g)}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className="row-action-btn text-danger"
                      title="Delete Goal"
                      onClick={() => setDeleteTargetId(g.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {g.notes && <p className="goal-notes-text">{g.notes}</p>}

                {/* Progress Circle / Bar */}
                <div className="goal-progress-section">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-muted">PROGRESS</span>
                    <span className={`text-sm font-bold ${isCompleted ? 'text-success' : 'text-primary'}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className={`progress-bar-fill ${isCompleted ? 'bg-success' : 'bg-primary'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Amount details */}
                <div className="goal-amounts-grid">
                  <div>
                    <span className="text-xs text-muted block">Saved So Far</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(g.currentAmount, currency)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted block">Target Goal</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(g.targetAmount, currency)}
                    </span>
                  </div>
                </div>

                <div className="goal-date-row">
                  {g.targetDate ? (
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Calendar size={13} /> Target: {formatDate(g.targetDate)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted">No target date set</span>
                  )}
                  {isCompleted ? (
                    <Badge variant="success" dot>Completed 🎉</Badge>
                  ) : (
                    <span className="text-xs text-muted">
                      {formatCurrency(remaining, currency)} left
                    </span>
                  )}
                </div>

                {/* Fund adjustment buttons */}
                <div className="goal-fund-buttons-row">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openFundModal(g, 'withdraw')}
                    disabled={g.currentAmount <= 0}
                  >
                    Withdraw
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => openFundModal(g, 'add')}
                  >
                    + Add Funds
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="No savings milestones established"
          description="Set savings targets for gadgets, travel trips, emergency funds, or house deposits to track your disciplined accumulation."
          actionText="Create Savings Goal"
          onAction={openAddModal}
        />
      )}

      {/* Add / Edit Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? "Edit Savings Goal" : "New Savings Goal"}
        subtitle="Define a target amount and milestone timeframe"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Goal Name *"
            type="text"
            placeholder="e.g. Vacation Trip, Emergency Cushion..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: null });
            }}
            error={errors.name}
            required
            autoFocus
          />

          <div className="form-row">
            <Input
              label={`Target Amount (${currency}) *`}
              type="number"
              step="100"
              min="100"
              placeholder="e.g. 100000"
              value={targetAmount}
              onChange={(e) => {
                setTargetAmount(e.target.value);
                if (errors.targetAmount) setErrors({ ...errors, targetAmount: null });
              }}
              error={errors.targetAmount}
              required
            />
            <Input
              label={`Already Saved (${currency})`}
              type="number"
              step="100"
              min="0"
              placeholder="0"
              value={currentAmount}
              onChange={(e) => {
                setCurrentAmount(e.target.value);
                if (errors.currentAmount) setErrors({ ...errors, currentAmount: null });
              }}
              error={errors.currentAmount}
            />
          </div>

          <div className="form-row">
            <Input
              label="Target Deadline (Optional)"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
            <div className="input-group">
              <label className="input-label">Category</label>
              <select
                className="select-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Safety">Safety & Emergency</option>
                <option value="Travel">Travel & Vacations</option>
                <option value="Electronics">Electronics & Tech</option>
                <option value="Vehicles">Vehicle Purchase</option>
                <option value="Investment">Wealth & Investments</option>
                <option value="General">General Milestone</option>
              </select>
            </div>
          </div>

          <Input
            label="Notes & Purpose"
            type="text"
            placeholder="Where is this money kept? (e.g. Liquid FD, Recurring Deposit)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="modal-actions-bar">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingGoal ? "Save Changes" : "Create Goal"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add / Withdraw Funds Modal */}
      {fundModalGoal && (
        <Modal
          isOpen={true}
          onClose={() => setFundModalGoal(null)}
          title={fundActionType === 'add' ? `Contribute to "${fundModalGoal.name}"` : `Withdraw from "${fundModalGoal.name}"`}
          subtitle={`Current savings: ${formatCurrency(fundModalGoal.currentAmount, currency)} of ${formatCurrency(fundModalGoal.targetAmount, currency)}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleFundSubmit} className="space-y-4">
            <Input
              label={`Amount to ${fundActionType === 'add' ? 'Contribute' : 'Withdraw'} (${currency})`}
              type="number"
              step="10"
              min="1"
              placeholder="0.00"
              value={fundAmount}
              onChange={(e) => {
                setFundAmount(e.target.value);
                if (fundError) setFundError('');
              }}
              error={fundError}
              required
              autoFocus
            />

            <div className="modal-actions-bar">
              <Button variant="outline" onClick={() => setFundModalGoal(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant={fundActionType === 'add' ? 'primary' : 'danger'}
              >
                Confirm {fundActionType === 'add' ? 'Deposit' : 'Withdrawal'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Savings Goal?"
        message="This will delete this goal milestone. Your transaction ledger entries will remain intact."
        confirmText="Delete Goal"
        confirmVariant="danger"
      />
    </div>
  );
};
