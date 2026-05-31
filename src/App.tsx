import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  User,
  Sliders,
  Sparkles,
  ShieldAlert,
  Save,
  Check,
  Award,
  BookOpen,
  Database,
  LayoutDashboard,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Target,
  Landmark,
  FileText,
  ShieldCheck,
  LogOut
} from 'lucide-react';

import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ExpenseTracker from './components/ExpenseTracker';
import IncomeTracker from './components/IncomeTracker';
import BudgetPlanner from './components/BudgetPlanner';
import SavingsGoals from './components/SavingsGoals';
import AiInsights from './components/AiInsights';
import PremiumFeatures from './components/PremiumFeatures';
import Reports from './components/Reports';
import AdminPanel from './components/AdminPanel';
import ThemeToggle from './components/ThemeToggle';

import {
  Transaction,
  Budget,
  SavingGoal,
  RecurringTransaction,
  SplitExpense,
  Debt,
  Investment,
  UserProfile,
  UserNotification,
  Badge
} from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core synchronized states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [splitExpenses, setSplitExpenses] = useState<SplitExpense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'User',
    email: '',
    currency: 'INR',
    dailyStreak: 1,
    xp: 10,
    level: 1,
    enable2FA: false,
    theme: 'light'
  });
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);

  // Active general categories
  const [categories, setCategories] = useState<string[]>([
    'Food',
    'Shopping',
    'Transport',
    'Entertainment',
    'Education',
    'Healthcare',
    'Bills',
    'Investments',
    'Other'
  ]);

  // Loading notifications / success banners
  const [savingStatus, setSavingStatus] = useState('');
  const [supabaseStatusState, setSupabaseStatusState] = useState<{
    configured: boolean;
    connected: boolean;
    tableExists: boolean;
    error: string | null;
    projectUrl: string;
  } | null>(null);

  const fetchSupabaseStatus = async () => {
    try {
      const res = await fetch('/api/supabase/status');
      if (res.ok) {
        const data = await res.json();
        setSupabaseStatusState(data);
      }
    } catch (e) {
      console.warn('Failed to fetch Supabase status', e);
    }
  };

  // Fetch initial profile sheets from Backend database
  const loadData = async () => {
    setIsLoading(true);
    try {
      const savedEmail = localStorage.getItem('moneymate_authenticated_email');
      if (!savedEmail) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      const response = await fetch(`/api/user/data?email=${encodeURIComponent(savedEmail)}`);
      if (response.ok) {
        const db = await response.json();
        setTransactions(db.transactions || []);
        setBudgets(db.budgets || []);
        setSavingGoals(db.savingGoals || []);
        setRecurringTransactions(db.recurringTransactions || []);
        setSplitExpenses(db.splitExpenses || []);
        setDebts(db.debts || []);
        setInvestments(db.investments || []);
        const derivedName = savedEmail.split('@')[0].split(/[._-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'User';
        setUserProfile(db.userProfile || {
          name: derivedName,
          email: savedEmail,
          currency: 'INR',
          dailyStreak: 1,
          xp: 10,
          level: 1,
          enable2FA: false,
          theme: 'light'
        });
        setNotifications(db.notifications || []);
        setBadges(db.badges || []);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.warn('Backend server unreachable, falling back to local fallback state layers!', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    fetchSupabaseStatus();
    const interval = setInterval(fetchSupabaseStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Save / Sync user changes to backend
  const syncWithServer = async (
    updatedT: Transaction[],
    updatedB: Budget[],
    updatedG: SavingGoal[],
    updatedU: UserProfile,
    updatedN: UserNotification[],
    updatedI: Investment[],
    updatedD: Debt[],
    updatedS: SplitExpense[]
  ) => {
    setSavingStatus('Syncing... ✅');
    const dbPayload = {
      transactions: updatedT,
      budgets: updatedB,
      savingGoals: updatedG,
      recurringTransactions,
      splitExpenses: updatedS,
      debts: updatedD,
      investments: updatedI,
      userProfile: updatedU,
      notifications: updatedN,
      badges
    };

    try {
      await fetch('/api/user/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPayload)
      });
    } catch (e) {
      console.warn('Backup fail syncing sheets.', e);
    } finally {
      setTimeout(() => setSavingStatus(''), 2000);
    }
  };

  // Convert short ISO currencies to respective glyph symbols
  const currencySymbol = useMemo(() => {
    const val = userProfile.currency;
    if (val === 'INR') return '₹';
    if (val === 'USD') return '$';
    if (val === 'EUR') return '€';
    if (val === 'GBP') return '£';
    return '¥';
  }, [userProfile.currency]);

  // Auth logins success triggers
  const handleAuthSuccess = (user: UserProfile) => {
    localStorage.setItem('moneymate_authenticated_email', user.email);
    setUserProfile(user);
    setIsAuthenticated(true);
    // Trigger loading of full dataset for that specific registered/logged-in email
    loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem('moneymate_authenticated_email');
    setIsAuthenticated(false);
    setActiveTab('dashboard');
    // Clear in-memory client state completely to prevent cross-user leak
    setTransactions([]);
    setBudgets([]);
    setSavingGoals([]);
    setRecurringTransactions([]);
    setSplitExpenses([]);
    setDebts([]);
    setInvestments([]);
    setNotifications([]);
    setBadges([]);
  };

  // ADD / INSERT TRANSACTION
  const handleAddTransaction = (payload: Omit<Transaction, 'id'>) => {
    const freshId = `tx-${Math.random().toString(36).substring(4)}`;
    const freshTransaction: Transaction = {
      id: freshId,
      ...payload
    };

    const nextTransactions = [freshTransaction, ...transactions];
    setTransactions(nextTransactions);

    // Dynamic budget limit spent calculations
    let nextBudgets = [...budgets];
    if (freshTransaction.type === 'expense') {
      nextBudgets = budgets.map((b) => {
        if (b.category === freshTransaction.category) {
          const spentNow = b.spent + freshTransaction.amount;
          // Trigger Budget warning alert notification if approaching above threshold limit (80%)
          if (spentNow >= b.limit * 0.8 && b.spent < b.limit * 0.8) {
            triggerInstantNotification(
              '⚠️ Budget threshold alarm',
              `You spent ${currencySymbol}${spentNow.toLocaleString()} of your ${b.category} limit (${currencySymbol}${b.limit.toLocaleString()})!`,
              'warning'
            );
          }
          return { ...b, spent: spentNow };
        }
        return b;
      });
      setBudgets(nextBudgets);
    }

    // Allocate streak increments and XP Rewards
    const levelXP = Math.min(500, userProfile.xp + 25);
    let nextLvl = userProfile.level;
    if (levelXP >= 500) {
      nextLvl += 1;
      triggerInstantNotification(
        '🏆 Level Up Achievement!',
        `Congratulations, your financial consistency upgraded your status to level ${nextLvl}! Keeps saving surplus cashflow!`,
        'success'
      );
    }

    const nextUser = {
      ...userProfile,
      xp: levelXP >= 500 ? 0 : levelXP,
      level: nextLvl
    };
    setUserProfile(nextUser);

    syncWithServer(nextTransactions, nextBudgets, savingGoals, nextUser, notifications, investments, debts, splitExpenses);
  };

  // DELETE TRANSACTION
  const handleDeleteTransaction = (id: string) => {
    const rx = transactions.find((t) => t.id === id);
    const nextTransactions = transactions.filter((t) => t.id !== id);
    setTransactions(nextTransactions);

    let nextBudgets = [...budgets];
    if (rx && rx.type === 'expense') {
      nextBudgets = budgets.map((b) => {
        if (b.category === rx.category) {
          return { ...b, spent: Math.max(0, b.spent - rx.amount) };
        }
        return b;
      });
      setBudgets(nextBudgets);
    }

    syncWithServer(nextTransactions, nextBudgets, savingGoals, userProfile, notifications, investments, debts, splitExpenses);
  };

  // EDIT TRANSACTION
  const handleEditTransaction = (id: string, partial: Partial<Transaction>) => {
    const prevTx = transactions.find((t) => t.id === id);
    const nextTransactions = transactions.map((t) => {
      if (t.id === id) return { ...t, ...partial };
      return t;
    });
    setTransactions(nextTransactions);

    // Compensate budgets spent calculation
    let nextBudgets = [...budgets];
    if (prevTx && prevTx.type === 'expense') {
      nextBudgets = budgets.map((b) => {
        if (b.category === prevTx.category) {
          const diff = (partial.amount ?? prevTx.amount) - prevTx.amount;
          return { ...b, spent: Math.max(0, b.spent + diff) };
        }
        return b;
      });
      setBudgets(nextBudgets);
    }

    syncWithServer(nextTransactions, nextBudgets, savingGoals, userProfile, notifications, investments, debts, splitExpenses);
  };

  // BUDGET CAPS UPDATE
  const handleSetBudgetLimit = (category: string, limitVal: number) => {
    const nextBudgets = budgets.map((b) => {
      if (b.category === category) return { ...b, limit: limitVal };
      return b;
    });
    setBudgets(nextBudgets);
    syncWithServer(transactions, nextBudgets, savingGoals, userProfile, notifications, investments, debts, splitExpenses);
  };

  // SAVINGS GOALS CREATION
  const handleAddGoal = (g: Omit<SavingGoal, 'id' | 'completed'>) => {
    const freshId = `goal-${Math.random().toString(36).substring(4)}`;
    const freshGoal: SavingGoal = {
      id: freshId,
      ...g,
      completed: g.currentAmount >= g.targetAmount
    };

    const nextGoals = [...savingGoals, freshGoal];
    setSavingGoals(nextGoals);
    syncWithServer(transactions, budgets, nextGoals, userProfile, notifications, investments, debts, splitExpenses);
  };

  // DELETE GOAL
  const handleDeleteGoal = (id: string) => {
    const nextGoals = savingGoals.filter((g) => g.id !== id);
    setSavingGoals(nextGoals);
    syncWithServer(transactions, budgets, nextGoals, userProfile, notifications, investments, debts, splitExpenses);
  };

  // CONTRIBUTE SURPLUS FUNDS INTO JAR
  const handleContributeGoal = (id: string, amt: number) => {
    const nextGoals = savingGoals.map((g) => {
      if (g.id === id) {
        const nextAmt = g.currentAmount + amt;
        const complete = nextAmt >= g.targetAmount;
        if (complete && !g.completed) {
          triggerInstantNotification(
            '🎯 Savings milestone unlocked!',
            `Great job! You fully funded and reached your target goal for "${g.name}"!`,
            'success'
          );
        }
        return {
          ...g,
          currentAmount: nextAmt,
          completed: complete
        };
      }
      return g;
    });
    setSavingGoals(nextGoals);
    syncWithServer(transactions, budgets, nextGoals, userProfile, notifications, investments, debts, splitExpenses);
  };

  // DEBTS SUBMIT
  const handleAddDebt = (d: Omit<Debt, 'id' | 'settled'>) => {
    const freshId = `debt-${Math.random().toString(36).substring(4)}`;
    const freshDebt: Debt = {
      id: freshId,
      ...d,
      settled: false
    };
    const nextDebts = [freshDebt, ...debts];
    setDebts(nextDebts);
    syncWithServer(transactions, budgets, savingGoals, userProfile, notifications, investments, nextDebts, splitExpenses);
  };

  const handleSettleDebt = (id: string) => {
    const nextDebts = debts.map((d) => {
      if (d.id === id) return { ...d, settled: true };
      return d;
    });
    setDebts(nextDebts);
    syncWithServer(transactions, budgets, savingGoals, userProfile, notifications, investments, nextDebts, splitExpenses);
  };

  // INVESTMENTS PORTFOLIOS LIST
  const handleAddInvestment = (i: Omit<Investment, 'id'>) => {
    const freshId = `inv-${Math.random().toString(36).substring(4)}`;
    const freshInv: Investment = {
      id: freshId,
      ...i
    };
    const nextInvest = [...investments, freshInv];
    setInvestments(nextInvest);
    syncWithServer(transactions, budgets, savingGoals, userProfile, notifications, nextInvest, debts, splitExpenses);
  };

  const handleUpdateInvestment = (id: string, newVal: number) => {
    const nextInvest = investments.map((i) => {
      if (i.id === id) return { ...i, currentValue: newVal, lastUpdated: new Date().toISOString().split('T')[0] };
      return i;
    });
    setInvestments(nextInvest);
    syncWithServer(transactions, budgets, savingGoals, userProfile, notifications, nextInvest, debts, splitExpenses);
  };

  // SPLIT BILLS
  const handleAddSplitExpense = (se: Omit<SplitExpense, 'id'>) => {
    const freshId = `split-${Math.random().toString(36).substring(4)}`;
    const freshSplit: SplitExpense = {
      id: freshId,
      ...se
    };
    const nextSplits = [freshSplit, ...splitExpenses];
    setSplitExpenses(nextSplits);
    syncWithServer(transactions, budgets, savingGoals, userProfile, notifications, investments, debts, nextSplits);
  };

  // SYSTEM CATEGORY UPDATER
  const handleAddCategory = (name: string) => {
    if (categories.includes(name)) return;
    const nextCats = [...categories, name];
    setCategories(nextCats);
  };

  const handleDeleteCategory = (name: string) => {
    setCategories(categories.filter((c) => c !== name));
  };

  // INSTANT BANNERS / CHANNELS NOTIFICATION FOR USER ACTIONS
  const triggerInstantNotification = (title: string, message: string, type: 'alert' | 'info' | 'warning' | 'success') => {
    const freshNotification: UserNotification = {
      id: `notif-${Math.random().toString(36).substring(4)}`,
      title,
      message,
      type,
      date: new Date().toISOString().split('T')[0],
      read: false
    };

    const nextNotifications = [freshNotification, ...notifications];
    setNotifications(nextNotifications);
    syncWithServer(transactions, budgets, savingGoals, userProfile, nextNotifications, investments, debts, splitExpenses);
  };

  const handleClearNotification = (id: string) => {
    const nextNotifs = notifications.filter((n) => n.id !== id);
    setNotifications(nextNotifs);
    syncWithServer(transactions, budgets, savingGoals, userProfile, nextNotifs, investments, debts, splitExpenses);
  };

  // BOARDCAST PANEL
  const handleBroadcastNotification = (title: string, message: string) => {
    triggerInstantNotification(title, message, 'info');
  };

  // Settings custom components Profile modifier
  const handleSaveSettings = (e: React.FormEvent, formState: Partial<UserProfile>) => {
    e.preventDefault();
    const updatedU = {
      ...userProfile,
      ...formState
    };
    setUserProfile(updatedU);
    triggerInstantNotification(
      '⚙️ Profile preferences locked',
      'Your configuration update has been synchronized and saved to the database sheets.',
      'success'
    );
    syncWithServer(transactions, budgets, savingGoals, updatedU, notifications, investments, debts, splitExpenses);
  };

  // Active theme application side-effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (userProfile.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [userProfile.theme]);

  const toggleTheme = () => {
    const nextTheme = userProfile.theme === 'light' ? 'dark' : 'light';
    const updated = { ...userProfile, theme: nextTheme as 'light' | 'dark' };
    setUserProfile(updated);
    syncWithServer(transactions, budgets, savingGoals, updated, notifications, investments, debts, splitExpenses);
  };

  // Quick Action triggers from Dashboard panel
  const [quickAddType, setQuickAddType] = useState<'income' | 'expense' | null>(null);

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col md:flex-row font-sans transition duration-150 antialiased overflow-x-hidden">
      
      {/* Mobile top navigation header */}
      <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 p-4 shrink-0 flex items-center justify-between sticky top-0 z-40 select-none">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          <span className="font-bold text-lg dark:text-white">MoneyMate</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle theme={userProfile.theme} onChange={toggleTheme} />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 dark:text-zinc-300"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu modal overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30 pt-16">
          <div className="bg-white dark:bg-zinc-900 p-5 shadow-2xl border-b border-slate-200 dark:border-zinc-800 h-auto max-h-[85vh] overflow-y-auto w-full rounded-b-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-bold text-xs">
                  {userProfile.name ? userProfile.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-gray-900 dark:text-white leading-tight">
                    {userProfile.name}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-medium block mt-0.5">{userProfile.email}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/40 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>

            <nav className="grid grid-cols-2 gap-2 text-xs font-semibold py-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'expenses', label: 'Expenses', icon: ArrowDownRight },
                { id: 'incomes', label: 'Incomes', icon: ArrowUpRight },
                { id: 'budgets', label: 'Budgets & limits', icon: Wallet },
                { id: 'goals', label: 'Savings Goals', icon: Target },
                { id: 'ai-insights', label: 'AI Advisor', icon: Sparkles },
                { id: 'premium', label: 'Premium Suite', icon: Landmark },
                { id: 'reports', label: 'Reports & Export', icon: FileText },
                { id: 'settings', label: 'Profile Options', icon: Sliders },
                ...(userProfile.email === 'shivvamanognya@gmail.com' ? [{ id: 'admin', label: 'Admin Panel', icon: ShieldCheck }] : [])
              ].map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-left border ${
                      isActive
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm font-bold'
                        : 'bg-gray-50 hover:bg-gray-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-100 dark:border-zinc-805'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar drawer */}
      <div className="hidden md:block shrink-0 h-screen sticky top-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={userProfile}
          onLogout={handleLogout}
          isAdmin={userProfile.email === 'shivvamanognya@gmail.com'}
        />
      </div>

      {/* Master dynamic scroll panel content workspace */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 relative h-screen">
        
        {/* Save Sync indicators toolbar */}
        <div className="absolute top-4 right-8 z-10 flex items-center gap-3.5 print:hidden select-none">
          {savingStatus && <span className="text-[10px] font-bold text-emerald-500">{savingStatus}</span>}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle theme={userProfile.theme} onChange={toggleTheme} />
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 text-red-650 dark:text-rose-400 border border-red-200/50 dark:border-rose-900/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Dynamic screen tabs layout routing */}
        <div className="max-w-7xl mx-auto space-y-6">
          
          {activeTab === 'dashboard' && (
            <Dashboard
              transactions={transactions}
              budgets={budgets}
              savingGoals={savingGoals}
              user={userProfile}
              notifications={notifications}
              badges={badges}
              currencySymbol={currencySymbol}
              onClearNotification={handleClearNotification}
              onOpenQuickAdd={(type) => {
                if (type === 'income') setActiveTab('incomes');
                else setActiveTab('expenses');
              }}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseTracker
              transactions={transactions}
              currencySymbol={currencySymbol}
              onAddTransaction={handleAddTransaction}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'incomes' && (
            <IncomeTracker
              transactions={transactions}
              currencySymbol={currencySymbol}
              onAddTransaction={handleAddTransaction}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetPlanner
              budgets={budgets}
              currencySymbol={currencySymbol}
              onSetBudgetLimit={handleSetBudgetLimit}
              expenses={transactions.filter((t) => t.type === 'expense')}
            />
          )}

          {activeTab === 'goals' && (
            <SavingsGoals
              savingGoals={savingGoals}
              currencySymbol={currencySymbol}
              onAddGoal={handleAddGoal}
              onDeleteGoal={handleDeleteGoal}
              onContributeGoal={handleContributeGoal}
            />
          )}

          {activeTab === 'ai-insights' && (
            <AiInsights
              transactions={transactions}
              budgets={budgets}
              user={userProfile}
              currencySymbol={currencySymbol}
              onApplyVoiceParsedTransaction={(parsed) => handleAddTransaction({ ...parsed, paymentMethod: parsed.type === 'income' ? 'Direct Deposit' : 'Cash' })}
            />
          )}

          {activeTab === 'premium' && (
            <PremiumFeatures
              splitExpenses={splitExpenses}
              debts={debts}
              investments={investments}
              currencySymbol={currencySymbol}
              onAddSplitExpense={handleAddSplitExpense}
              onAddDebt={handleAddDebt}
              onSettleDebt={handleSettleDebt}
              onAddInvestment={handleAddInvestment}
              onUpdateInvestment={handleUpdateInvestment}
            />
          )}

          {activeTab === 'reports' && (
            <Reports
              transactions={transactions}
              budgets={budgets}
              savingGoals={savingGoals}
              currencySymbol={currencySymbol}
              userName={userProfile.name}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPanel
              user={userProfile}
              notifications={notifications}
              onBroadcastNotification={handleBroadcastNotification}
              categories={categories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto space-y-6">
              {/* Profile Card */}
              <div id="settings-preferences-tab" className="bg-white dark:bg-zinc-900 border p-6.5 rounded-2xl shadow-xs space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Sliders className="w-5.5 h-5.5 text-emerald-500" />
                    <span>Profile Preferences</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Customize account metrics, symbols, and standard security locks.</p>
                </div>

                <form onSubmit={(e) => {
                  const target = e.currentTarget;
                  const formName = (target.elements.namedItem('settings_name') as HTMLInputElement).value;
                  const formEmail = (target.elements.namedItem('settings_email') as HTMLInputElement).value;
                  const formCurr = (target.elements.namedItem('settings_currency') as HTMLSelectElement).value;
                  const form2FA = (target.elements.namedItem('settings_2fa') as HTMLInputElement).checked;

                  handleSaveSettings(e, {
                    name: formName,
                    email: formEmail,
                    currency: formCurr,
                    enable2FA: form2FA
                  });
                }} className="space-y-4 text-xs font-semibold font-sans">
                  
                  {/* Account Name */}
                  <div>
                    <label className="text-gray-400 font-bold uppercase block mb-1">Holder Name</label>
                    <input
                      name="settings_name"
                      type="text"
                      required
                      defaultValue={userProfile.name}
                      className="w-full bg-gray-50 dark:bg-zinc-850 px-3 py-2.5 rounded-xl border text-gray-800 dark:text-zinc-200 focus:outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-gray-400 font-bold uppercase block mb-1">Communication Email</label>
                    <input
                      name="settings_email"
                      type="email"
                      required
                      defaultValue={userProfile.email}
                      className="w-full bg-gray-50 dark:bg-zinc-850 px-3 py-2.5 rounded-xl border text-gray-800 dark:text-zinc-200 focus:outline-none"
                    />
                  </div>

                  {/* Currency select */}
                  <div>
                    <label className="text-gray-400 font-bold uppercase block mb-1">Standard Currency symbol</label>
                    <select
                      name="settings_currency"
                      defaultValue={userProfile.currency}
                      className="w-full bg-gray-50 dark:bg-zinc-850 px-3 py-2.5 rounded-xl border text-gray-800 focus:outline-none"
                    >
                      <option value="INR">INR (₹) Indian Rupee</option>
                      <option value="USD">USD ($) US Dollar</option>
                      <option value="EUR">EUR (€) Euro Zone</option>
                      <option value="GBP">GBP (£) British Pound</option>
                    </select>
                  </div>

                  {/* Secure Two-Factor Authentication */}
                  <div className="flex items-center gap-2.5 p-3.5 bg-gray-50 dark:bg-zinc-850 rounded-xl border border-dashed text-zinc-100">
                    <input
                      name="settings_2fa"
                      type="checkbox"
                      defaultChecked={userProfile.enable2FA}
                      className="w-4 h-4 text-emerald-500 rounded border-gray-300 focus:ring-emerald-400 focus:ring-1 cursor-pointer shrink-0"
                    />
                    <div>
                      <label className="font-bold text-gray-800 dark:text-white block cursor-pointer">Two-Factor Authentication (2FA)</label>
                      <span className="text-[10px] text-gray-400 block mt-0.5 font-medium leading-normal">Locks critical fund transfers and spreadsheet ledger exports with simulated passcode requests.</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition shadow cursor-pointer text-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lock profile updates</span>
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
