/**
 * Safe CSV and JSON Export / Import utilities for SpendWise.
 */

// Helper to trigger browser download
function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------- CSV EXPORT ----------------

export function exportTransactionsToCSV(transactions, userCurrency = 'INR') {
  if (!transactions || transactions.length === 0) {
    throw new Error('No transactions available to export.');
  }

  const headers = ['ID', 'Date', 'Title', 'Type', 'Category', 'Amount', 'Currency', 'Payment Method', 'Notes'];

  const rows = transactions.map(tx => {
    const escape = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    return [
      escape(tx.id),
      escape(tx.date),
      escape(tx.title),
      escape(tx.type),
      escape(tx.category),
      escape(tx.amount),
      escape(userCurrency),
      escape(tx.paymentMethod || 'N/A'),
      escape(tx.notes || '')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `spendwise_transactions_${timestamp}.csv`;

  triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;');
  return filename;
}

// ---------------- JSON BACKUP EXPORT ----------------

export function exportUserBackupJSON(userData) {
  const backup = {
    app: 'SpendWise — Smart Personal Finance Manager',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    user: {
      id: userData.id,
      name: userData.name,
      email: userData.email
    },
    preferences: userData.preferences || {},
    transactions: userData.transactions || [],
    budgets: userData.budgets || [],
    goals: userData.goals || [],
    notifications: userData.notifications || []
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `spendwise_backup_${userData.name?.toLowerCase().replace(/\s+/g, '_') || 'user'}_${dateStr}.json`;

  triggerDownload(jsonStr, filename, 'application/json;charset=utf-8;');
  return filename;
}

// ---------------- JSON BACKUP IMPORT & VALIDATION ----------------

export function validateAndParseBackupJSON(jsonString) {
  let data;
  try {
    data = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON file format. Could not parse data.');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Uploaded file does not contain a valid JSON object.');
  }

  if (data.app && !data.app.includes('SpendWise')) {
    throw new Error('File does not appear to be an authentic SpendWise backup.');
  }

  if (!Array.isArray(data.transactions)) {
    throw new Error("Invalid backup: 'transactions' list is missing or corrupted.");
  }

  if (!Array.isArray(data.budgets)) {
    throw new Error("Invalid backup: 'budgets' list is missing or corrupted.");
  }

  if (!Array.isArray(data.goals)) {
    throw new Error("Invalid backup: 'goals' list is missing or corrupted.");
  }

  // Sanitize transactions
  const sanitizedTransactions = data.transactions.map((tx, idx) => ({
    id: tx.id || `tx_imp_${idx}_${Date.now()}`,
    title: String(tx.title || 'Imported Transaction').substring(0, 100),
    amount: Math.abs(Number(tx.amount) || 0),
    type: tx.type === 'income' ? 'income' : 'expense',
    category: String(tx.category || 'Other').substring(0, 50),
    date: tx.date || new Date().toISOString().split('T')[0],
    paymentMethod: String(tx.paymentMethod || 'Other'),
    notes: String(tx.notes || '').substring(0, 200)
  }));

  // Sanitize budgets
  const sanitizedBudgets = data.budgets.map((b, idx) => ({
    id: b.id || `bg_imp_${idx}_${Date.now()}`,
    category: String(b.category || 'General').substring(0, 50),
    limit: Math.abs(Number(b.limit) || 0),
    period: 'monthly'
  }));

  // Sanitize goals
  const sanitizedGoals = data.goals.map((g, idx) => ({
    id: g.id || `gl_imp_${idx}_${Date.now()}`,
    name: String(g.name || 'Savings Goal').substring(0, 80),
    targetAmount: Math.abs(Number(g.targetAmount) || 0),
    currentAmount: Math.abs(Number(g.currentAmount) || 0),
    targetDate: g.targetDate || '',
    category: String(g.category || 'General'),
    notes: String(g.notes || '').substring(0, 150)
  }));

  return {
    preferences: data.preferences || {},
    transactions: sanitizedTransactions,
    budgets: sanitizedBudgets,
    goals: sanitizedGoals,
    notifications: Array.isArray(data.notifications) ? data.notifications : []
  };
}
