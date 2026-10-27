/**
 * SpendWise API client with automatic offline/client-side fallback.
 * Ensures the app functions 100% reliably regardless of backend availability.
 */

const API_BASE_URL = '/api';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const data = await res.json();
      return { online: true, ...data };
    }
    return { online: false, error: 'Unhealthy response' };
  } catch (err) {
    return { online: false, error: err.message };
  }
}

export async function fetchBackendInfo() {
  try {
    const res = await fetch(`${API_BASE_URL}/info`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
}

// Local calculation fallbacks
export function localCalculateSummary(transactions = []) {
  let totalIncome = 0;
  let totalExpenses = 0;
  let incomeCount = 0;
  let expenseCount = 0;
  let largestExpense = null;

  transactions.forEach(tx => {
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      totalIncome += amt;
      incomeCount++;
    } else if (tx.type === 'expense') {
      totalExpenses += amt;
      expenseCount++;
      if (!largestExpense || amt > largestExpense.amount) {
        largestExpense = {
          id: tx.id,
          title: tx.title,
          amount: amt,
          category: tx.category
        };
      }
    }
  });

  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Number(((netBalance / totalIncome) * 100).toFixed(1)) : 0;

  return {
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    netBalance: Number(netBalance.toFixed(2)),
    transactionCount: transactions.length,
    incomeCount,
    expenseCount,
    largestExpense,
    savingsRate
  };
}

export function localCalculateBudgets(budgets = [], transactions = []) {
  const categorySpending = {};
  transactions.forEach(tx => {
    if (tx.type === 'expense') {
      const cat = (tx.category || 'Other').trim();
      categorySpending[cat] = (categorySpending[cat] || 0) + (Number(tx.amount) || 0);
    }
  });

  let overallBudgetLimit = 0;
  let overallSpent = 0;

  const budgetAnalysis = budgets.map(b => {
    const limit = Number(b.limit) || 0;
    const cat = (b.category || 'Other').trim();
    const spent = categorySpending[cat] || 0;
    const remaining = Math.max(0, limit - spent);
    const utilization = limit > 0 ? Number(((spent / limit) * 100).toFixed(1)) : 0;

    overallBudgetLimit += limit;
    overallSpent += spent;

    let status = 'on_track';
    if (spent >= limit) {
      status = 'exceeded';
    } else if (utilization >= 80) {
      status = 'warning';
    }

    return {
      id: b.id,
      category: cat,
      limit,
      spent: Number(spent.toFixed(2)),
      remaining: Number(remaining.toFixed(2)),
      utilization,
      status,
      isOverBudget: spent > limit,
      overBudgetAmount: spent > limit ? Number((spent - limit).toFixed(2)) : 0
    };
  });

  return {
    overallBudgetLimit: Number(overallBudgetLimit.toFixed(2)),
    overallSpent: Number(overallSpent.toFixed(2)),
    overallRemaining: Number(Math.max(0, overallBudgetLimit - overallSpent).toFixed(2)),
    overallUtilization: overallBudgetLimit > 0 ? Number(((overallSpent / overallBudgetLimit) * 100).toFixed(1)) : 0,
    budgets: budgetAnalysis
  };
}

// Request backend with fallback
export async function calculateSummaryApi(transactions) {
  try {
    const res = await fetch(`${API_BASE_URL}/calculate/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions }),
      signal: AbortSignal.timeout(2500)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return { ...json.data, source: 'backend' };
    }
  } catch (e) {
    // Backend offline; use local calculation
  }
  return { ...localCalculateSummary(transactions), source: 'local' };
}

export async function calculateBudgetApi(budgets, transactions) {
  try {
    const res = await fetch(`${API_BASE_URL}/calculate/budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budgets, transactions }),
      signal: AbortSignal.timeout(2500)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return { ...json.data, source: 'backend' };
    }
  } catch (e) {
    // Backend offline; use local calculation
  }
  return { ...localCalculateBudgets(budgets, transactions), source: 'local' };
}
