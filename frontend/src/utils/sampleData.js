/**
 * Realistic default sample data for SpendWise demo accounts.
 */

export const DEFAULT_CATEGORIES = [
  { id: 'cat_salary', name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10B981' },
  { id: 'cat_freelance', name: 'Freelance & Consulting', type: 'income', icon: 'Laptop', color: '#06B6D4' },
  { id: 'cat_investment_inc', name: 'Investment Returns', type: 'income', icon: 'TrendingUp', color: '#8B5CF6' },
  { id: 'cat_housing', name: 'Housing & Rent', type: 'expense', icon: 'Home', color: '#6366F1' },
  { id: 'cat_food', name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#F59E0B' },
  { id: 'cat_utilities', name: 'Utilities & Bills', type: 'expense', icon: 'Zap', color: '#EC4899' },
  { id: 'cat_transport', name: 'Transportation', type: 'expense', icon: 'Car', color: '#3B82F6' },
  { id: 'cat_shopping', name: 'Shopping & Groceries', type: 'expense', icon: 'ShoppingBag', color: '#14B8A6' },
  { id: 'cat_entertainment', name: 'Entertainment', type: 'expense', icon: 'Film', color: '#A855F7' },
  { id: 'cat_health', name: 'Healthcare & Fitness', type: 'expense', icon: 'HeartPulse', color: '#EF4444' },
  { id: 'cat_other', name: 'Other Expenses', type: 'expense', icon: 'MoreHorizontal', color: '#64748B' }
];

export const PAYMENT_METHODS = [
  'UPI / GPay / PhonePe',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash'
];

export function generateSampleData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  // Dates in current month
  const d = (day) => `${year}-${month}-${String(day).padStart(2, '0')}`;

  const transactions = [
    {
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      title: 'Monthly Tech Salary',
      amount: 85000,
      type: 'income',
      category: 'Salary',
      date: d(1),
      paymentMethod: 'Net Banking',
      notes: 'Direct salary deposit for the month'
    },
    {
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      title: 'Apartment Monthly Rent',
      amount: 24000,
      type: 'expense',
      category: 'Housing & Rent',
      date: d(2),
      paymentMethod: 'Net Banking',
      notes: 'Landlord transfer via NEFT'
    },
    {
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      title: 'Electricity & Fiber Internet',
      amount: 3200,
      type: 'expense',
      category: 'Utilities & Bills',
      date: d(4),
      paymentMethod: 'UPI / GPay / PhonePe',
      notes: 'Bescom bill + Jio Fiber'
    },
    {
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      title: 'Organic Groceries & Produce',
      amount: 4850,
      type: 'expense',
      category: 'Shopping & Groceries',
      date: d(6),
      paymentMethod: 'Credit Card',
      notes: 'Weekly supermarket supplies'
    },
    {
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      title: 'Freelance Design Consulting',
      amount: 18000,
      type: 'income',
      category: 'Freelance & Consulting',
      date: d(9),
      paymentMethod: 'UPI / GPay / PhonePe',
      notes: 'Frontend UI design sprint client payment'
    },
    {
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      title: 'Dinner at Bistro & Cafe',
      amount: 2150,
      type: 'expense',
      category: 'Food & Dining',
      date: d(12),
      paymentMethod: 'UPI / GPay / PhonePe',
      notes: 'Weekend get-together with friends'
    },
    {
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      title: 'Fuel & Metro Recharge',
      amount: 2800,
      type: 'expense',
      category: 'Transportation',
      date: d(15),
      paymentMethod: 'Debit Card',
      notes: 'Petrol fill up and metro smart card'
    },
    {
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      title: 'Streaming & Media Subscriptions',
      amount: 1199,
      type: 'expense',
      category: 'Entertainment',
      date: d(18),
      paymentMethod: 'Credit Card',
      notes: 'Netflix, Spotify & Prime renewals'
    },
    {
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      title: 'Pharmacy & Wellness Checkup',
      amount: 1750,
      type: 'expense',
      category: 'Healthcare & Fitness',
      date: d(21),
      paymentMethod: 'Credit Card',
      notes: 'Monthly vitamins and health check'
    },
    {
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      title: 'Mutual Fund Dividend Payout',
      amount: 3400,
      type: 'income',
      category: 'Investment Returns',
      date: d(24),
      paymentMethod: 'Net Banking',
      notes: 'Quarterly mutual fund dividend'
    }
  ];

  const budgets = [
    {
      id: 'bg_' + Math.random().toString(36).substring(2, 9),
      category: 'Housing & Rent',
      limit: 25000,
      period: 'monthly'
    },
    {
      id: 'bg_' + Math.random().toString(36).substring(2, 9),
      category: 'Food & Dining',
      limit: 10000,
      period: 'monthly'
    },
    {
      id: 'bg_' + Math.random().toString(36).substring(2, 9),
      category: 'Shopping & Groceries',
      limit: 12000,
      period: 'monthly'
    },
    {
      id: 'bg_' + Math.random().toString(36).substring(2, 9),
      category: 'Transportation',
      limit: 5000,
      period: 'monthly'
    },
    {
      id: 'bg_' + Math.random().toString(36).substring(2, 9),
      category: 'Utilities & Bills',
      limit: 4500,
      period: 'monthly'
    },
    {
      id: 'bg_' + Math.random().toString(36).substring(2, 9),
      category: 'Entertainment',
      limit: 3000,
      period: 'monthly'
    }
  ];

  const goals = [
    {
      id: 'gl_' + Math.random().toString(36).substring(2, 9),
      name: 'Emergency Reserve Fund (6 Months)',
      targetAmount: 250000,
      currentAmount: 185000,
      targetDate: `${year + 1}-03-31`,
      category: 'Safety',
      notes: 'Liquid high-interest savings account reserve'
    },
    {
      id: 'gl_' + Math.random().toString(36).substring(2, 9),
      name: 'New M3 MacBook Pro',
      targetAmount: 160000,
      currentAmount: 120000,
      targetDate: `${year}-12-15`,
      category: 'Electronics',
      notes: 'Workstation upgrade for development'
    },
    {
      id: 'gl_' + Math.random().toString(36).substring(2, 9),
      name: 'Himachal Vacation Trip',
      targetAmount: 50000,
      currentAmount: 35000,
      targetDate: `${year}-11-20`,
      category: 'Travel',
      notes: 'Cabin stay and trekking travel funds'
    }
  ];

  return { transactions, budgets, goals };
}
