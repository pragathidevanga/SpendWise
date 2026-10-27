import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportTransactionsToCSV } from '../utils/exportImport';
import { DEFAULT_CATEGORIES, PAYMENT_METHODS } from '../utils/sampleData';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { Input } from '../components/common/Input';

export const TransactionsPage = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, preferences } = useFinance();
  const { showToast } = useToast();
  const currency = preferences.currency || 'INR';

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'income' | 'expense'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date_desc'); // 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [viewDetailsTarget, setViewDetailsTarget] = useState(null);

  // Form inputs state
  const [formType, setFormType] = useState('expense');
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Food & Dining');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formPaymentMethod, setFormPaymentMethod] = useState('UPI / GPay / PhonePe');
  const [formNotes, setFormNotes] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Reset or fill form
  const openAddModal = () => {
    setEditingTransaction(null);
    setFormType('expense');
    setFormTitle('');
    setFormAmount('');
    setFormCategory('Food & Dining');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPaymentMethod('UPI / GPay / PhonePe');
    setFormNotes('');
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const openEditModal = (tx) => {
    setEditingTransaction(tx);
    setFormType(tx.type);
    setFormTitle(tx.title);
    setFormAmount(tx.amount.toString());
    setFormCategory(tx.category);
    setFormDate(tx.date);
    setFormPaymentMethod(tx.paymentMethod || 'UPI / GPay / PhonePe');
    setFormNotes(tx.notes || '');
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!formTitle.trim()) errs.title = 'Title is required';
    const num = parseFloat(formAmount);
    if (!formAmount || isNaN(num) || num <= 0) errs.amount = 'Valid positive amount required';
    if (!formCategory) errs.category = 'Category is required';
    if (!formDate) errs.date = 'Date is required';

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    const payload = {
      title: formTitle.trim(),
      amount: num,
      type: formType,
      category: formCategory,
      date: formDate,
      paymentMethod: formPaymentMethod,
      notes: formNotes.trim()
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, payload);
      showToast('Transaction successfully updated!', 'success');
    } else {
      addTransaction(payload);
      showToast(`Added ${formType === 'income' ? 'income' : 'expense'}: "${formTitle.trim()}"`, 'success');
    }

    setIsFormModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteTransaction(deleteTargetId);
      showToast('Transaction deleted.', 'info');
      setDeleteTargetId(null);
    }
  };

  // Filter & Search Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = tx.title?.toLowerCase().includes(q);
        const matchesNotes = tx.notes?.toLowerCase().includes(q);
        const matchesCategory = tx.category?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesNotes && !matchesCategory) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

      // Date range
      if (startDate && tx.date < startDate) return false;
      if (endDate && tx.date > endDate) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date_asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, searchTerm, typeFilter, categoryFilter, startDate, endDate, sortBy]);

  // Filtered Totals
  const filteredSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const handleExportCSV = () => {
    try {
      const filename = exportTransactionsToCSV(filteredTransactions, currency);
      showToast(`Exported ${filteredTransactions.length} records to ${filename}`, 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
    setSortBy('date_desc');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' || startDate || endDate;

  return (
    <div className="transactions-page space-y-6">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Transaction Ledger</h2>
          <p className="page-subtitle">
            Manage, filter, search, and export all credit and debit records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={Download}
            onClick={handleExportCSV}
            disabled={filteredTransactions.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={openAddModal}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filtered Summary Ribbon */}
      <div className="filtered-summary-ribbon">
        <div className="ribbon-col">
          <span className="ribbon-label">Matches Found</span>
          <span className="ribbon-val">{filteredTransactions.length} records</span>
        </div>
        <div className="ribbon-divider" />
        <div className="ribbon-col">
          <span className="ribbon-label">Filtered Income</span>
          <span className="ribbon-val text-success">+{formatCurrency(filteredSummary.income, currency)}</span>
        </div>
        <div className="ribbon-divider" />
        <div className="ribbon-col">
          <span className="ribbon-label">Filtered Expenses</span>
          <span className="ribbon-val text-danger">-{formatCurrency(filteredSummary.expense, currency)}</span>
        </div>
        <div className="ribbon-divider" />
        <div className="ribbon-col">
          <span className="ribbon-label">Net Filtered Balance</span>
          <span className={`ribbon-val ${filteredSummary.balance >= 0 ? 'text-primary' : 'text-danger'}`}>
            {formatCurrency(filteredSummary.balance, currency)}
          </span>
        </div>
      </div>

      {/* Filter Controls Toolbar */}
      <Card className="filter-card p-4">
        <div className="filter-grid">
          {/* Search box */}
          <div className="search-input-box">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search title, notes, or category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-field"
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchTerm('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
          </select>

          {/* Category Filter */}
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Categories</option>
            {DEFAULT_CATEGORIES.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>

          {/* Clear filters shortcut */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={clearFilters}
              className="clear-filter-btn"
            >
              Reset
            </Button>
          )}
        </div>
      </Card>

      {/* Transactions Data Table */}
      <Card className="transactions-table-card">
        {paginatedList.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Payment Method</th>
                    <th className="text-right">Amount</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedList.map((tx) => (
                    <tr key={tx.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className={`tx-mini-icon ${tx.type === 'income' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                            {tx.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          </div>
                          <div>
                            <span className="tx-title-text font-medium text-primary">{tx.title}</span>
                            {tx.notes && <p className="tx-notes-preview text-xs text-muted">{tx.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant={tx.type === 'income' ? 'success' : 'danger'}>
                          {tx.type}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant="default">{tx.category}</Badge>
                      </td>
                      <td className="text-muted text-sm">{formatDate(tx.date)}</td>
                      <td className="text-muted text-sm">{tx.paymentMethod || '—'}</td>
                      <td className={`text-right font-semibold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                      </td>
                      <td className="text-center">
                        <div className="table-row-actions">
                          <button
                            type="button"
                            className="row-action-btn"
                            title="View Details"
                            onClick={() => setViewDetailsTarget(tx)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            className="row-action-btn"
                            title="Edit Record"
                            onClick={() => openEditModal(tx)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            className="row-action-btn text-danger"
                            title="Delete Record"
                            onClick={() => setDeleteTargetId(tx.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="pagination-bar">
              <span className="pagination-info">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} entries
              </span>
              <div className="pagination-controls">
                <Button
                  variant="outline"
                  size="sm"
                  icon={ChevronLeft}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="page-indicator">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  icon={ChevronRight}
                  iconPosition="right"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={Search}
              title={hasActiveFilters ? "No matching records found" : "No transactions recorded yet"}
              description={
                hasActiveFilters
                  ? "Try loosening your search terms or resetting your filters."
                  : "Click the 'Add Transaction' button to start logging your finances."
              }
              actionText={hasActiveFilters ? "Reset Filters" : "Record First Transaction"}
              onAction={hasActiveFilters ? clearFilters : openAddModal}
            />
          </div>
        )}
      </Card>

      {/* Add / Edit Transaction Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingTransaction ? "Edit Transaction" : "New Transaction"}
        subtitle={editingTransaction ? "Update the details of this ledger entry" : "Record an income or expense transaction"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="type-toggle-pills">
            <button
              type="button"
              className={`type-pill ${formType === 'expense' ? 'pill-expense-active' : ''}`}
              onClick={() => {
                setFormType('expense');
                setFormCategory('Food & Dining');
              }}
            >
              Expense
            </button>
            <button
              type="button"
              className={`type-pill ${formType === 'income' ? 'pill-income-active' : ''}`}
              onClick={() => {
                setFormType('income');
                setFormCategory('Salary');
              }}
            >
              Income
            </button>
          </div>

          <div className="form-row">
            <Input
              label={`Amount (${currency})`}
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={formAmount}
              onChange={(e) => {
                setFormAmount(e.target.value);
                if (formErrors.amount) setFormErrors({ ...formErrors, amount: null });
              }}
              error={formErrors.amount}
              required
              autoFocus
            />
            <Input
              label="Date"
              type="date"
              value={formDate}
              onChange={(e) => {
                setFormDate(e.target.value);
                if (formErrors.date) setFormErrors({ ...formErrors, date: null });
              }}
              error={formErrors.date}
              required
            />
          </div>

          <Input
            label="Title / Narration"
            type="text"
            placeholder="e.g. Monthly Rent, Grocery bill..."
            value={formTitle}
            onChange={(e) => {
              setFormTitle(e.target.value);
              if (formErrors.title) setFormErrors({ ...formErrors, title: null });
            }}
            error={formErrors.title}
            required
          />

          <div className="form-row">
            <div className="input-group">
              <label className="input-label">Category *</label>
              <select
                className="select-field"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
              >
                {DEFAULT_CATEGORIES.filter(c => c.type === formType).map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Payment Method</label>
              <select
                className="select-field"
                value={formPaymentMethod}
                onChange={(e) => setFormPaymentMethod(e.target.value)}
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Notes & Tags"
            type="text"
            placeholder="Optional memo, invoice reference..."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
          />

          <div className="modal-actions-bar">
            <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingTransaction ? "Save Changes" : "Save Transaction"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction?"
        message="This will permanently remove this record from your ledger and update all dependent budget progress."
        confirmText="Yes, Delete"
        confirmVariant="danger"
      />

      {/* Transaction Details Modal */}
      {viewDetailsTarget && (
        <Modal
          isOpen={true}
          onClose={() => setViewDetailsTarget(null)}
          title="Transaction Details"
          subtitle={`Record ID: ${viewDetailsTarget.id}`}
        >
          <div className="tx-details-body space-y-4">
            <div className="detail-hero-box">
              <span className="text-xs text-muted uppercase">Amount</span>
              <h2 className={`text-2xl font-bold ${viewDetailsTarget.type === 'income' ? 'text-success' : 'text-danger'}`}>
                {viewDetailsTarget.type === 'income' ? '+' : '-'}{formatCurrency(viewDetailsTarget.amount, currency)}
              </h2>
            </div>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Title</span>
                <span className="detail-val font-medium">{viewDetailsTarget.title}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Type</span>
                <Badge variant={viewDetailsTarget.type === 'income' ? 'success' : 'danger'}>
                  {viewDetailsTarget.type}
                </Badge>
              </div>
              <div className="detail-item">
                <span className="detail-label">Category</span>
                <Badge variant="default">{viewDetailsTarget.category}</Badge>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date</span>
                <span className="detail-val">{formatDate(viewDetailsTarget.date)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Payment Method</span>
                <span className="detail-val">{viewDetailsTarget.paymentMethod || 'N/A'}</span>
              </div>
              <div className="detail-item col-span-2">
                <span className="detail-label">Notes</span>
                <p className="detail-val text-sm">{viewDetailsTarget.notes || 'No notes provided.'}</p>
              </div>
            </div>
            <div className="modal-actions-bar">
              <Button variant="outline" onClick={() => setViewDetailsTarget(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const target = viewDetailsTarget;
                  setViewDetailsTarget(null);
                  openEditModal(target);
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
