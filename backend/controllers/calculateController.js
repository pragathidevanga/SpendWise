/**
 * Controllers for SpendWise financial calculations.
 * Used for supplementary backend processing with rigorous validation.
 */

export const calculateSummary = (req, res) => {
  try {
    const { transactions } = req.body;

    if (!Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        error: "Invalid request payload: 'transactions' must be an array."
      });
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expenseCount = 0;
    let largestExpense = null;

    for (const tx of transactions) {
      if (!tx || typeof tx !== 'object') continue;
      const amount = Number(tx.amount);
      if (isNaN(amount) || amount < 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid transaction amount encountered: ${tx.amount}`
        });
      }

      const type = (tx.type || '').toLowerCase();
      if (type === 'income') {
        totalIncome += amount;
        incomeCount++;
      } else if (type === 'expense') {
        totalExpenses += amount;
        expenseCount++;
        if (!largestExpense || amount > largestExpense.amount) {
          largestExpense = {
            id: tx.id,
            title: tx.title || 'Untitled Expense',
            amount,
            category: tx.category || 'General'
          };
        }
      }
    }

    const netBalance = totalIncome - totalExpenses;

    return res.status(200).json({
      success: true,
      data: {
        totalIncome: Number(totalIncome.toFixed(2)),
        totalExpenses: Number(totalExpenses.toFixed(2)),
        netBalance: Number(netBalance.toFixed(2)),
        transactionCount: transactions.length,
        incomeCount,
        expenseCount,
        largestExpense,
        savingsRate: totalIncome > 0 ? Number(((netBalance / totalIncome) * 100).toFixed(1)) : 0
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal calculation error: " + err.message
    });
  }
};

export const calculateBudget = (req, res) => {
  try {
    const { budgets, transactions } = req.body;

    if (!Array.isArray(budgets) || !Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        error: "Both 'budgets' and 'transactions' arrays are required."
      });
    }

    // Calculate spending per category
    const categorySpending = {};
    for (const tx of transactions) {
      if (!tx || typeof tx !== 'object') continue;
      if ((tx.type || '').toLowerCase() === 'expense') {
        const cat = (tx.category || 'Other').trim();
        const amt = Number(tx.amount) || 0;
        categorySpending[cat] = (categorySpending[cat] || 0) + amt;
      }
    }

    let overallBudgetLimit = 0;
    let overallSpent = 0;

    const budgetAnalysis = budgets.map(b => {
      const limit = Number(b.limit) || 0;
      const category = (b.category || 'Other').trim();
      const spent = categorySpending[category] || 0;
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
        category,
        limit,
        spent: Number(spent.toFixed(2)),
        remaining: Number(remaining.toFixed(2)),
        utilization,
        status,
        isOverBudget: spent > limit,
        overBudgetAmount: spent > limit ? Number((spent - limit).toFixed(2)) : 0
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        overallBudgetLimit: Number(overallBudgetLimit.toFixed(2)),
        overallSpent: Number(overallSpent.toFixed(2)),
        overallRemaining: Number(Math.max(0, overallBudgetLimit - overallSpent).toFixed(2)),
        overallUtilization: overallBudgetLimit > 0 ? Number(((overallSpent / overallBudgetLimit) * 100).toFixed(1)) : 0,
        budgets: budgetAnalysis
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal budget calculation error: " + err.message
    });
  }
};
