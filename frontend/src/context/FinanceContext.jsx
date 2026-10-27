import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { Storage, KEYS } from '../services/storage';
import { generateSampleData } from '../utils/sampleData';
import { checkBackendHealth, calculateSummaryApi, calculateBudgetApi } from '../services/api';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({
    currency: 'INR',
    monthlyIncome: 0,
    monthlyBudget: 0,
    financialGoal: '',
    dateFormat: 'DD MMM YYYY'
  });
  const [backendStatus, setBackendStatus] = useState({ online: false, checking: true });
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Periodically check backend status
  const pingBackend = useCallback(async () => {
    const health = await checkBackendHealth();
    setBackendStatus({ online: health.online, checking: false, info: health });
  }, []);

  useEffect(() => {
    pingBackend();
    const interval = setInterval(pingBackend, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [pingBackend]);

  // Load user-scoped financial data whenever user changes
  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      setNotifications([]);
      setIsDataLoaded(false);
      return;
    }

    try {
      const userTx = Storage.getUserData(KEYS.TRANSACTIONS, userId, []);
      const userBg = Storage.getUserData(KEYS.BUDGETS, userId, []);
      const userGl = Storage.getUserData(KEYS.GOALS, userId, []);
      const userNotifs = Storage.getUserData(KEYS.NOTIFICATIONS, userId, []);
      const userPref = Storage.getUserData(KEYS.PREFERENCES, userId, {
        currency: 'INR',
        monthlyIncome: 0,
        monthlyBudget: 0,
        financialGoal: '',
        dateFormat: 'DD MMM YYYY'
      });

      // If user is a demo user and has zero data, seed initial demo data
      if (user?.isDemo && userTx.length === 0 && userBg.length === 0) {
        const sample = generateSampleData();
        setTransactions(sample.transactions);
        setBudgets(sample.budgets);
        setGoals(sample.goals);

        Storage.setUserData(KEYS.TRANSACTIONS, userId, sample.transactions);
        Storage.setUserData(KEYS.BUDGETS, userId, sample.budgets);
        Storage.setUserData(KEYS.GOALS, userId, sample.goals);

        const initialNotifs = [
          {
            id: 'notif_welcome',
            title: 'Welcome to SpendWise Demo',
            message: 'Sample transactions, budgets, and savings goals have been preloaded for your evaluation.',
            type: 'info',
            read: false,
            createdAt: new Date().toISOString()
          }
        ];
        setNotifications(initialNotifs);
        Storage.setUserData(KEYS.NOTIFICATIONS, userId, initialNotifs);
      } else {
        setTransactions(userTx);
        setBudgets(userBg);
        setGoals(userGl);
        setNotifications(userNotifs);
      }

      setPreferences(userPref);
      setIsDataLoaded(true);
    } catch (e) {
      console.error('[FinanceContext] Error loading user financial data:', e);
      setIsDataLoaded(true);
    }
  }, [userId, user?.isDemo]);

  // Save changes to localStorage scoped by user
  const saveTransactions = useCallback((newTx) => {
    setTransactions(newTx);
    if (userId) Storage.setUserData(KEYS.TRANSACTIONS, userId, newTx);
  }, [userId]);

  const saveBudgets = useCallback((newBudgets) => {
    setBudgets(newBudgets);
    if (userId) Storage.setUserData(KEYS.BUDGETS, userId, newBudgets);
  }, [userId]);

  const saveGoals = useCallback((newGoals) => {
    setGoals(newGoals);
    if (userId) Storage.setUserData(KEYS.GOALS, userId, newGoals);
  }, [userId]);

  const saveNotifications = useCallback((newNotifs) => {
    setNotifications(newNotifs);
    if (userId) Storage.setUserData(KEYS.NOTIFICATIONS, userId, newNotifs);
  }, [userId]);

  const savePreferences = useCallback((newPrefs) => {
    setPreferences(newPrefs);
    if (userId) Storage.setUserData(KEYS.PREFERENCES, userId, newPrefs);
  }, [userId]);

  // ---------------- Transaction CRUD ----------------

  const addTransaction = useCallback((txData) => {
    const newTx = {
      ...txData,
      id: txData.id || 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      amount: Math.abs(Number(txData.amount) || 0),
      createdAt: new Date().toISOString()
    };
    const updated = [newTx, ...transactions];
    saveTransactions(updated);

    // Auto trigger budget notification if budget threshold exceeded
    if (newTx.type === 'expense') {
      const budget = budgets.find(b => b.category.toLowerCase() === newTx.category.toLowerCase());
      if (budget) {
        const totalSpentInCat = updated
          .filter(t => t.type === 'expense' && t.category.toLowerCase() === newTx.category.toLowerCase())
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        if (totalSpentInCat > budget.limit) {
          const notif = {
            id: 'notif_bg_exceeded_' + Date.now(),
            title: `Budget Exceeded: ${budget.category}`,
            message: `Spending on ${budget.category} reached ${totalSpentInCat}, surpassing your limit of ${budget.limit}.`,
            type: 'warning',
            read: false,
            createdAt: new Date().toISOString()
          };
          saveNotifications([notif, ...notifications]);
        }
      }
    }

    return newTx;
  }, [transactions, budgets, notifications, saveTransactions, saveNotifications]);

  const updateTransaction = useCallback((id, updatedData) => {
    const updated = transactions.map(tx => {
      if (tx.id === id) {
        return {
          ...tx,
          ...updatedData,
          amount: Math.abs(Number(updatedData.amount !== undefined ? updatedData.amount : tx.amount) || 0),
          updatedAt: new Date().toISOString()
        };
      }
      return tx;
    });
    saveTransactions(updated);
  }, [transactions, saveTransactions]);

  const deleteTransaction = useCallback((id) => {
    const updated = transactions.filter(tx => tx.id !== id);
    saveTransactions(updated);
  }, [transactions, saveTransactions]);

  // ---------------- Budget CRUD ----------------

  const addBudget = useCallback((budgetData) => {
    const newBudget = {
      ...budgetData,
      id: 'bg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      limit: Math.abs(Number(budgetData.limit) || 0),
      period: 'monthly'
    };
    const updated = [...budgets, newBudget];
    saveBudgets(updated);
    return newBudget;
  }, [budgets, saveBudgets]);

  const updateBudget = useCallback((id, updatedData) => {
    const updated = budgets.map(b => {
      if (b.id === id) {
        return {
          ...b,
          ...updatedData,
          limit: Math.abs(Number(updatedData.limit !== undefined ? updatedData.limit : b.limit) || 0)
        };
      }
      return b;
    });
    saveBudgets(updated);
  }, [budgets, saveBudgets]);

  const deleteBudget = useCallback((id) => {
    const updated = budgets.filter(b => b.id !== id);
    saveBudgets(updated);
  }, [budgets, saveBudgets]);

  // ---------------- Goal CRUD ----------------

  const addGoal = useCallback((goalData) => {
    const newGoal = {
      ...goalData,
      id: 'gl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      targetAmount: Math.abs(Number(goalData.targetAmount) || 0),
      currentAmount: Math.abs(Number(goalData.currentAmount) || 0),
      createdAt: new Date().toISOString()
    };
    const updated = [...goals, newGoal];
    saveGoals(updated);
    return newGoal;
  }, [goals, saveGoals]);

  const updateGoal = useCallback((id, updatedData) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        return {
          ...g,
          ...updatedData,
          targetAmount: Math.abs(Number(updatedData.targetAmount !== undefined ? updatedData.targetAmount : g.targetAmount) || 0),
          currentAmount: Math.abs(Number(updatedData.currentAmount !== undefined ? updatedData.currentAmount : g.currentAmount) || 0)
        };
      }
      return g;
    });
    saveGoals(updated);
  }, [goals, saveGoals]);

  const deleteGoal = useCallback((id) => {
    const updated = goals.filter(g => g.id !== id);
    saveGoals(updated);
  }, [goals, saveGoals]);

  const addFundsToGoal = useCallback((id, amount) => {
    const amt = Math.abs(Number(amount) || 0);
    if (amt <= 0) return;

    let completedGoalName = null;
    const updated = goals.map(g => {
      if (g.id === id) {
        const nextAmount = g.currentAmount + amt;
        if (nextAmount >= g.targetAmount && g.currentAmount < g.targetAmount) {
          completedGoalName = g.name;
        }
        return {
          ...g,
          currentAmount: nextAmount,
          lastContributionAt: new Date().toISOString()
        };
      }
      return g;
    });

    saveGoals(updated);

    if (completedGoalName) {
      const milestoneNotif = {
        id: 'notif_goal_' + Date.now(),
        title: 'Goal Achieved! 🎉',
        message: `Congratulations! You've reached your target savings goal: "${completedGoalName}".`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString()
      };
      saveNotifications([milestoneNotif, ...notifications]);
    }
  }, [goals, notifications, saveGoals, saveNotifications]);

  const withdrawFromGoal = useCallback((id, amount) => {
    const amt = Math.abs(Number(amount) || 0);
    if (amt <= 0) return;

    const updated = goals.map(g => {
      if (g.id === id) {
        return {
          ...g,
          currentAmount: Math.max(0, g.currentAmount - amt),
          lastWithdrawalAt: new Date().toISOString()
        };
      }
      return g;
    });
    saveGoals(updated);
  }, [goals, saveGoals]);

  // ---------------- Notifications CRUD ----------------

  const markNotificationAsRead = useCallback((id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const markAllNotificationsAsRead = useCallback(() => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const clearNotification = useCallback((id) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const clearAllNotifications = useCallback(() => {
    saveNotifications([]);
  }, [saveNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // ---------------- Bulk Actions ----------------

  const loadSampleData = useCallback(() => {
    const sample = generateSampleData();
    saveTransactions(sample.transactions);
    saveBudgets(sample.budgets);
    saveGoals(sample.goals);

    const notif = {
      id: 'notif_sample_loaded_' + Date.now(),
      title: 'Sample Data Loaded',
      message: 'Demo transactions, budget categories, and savings goals are now populated.',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    };
    saveNotifications([notif, ...notifications]);
  }, [notifications, saveTransactions, saveBudgets, saveGoals, saveNotifications]);

  const clearAllUserData = useCallback(() => {
    if (!userId) return;
    Storage.clearUserData(userId);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setNotifications([]);
  }, [userId]);

  const importBackupData = useCallback((parsed) => {
    if (parsed.transactions) saveTransactions(parsed.transactions);
    if (parsed.budgets) saveBudgets(parsed.budgets);
    if (parsed.goals) saveGoals(parsed.goals);
    if (parsed.preferences) savePreferences({ ...preferences, ...parsed.preferences });
    if (parsed.notifications) saveNotifications(parsed.notifications);
  }, [preferences, saveTransactions, saveBudgets, saveGoals, savePreferences, saveNotifications]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        goals,
        notifications,
        unreadCount,
        preferences,
        backendStatus,
        isDataLoaded,
        pingBackend,
        // Transaction actions
        addTransaction,
        updateTransaction,
        deleteTransaction,
        // Budget actions
        addBudget,
        updateBudget,
        deleteBudget,
        // Goal actions
        addGoal,
        updateGoal,
        deleteGoal,
        addFundsToGoal,
        withdrawFromGoal,
        // Notification actions
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        clearAllNotifications,
        // Preferences & data
        savePreferences,
        loadSampleData,
        clearAllUserData,
        importBackupData
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
