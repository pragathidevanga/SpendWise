import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  Lightbulb,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import { exportTransactionsToCSV } from '../utils/exportImport';
import { Button } from '../components/common/Button';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';

const PALETTE = [
  '#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6',
  '#8B5CF6', '#14B8A6', '#EF4444', '#06B6D4', '#64748B'
];

export const AnalyticsPage = () => {
  const { transactions, budgets, goals, preferences } = useFinance();
  const { showToast } = useToast();
  const currency = preferences.currency || 'INR';

  const [timeRange, setTimeRange] = useState('all'); // 'all' | '30days' | 'month'

  // Filter transactions by timeRange
  const activeTransactions = useMemo(() => {
    if (timeRange === 'all') return transactions;
    const now = new Date();

    if (timeRange === 'month') {
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return transactions.filter(t => t.date && t.date.startsWith(currentYearMonth));
    }

    if (timeRange === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      const cutoff = thirtyDaysAgo.toISOString().split('T')[0];
      return transactions.filter(t => t.date && t.date >= cutoff);
    }

    return transactions;
  }, [transactions, timeRange]);

  // Aggregate stats
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    activeTransactions.forEach(t => {
      if (t.type === 'income') income += Number(t.amount) || 0;
      else expense += Number(t.amount) || 0;
    });

    const net = income - expense;
    const savingsRate = income > 0 ? (net / income) * 100 : 0;
    return { income, expense, net, savingsRate };
  }, [activeTransactions]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const map = {};
    activeTransactions.forEach(t => {
      if (t.type === 'expense') {
        const cat = t.category || 'Other';
        map[cat] = (map[cat] || 0) + (Number(t.amount) || 0);
      }
    });

    return Object.keys(map).map((cat, idx) => ({
      name: cat,
      value: Number(map[cat].toFixed(2)),
      color: PALETTE[idx % PALETTE.length],
      percentage: stats.expense > 0 ? ((map[cat] / stats.expense) * 100).toFixed(1) : 0
    })).sort((a, b) => b.value - a.value);
  }, [activeTransactions, stats.expense]);

  // Daily / Period Cash Flow timeline
  const timelineData = useMemo(() => {
    const grouped = {};
    const sorted = [...activeTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    sorted.forEach(t => {
      const dKey = formatDate(t.date, 'short');
      if (!grouped[dKey]) {
        grouped[dKey] = { date: dKey, income: 0, expense: 0, net: 0 };
      }
      if (t.type === 'income') {
        grouped[dKey].income += Number(t.amount) || 0;
      } else {
        grouped[dKey].expense += Number(t.amount) || 0;
      }
      grouped[dKey].net = grouped[dKey].income - grouped[dKey].expense;
    });

    return Object.values(grouped);
  }, [activeTransactions]);

  // Rule-based insights engine (strict heuristics, no fake AI)
  const insights = useMemo(() => {
    const list = [];
    if (activeTransactions.length === 0) return list;

    // Insight 1: Savings rate
    if (stats.income > 0) {
      if (stats.savingsRate >= 30) {
        list.push({
          type: 'positive',
          title: 'Strong Savings Rate',
          text: `You have retained ${stats.savingsRate.toFixed(1)}% of recorded inflows for this timeframe, comfortably above standard benchmark goals.`
        });
      } else if (stats.savingsRate > 0) {
        list.push({
          type: 'info',
          title: 'Moderate Surplus',
          text: `Your current savings rate is ${stats.savingsRate.toFixed(1)}%. Review secondary spending categories to boost your monthly cushion.`
        });
      } else {
        list.push({
          type: 'warning',
          title: 'Deficit Alert',
          text: `Expenses exceed recorded income by ${formatCurrency(Math.abs(stats.net), currency)} for this period.`
        });
      }
    }

    // Insight 2: Highest spending category
    if (categoryData.length > 0) {
      const top = categoryData[0];
      list.push({
        type: 'info',
        title: `Primary Expense: ${top.name}`,
        text: `${top.name} represents your highest outlay at ${formatCurrency(top.value, currency)}, making up ${top.percentage}% of your total expenditures.`
      });
    }

    // Insight 3: Budget limit status checks
    budgets.forEach(b => {
      const catSpent = categoryData.find(c => c.name === b.category)?.value || 0;
      if (catSpent > b.limit) {
        list.push({
          type: 'warning',
          title: `Budget Exceeded in ${b.category}`,
          text: `You have spent ${formatCurrency(catSpent, currency)} against an allotted ceiling of ${formatCurrency(b.limit, currency)}.`
        });
      }
    });

    // Insight 4: Savings goal proximity
    goals.forEach(g => {
      if (g.targetAmount > 0 && g.currentAmount >= g.targetAmount) {
        list.push({
          type: 'positive',
          title: `Goal Completed: ${g.name}`,
          text: `Congratulations! Target amount of ${formatCurrency(g.targetAmount, currency)} has been fully accumulated.`
        });
      }
    });

    return list;
  }, [activeTransactions, stats, categoryData, budgets, goals, currency]);

  const handleExport = () => {
    try {
      const filename = exportTransactionsToCSV(activeTransactions, currency);
      showToast(`Exported report data to ${filename}`, 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="analytics-page space-y-6">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Financial Analytics & Reports</h2>
          <p className="page-subtitle">
            Visual breakdown of income streams, category distributions, and rule-based insights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <div className="time-range-pills">
            <button
              type="button"
              className={`pill-btn ${timeRange === 'all' ? 'pill-btn-active' : ''}`}
              onClick={() => setTimeRange('all')}
            >
              All Time
            </button>
            <button
              type="button"
              className={`pill-btn ${timeRange === '30days' ? 'pill-btn-active' : ''}`}
              onClick={() => setTimeRange('30days')}
            >
              Last 30 Days
            </button>
            <button
              type="button"
              className={`pill-btn ${timeRange === 'month' ? 'pill-btn-active' : ''}`}
              onClick={() => setTimeRange('month')}
            >
              Current Month
            </button>
          </div>
          <Button
            variant="outline"
            icon={Download}
            onClick={handleExport}
            disabled={activeTransactions.length === 0}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Aggregate metric ribbon */}
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-icon-wrapper bg-success-soft">
            <TrendingUp className="text-success" size={22} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Inflow for Period</span>
            <span className="stat-value text-success">{formatCurrency(stats.income, currency)}</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon-wrapper bg-danger-soft">
            <TrendingDown className="text-danger" size={22} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Outflow for Period</span>
            <span className="stat-value text-danger">{formatCurrency(stats.expense, currency)}</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon-wrapper bg-primary-soft">
            <BarChart3 className="text-primary" size={22} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Net Inflow / Savings</span>
            <span className={`stat-value ${stats.net >= 0 ? 'text-primary' : 'text-danger'}`}>
              {formatCurrency(stats.net, currency)}
            </span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon-wrapper bg-warning-soft">
            <PieIcon className="text-warning" size={22} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Retention Rate</span>
            <span className="stat-value">{stats.savingsRate.toFixed(1)}%</span>
          </div>
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card className="chart-card">
        <CardHeader
          title="Cash Inflow & Outflow Timeline"
          subtitle="Chronological trend of income vs expenditures"
        />
        <CardBody>
          {timelineData.length > 0 ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Expenses"
                    stroke="#EF4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="Insufficient chronological data"
              description="Add entries to plot timeline graphs."
            />
          )}
        </CardBody>
      </Card>

      {/* Two columns: Category Breakdown & Rule-Based Insights */}
      <div className="analytics-split-grid">
        {/* Category Breakdown Table & Donut */}
        <Card className="category-analysis-card">
          <CardHeader
            title="Spending Distribution"
            subtitle="Top categories by percentage and volume"
          />
          <CardBody>
            {categoryData.length > 0 ? (
              <div className="space-y-4">
                <div className="category-bars-list">
                  {categoryData.map((c) => (
                    <div key={c.name} className="cat-metric-row">
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="font-medium text-primary">{c.name}</span>
                        <span className="text-muted font-semibold">
                          {formatCurrency(c.value, currency)} ({c.percentage}%)
                        </span>
                      </div>
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${c.percentage}%`,
                            backgroundColor: c.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={PieIcon}
                title="No category expenditures"
                description="Record expense entries to view detailed category weightings."
              />
            )}
          </CardBody>
        </Card>

        {/* Rule-Based Financial Insights */}
        <Card className="insights-card">
          <CardHeader
            title="Rule-Based Financial Insights"
            subtitle="Calculated heuristics and status observations"
          />
          <CardBody>
            {insights.length > 0 ? (
              <div className="insights-feed space-y-3">
                {insights.map((item, idx) => (
                  <div
                    key={idx}
                    className={`insight-item-box ${
                      item.type === 'positive'
                        ? 'insight-box-positive'
                        : item.type === 'warning'
                        ? 'insight-box-warning'
                        : 'insight-box-info'
                    }`}
                  >
                    <div className="insight-icon-col">
                      {item.type === 'positive' ? (
                        <CheckCircle2 size={18} className="text-success" />
                      ) : item.type === 'warning' ? (
                        <AlertTriangle size={18} className="text-warning" />
                      ) : (
                        <Lightbulb size={18} className="text-primary" />
                      )}
                    </div>
                    <div className="insight-content-col">
                      <h4 className="insight-title">{item.title}</h4>
                      <p className="insight-text">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Lightbulb}
                title="No insights generated yet"
                description="Once transactions are recorded, automated rule-based summaries will appear here."
              />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
