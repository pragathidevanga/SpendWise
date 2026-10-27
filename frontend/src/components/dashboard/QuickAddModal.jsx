import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { DEFAULT_CATEGORIES, PAYMENT_METHODS } from '../../utils/sampleData';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';

export const QuickAddModal = ({ isOpen, onClose }) => {
  const { addTransaction, preferences } = useFinance();
  const { showToast } = useToast();

  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI / GPay / PhonePe');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const filteredCategories = DEFAULT_CATEGORIES.filter(c => c.type === type);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid positive amount';
    }
    if (!category) {
      newErrors.category = 'Category is required';
    }
    if (!date) {
      newErrors.date = 'Date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addTransaction({
      title: title.trim(),
      amount: numAmount,
      type,
      category,
      date,
      paymentMethod,
      notes: notes.trim()
    });

    showToast(`Added ${type === 'income' ? 'income' : 'expense'}: "${title.trim()}"`, 'success');
    
    // Reset and close
    setTitle('');
    setAmount('');
    setNotes('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Transaction"
      subtitle="Add income or expense to your personal ledger"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="quick-add-form">
        {/* Type Toggle Tabs */}
        <div className="type-toggle-pills">
          <button
            type="button"
            className={`type-pill ${type === 'expense' ? 'pill-expense-active' : ''}`}
            onClick={() => {
              setType('expense');
              setCategory('Food & Dining');
            }}
          >
            Expense
          </button>
          <button
            type="button"
            className={`type-pill ${type === 'income' ? 'pill-income-active' : ''}`}
            onClick={() => {
              setType('income');
              setCategory('Salary');
            }}
          >
            Income
          </button>
        </div>

        {/* Amount Input */}
        <div className="form-row">
          <Input
            label={`Amount (${preferences.currency || 'INR'})`}
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount) setErrors({ ...errors, amount: null });
            }}
            error={errors.amount}
            required
            autoFocus
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (errors.date) setErrors({ ...errors, date: null });
            }}
            error={errors.date}
            required
          />
        </div>

        {/* Title */}
        <Input
          label="Title / Description"
          type="text"
          placeholder="e.g. Grocery Store, Client Invoice, Uber..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors({ ...errors, title: null });
          }}
          error={errors.title}
          required
        />

        {/* Category & Payment Method */}
        <div className="form-row">
          <div className="input-group">
            <label className="input-label">Category *</label>
            <select
              className="select-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {filteredCategories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Payment Method</label>
            <select
              className="select-field"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <Input
          label="Optional Notes"
          type="text"
          placeholder="Add tags, receipt refs, or memo..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Action Buttons */}
        <div className="modal-actions-bar">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save {type === 'income' ? 'Income' : 'Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
