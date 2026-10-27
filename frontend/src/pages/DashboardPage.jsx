import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Target,
  Sliders,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { QuickAddModal } from '../components/dashboard/QuickAddModal';
import { calculateSummaryApi, calculateBudgetApi } from '../services/api';

const CATEGORY_COLORS = [
  '#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6',
  '#8B5CF6', '#14B8A6', '#EF4444', '#06B6D4', '#64748B'
];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transactions, budgets, goals, preferences, loadSampleData } = useFinance();

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    transactionCount: 0
  });

  // Calculate summary (using backend API with automatic local fallback)
  useEffect(() => {
    let isMounted = true;
    calculateSummaryApi(transactions).then(res => {
      if (isMounted) {
        setSummaryData(res);
      }
    });
    return () => { isMounted = false; };
  }, [transactions]);

  const currency = preferences.currency || 'INR';

  // Budget calculations
  const budgetStats = useMemo(() => {
    const totalLimit = budgets.reduce((sum, b) => sum + (Number(b.limit) || 0), 0);
    const categorySpending = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        const cat = t.category || 'Other';
        categorySpending[cat] = (categorySpending[cat] || 0) + (Number(t.amount) || 0);
      }
    });

    let totalBudgetedSpent = 0;
    budgets.forEach(b => {
      totalBudgetedSpent += categorySpending[b.category] || 0;
    });

    const remainingBudget = Math.max(0, totalLimit - totalBudgetedSpent);
    const utilization = totalLimit > 0 ? (totalBudgetedSpent / totalLimit) * 100 : 0;

    return { totalLimit, totalBudgetedSpent, remainingBudget, utilization };
  }, [budgets, transactions]);

  // Category breakdown for Recharts Pie Chart
  const categoryChartData = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        const cat = t.category || 'Other';
        map[cat] = (map[cat] || 0) + (Number(t.amount) || 0);
      }
    });

    return Object.keys(map).map((cat, idx) => ({
      name: cat,
      value: Number(map[cat].toFixed(2)),
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Cash flow trend for Recharts Bar Chart (Last 6 entries or grouped)
  const cashFlowData = useMemo(() => {
    const grouped = {};
    transactions.slice(0, 15).reverse().forEach(t => {
      const dateKey = formatDate(t.date, 'short');
      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: dateKey, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        grouped[dateKey].income += Number(t.amount) || 0;
      } else {
        grouped[dateKey].expense += Number(t.amount) || 0;
      }
    });
    return Object.values(grouped);
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions].slice(0, 5);
  }, [transactions]);

  return (
    <div className="dashboard-page space-y-6">
      {/* Top Banner / Welcome Banner */}
      <div className="dashboard-welcome-banner">
        <div className="banner-text">
          <h2>Overview & Analytics</h2>
          <p>
            Real-time balance, budgets, and cash flow for {user?.name || 'User'}.
          </p>
        </div>
        <div className="banner-actions">
          {transactions.length === 0 && (
            <Button
              variant="outline"
              icon={Sparkles}
              onClick={loadSampleData}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Load Demo Data
            </Button>
          )}
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setQuickAddOpen(true)}
            className="shadow-md"
          >
            Record Transaction
          </Button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="stats-grid">
        {/* Net Balance */}
        <Card className="stat-card">
          <div className="stat-icon-wrapper bg-primary-soft">
            <Wallet className="text-primary" size={24} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Net Balance</span>
            <span className={`stat-value ${summaryData.netBalance >= 0 ? 'text-primary' : 'text-danger'}`}>
              {formatCurrency(summaryData.netBalance, currency)}
            </span>
            <span className="stat-caption">
              {summaryData.totalIncome > 0
                ? `${summaryData.savingsRate}% of income retained`
                : 'Accumulated balance'}
            </span>
          </div>
        </Card>

        {/* Total Income */}
        <Card className="stat-card">
          <div className="stat-icon-wrapper bg-success-soft">
            <TrendingUp className="text-success" size={24} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Total Income</span>
            <span className="stat-value text-success">
              {formatCurrency(summaryData.totalIncome, currency)}
            </span>
            <span className="stat-caption">
              {summaryData.incomeCount} credited inflows
            </span>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card className="stat-card">
          <div className="stat-icon-wrapper bg-danger-soft">
            <TrendingDown className="text-danger" size={24} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Total Expenses</span>
            <span className="stat-value text-danger">
              {formatCurrency(summaryData.totalExpenses, currency)}
            </span>
            <span className="stat-caption">
              {summaryData.expenseCount} debited payments
            </span>
          </div>
        </Card>

        {/* Remaining Monthly Budget */}
        <Card className="stat-card">
          <div className="stat-icon-wrapper bg-warning-soft">
            <PieIcon className="text-warning" size={24} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Remaining Budget</span>
            <span className={`stat-value ${budgetStats.remainingBudget === 0 && budgetStats.totalLimit > 0 ? 'text-danger' : 'text-warning'}`}>
              {formatCurrency(budgetStats.remainingBudget, currency)}
            </span>
            <span className="stat-caption">
              {budgets.length > 0
                ? `${budgetStats.utilization.toFixed(0)}% limit utilized`
                : 'No budgets defined'}
            </span>
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="dashboard-charts-grid">
        {/* Income vs Expenses Cash Flow */}
        <Card className="chart-card">
          <CardHeader
            title="Cash Flow Activity"
            subtitle="Recent income vs expense distribution"
            action={
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/analytics')}
              >
                Deep Insights
              </Button>
            }
          />
          <CardBody>
            {cashFlowData.length > 0 ? (
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <Tooltip
                      formatter={(val) => formatCurrency(val, currency)}
                      contentStyle={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No chart data available"
                description="Record transactions to see your interactive cash flow graph."
                actionText="Add Transaction"
                onAction={() => setQuickAddOpen(true)}
              />
            )}
          </CardBody>
        </Card>

        {/* Expense Category Breakdown */}
        <Card className="chart-card">
          <CardHeader
            title="Expense Categories"
            subtitle="Proportional spending by category"
            action={
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/budgets')}
              >
                Manage Budgets
              </Button>
            }
          />
          <CardBody>
            {categoryChartData.length > 0 ? (
              <div className="chart-wrapper flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => formatCurrency(val, currency)}
                      contentStyle={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Category Legend Pills */}
                <div className="category-legend-list mt-2">
                  {categoryChartData.slice(0, 4).map((c) => (
                    <div key={c.name} className="legend-item">
                      <span className="legend-dot" style={{ backgroundColor: c.color }} />
                      <span className="legend-name">{c.name}</span>
                      <span className="legend-val">{formatCurrency(c.value, currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={PieIcon}
                title="No category spending yet"
                description="Add expenses to see your spending allocations by category."
                actionText="Add Expense"
                onAction={() => setQuickAddOpen(true)}
              />
            )}
          </CardBody>
        </Card>
      </div>

      {/* Bottom Row: Recent Transactions & Active Savings Goals */}
      <div className="dashboard-bottom-grid">
        {/* Recent Transactions Table */}
        <Card className="recent-tx-card">
          <CardHeader
            title="Recent Transactions"
            subtitle={`Showing latest ${recentTransactions.length} records`}
            action={
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/transactions')}
              >
                View All
              </Button>
            }
          />
          <CardBody className="p-0">
            {recentTransactions.length > 0 ? (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Method</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className={`tx-mini-icon ${tx.type === 'income' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                              {tx.type === 'income' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                            </div>
                            <span className="font-medium text-primary">{tx.title}</span>
                          </div>
                        </td>
                        <td>
                          <Badge variant="default">{tx.category}</Badge>
                        </td>
                        <td className="text-muted text-sm">{formatDate(tx.date, 'short')}</td>
                        <td className="text-muted text-sm">{tx.paymentMethod || '—'}</td>
                        <td className={`text-right font-semibold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6">
                <EmptyState
                  icon={Wallet}
                  title="No transactions yet"
                  description="Your financial ledger is currently empty. Record your first income or expense."
                  actionText="Record First Transaction"
                  onAction={() => setQuickAddOpen(true)}
                />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Savings Goals Widget */}
        <Card className="goals-widget-card">
          <CardHeader
            title="Savings Goals"
            subtitle={`${goals.length} active targets`}
            action={
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/goals')}
              >
                All Goals
              </Button>
            }
          />
          <CardBody>
            {goals.length > 0 ? (
              <div className="space-y-4">
                {goals.slice(0, 3).map((g) => {
                  const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
                  return (
                    <div key={g.id} className="goal-mini-item">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm text-primary">{g.name}</span>
                        <span className="text-xs font-semibold text-primary">{pct}%</span>
                      </div>
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1 text-xs text-muted">
                        <span>Saved: {formatCurrency(g.currentAmount, currency)}</span>
                        <span>Target: {formatCurrency(g.targetAmount, currency)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Target}
                title="No savings goals"
                description="Create milestones for trips, emergency funds, or equipment."
                actionText="Create Goal"
                onAction={() => navigate('/goals')}
              />
            )}
          </CardBody>
        </Card>
      </div>

      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
      />
    </div>
  );
};
